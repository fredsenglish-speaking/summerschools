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
          <img src="/logo.png" alt="International Summer Schools" width={186} height={130} className="footer-logo" />
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
              <a href={`https://instagram.com/${instagram}`} className="insta-link" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                @{instagram}
              </a>
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
          <p>
            <Link href="/about">{t.nav.about}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
