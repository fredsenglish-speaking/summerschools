"use client";

import { Children, useEffect, useState } from "react";

/** Shows its children one at a time, fading to the next every few seconds. Pauses while hovered. */
export function Carousel({ children, label, interval = 5000 }: { children: React.ReactNode; label: string; interval?: number }) {
  const slides = Children.toArray(children);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), interval);
    return () => clearInterval(id);
  }, [n, paused, interval]);

  return (
    <div className="carousel" aria-roledescription="carousel" aria-label={label} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
  );
}
