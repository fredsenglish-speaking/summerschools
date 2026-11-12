import "server-only";
import { LOCALES, type Locale } from "./i18n";
import { LIST_FIELDS, TEXT_FIELDS, type LocalText } from "./schools";

type I18n = Partial<Record<Locale, Partial<LocalText>>>;

async function translateChunk(text: string, from: Locale, to: Locale): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    // GET so Next can keep the answer for a month: each text is translated once, not on every visit.
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!res.ok) return null;
    const data = (await res.json()) as [[string, string][]];
    const out = data?.[0]?.map((part) => part?.[0] ?? "").join("");
    return out?.trim() ? out : null;
  } catch {
    return null;
  }
}

/** Machine-translates one text, a few paragraphs at a time. Returns null when the service is unreachable. */
async function translate(text: string, from: Locale, to: Locale): Promise<string | null> {
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (current && current.length + line.length > 1200) {
      chunks.push(current);
      current = line;
    } else current = current ? `${current}\n${line}` : line;
  }
  if (current) chunks.push(current);
  const parts = await Promise.all(chunks.map((c) => (c.trim() ? translateChunk(c, from, to) : Promise.resolve(c))));
  if (parts.some((p) => p === null)) return null;
  return parts.join("\n").trim();
}

/**
 * Fills every empty text field in each language from the first language that has it
 * (Azerbaijani first), so a school written in one language reads in all three.
 * Text Ms Jane typed herself is never overwritten. Returns how many fields were filled.
 */
export async function fillTranslations(i18n: I18n, only?: Locale): Promise<number> {
  const jobs: Promise<void>[] = [];
  let filled = 0;
  for (const to of only ? [only] : LOCALES) {
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
