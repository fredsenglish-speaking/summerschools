import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { requireAdmin } from "@/lib/auth";
import { bakuToday } from "@/lib/format";
import { DICTIONARIES, INTL_LOCALE } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { isListed, localText, type School } from "@/lib/schools";
import { whatsappDigits } from "@/lib/whatsapp";
import { markHandled } from "./actions";

export const metadata: Metadata = { robots: { index: false } };

type Inquiry = {
  id: string;
  created_at: string;
  school_title: string;
  parent_name: string;
  phone: string;
  child_age: number | null;
  session: string;
  message: string;
  handled: boolean;
};

type PartnerRequest = {
  id: string;
  created_at: string;
  company: string;
  phone: string;
  country: string;
  tier: School["tier"];
  message: string;
  handled: boolean;
};

function HandledButton({ id, table, label }: { id: string; table: string; label: string }) {
  return (
    <form action={markHandled}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="table" value={table} />
      <button type="submit" className="btn ghost small">
        {label}
      </button>
    </form>
  );
}

export default async function Admin() {
  await requireAdmin();
  const locale = await getLocale();
  const t = DICTIONARIES[locale];
  const a = t.admin;
  const supabase = await createClient();
  const [{ data: schools }, { data: inquiries }, { data: requests }] = await Promise.all([
    supabase.from("schools").select("*").order("created_at", { ascending: false }),
    supabase.from("inquiries").select("*").order("handled").order("created_at", { ascending: false }).limit(200),
    supabase.from("partner_requests").select("*").order("handled").order("created_at", { ascending: false }).limit(100),
  ]);
  const today = bakuToday();
  const when = (iso: string) =>
    new Date(iso).toLocaleString(INTL_LOCALE[locale], { timeZone: "Asia/Baku", dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="wrap section stack">
      <h1>{a.title}</h1>

      <section className="panel stack">
        <div className="section-head">
          <h2>{a.schools}</h2>
          <Link href="/admin/schools/new" className="btn gold">
            {a.addSchool}
          </Link>
        </div>
        <p className="muted small">
          {a.submitLink} <Link href="/submit">summerschools.vercel.app/submit</Link>
        </p>
        {!schools?.length ? (
          <p className="muted">{a.noSchools}</p>
        ) : (
          <div className="table-box">
            <table>
              <tbody>
                {(schools as School[]).map((s) => {
                  const status = !s.published ? (s.submitted ? a.submitted : a.draft) : isListed(s, today) ? a.published : a.expired;
                  return (
                    <tr key={s.id}>
                      <td>
                        <b>{localText(s, locale).title}</b>
                        <div className="muted small">
                          <Flag country={s.country} size={14} /> {t.countries[s.country]} · {t.common.ages(s.age_min, s.age_max)} · {t.common.weeks(s.duration_weeks)}
                        </div>
                      </td>
                      <td>
                        {s.organizer || a.own}
                        {s.organizer_contact && <div className="muted small">{s.organizer_contact}</div>}
                      </td>
                      <td>{t.partners.tiers[s.tier].name}</td>
                      <td>
                        {status}
                        {s.paid_until && <div className="muted small">{s.paid_until}</div>}
                      </td>
                      <td className="actions">
                        <Link href={`/admin/schools/${s.id}`}>{a.edit}</Link>
                        {s.published && <Link href={`/schools/${s.slug}`}>{a.view}</Link>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel stack">
        <h2>{a.inquiries}</h2>
        {!inquiries?.length ? (
          <p className="muted">{a.noInquiries}</p>
        ) : (
          <div className="requests">
            {(inquiries as Inquiry[]).map((q) => {
              const wa = whatsappDigits(q.phone);
              return (
                <div key={q.id} className={q.handled ? "request done" : "request"}>
                  <div className="request-head">
                    <b>{q.parent_name}</b>
                    <span className="muted small">{when(q.created_at)}</span>
                  </div>
                  <div>
                    <a href={`tel:${q.phone.replace(/[^\d+]/g, "")}`}>{q.phone}</a>
                    {wa && (
                      <>
                        {" · "}
                        <a href={`https://wa.me/${wa}`}>WhatsApp</a>
                      </>
                    )}
                  </div>
                  <div className="small">
                    {q.school_title}
                    {q.session && ` · ${q.session}`}
                    {q.child_age && ` · ${t.school.childAge}: ${q.child_age}`}
                  </div>
                  {q.message && <p className="small">{q.message}</p>}
                  {q.handled ? <span className="pill">{a.handled}</span> : <HandledButton id={q.id} table="inquiries" label={a.markHandled} />}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel stack">
        <h2>{a.partnerRequests}</h2>
        {!requests?.length ? (
          <p className="muted">{a.noPartnerRequests}</p>
        ) : (
          <div className="requests">
            {(requests as PartnerRequest[]).map((r) => (
              <div key={r.id} className={r.handled ? "request done" : "request"}>
                <div className="request-head">
                  <b>{r.company}</b>
                  <span className="muted small">{when(r.created_at)}</span>
                </div>
                <div>
                  <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a>
                  {r.country && ` · ${r.country}`} · {t.partners.tiers[r.tier].name}
                </div>
                {r.message && <p className="small">{r.message}</p>}
                {r.handled ? <span className="pill">{a.handled}</span> : <HandledButton id={r.id} table="partner_requests" label={a.markHandled} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
