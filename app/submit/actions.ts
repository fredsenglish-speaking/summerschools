"use server";

import { getT } from "@/lib/i18n/server";
import { readSchoolForm, storePhoto } from "@/lib/schoolForm";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SaveState } from "@/app/admin/actions";

/** Organisers upload photos without signing in; the files only show once the admin publishes the school. */
export async function uploadSubmissionPhoto(form: FormData): Promise<{ url?: string; error?: string }> {
  return storePhoto(form, await getT());
}

/** Saves an organiser's school as a hidden draft. Only the admin can publish it. */
export async function submitSchool(_: SaveState, form: FormData): Promise<SaveState> {
  const t = await getT();
  const read = readSchoolForm(form, t);
  if ("error" in read) return { error: read.error };
  if (!read.row.organizer || read.row.organizer_contact.replace(/\D/g, "").length < 5) return { error: t.submit.errContact };

  const row = {
    ...read.row,
    published: false,
    submitted: true,
    paid_until: null,
    // A random ending keeps two organisers with the same school name apart.
    slug: `${read.row.slug.slice(0, 70)}-${crypto.randomUUID().slice(0, 6)}`,
  };
  const { error } = await createAdminClient().from("schools").insert(row);
  return error ? { error: `${t.admin.form.errSave} ${error.message}` } : { ok: true };
}
