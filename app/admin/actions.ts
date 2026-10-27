"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { LOCALES } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COUNTRIES, CURRENCIES, LIST_FIELDS, TEXT_FIELDS, TIERS, linesToList, slugify, type LocalText } from "@/lib/schools";

export type SaveState = { error?: string };

const BUCKET = "school-photos";
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function str(form: FormData, name: string, max = 200): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function oneOf<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Uploads one photo (already shrunk in the browser) and returns its public link. */
export async function uploadPhoto(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !PHOTO_TYPES[file.type] || file.size > 5 * 1024 * 1024) {
    return { error: (await getT()).admin.form.uploadFailed };
  }
  const path = `${crypto.randomUUID()}.${PHOTO_TYPES[file.type]}`;
  const storage = createAdminClient().storage.from(BUCKET);
  const { error } = await storage.upload(path, file, { contentType: file.type });
  if (error) return { error: `${(await getT()).admin.form.uploadFailed} ${error.message}` };
  return { url: storage.getPublicUrl(path).data.publicUrl };
}

export async function saveSchool(_: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const t = (await getT()).admin.form;
  const id = str(form, "id", 40);

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
  const title = i18n.az.title ?? "";
  if (!title) return { error: t.errTitle };

  const age_min = Number.parseInt(str(form, "age_min"), 10);
  const age_max = Number.parseInt(str(form, "age_max"), 10);
  if (!(age_min >= 1 && age_max <= 99 && age_min <= age_max)) return { error: t.errAges };
  const duration_weeks = Number.parseInt(str(form, "duration_weeks"), 10);
  if (!(duration_weeks >= 1 && duration_weeks <= 52)) return { error: t.errWeeks };
  const price = Number.parseFloat(str(form, "price").replace(/\s/g, "").replace(",", "."));

  let gallery: string[] = [];
  try {
    const parsed = JSON.parse(str(form, "gallery", 20000) || "[]");
    if (Array.isArray(parsed)) gallery = parsed.filter((x): x is string => typeof x === "string" && x.startsWith("https://"));
  } catch {
    gallery = [];
  }
  const mainPhoto = str(form, "main_photo", 500);
  const paidUntil = str(form, "paid_until", 10);

  const row = {
    slug: slugify(str(form, "slug", 80) || title) || crypto.randomUUID().slice(0, 8),
    published: form.get("published") === "on",
    country: oneOf(str(form, "country"), COUNTRIES, "other"),
    age_min,
    age_max,
    duration_weeks,
    price: Number.isFinite(price) && price > 0 ? price : null,
    currency: oneOf(str(form, "currency"), CURRENCIES, "USD"),
    main_photo: mainPhoto.startsWith("https://") ? mainPhoto : null,
    gallery,
    tier: oneOf(str(form, "tier"), TIERS, "standard"),
    organizer: str(form, "organizer"),
    paid_until: /^\d{4}-\d{2}-\d{2}$/.test(paidUntil) ? paidUntil : null,
    i18n,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = id ? await supabase.from("schools").update(row).eq("id", id) : await supabase.from("schools").insert(row);
  if (error) return { error: error.code === "23505" ? t.errSlug : `${t.errSave} ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteSchool(form: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("schools").delete().eq("id", str(form, "id", 40));
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function markHandled(form: FormData) {
  await requireAdmin();
  const table = form.get("table") === "partner_requests" ? "partner_requests" : "inquiries";
  const supabase = await createClient();
  await supabase.from(table).update({ handled: true }).eq("id", str(form, "id", 40));
  revalidatePath("/admin");
}
