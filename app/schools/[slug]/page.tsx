import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag } from "@/components/Flag";
import { priceLabel } from "@/components/SchoolCard";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getContact } from "@/lib/contact";
import { getSchoolBySlug } from "@/lib/data";
import { DICTIONARIES } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { isFeatured, linesToList, localText } from "@/lib/schools";
import { whatsappLink } from "@/lib/whatsapp";
import { InquiryForm } from "./InquiryForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await getSchoolBySlug((await params).slug);
  if (!school) return {};
  const text = localText(school, await getLocale());
  return { title: text.title, description: text.description.slice(0, 160) || undefined };
}

const ICONS = {
  ages: "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  duration: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  months: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2",
  sessions: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  meals: "M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 2-3 6s1 5 3 5v7",
  room: "M3 18V8M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6",
  excursions: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  transfer: "M5 17V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11M5 12h14M7 17v2M17 17v2M3 17h18",
};

export default async function SchoolPage({ params }: Props) {
  const school = await getSchoolBySlug((await params).slug);
  if (!school) notFound();
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const text = localText(school, locale);
  const contact = getContact();
  const sessions = linesToList(text.sessions.replace(/;/g, "\n"));
  const facts = [
    { key: "ages", label: t.school.ages, value: t.common.ages(school.age_min, school.age_max) },
    { key: "duration", label: t.school.duration, value: t.common.weeks(school.duration_weeks) },
    { key: "months", label: t.school.months, value: (school.months ?? []).map((m) => t.common.months[m - 1]).join(", ") },
    { key: "sessions", label: t.school.sessions, value: sessions.join(", ") },
    { key: "meals", label: t.school.meals, value: text.meals },
    { key: "room", label: t.school.room, value: text.room },
    { key: "excursions", label: t.school.excursions, value: text.excursions },
    { key: "transfer", label: t.school.transfer, value: text.transfer },
  ].filter((f) => f.value) as { key: keyof typeof ICONS; label: string; value: string }[];

  return (
    <div className="wrap section school">
      <nav className="crumbs">
        <Link href="/#schools">{t.school.back}</Link> / {t.countries[school.country]}
        {text.city && ` / ${text.city}`}
      </nav>

      <div className="school-photo" data-country={school.country}>
        {school.main_photo ? <img src={school.main_photo} alt={text.title} /> : <Flag country={school.country} size={140} className="photo-flag" />}
        {isFeatured(school) && <span className="pill gold">{t.school.recommended}</span>}
      </div>

      <div className="school-cols">
        <div className="school-main">
          <div className="stack">
            <span className="card-place">
              <Flag country={school.country} size={20} />
              {[t.countries[school.country], text.city].filter(Boolean).join(", ")}
            </span>
            <h1>{text.title}</h1>
            {text.description && <p className="prose">{text.description}</p>}
          </div>

          <div className="facts">
            {facts.map((f) => (
              <div key={f.key} className="fact">
                <span className="fact-icon">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[f.key]} />
                  </svg>
                </span>
                <div>
                  <span className="muted small">{f.label}</span>
                  <b>{f.value}</b>
                </div>
              </div>
            ))}
          </div>

          {(text.included.length > 0 || text.excluded.length > 0) && (
            <div className="inout">
              {text.included.length > 0 && (
                <div className="in">
                  <h2>{t.school.included}</h2>
                  <ul>
                    {text.included.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
              {text.excluded.length > 0 && (
                <div className="out">
                  <h2>{t.school.excluded}</h2>
                  <ul>
                    {text.excluded.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {school.gallery.length > 0 && (
            <div className="stack">
              <h2>{t.school.gallery}</h2>
              <div className="gallery">
                {school.gallery.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="apply">
          <div>
            <span className="muted small">
              {t.school.price}, {t.common.weeks(school.duration_weeks)}
            </span>
            <b className="apply-price">{priceLabel(school, locale)}</b>
          </div>
          <h2>{t.school.applyTitle}</h2>
          <InquiryForm schoolId={school.id} schoolTitle={text.title} sessions={sessions} />
          {contact.whatsapp && (
            <a href={whatsappLink(contact.whatsapp, t.school.whatsappText(text.title))} className="btn wa big">
              <WhatsAppIcon /> {t.common.whatsapp}
            </a>
          )}
          {contact.phone && <span className="muted small center">{t.school.orCall(contact.phone)}</span>}
        </aside>
      </div>
    </div>
  );
}
