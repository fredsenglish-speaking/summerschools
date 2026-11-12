import type { Metadata } from "next";
import Link from "next/link";
import { FlagCover } from "@/components/Flag";
import { listArchive } from "@/lib/data";
import { DICTIONARIES, INTL_LOCALE } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { localText, photoFor } from "@/lib/schools";

export async function generateMetadata(): Promise<Metadata> {
  return { title: DICTIONARIES[await getLocale()].archive.title };
}

export default async function Archive() {
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const albums = await listArchive();
  const date = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(INTL_LOCALE[locale], { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <section className="hero photo-hero about-hero">
        <img src="/hero-sm.jpg" alt="" className="hero-bg" />
        <div className="wrap hero-inner">
          <span className="pill gold">{t.archive.title}</span>
          <h1>{t.archive.title}</h1>
          <p className="lead">{t.archive.lead}</p>
        </div>
      </section>

      <section className="wrap section">
        {albums.length === 0 ? (
          <div className="stack">
            <p className="empty">{t.archive.empty}</p>
            <Link href="/#schools" className="btn dark">
              {t.archive.cta} →
            </Link>
          </div>
        ) : (
          <div className="grid">
            {albums.map((s) => {
              const text = localText(s, locale);
              const photo = photoFor(s, locale);
              return (
                <Link key={s.id} href={`/archive/${s.slug}`} className="card album">
                  <div className="card-photo" data-country={s.country}>
                    {photo ? (
                      <>
                        <img src={photo} alt="" loading="lazy" className="photo-blur" aria-hidden="true" />
                        <img src={photo} alt="" loading="lazy" className="photo-fit" />
                      </>
                    ) : (
                      <FlagCover country={s.country} name={t.countries[s.country]} />
                    )}
                    <span className="pill gold">{t.archive.photos(s.gallery.length)}</span>
                  </div>
                  <div className="card-body">
                    <span className="card-place">{[t.countries[s.country], text.city].filter(Boolean).join(", ")}</span>
                    <h3>{text.title}</h3>
                    {s.paid_until && (
                      <span className="muted small">
                        {t.archive.ended}: {text.sessions || date(s.paid_until)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
