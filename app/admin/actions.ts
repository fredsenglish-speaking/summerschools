"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { readSchoolForm, storePhoto, str } from "@/lib/schoolForm";
import { createClient } from "@/lib/supabase/server";

export type SaveState = { ok?: boolean; error?: string };

export async function uploadPhoto(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  return storePhoto(form, await getT());
}

export async function saveSchool(_: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const t = await getT();
  const read = readSchoolForm(form, t);
  if ("error" in read) return { error: read.error };

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
