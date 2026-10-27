import "server-only";
import { LOCALES, type Dictionary } from "./i18n";
import { createAdminClient } from "./supabase/admin";
import { COUNTRIES, CURRENCIES, LIST_FIELDS, TEXT_FIELDS, TIERS, linesToList, parseMonths, slugify, type LocalText, type School } from "./schools";

const BUCKET = "school-photos";
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function str(form: FormData, name: string, max = 200): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function oneOf<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Saves one photo (already shrunk in the browser) to storage and returns its public link. */
export async function storePhoto(form: FormData, t: Dictionary): Promise<{ url?: string; error?: string }> {
  const file = form.get("file");
  if (!(file instanceof File) || !PHOTO_TYPES[file.type] || file.size > 5 * 1024 * 1024) {
    return { error: t.admin.form.uploadFailed };
  }
  const path = `${crypto.randomUUID()}.${PHOTO_TYPES[file.type]}`;
  const storage = createAdminClient().storage.from(BUCKET);
  const { error } = await storage.upload(path, file, { contentType: file.type });
  if (error) return { error: `${t.admin.form.uploadFailed} ${error.message}` };
  return { url: storage.getPublicUrl(path).data.publicUrl };
}

export type SchoolRow = Omit<School, "id" | "created_at"> & { organizer_contact: string; updated_at: string };

/** Reads and checks the school form shared by the admin panel and the organisers' form. */
export function readSchoolForm(form: FormData, t: Dictionary): { row: SchoolRow } | { error: string } {
  const e = t.admin.form;
  const i18n: Record<string, Partial<LocalText>> = {};
  for (const l of LOCALES) {
    const text: Partial<LocalText> = {};
    for (const f of TEXT_FIELDS) {
      const value = str(form, `${l}.${f}`, f === "description" ? 5000 : 300);
      if (value) text[f] = value;
    }
    for (const f of LIST_FIELDS) {
      const list = linesToList(str(form, `${l}.${f}`, 3000));
      if (list.length) text[f] = list;
    }
    i18n[l] = text;
  }
  const title = i18n.az.title || i18n.en.title || i18n.ru.title || "";
  if (!title) return { error: e.errTitle };

  const age_min = Number.parseInt(str(form, "age_min"), 10);
  const age_max = Number.parseInt(str(form, "age_max"), 10);
  if (!(age_min >= 1 && age_max <= 99 && age_min <= age_max)) return { error: e.errAges };
  const duration_weeks = Number.parseInt(str(form, "duration_weeks"), 10);
  if (!(duration_weeks >= 1 && duration_weeks <= 52)) return { error: e.errWeeks };
  const price = Number.parseFloat(str(form, "price").replace(/\s/g, "").replace(",", "."));

  let gallery: string[] = [];
  try {
    const parsed = JSON.parse(str(form, "gallery", 20000) || "[]");
    if (Array.isArray(parsed)) gallery = parsed.filter((x): x is string => typeof x === "string" && x.startsWith("https://")).slice(0, 30);
  } catch {
    gallery = [];
  }
  const mainPhoto = str(form, "main_photo", 500);
  const paidUntil = str(form, "paid_until", 10);

  return {
    row: {
      slug: slugify(str(form, "slug", 80) || title) || crypto.randomUUID().slice(0, 8),
      published: form.get("published") === "on",
      country: oneOf(str(form, "country"), COUNTRIES, "other"),
      age_min,
      age_max,
      duration_weeks,
      months: parseMonths(form.getAll("months")),
      price: Number.isFinite(price) && price > 0 ? price : null,
      currency: oneOf(str(form, "currency"), CURRENCIES, "USD"),
      main_photo: mainPhoto.startsWith("https://") ? mainPhoto : null,
      gallery,
      tier: oneOf(str(form, "tier"), TIERS, "standard"),
      organizer: str(form, "organizer"),
      organizer_contact: str(form, "organizer_contact", 500),
      paid_until: /^\d{4}-\d{2}-\d{2}$/.test(paidUntil) ? paidUntil : null,
      i18n,
      updated_at: new Date().toISOString(),
    },
  };
}
