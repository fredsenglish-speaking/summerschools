"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";
import type { FormState } from "@/app/schools/actions";
import { signIn } from "./actions";

export function LoginForm() {
  const t = useT().login;
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className="form">
      <label>
        <span>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        <span>{t.password}</span>
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {state.error && <p className="notice err">{state.error}</p>}
      <SubmitButton className="btn gold big">{t.submit}</SubmitButton>
    </form>
  );
}
