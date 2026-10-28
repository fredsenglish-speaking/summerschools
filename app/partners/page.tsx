import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { TIERS, type Tier } from "@/lib/schools";
import { PartnerForm } from "./PartnerForm";
import { Sky } from "@/components/Sky";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).nav.partners };
}

export default async function Partners({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const t = (await getT()).partners;
  const chosen = (await searchParams).tier;
  const tier: Tier = (TIERS as readonly string[]).includes(chosen ?? "") ? (chosen as Tier) : "top";

  return (
    <>
      <section className="hero">
        <Sky />
        <div className="wrap hero-inner">
          <span className="pill gold">{t.badge}</span>
          <h1>{t.title}</h1>
          <p className="lead">{t.lead}</p>
        </div>
      </section>

      <section className="wrap section">
        <h2 className="plans-head">{t.tariffsTitle}</h2>
        <div className="plans">
          {TIERS.map((x) => (
            <div key={x} className={x === tier ? "plan chosen" : "plan"}>
              {x === "top" && <span className="pill gold">{t.popular}</span>}
              <h3>{t.tiers[x].name}</h3>
              <p className="muted">
                {t.priceOnRequest} · {t.perSeason}
              </p>
              <ul className="ticks">
                {t.tiers[x].items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <Link href={`/partners?tier=${x}#apply`} scroll={false} className="btn dark">
                {t.choose}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="soft">
        <div className="wrap section">
          <h2>{t.howTitle}</h2>
          <ol className="steps">
            {t.steps.map((s, i) => (
              <li key={s.title}>
                <b className="step-no">{i + 1}</b>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" className="wrap section narrow">
        <h2>{t.formTitle}</h2>
        <PartnerForm tier={tier} />
        <p>
          <Link href="/submit" className="btn ghost">
            {(await getT()).submit.cta}
          </Link>
        </p>
      </section>
    </>
  );
}
