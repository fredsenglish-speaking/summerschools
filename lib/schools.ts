import { LOCALES, type Locale } from "./i18n/index.ts";

export const COUNTRIES = ["usa", "uk", "cn", "eu", "tr", "az", "other"] as const;
export type Country = (typeof COUNTRIES)[number];

export const CURRENCIES = ["AZN", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Placement tiers. "top" and "premium" come first in the catalog; "premium" also gets the home page banner. */
export const TIERS = ["standard", "top", "premium"] as const;
export type Tier = (typeof TIERS)[number];

export const DURATIONS = ["all", "1", "2", "3"] as const;
export type Duration = (typeof DURATIONS)[number];

/** Everything on a school page that is written separately in each language. */
export type LocalText = {
  title: string;
  city: string;
  sessions: string;
  description: string;
  meals: string;
  room: string;
  excursions: string;
  transfer: string;
  included: string[];
  excluded: string[];
};

export const TEXT_FIELDS = ["title", "city", "sessions", "description", "meals", "room", "excursions", "transfer"] as const;
export const LIST_FIELDS = ["included", "excluded"] as const;

export type School = {
  id: string;
  slug: string;
  published: boolean;
  country: Country;
  age_min: number;
  age_max: number;
  duration_weeks: number;
  /** Months the school runs in, 1 = January … 12 = December. */
  months: number[];
  price: number | null;
  currency: Currency;
  main_photo: string | null;
  gallery: string[];
  tier: Tier;
  /** Empty for Ms Jane's own schools, else the partner company. Only shown in the admin. */
  organizer: string;
  /** Last day a paid placement is shown (YYYY-MM-DD); null means no end date. */
  paid_until: string | null;
  i18n: Partial<Record<Locale, Partial<LocalText>>>;
  created_at: string;
};

export type Search = { age: number | null; duration: Duration; country: "all" | Country; month: number | null };

/** One language's text, each missing field taken from the other languages (Azerbaijani first). */
export function localText(school: Pick<School, "i18n">, locale: Locale): LocalText {
  const order = [locale, ...LOCALES.filter((l) => l !== locale)];
  const pick = <K extends keyof LocalText>(key: K, empty: LocalText[K]): LocalText[K] => {
    for (const l of order) {
      const value = school.i18n?.[l]?.[key];
      if (Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim() !== "") {
        return value as LocalText[K];
      }
    }
    return empty;
  };
  const out = {} as LocalText;
  for (const f of TEXT_FIELDS) out[f] = pick(f, "");
  for (const f of LIST_FIELDS) out[f] = pick(f, []);
  return out;
}

/** Published, and the paid placement (if any) has not run out. */
export function isListed(school: Pick<School, "published" | "paid_until">, today: string): boolean {
  return school.published && (!school.paid_until || school.paid_until >= today);
}

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseSearch(params: Record<string, string | string[] | undefined>): Search {
  const age = Number.parseInt(one(params.age), 10);
  const duration = one(params.duration);
  const country = one(params.country);
  const month = Number.parseInt(one(params.month), 10);
  return {
    age: Number.isFinite(age) && age > 0 && age < 100 ? age : null,
    duration: (DURATIONS as readonly string[]).includes(duration) ? (duration as Duration) : "all",
    country: (COUNTRIES as readonly string[]).includes(country) ? (country as Country) : "all",
    month: month >= 1 && month <= 12 ? month : null,
  };
}

export function matches(school: School, search: Search): boolean {
  if (search.age !== null && (search.age < school.age_min || search.age > school.age_max)) return false;
  if (search.duration === "3" ? school.duration_weeks < 3 : search.duration !== "all" && school.duration_weeks !== Number(search.duration)) return false;
  if (search.country !== "all" && school.country !== search.country) return false;
  if (search.month !== null && !(school.months ?? []).includes(search.month)) return false;
  return true;
}

const TIER_RANK: Record<Tier, number> = { premium: 0, top: 1, standard: 2 };

/** Premium, then top, then the rest; newest first within each. */
export function sortForListing(schools: School[]): School[] {
  return [...schools].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.created_at.localeCompare(a.created_at));
}

export function isFeatured(school: Pick<School, "tier">): boolean {
  return school.tier !== "standard";
}

const LATIN: Record<string, string> = { ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c" };

/** "İngilis dili yay məktəbi" → "ingilis-dili-yay-mektebi" */
export function slugify(text: string): string {
  return text
    .toLocaleLowerCase("az")
    .replace(/[əıöüğşç]/g, (c) => LATIN[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** The form's checked months, as sorted unique numbers 1–12. */
export function parseMonths(values: unknown[]): number[] {
  const months = values.map((v) => Number.parseInt(String(v), 10)).filter((m) => m >= 1 && m <= 12);
  return [...new Set(months)].sort((a, b) => a - b);
}

/** A textarea with one item per line → the list, blank lines dropped. */
export function linesToList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*✓✔]\s*/, "").trim())
    .filter(Boolean);
}
