import Link from "next/link";
import { Flag } from "@/components/Flag";
import { DICTIONARIES, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { isFeatured, localText, type School } from "@/lib/schools";

export function priceLabel(school: School, locale: Locale): string {
  const t = DICTIONARIES[locale];
  return school.price ? t.common.from(formatPrice(school.price, school.currency, locale)) : t.common.priceOnRequest;
}

export function SchoolCard({ school, locale }: { school: School; locale: Locale }) {
  const t = DICTIONARIES[locale];
  const text = localText(school, locale);
  const place = [t.countries[school.country], text.city].filter(Boolean).join(", ");
  return (
    <Link href={`/schools/${school.slug}`} className="card">
      <div className="card-photo" data-country={school.country}>
        {school.main_photo ? <img src={school.main_photo} alt="" loading="lazy" /> : <Flag country={school.country} size={88} className="photo-flag" />}
        {isFeatured(school) && <span className="pill gold">{t.school.recommended}</span>}
      </div>
      <div className="card-body">
        <span className="card-place">
          <Flag country={school.country} size={18} />
          {place}
        </span>
        <h3>{text.title}</h3>
        <dl className="card-facts">
          <div>
            <dt>{t.school.ages}</dt>
            <dd>{t.common.ages(school.age_min, school.age_max)}</dd>
          </div>
          <div>
            <dt>{t.school.duration}</dt>
            <dd>{t.common.weeks(school.duration_weeks)}</dd>
          </div>
          {text.meals && (
            <div>
              <dt>{t.school.meals}</dt>
              <dd>{text.meals}</dd>
            </div>
          )}
          {text.room && (
            <div>
              <dt>{t.school.room}</dt>
              <dd>{text.room}</dd>
            </div>
          )}
        </dl>
        <div className="card-foot">
          <b>{priceLabel(school, locale)}</b>
          <span className="more">{t.common.more} →</span>
        </div>
      </div>
    </Link>
  );
}
