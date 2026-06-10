/* Direction C — "Atelier"
   The most image-dense, tactile take. A full-bleed cinematic hero that re-skins
   to whichever candidate you bring forward from a fanned deck of location
   "postcards" in the corner. Editorial title block lower-left; a compact
   "also planning" index top-right. Layering, depth, visual rhythm. */

function DirC_UpcomingMini({ trip }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 8px", borderRadius: 11, cursor: "pointer",
        background: hover ? "rgba(255,255,255,.12)" : "transparent", transition: "background .25s" }}
    >
      <span style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: trip.gradient, boxShadow: "0 2px 8px rgba(0,0,0,.25)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 15, color: "#fff", lineHeight: 1.05, whiteSpace: "nowrap" }}>{trip.name}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.7)", marginTop: 1 }}>{trip.window}</div>
      </div>
      <Ico.arrow width="15" height="15" style={{ color: "rgba(255,255,255,.7)", transform: hover ? "translateX(2px)" : "none", transition: "transform .25s" }} />
    </div>
  );
}

function DirC_Card({ loc, i, total, active, setActive }) {
  const isActive = active === i;
  // base fan: spread cards horizontally with a gentle rotation
  const spread = 150;
  const baseX = (i - (total - 1) / 2) * spread;
  const baseRot = (i - (total - 1) / 2) * 9;
  const tf = isActive
    ? `translateX(${baseX}px) translateY(-26px) rotate(0deg) scale(1.06)`
    : `translateX(${baseX}px) translateY(0) rotate(${baseRot}deg) scale(1)`;
  return (
    <div
      onMouseEnter={() => setActive(i)}
      style={{
        position: "absolute", bottom: 0, left: "50%", marginLeft: -105,
        width: 210, height: 286, borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transform: tf, transformOrigin: "bottom center",
        transition: "transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s",
        zIndex: isActive ? 30 : 10 + i,
        border: "3px solid #fff",
        boxShadow: isActive ? "0 30px 60px rgba(0,0,0,.42)" : "0 12px 30px rgba(0,0,0,.34)",
      }}
    >
      <SmartImage src={loc.image} alt={loc.imageAlt} seed={loc.slug}
        imgStyle={{ transform: isActive ? "scale(1.06)" : "scale(1)", transition: "transform .8s cubic-bezier(.22,1,.36,1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,0) 58%)" }} />
      <div style={{ position: "absolute", left: 13, right: 13, bottom: 12 }}>
        <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 19, color: "#fff", lineHeight: 1 }}>{loc.name}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.84)", marginTop: 2 }}>{loc.country}</div>
        <div style={{ marginTop: 8 }}>
          {loc.from != null
            ? <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>From {window.HP.gbp(loc.from)}</span>
            : <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.82)" }}>Researching</span>}
        </div>
      </div>
    </div>
  );
}

function DirectionC() {
  const f = window.HP.featured;
  const [active, setActive] = useState(0);
  const loc = f.locations[active];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", color: "#fff", background: "hsl(198 36% 9%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* hero bg cross-fade */}
      {f.locations.map((l, i) => (
        <div key={l.slug} style={{ position: "absolute", inset: 0, opacity: active === i ? 1 : 0, transition: "opacity .8s cubic-bezier(.22,1,.36,1)" }}>
          <SmartImage src={l.image} alt={l.imageAlt} seed={l.slug}
            imgStyle={{ transform: active === i ? "scale(1.06)" : "scale(1.14)", transition: "transform 1.6s cubic-bezier(.22,1,.36,1)" }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,28,34,.82) 0%, rgba(8,28,34,.5) 34%, rgba(8,28,34,.12) 62%, rgba(8,28,34,.32) 100%)" }} />
      <div style={{ position: "absolute", insetInline: 0, top: 0, height: 120, background: "linear-gradient(to bottom, rgba(8,28,34,.5), transparent)" }} />

      {/* top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px", zIndex: 40 }}>
        <Wordmark light />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.10)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>+ Add a trip</button>
      </div>

      {/* title block lower-left */}
      <div className="dc-rise" style={{ position: "absolute", left: 40, bottom: 48, maxWidth: 620, zIndex: 35 }}>
        <div style={{ marginBottom: 16 }}><StatusChip label={f.status} tone="shortlisted" light /></div>
        <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 76, lineHeight: 0.98, letterSpacing: "-.025em", margin: 0, textShadow: "0 2px 30px rgba(0,0,0,.34)" }}>{f.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, fontSize: 15, color: "rgba(255,255,255,.9)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico.cal width="17" height="17" />{f.window}</span>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: "rgba(255,255,255,.5)" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico.coins width="17" height="17" />From {window.HP.gbp(f.fromPrice)} · ~{window.HP.gbp(f.perPerson)}pp</span>
        </div>
        {/* dynamic now-showing line */}
        <div style={{ marginTop: 22, fontSize: 13.5, color: "rgba(255,255,255,.78)" }}>
          <span style={{ fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 11.5, color: "rgba(255,255,255,.62)" }}>Now showing&nbsp;</span>
          <span style={{ fontFamily: "Spectral, Georgia, serif", fontStyle: "italic", fontSize: 17 }}>{loc.name}, {loc.country}</span>
          <span style={{ color: "rgba(255,255,255,.62)" }}> — {loc.blurb}</span>
        </div>
        <button className="dc-cta" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 26px", marginTop: 26, borderRadius: 999, border: "none", background: "#fff", color: "hsl(193 52% 22%)", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>
          Open this trip <Ico.arrow width="19" height="19" />
        </button>
      </div>

      {/* upcoming index top-right */}
      <div style={{ position: "absolute", top: 84, right: 40, width: 268, padding: 14, borderRadius: 16, background: "rgba(12,30,36,.42)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(10px)", zIndex: 35 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 8px" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>Also planning</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>ideas</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {window.HP.upcoming.map((t) => <DirC_UpcomingMini key={t.slug} trip={t} />)}
        </div>
      </div>

      {/* fanned deck bottom-right */}
      <div onMouseLeave={() => setActive(0)} style={{ position: "absolute", right: 232, bottom: 64, width: 210, height: 320, zIndex: 30 }}>
        <div style={{ position: "absolute", left: 4, right: 4, bottom: -10, textAlign: "center", fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}></div>
        {f.locations.map((l, i) => (
          <DirC_Card key={l.slug} loc={l} i={i} total={f.locations.length} active={active} setActive={setActive} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 30, width: 594, textAlign: "right", fontSize: 12, color: "rgba(255,255,255,.55)", zIndex: 30 }}>
        Hover a postcard to preview · {f.locationCount} on the shortlist
      </div>
    </div>
  );
}

window.DirectionC = DirectionC;
