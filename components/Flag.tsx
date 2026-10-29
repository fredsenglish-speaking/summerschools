import type { Country } from "@/lib/schools";

/** Square flag files in public/flags (from the MIT-licensed flag-icons set). */
const FILES: Partial<Record<Country, string>> = { usa: "us", uk: "gb", cn: "cn", eu: "eu", tr: "tr", az: "az" };

/** A square flag; "other" and "all countries" get a globe. */
export function Flag({ country, size = 24, className = "" }: { country: Country | "all"; size?: number; className?: string }) {
  const file = country === "all" ? undefined : FILES[country];
  const style = { width: size, height: size };
  if (file) return <img src={`/flags/${file}.svg`} alt="" className={`flag ${className}`} style={style} />;
  return (
    <span className={`flag globe ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
      </svg>
    </span>
  );
}

/** A flag filling its whole box, with the country name written over it. */
export function FlagCover({ country, name, note }: { country: Country; name: string; note?: string }) {
  const file = FILES[country];
  return (
    <span className="flag-cover">
      {file && <img src={`/flags/wide/${file}.svg`} alt="" loading="lazy" />}
      {name && (
        <span className="flag-name">
          <b>{name}</b>
          {note && <small>{note}</small>}
        </span>
      )}
    </span>
  );
}
