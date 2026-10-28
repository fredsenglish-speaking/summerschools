/** The sunny backdrop behind every hero: sun, drifting clouds and sea waves. Purely decorative. */
export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sun">
        <span className="rays" />
      </div>
      <span className="cloud c1" />
      <span className="cloud c2" />
      <span className="cloud c3" />
      <svg className="waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 60c120 30 240 30 360 0s240-30 360 0 240 30 360 0 240-30 360 0v60H0z" fill="#5eead4" opacity="0.55" />
        <path d="M0 80c160 24 320 24 480 0s320-24 480 0 320 24 480 0v40H0z" fill="#2dd4bf" opacity="0.5" />
        <path d="M0 100c180 16 360 16 540 0s360-16 540 0 360 16 360 0v20H0z" fill="#faf6ef" />
      </svg>
    </div>
  );
}
