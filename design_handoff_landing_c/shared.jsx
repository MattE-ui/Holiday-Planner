/* Shared building blocks for the landing-page directions.
   SmartImage falls back to an on-brand gradient if a photo ever fails to load,
   so the layouts never show a broken image. */

const { useState, useRef, useEffect } = React;

const FALLBACKS = [
  "linear-gradient(135deg, #1F4E5F, #2E7D8A 55%, #5BA7A0)",
  "linear-gradient(135deg, #234e6e, #3a7ca5 55%, #79b3c4)",
  "linear-gradient(135deg, #1d6a6a, #2f8f8f 55%, #7cc0b4)",
];
function hashIndex(seed, mod) {
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) >>> 0;
  return h % mod;
}

/** Photographic fill with graceful gradient fallback. position/extra style pass-through. */
function SmartImage({ src, alt, seed, className, style, imgStyle }) {
  const [failed, setFailed] = useState(false);
  const grad = FALLBACKS[hashIndex(seed || alt || src || "x", FALLBACKS.length)];
  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: grad, ...style }}
      role="img"
      aria-label={alt}
    >
      {!failed && src && (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            ...imgStyle,
          }}
        />
      )}
    </div>
  );
}

/* ---- tiny line icons (1.5px stroke, currentColor) ---- */
const Ico = {
  pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  cal: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  ),
  bed: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 18v-7m0 7h18m0 0v-7M3 11h18m0 0a3 3 0 0 0-3-3h-4v3M3 11V7" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plane: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10.5 13.5 3 11l1-2 8 1.5 4.5-5a2 2 0 0 1 3 3l-5 4.5L15 21l-2 1-2.5-7.5Z" />
    </svg>
  ),
  coins: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </svg>
  ),
};

/** Holiday Planner wordmark — Spectral, with a small teal seal. */
function Wordmark({ light, compact }) {
  const fg = light ? "#fff" : "hsl(193 52% 25%)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 30, height: 30, borderRadius: 999,
          background: light ? "rgba(255,255,255,.16)" : "hsl(193 52% 25%)",
          color: light ? "#fff" : "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: light ? "1px solid rgba(255,255,255,.5)" : "none",
          backdropFilter: light ? "blur(4px)" : "none",
        }}
      >
        <Ico.plane width="15" height="15" />
      </span>
      {!compact && (
        <span style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 18, letterSpacing: "-.01em", color: fg, whiteSpace: "nowrap" }}>
          Holiday Planner
        </span>
      )}
    </div>
  );
}

/** Status chip — text + tone, never colour alone (brand a11y rule). */
function StatusChip({ label, tone, light }) {
  const tones = {
    shortlisted: { bg: "rgba(20,83,55,.14)", fg: "hsl(142 58% 26%)", dot: "hsl(142 58% 34%)" },
    idea: { bg: "rgba(120,120,120,.14)", fg: "hsl(199 14% 38%)", dot: "hsl(199 14% 52%)" },
    booked: { bg: "rgba(20,83,55,.16)", fg: "hsl(142 58% 24%)", dot: "hsl(142 58% 34%)" },
  };
  const t = tones[tone] || tones.idea;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 600, letterSpacing: ".01em",
        padding: "4px 10px 4px 8px", borderRadius: 999,
        background: light ? "rgba(255,255,255,.18)" : t.bg,
        color: light ? "#fff" : t.fg,
        border: light ? "1px solid rgba(255,255,255,.34)" : "1px solid transparent",
        backdropFilter: light ? "blur(4px)" : "none",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: light ? "#fff" : t.dot }} />
      {label}
    </span>
  );
}

Object.assign(window, { SmartImage, Ico, Wordmark, StatusChip });
