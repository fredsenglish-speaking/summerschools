"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale, getT } from "@/lib/i18n/server";

export type FormState = { ok?: boolean; error?: string };

function field(form: FormData, name: string, max: number): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

export async function sendInquiry(_: FormState, form: FormData): Promise<FormState> {
  const t = (await getT()).school;
  const parent_name = field(form, "parent_name", 120);
  const phone = field(form, "phone", 40);
  if (!parent_name || phone.replace(/\D/g, "").length < 5) return { error: t.errRequired };
  const age = Number.parseInt(field(form, "child_age", 3), 10);
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    school_id: field(form, "school_id", 40) || null,
    school_title: field(form, "school_title", 200),
    parent_name,
    phone,
    child_age: age > 0 && age < 100 ? age : null,
    session: field(form, "session", 200),
    message: field(form, "message", 2000),
    locale: await getLocale(),
  });
  return error ? { error: t.errFailed } : { ok: true };
}
