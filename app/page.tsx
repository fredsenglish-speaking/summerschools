import Link from "next/link";
import { Carousel } from "@/components/Carousel";
import { Flag, FlagCover } from "@/components/Flag";
import { SchoolCard, priceLabel } from "@/components/SchoolCard";
import { listSchools } from "@/lib/data";
import { DICTIONARIES } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { COUNTRIES, DURATIONS, localText, matches, parseSearch } from "@/lib/schools";

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
        </div>
      </section>
      <div className="wrap search-wrap">
        <form action="/#schools" method="get" className="search" role="search">
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

      <section id="about" className="wrap section about">
        <div className="stack">
          <h2>{t.home.whyTitle}</h2>
          <p className="lead-dark">{t.home.whyText}</p>
        </div>
        <div className="why">
          {t.home.why.map((w, i) => (
            <div key={w.title}>
              <span className="why-no">{String(i + 1).padStart(2, "0")}</span>
              <b>{w.title}</b>
              <span>{w.text}</span>
            </div>
          ))}
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
