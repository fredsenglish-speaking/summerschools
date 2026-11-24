"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { readSchoolForm, storePhoto, str } from "@/lib/schoolForm";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_VIDEO_BYTES } from "@/lib/media";
import { fillTranslations } from "@/lib/translate";
import type { School } from "@/lib/schools";

export type SaveState = { ok?: boolean; error?: string };

export async function uploadPhoto(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  return storePhoto(form, await getT());
}

const VIDEO_BUCKET = "school-videos";
const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/x-m4v": "m4v" };

/**
 * Gives the browser a one-time link to upload a video straight to storage.
 * Videos are too big to pass through the site's own server (it accepts about 4 MB per request).
 */
export async function prepareVideoUpload(type: string, size: number): Promise<{ path?: string; token?: string; url?: string; error?: string }> {
  await requireAdmin();
  const t = (await getT()).admin.form;
  const ext = VIDEO_TYPES[type];
  if (!ext) return { error: t.videoType };
  if (size > MAX_VIDEO_BYTES) return { error: t.videoTooBig };
  const storage = createAdminClient().storage;
  const { error: missing } = await storage.getBucket(VIDEO_BUCKET);
  if (missing) {
    const { error } = await storage.createBucket(VIDEO_BUCKET, { public: true, fileSizeLimit: MAX_VIDEO_BYTES, allowedMimeTypes: Object.keys(VIDEO_TYPES) });
    if (error && !/exists/i.test(error.message)) return { error: `${t.uploadFailed} ${error.message}` };
  }
  const path = `${crypto.randomUUID()}.${ext}`;
  const { data, error } = await storage.from(VIDEO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: `${t.uploadFailed} ${error?.message ?? ""}` };
  return { path, token: data.token, url: storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function saveSchool(_: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const t = await getT();
  const read = readSchoolForm(form, t);
  if ("error" in read) return { error: read.error };

  await fillTranslations(read.row.i18n);

  const id = str(form, "id", 40);
  const supabase = await createClient();
  const { error } = id ? await supabase.from("schools").update(read.row).eq("id", id) : await supabase.from("schools").insert(read.row);
  if (error) return { error: error.code === "23505" ? t.admin.form.errSlug : `${t.admin.form.errSave} ${error.message}` };

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

/** Translates the missing Russian/English (or Azerbaijani) text of every school in one go. */
export async function translateAll() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("id, i18n");
  let total = 0;
  for (const s of (data ?? []) as Pick<School, "id" | "i18n">[]) {
    const i18n = s.i18n ?? {};
    const n = await fillTranslations(i18n);
    if (n > 0) {
      const { error } = await supabase.from("schools").update({ i18n }).eq("id", s.id);
      if (!error) total += n;
    }
  }
  revalidatePath("/", "layout");
  redirect(`/admin?translated=${total}`);
}
