import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { SchoolForm } from "@/app/admin/SchoolForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).submit.title, robots: { index: false } };
}

/** The link the admin forwards to organisers; what they send waits as a hidden draft. */
export default async function Submit() {
  const t = (await getT()).submit;
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <h1>{t.title}</h1>
          <p className="lead">{t.lead}</p>
        </div>
      </section>
      <section className="wrap section">
        <SchoolForm public />
      </section>
    </>
  );
}
