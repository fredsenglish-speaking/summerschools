import Link from "next/link";
import { getContact } from "@/lib/contact";
import { getT } from "@/lib/i18n/server";

export async function Footer() {
  const t = await getT();
  const { phone, tel, whatsapp, instagram, address } = getContact();
  return (
    <footer id="contact" className="footer">
      <div className="wrap footer-grid">
        <div>
          <img src="/logo.png" alt="International Summer School" width={177} height={130} className="footer-logo" />
          {address && <p>{address}</p>}
        </div>
        <div>
          <b>{t.nav.contact}</b>
          {phone && (
            <p>
              {t.footer.phone}: <a href={`tel:${tel}`}>{phone}</a>
            </p>
          )}
          {whatsapp && (
            <p>
              WhatsApp: <a href={`https://wa.me/${whatsapp}`}>+{whatsapp}</a>
            </p>
          )}
          {instagram && (
            <p>
              Instagram: <a href={`https://instagram.com/${instagram}`}>@{instagram}</a>
            </p>
          )}
        </div>
        <div>
          <b>{t.footer.sections}</b>
          <p>
            <Link href="/#schools">{t.nav.schools}</Link>
          </p>
          <p>
            <Link href="/partners">{t.nav.partners}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
