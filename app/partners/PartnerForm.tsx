"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";
import { TIERS, type Tier } from "@/lib/schools";
import type { FormState } from "@/app/schools/actions";
import { sendPartnerRequest } from "./actions";

export function PartnerForm({ tier }: { tier: Tier }) {
  const t = useT().partners;
  const [state, action] = useActionState<FormState, FormData>(sendPartnerRequest, {});
  if (state.ok) return <p className="notice ok">{t.sent}</p>;
  return (
    <form action={action} className="form two-col">
      <label>
        <span>{t.company}</span>
        <input name="company" required maxLength={200} autoComplete="organization" />
      </label>
      <label>
        <span>{t.phone}</span>
        <input name="phone" type="tel" required maxLength={40} placeholder="+994" autoComplete="tel" />
      </label>
      <label>
        <span>{t.country}</span>
        <input name="country" maxLength={100} />
      </label>
      <label>
        <span>{t.tier}</span>
        <select name="tier" defaultValue={tier} key={tier}>
          {TIERS.map((x) => (
            <option key={x} value={x}>
              {t.tiers[x].name}
            </option>
          ))}
        </select>
      </label>
      <label className="full">
        <span>{t.message}</span>
        <textarea name="message" rows={4} maxLength={2000} />
      </label>
      {state.error && <p className="notice err full">{state.error}</p>}
      <div className="full">
        <SubmitButton className="btn gold big wide">{t.send}</SubmitButton>
      </div>
    </form>
  );
}
