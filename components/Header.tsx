import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getAdminId } from "@/lib/auth";
import { getContact } from "@/lib/contact";
import { DICTIONARIES, LOCALES } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { setLanguage } from "@/app/lang/actions";
import { signOut } from "@/app/login/actions";

export async function Header() {
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const isAdmin = Boolean(await getAdminId());
  const { phone, tel } = getContact();

  return (
    <header className="bar">
      <div className="wrap bar-row">
        <Logo />
        <nav className="nav" aria-label={t.nav.schools}>
          <Link href="/#schools">{t.nav.schools}</Link>
          <Link href="/#countries">{t.nav.countries}</Link>
          <Link href="/partners">{t.nav.partners}</Link>
          <Link href="/#about">{t.nav.about}</Link>
          <Link href="#contact">{t.nav.contact}</Link>
          {isAdmin && <Link href="/admin">{t.nav.admin}</Link>}
        </nav>
        <div className="row">
          <form action={setLanguage} className="langs" aria-label={t.nav.language}>
            {LOCALES.map((l) => (
              <button key={l} type="submit" name="locale" value={l} aria-pressed={l === locale} title={DICTIONARIES[l].langName}>
                {l.toUpperCase()}
              </button>
            ))}
          </form>
          {isAdmin && (
            <form action={signOut}>
              <button className="btn ghost small" type="submit">
                {t.nav.signOut}
              </button>
            </form>
          )}
          {phone && (
            <a href={`tel:${tel}`} className="btn dark small">
              {phone}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
