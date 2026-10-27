import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { robots: { index: false } };

export default async function Login() {
  const t = (await getT()).login;
  return (
    <section className="wrap section narrow">
      <div className="panel">
        <h1>{t.title}</h1>
        <LoginForm />
      </div>
    </section>
  );
}
