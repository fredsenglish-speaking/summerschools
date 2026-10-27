import "server-only";
import { whatsappDigits } from "./whatsapp";

/** The one set of contacts shown across the site; every enquiry goes to this phone. */
export function getContact() {
  const phone = (process.env.CONTACT_PHONE ?? "").trim();
  return {
    phone,
    tel: phone.replace(/[^\d+]/g, ""),
    whatsapp: whatsappDigits(process.env.WHATSAPP_NUMBER?.trim() || phone),
    instagram: (process.env.INSTAGRAM ?? "").trim().replace(/^@/, ""),
    address: (process.env.ADDRESS ?? "").trim(),
  };
}
