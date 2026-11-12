import "server-only";
import { createClient } from "./supabase/server";
import { SUPABASE_URL } from "./supabase/url";
import { bakuToday } from "./format";
import { isListed, sortForListing, type School } from "./schools";
import { getLocale } from "./i18n/server";
import { fillTranslations } from "./translate";

/**
 * Text the admin left empty in the visitor's language is machine-translated on the fly
 * (cached), so a school saved before translation worked, or while the service was down, still reads right.
 */
async function translated(schools: School[]): Promise<School[]> {
  const locale = await getLocale();
  return Promise.all(
    schools.map(async (s) => {
      const copy = { ...s, i18n: structuredClone(s.i18n ?? {}) };
      await fillTranslations(copy.i18n, locale);
      return copy;
    }),
  );
}

/** Schools visitors can see, in catalog order. Empty until Supabase is configured. */
export async function listSchools(): Promise<School[]> {
  if (!SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("*").eq("published", true);
  const today = bakuToday();
  return translated(sortForListing(((data ?? []) as School[]).filter((s) => isListed(s, today))));
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  if (!SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  const school = data as School | null;
  return school && isListed(school, bakuToday()) ? (await translated([school]))[0] : null;
}

/** Past programmes: published, and their last day on the site has passed. Newest first. They become the photo archive. */
export async function listArchive(): Promise<School[]> {
  if (!SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("published", true)
    .lt("paid_until", bakuToday())
    .order("paid_until", { ascending: false });
  return translated((data ?? []) as School[]);
}

export async function getArchiveBySlug(slug: string): Promise<School | null> {
  return (await listArchive()).find((s) => s.slug === slug) ?? null;
}
