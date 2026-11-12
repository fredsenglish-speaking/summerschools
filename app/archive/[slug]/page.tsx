import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArchiveBySlug } from "@/lib/data";
import { DICTIONARIES, INTL_LOCALE } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { localText, photoFor } from "@/lib/schools";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await getArchiveBySlug((await params).slug);
  const locale = await getLocale();
  return { title: school ? localText(school, locale).title : DICTIONARIES[locale].archive.title };
}

export default async function Album({ params }: Props) {
  const school = await getArchiveBySlug((await params).slug);
  if (!school) notFound();
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const text = localText(school, locale);
  const photo = photoFor(school, locale);
  const ended = school.paid_until
    ? new Date(`${school.paid_until}T12:00:00`).toLocaleDateString(INTL_LOCALE[locale], { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="wrap section stack album-page">
      <Link href="/archive" className="muted">
        ← {t.archive.back}
      </Link>
      <div className="section-head">
        <h1>{text.title}</h1>
        <span className="muted">
          {[t.countries[school.country], text.city].filter(Boolean).join(", ")} · {t.archive.ended}: {text.sessions || ended}
        </span>
      </div>
      {text.description && <p className="lead-dark">{text.description}</p>}

      <div className="album-grid">
        {photo && (
          <a href={photo} target="_blank" rel="noreferrer" className="album-poster">
            <img src={photo} alt={text.title} />
          </a>
        )}
        {school.gallery.map((src) => (
          <a key={src} href={src} target="_blank" rel="noreferrer">
            <img src={src} alt="" loading="lazy" />
          </a>
        ))}
      </div>
      {school.gallery.length === 0 && <p className="empty">{t.archive.soon}</p>}
    </div>
  );
}
