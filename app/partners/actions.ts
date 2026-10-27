"use server";

import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import { TIERS, type Tier } from "@/lib/schools";
import type { FormState } from "@/app/schools/actions";

function field(form: FormData, name: string, max: number): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

export async function sendPartnerRequest(_: FormState, form: FormData): Promise<FormState> {
  const t = await getT();
  const company = field(form, "company", 200);
  const phone = field(form, "phone", 40);
  if (!company || phone.replace(/\D/g, "").length < 5) return { error: t.partners.errRequired };
  const tier = field(form, "tier", 20);
  const supabase = await createClient();
  const { error } = await supabase.from("partner_requests").insert({
    company,
    phone,
    country: field(form, "country", 100),
    tier: (TIERS as readonly string[]).includes(tier) ? (tier as Tier) : "standard",
    message: field(form, "message", 2000),
  });
  return error ? { error: t.school.errFailed } : { ok: true };
}
