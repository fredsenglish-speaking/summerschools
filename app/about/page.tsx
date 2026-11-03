import type { Metadata } from "next";
import Link from "next/link";
import { FlagCover } from "@/components/Flag";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getContact } from "@/lib/contact";
import { getT } from "@/lib/i18n/server";
import { COUNTRIES } from "@/lib/schools";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).about.eyebrow };
}

const VALUE_ICONS = [
  "M12 21s-7-4.4-7-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 16.6 12 21 12 21z",
  "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5",
  "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
];

export default async function About() {
  const all = await getT();
  const t = all.about;
  const { phone, tel, whatsapp } = getContact();
  const countries = COUNTRIES.filter((c) => c !== "other");

  return (
    <>
      <section className="hero photo-hero about-hero">
        <img src="/hero-sm.jpg" alt="" className="hero-bg" />
        <div className="wrap hero-inner">
          <span className="pill gold">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p className="lead">{t.lead}</p>
        </div>
      </section>

      <section className="wrap section about-story">
        <div className="about-text">
          <h2>{t.storyTitle}</h2>
          {t.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="about-stats">
            {all.home.stats.map((x) => (
              <li key={x.label}>
                <b>{x.value}</b>
                <span>{x.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <figure className="about-photo">
          <img src="/about.jpg" alt="" loading="lazy" />
        </figure>
      </section>

      <section className="soft">
        <div className="wrap section">
          <h2 className="center">{t.valuesTitle}</h2>
          <ul className="about-values">
            {t.values.map((v, i) => (
              <li key={v.title}>
                <span className="why-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={VALUE_ICONS[i % VALUE_ICONS.length]} />
                  </svg>
                </span>
                <b>{v.title}</b>
                <span>{v.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap section">
        <h2>{t.destinationsTitle}</h2>
        <div className="countries">
          {countries.map((c) => (
            <Link key={c} href={`/?country=${c}#schools`} className="country">
              <FlagCover country={c} name={all.countries[c]} />
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="cta">
          <div className="stack">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
          </div>
          <div className="row wrap-row">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} className="btn gold big">
                <WhatsAppIcon size={20} /> {all.common.whatsapp}
              </a>
            )}
            {phone && (
              <a href={`tel:${tel}`} className="btn dark big">
                {phone}
              </a>
            )}
            <Link href="/#schools" className="btn ghost big">
              {t.ctaSchools} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
