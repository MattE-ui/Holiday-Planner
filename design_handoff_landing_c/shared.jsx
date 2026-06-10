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
  thermo: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 9v6.5" />
    </svg>
  ),
  sun: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  ),
  wave: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 7c2.2 0 2.2 2 4.4 2S8.6 7 10.8 7 13 9 15.2 9 17.4 7 19.6 7 21.8 9 22 9M2 13c2.2 0 2.2 2 4.4 2s2.2-2 4.4-2 2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 2.4 2" />
    </svg>
  ),
  users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5M16 5.2a3.2 3.2 0 0 1 0 6M17.5 14.7c2.2.5 3.9 2.5 3.9 5.3" />
    </svg>
  ),
  bath: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12V6.5A2.5 2.5 0 0 1 6.5 4 2.5 2.5 0 0 1 9 6.5M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2ZM5 18l-1 2M19 18l1 2M8.5 6.5h2.5" />
    </svg>
  ),
  snow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2v20M4.5 6.5 12 11l7.5-4.5M4.5 17.5 12 13l7.5 4.5M12 2l-2.5 2.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5M4.5 6.5l.3 3.4M4.5 6.5l-3.4.3M19.5 17.5l-.3-3.4M19.5 17.5l3.4-.3" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M12 3.2l2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 16.9 6.8 19l1.2-5.8-4.4-4 5.9-.7L12 3.2Z" />
    </svg>
  ),
  camera: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 8.5A2 2 0 0 1 5 6.5h1.5l1-1.6h6l1 1.6H17a2 2 0 0 1 2 2v8A2 2 0 0 1 17 18.5H5a2 2 0 0 1-2-2Z" />
      <circle cx="11" cy="12" r="3" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12.5l5 5 11-11" />
    </svg>
  ),
  heart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20s-7-4.4-9.2-9C1.3 7.7 3 5 5.8 5 7.7 5 9 6.2 12 9c3-2.8 4.3-4 6.2-4C21 5 22.7 7.7 21.2 11 19 15.6 12 20 12 20Z" />
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
