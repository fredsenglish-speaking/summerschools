import { getContact } from "@/lib/contact";
import { getT } from "@/lib/i18n/server";

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

/** Round WhatsApp button fixed in the corner of every page. */
export async function WhatsAppButton() {
  const { whatsapp } = getContact();
  if (!whatsapp) return null;
  const t = await getT();
  return (
    <a href={`https://wa.me/${whatsapp}`} className="wa-float" aria-label={t.common.whatsapp}>
      <WhatsAppIcon size={28} />
    </a>
  );
}
