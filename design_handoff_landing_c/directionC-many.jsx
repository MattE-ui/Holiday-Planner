/* Direction C at scale (desktop, 6 locations).
   The ±9° fan is a flourish that works for 3–4. Past that it becomes a wider,
   gently-fanned "hand" of postcards that scrolls horizontally — same tactile
   metaphor, readable names, brings the active card forward. Hero re-skins to it. */

function ManyCard({ loc, i, active, setActive }) {
  const [hover, setHover] = useState(false);
  const d = i - active;
  const ad = Math.abs(d);
  const tx = d * 146;
  const baseTy = ad === 0 ? -26 : ad === 1 ? 2 : 16;
  const ty = baseTy - (hover && ad !== 0 ? 12 : 0);
  const rot = hover && ad !== 0 ? 0 : d * 3.5;
  const scale = ad === 0 ? 1.06 : ad === 1 ? 0.98 : ad === 2 ? 0.9 : 0.85;
  const baseOpacity = ad === 0 ? 1 : ad === 1 ? 1 : ad === 2 ? 0.5 : ad === 3 ? 0.16 : 0;
  const opacity = hover && baseOpacity > 0.1 ? Math.max(baseOpacity, 0.95) : baseOpacity;
  const isActive = ad === 0;
  return (
    <div
      onClick={() => setActive(i)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute", left: "50%", bottom: 0, width: 190, height: 250, marginLeft: -95,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transformOrigin: "bottom center",
        transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
        opacity,
        pointerEvents: baseOpacity < 0.2 ? "none" : "auto",
        zIndex: isActive ? 100 : hover ? 95 : 90 - ad * 10,
        border: "3px solid #fff",
        boxShadow: isActive || hover ? "0 16px 34px rgba(0,0,0,.40)" : "0 10px 24px rgba(0,0,0,.30)",
        transition: "transform .55s cubic-bezier(.22,1,.36,1), opacity .55s, box-shadow .35s",
      }}
    >
      <CoverFill loc={loc} active={isActive} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,0) 56%)" }} />
      <div style={{ position: "absolute", left: 12, right: 11, bottom: 12 }}>
        <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 18, color: "#fff", lineHeight: 1 }}>{loc.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.82)", marginTop: 2 }}>{loc.country}</div>
        <div style={{ marginTop: 7 }}>
          {loc.from != null
            ? <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>From {window.HP.gbp(loc.from)}</span>
            : <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>Researching</span>}
        </div>
      </div>
    </div>
  );
}

function DirectionCMany() {
  const f = window.HP.featured;
  const locs = window.HP.manyLocations;
  const [active, setActive] = useState(2);
  const loc = locs[active];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", color: "#fff", background: "hsl(198 36% 9%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* hero bg */}
      {locs.map((l, i) => (
        <div key={l.slug} style={{ position: "absolute", inset: 0, opacity: active === i ? 1 : 0, transition: "opacity .8s cubic-bezier(.22,1,.36,1)" }}>
          <CoverFill loc={l} active={active === i} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,28,34,.82) 0%, rgba(8,28,34,.5) 34%, rgba(8,28,34,.12) 60%, rgba(8,28,34,.34) 100%)" }} />
      <div style={{ position: "absolute", insetInline: 0, top: 0, height: 120, background: "linear-gradient(to bottom, rgba(8,28,34,.5), transparent)" }} />

      {/* top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px", zIndex: 40 }}>
        <Wordmark light />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.10)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>+ Add a trip</button>
      </div>

      {/* title block lower-left */}
      <div style={{ position: "absolute", left: 40, bottom: 48, maxWidth: 560, zIndex: 35 }}>
        <div style={{ marginBottom: 16 }}><StatusChip label={f.status} tone="shortlisted" light /></div>
        <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 72, lineHeight: 0.98, letterSpacing: "-.025em", margin: 0, textShadow: "0 2px 30px rgba(0,0,0,.34)" }}>{f.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, fontSize: 15, color: "rgba(255,255,255,.9)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico.cal width="17" height="17" />{f.window}</span>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: "rgba(255,255,255,.5)" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico.pin width="17" height="17" />{locs.length} locations</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 13.5, color: "rgba(255,255,255,.78)", maxWidth: 440 }}>
          <span style={{ fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 11.5, color: "rgba(255,255,255,.62)" }}>Now showing&nbsp;</span>
          <span style={{ fontFamily: "Spectral, Georgia, serif", fontStyle: "italic", fontSize: 17 }}>{loc.name}, {loc.country}</span>
          <span style={{ color: "rgba(255,255,255,.62)" }}> — {loc.blurb}</span>
        </div>
        <button className="dc-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 26px", marginTop: 24, borderRadius: 999, border: "none", background: "#fff", color: "hsl(193 52% 22%)", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>
          Open this trip <Ico.arrow width="19" height="19" />
        </button>
      </div>

      {/* scalable deck — a centered carousel: active card middle, neighbours
          forming the trio, half-peeks dissolving out via opacity + edge mask. */}
      <div style={{ position: "absolute", right: 40, bottom: 10, width: 720, height: 300, zIndex: 30 }}>
        <div style={{ position: "absolute", top: 0, right: 12, display: "flex", alignItems: "center", gap: 14, zIndex: 110 }}>
          <button onClick={() => setActive(Math.max(0, active - 1))} aria-label="Previous"
            style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", backdropFilter: "blur(6px)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: active === 0 ? 0.4 : 1 }}>
            <Ico.arrow width="16" height="16" style={{ transform: "scaleX(-1)" }} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "rgba(255,255,255,.9)", minWidth: 56, textAlign: "center" }}>
            {String(active + 1).padStart(2, "0")} / {String(locs.length).padStart(2, "0")}
          </span>
          <button onClick={() => setActive(Math.min(locs.length - 1, active + 1))} aria-label="Next"
            style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", backdropFilter: "blur(6px)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: active === locs.length - 1 ? 0.4 : 1 }}>
            <Ico.arrow width="16" height="16" />
          </button>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 290 }}>
          {locs.map((l, i) => <ManyCard key={l.slug} loc={l} i={i} active={active} setActive={setActive} />)}
        </div>
      </div>
    </div>
  );
}

window.DirectionCMany = DirectionCMany;
