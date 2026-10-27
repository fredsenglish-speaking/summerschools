import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getT();
  return (
    <section className="wrap section narrow stack">
      <h1>404</h1>
      <Link href="/#schools" className="btn gold">
        {t.school.back}
      </Link>
    </section>
  );
}
