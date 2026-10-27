import "server-only";
import { whatsappDigits } from "./whatsapp";

/** Used when CONTACT_PHONE is not set. */
const DEFAULT_PHONE = "+994 50 488 36 66";

/** The one set of contacts shown across the site; every enquiry goes to this phone. */
export function getContact() {
  const phone = process.env.CONTACT_PHONE?.trim() || DEFAULT_PHONE;
  return {
    phone,
    tel: phone.replace(/[^\d+]/g, ""),
    whatsapp: whatsappDigits(process.env.WHATSAPP_NUMBER?.trim() || phone),
    instagram: (process.env.INSTAGRAM ?? "").trim().replace(/^@/, ""),
    address: (process.env.ADDRESS ?? "").trim(),
  };
}
