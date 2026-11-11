import "server-only";
import { LOCALES, type Locale } from "./i18n";
import { LIST_FIELDS, TEXT_FIELDS, type LocalText } from "./schools";

type I18n = Partial<Record<Locale, Partial<LocalText>>>;

/** Machine-translates one text. Returns null when the service is unreachable, so callers keep the field empty. */
async function translate(text: string, from: Locale, to: Locale): Promise<string | null> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ q: text }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as [[string, string][]];
    const out = data?.[0]?.map((part) => part?.[0] ?? "").join("");
    return out?.trim() ? out.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Fills every empty text field in each language from the first language that has it
 * (Azerbaijani first), so a school written in one language reads in all three.
 * Text Ms Jane typed herself is never overwritten. Returns how many fields were filled.
 */
export async function fillTranslations(i18n: I18n): Promise<number> {
  const jobs: Promise<void>[] = [];
  let filled = 0;
  for (const to of LOCALES) {
    const target = (i18n[to] ??= {});
    for (const f of [...TEXT_FIELDS, ...LIST_FIELDS]) {
      const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");
      if (has(target[f])) continue;
      const from = LOCALES.find((l) => l !== to && has(i18n[l]?.[f]));
      if (!from) continue;
      const source = i18n[from]![f]!;
      const isList = Array.isArray(source);
      jobs.push(
        translate(isList ? (source as string[]).join("\n") : (source as string), from, to).then((out) => {
          if (!out) return;
          (target as Record<string, unknown>)[f] = isList ? out.split("\n").map((s) => s.trim()).filter(Boolean) : out;
          filled++;
        }),
      );
    }
  }
  await Promise.all(jobs);
  return filled;
}
