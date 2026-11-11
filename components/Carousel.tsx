"use client";

import { Children, useEffect, useState } from "react";

/** Shows its children one at a time, fading to the next every few seconds, with a strip of all slides below. */
export function Carousel({
  children,
  label,
  thumbs = [],
  interval = 4500,
}: {
  children: React.ReactNode;
  label: string;
  thumbs?: { src: string | null; title: string }[];
  interval?: number;
}) {
  const slides = Children.toArray(children);
  const [i, setI] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n < 2) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), interval);
    return () => clearTimeout(id);
  }, [n, interval, i]);

  return (
    <>
    <div className="carousel" aria-roledescription="carousel" aria-label={label}>
      {slides.map((s, k) => (
        <div key={k} className={k === i ? "slide on" : "slide"} aria-hidden={k !== i} inert={k !== i}>
          {s}
        </div>
      ))}
      {n > 1 && (
        <>
          <button type="button" className="car-arrow prev" aria-label="‹" onClick={() => setI((i - 1 + n) % n)}>
            ‹
          </button>
          <button type="button" className="car-arrow next" aria-label="›" onClick={() => setI((i + 1) % n)}>
            ›
          </button>
          <div className="dots">
            {slides.map((_, k) => (
              <button key={k} type="button" aria-label={String(k + 1)} aria-current={k === i} onClick={() => setI(k)} />
            ))}
          </div>
        </>
      )}
    </div>
    {n > 1 && thumbs.length === n && (
      <div className="car-thumbs">
        {thumbs.map((th, k) => (
          <button key={k} type="button" className={k === i ? "on" : ""} aria-label={th.title} aria-current={k === i} onClick={() => setI(k)}>
            {th.src ? <img src={th.src} alt="" loading="lazy" /> : null}
            <span>{th.title}</span>
          </button>
        ))}
      </div>
    )}
    </>
  );
}