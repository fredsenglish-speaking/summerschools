import "server-only";
import { createClient } from "./supabase/server";
import { SUPABASE_URL } from "./supabase/url";
import { bakuToday } from "./format";
import { isListed, sortForListing, type School } from "./schools";

/** Schools visitors can see, in catalog order. Empty until Supabase is configured. */
export async function listSchools(): Promise<School[]> {
  if (!SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("*").eq("published", true);
  const today = bakuToday();
  return sortForListing(((data ?? []) as School[]).filter((s) => isListed(s, today)));
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  if (!SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  const school = data as School | null;
  return school && isListed(school, bakuToday()) ? school : null;
}
