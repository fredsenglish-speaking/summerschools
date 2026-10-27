"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";
import { sendInquiry, type FormState } from "../actions";

export function InquiryForm({ schoolId, schoolTitle, sessions }: { schoolId: string; schoolTitle: string; sessions: string[] }) {
  const t = useT().school;
  const [state, action] = useActionState<FormState, FormData>(sendInquiry, {});
  if (state.ok) return <p className="notice ok">{t.sent}</p>;
  return (
    <form action={action} className="form">
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="school_title" value={schoolTitle} />
      <label>
        <span>{t.parentName}</span>
        <input name="parent_name" required maxLength={120} autoComplete="name" />
      </label>
      <label>
        <span>{t.phone}</span>
        <input name="phone" type="tel" required maxLength={40} placeholder="+994" autoComplete="tel" />
      </label>
      <div className="two">
        <label>
          <span>{t.childAge}</span>
          <input name="child_age" type="number" min={1} max={99} />
        </label>
        {sessions.length > 0 && (
          <label>
            <span>{t.session}</span>
            <select name="session">
              {sessions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label>
        <span>{t.message}</span>
        <textarea name="message" rows={3} maxLength={2000} />
      </label>
      {state.error && <p className="notice err">{state.error}</p>}
      <SubmitButton className="btn gold big">{t.send}</SubmitButton>
    </form>
  );
}
