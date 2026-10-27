"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { DICTIONARIES, LOCALES } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";
import { shrinkImage } from "@/lib/shrinkImage";
import { COUNTRIES, CURRENCIES, LIST_FIELDS, TEXT_FIELDS, TIERS, type School } from "@/lib/schools";
import { saveSchool, uploadPhoto, type SaveState } from "./actions";

/** Picks photos, shrinks and uploads each one, and reports the links back. */
function PhotoPicker({ multiple, onAdd }: { multiple: boolean; onAdd: (urls: string[]) => void }) {
  const t = useT().admin.form;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setError("");
    const urls: string[] = [];
    for (const file of files) {
      const data = new FormData();
      data.set("file", await shrinkImage(file).catch(() => file));
      const res = await uploadPhoto(data);
      if (res.url) urls.push(res.url);
      else setError(res.error ?? t.uploadFailed);
    }
    setBusy(false);
    if (urls.length) onAdd(urls);
  }

  return (
    <div className="stack tight">
      <label className="btn ghost small file">
        {busy ? t.uploading : t.upload}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={pick} disabled={busy} hidden />
      </label>
      {error && <p className="notice err">{error}</p>}
    </div>
  );
}

export function SchoolForm({ school }: { school?: School }) {
  const tAll = useT();
  const t = tAll.admin.form;
  const [state, action] = useActionState<SaveState, FormData>(saveSchool, {});
  const [mainPhoto, setMainPhoto] = useState(school?.main_photo ?? "");
  const [gallery, setGallery] = useState<string[]>(school?.gallery ?? []);

  return (
    <form action={action} className="form admin-form">
      {school && <input type="hidden" name="id" value={school.id} />}
      <input type="hidden" name="main_photo" value={mainPhoto} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />

      <fieldset>
        <legend>{t.basics}</legend>
        <label className="check">
          <input type="checkbox" name="published" defaultChecked={school?.published ?? true} />
          <span>{t.published}</span>
        </label>
        <div className="three">
          <label>
            <span>{t.country}</span>
            <select name="country" defaultValue={school?.country ?? "uk"}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {tAll.countries[c]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t.ageMin}</span>
            <input name="age_min" type="number" min={1} max={99} required defaultValue={school?.age_min ?? 10} />
          </label>
          <label>
            <span>{t.ageMax}</span>
            <input name="age_max" type="number" min={1} max={99} required defaultValue={school?.age_max ?? 16} />
          </label>
          <label>
            <span>{t.weeks}</span>
            <input name="duration_weeks" type="number" min={1} max={52} required defaultValue={school?.duration_weeks ?? 2} />
          </label>
          <label>
            <span>{t.price}</span>
            <input name="price" inputMode="decimal" defaultValue={school?.price ?? ""} />
          </label>
          <label>
            <span>{t.currency}</span>
            <select name="currency" defaultValue={school?.currency ?? "USD"}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="stack tight">
          <span className="muted small">{t.months}</span>
          <div className="months">
            {tAll.common.months.map((m, i) => (
              <label key={m} className="check">
                <input type="checkbox" name="months" value={i + 1} defaultChecked={(school?.months ?? [6, 7, 8]).includes(i + 1)} />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </div>
        <label>
          <span>{t.slug}</span>
          <input name="slug" defaultValue={school?.slug ?? ""} pattern="[a-z0-9\-]*" />
        </label>
      </fieldset>

      <fieldset>
        <legend>{t.placement}</legend>
        <div className="three">
          <label>
            <span>{t.organizer}</span>
            <input name="organizer" defaultValue={school?.organizer ?? ""} />
          </label>
          <label>
            <span>{t.tier}</span>
            <select name="tier" defaultValue={school?.tier ?? "standard"}>
              {TIERS.map((x) => (
                <option key={x} value={x}>
                  {tAll.partners.tiers[x].name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t.paidUntil}</span>
            <input name="paid_until" type="date" defaultValue={school?.paid_until ?? ""} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t.photos}</legend>
        <div className="stack tight">
          <b>{t.mainPhoto}</b>
          {mainPhoto && (
            <div className="thumbs">
              <figure>
                <img src={mainPhoto} alt="" />
                <button type="button" className="link" onClick={() => setMainPhoto("")}>
                  {t.remove}
                </button>
              </figure>
            </div>
          )}
          <PhotoPicker multiple={false} onAdd={(urls) => setMainPhoto(urls[0])} />
        </div>
        <div className="stack tight">
          <b>{t.gallery}</b>
          {gallery.length > 0 && (
            <div className="thumbs">
              {gallery.map((src) => (
                <figure key={src}>
                  <img src={src} alt="" />
                  <button type="button" className="link" onClick={() => setGallery((g) => g.filter((x) => x !== src))}>
                    {t.remove}
                  </button>
                </figure>
              ))}
            </div>
          )}
          <PhotoPicker multiple onAdd={(urls) => setGallery((g) => [...g, ...urls])} />
        </div>
      </fieldset>

      <fieldset>
        <legend>{t.texts}</legend>
        <p className="muted small">{t.textsHint}</p>
        {LOCALES.map((l) => {
          const text = school?.i18n?.[l] ?? {};
          return (
            <details key={l} open={l === "az"} className="lang-block">
              <summary>{DICTIONARIES[l].langName}</summary>
              {TEXT_FIELDS.map((f) => (
                <label key={f}>
                  <span>{t.fields[f]}</span>
                  {f === "description" ? (
                    <textarea name={`${l}.${f}`} rows={5} defaultValue={text[f] ?? ""} />
                  ) : (
                    <input name={`${l}.${f}`} defaultValue={text[f] ?? ""} required={l === "az" && f === "title"} />
                  )}
                </label>
              ))}
              <div className="two">
                {LIST_FIELDS.map((f) => (
                  <label key={f}>
                    <span>{t.fields[f]}</span>
                    <textarea name={`${l}.${f}`} rows={6} defaultValue={(text[f] ?? []).join("\n")} />
                  </label>
                ))}
              </div>
            </details>
          );
        })}
      </fieldset>

      {state.error && <p className="notice err">{state.error}</p>}
      <SubmitButton className="btn gold big">{t.save}</SubmitButton>
    </form>
  );
}
