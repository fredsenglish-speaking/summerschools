import Link from "next/link";
import { Carousel } from "@/components/Carousel";
import { Flag, FlagCover } from "@/components/Flag";
import { SchoolCard, priceLabel } from "@/components/SchoolCard";
import { listSchools } from "@/lib/data";
import { DICTIONARIES } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { COUNTRIES, DURATIONS, localText, matches, parseSearch } from "@/lib/schools";

const WHY_ICONS = {
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9",
  cap: "M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6",
  growth: "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6 1.2 0 2.3.3 3.2.9M14 20l3-4 2 2 3-5M19 13h3v3",
  plane: "M21 3L3 10.5l7 2.5 2.5 7L21 3zM10 13l5-5",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3zM12 1v1M4 5l.7.7M20 5l-.7.7",
};

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const search = parseSearch(await searchParams);
  const all = await listSchools();
  const found = all.filter((s) => matches(s, search));
  const premium = all.filter((s) => s.tier === "premium");
  const filtered = search.age !== null || search.duration !== "all" || search.country !== "all" || search.month !== null;
  const countries = COUNTRIES.filter((c) => c !== "other");

  return (
    <>
      <section className="hero home-hero photo-hero">
        <img src="/hero-sm.jpg" alt="" className="hero-fill" />
        <img src="/hero.jpg" srcSet="/hero-sm.jpg 1000w, /hero.jpg 1672w" sizes="100vw" alt="" className="hero-bg" fetchPriority="high" />
        <div className="wrap hero-inner">
          <span className="pill gold">{t.home.badge}</span>
          <h1>{t.home.title}</h1>
          <p className="lead">{t.home.lead}</p>
          <ul className="stats">
            {t.home.stats.map((x) => (
              <li key={x.label}>
                <b>{x.value}</b>
                <span>{x.label}</span>
              </li>
            ))}
          </ul>
          <form action="/#schools" method="get" className="search lux-search" role="search">
            <label>
              <span>{t.home.age}</span>
              <input type="number" name="age" min={1} max={99} placeholder={t.home.agePlaceholder} defaultValue={search.age ?? ""} />
            </label>
            <label>
              <span>{t.home.duration}</span>
              <select name="duration" defaultValue={search.duration}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {t.home.durations[d]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.home.month}</span>
              <select name="month" defaultValue={search.month ?? ""}>
                <option value="">{t.home.anyMonth}</option>
                {t.common.months.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="chips">
              <legend>{t.home.country}</legend>
              {(["all", ...COUNTRIES] as const).map((c) => (
                <label key={c} className="chip">
                  <input type="radio" name="country" value={c} defaultChecked={search.country === c} />
                  <span>
                    <Flag country={c} size={22} />
                    {c === "all" ? t.home.allCountries : t.countries[c]}
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="submit" className="btn gold big search-go">
              {t.home.search}
            </button>
          </form>
        </div>
      </section>

      {premium.length > 0 && !filtered && (
        <section className="wrap section">
          <Carousel label={t.school.recommended}>
            {premium.map((banner) => (
              <Link key={banner.id} href={`/schools/${banner.slug}`} className="banner" data-country={banner.country}>
                {banner.main_photo ? <img src={banner.main_photo} alt="" /> : <FlagCover country={banner.country} name="" />}
                <div className="banner-text">
                  <span className="pill gold">{t.school.recommended}</span>
                  <h2>{localText(banner, locale).title}</h2>
                  <p>
                    {t.countries[banner.country]} · {t.common.ages(banner.age_min, banner.age_max)} · {t.common.weeks(banner.duration_weeks)} ·{" "}
                    {priceLabel(banner, locale)}
                  </p>
                </div>
              </Link>
            ))}
          </Carousel>
        </section>
      )}

      <section id="schools" className="wrap section">
        <div className="section-head">
          <h2>{t.home.schoolsTitle}</h2>
          <span className="muted">{t.home.found(found.length)}</span>
          {filtered && (
            <Link href="/#schools" className="reset">
              {t.home.reset}
            </Link>
          )}
        </div>
        {found.length === 0 ? (
          <p className="empty">{t.home.empty}</p>
        ) : (
          <div className="grid">
            {found.map((s) => (
              <SchoolCard key={s.id} school={s} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section id="countries" className="soft">
        <div className="wrap section">
          <h2>{t.home.countriesTitle}</h2>
          <div className="countries">
            {countries.map((c) => (
              <Link key={c} href={`/?country=${c}#schools`} className="country">
                <FlagCover country={c} name={t.countries[c]} note={t.home.schoolsN(all.filter((s) => s.country === c).length)} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="why-lux">
        <img src="/why.jpg" alt="" className="why-photo" loading="lazy" />
        <div className="wrap why-inner">
          <h2 className="why-title">
            {t.home.whyTitle}
            <em>{t.home.whyTitleGold}</em>
          </h2>
          <p className="why-lead">{t.home.whyText}</p>
          <ul className="why-points">
            {t.home.why.map((w) => (
              <li key={w.title}>
                <span className="why-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={WHY_ICONS[w.icon as keyof typeof WHY_ICONS]} />
                  </svg>
                </span>
                <b>{w.title}</b>
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
          <Link href="/#schools" className="btn dark big why-cta">
            {t.home.whyCta} →
          </Link>
          <p className="why-closing">{t.home.whyClosing}</p>
          <p className="why-tagline">
            <b lang="en">International Summer Schools —</b> {t.home.whyTagline}
          </p>
        </div>
      </section>

      <section className="wrap section">
        <div className="cta">
          <div className="stack">
            <h2>{t.home.partnerTitle}</h2>
            <p>{t.home.partnerText}</p>
          </div>
          <Link href="/partners" className="btn dark big">
            {t.home.partnerCta}
          </Link>
        </div>
      </section>
    </>
  );
}
