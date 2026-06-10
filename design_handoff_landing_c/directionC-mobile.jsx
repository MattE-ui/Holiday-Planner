/* Direction C — Mobile + scaling.
   The desktop fan doesn't fit a narrow screen, and a fixed fan crowds past ~4
   cards. The answer for both: the deck becomes a horizontally swipeable rail of
   postcards. Tap/swipe a card → it lifts and re-skins the hero. Scales to any N
   with a counter + dots. A gradient/photo-aware card renderer is shared. */

/** Fill that handles either a real photo or a brand gradient cover. */
function CoverFill({ loc, active }) {
  if (loc.image) {
    return <SmartImage src={loc.image} alt={loc.imageAlt} seed={loc.slug}
      imgStyle={{ transform: active ? "scale(1.06)" : "scale(1)", transition: "transform .9s cubic-bezier(.22,1,.36,1)" }} />;
  }
  return (
    <div style={{ position: "absolute", inset: 0, background: loc.gradient }} role="img" aria-label={(loc.name || "") + " — photo to come"}>
      <span style={{ position: "absolute", top: 8, right: 9, fontSize: 8.5, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>Photo to come</span>
    </div>
  );
}

function MobilePostcard({ loc, i, active, onPick }) {
  const isActive = active === i;
  return (
    <div
      onClick={() => onPick(i)}
      style={{
        position: "relative", flexShrink: 0, width: 150, height: 178,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        scrollSnapAlign: "center",
        border: "2.5px solid " + (isActive ? "#fff" : "rgba(255,255,255,.34)"),
        transform: isActive ? "translateY(-10px)" : "translateY(0)",
        opacity: isActive ? 1 : 0.82,
        boxShadow: isActive ? "0 22px 40px rgba(0,0,0,.46)" : "0 8px 20px rgba(0,0,0,.32)",
        transition: "transform .42s cubic-bezier(.22,1,.36,1), opacity .42s, box-shadow .42s, border-color .42s",
      }}
    >
      <CoverFill loc={loc} active={isActive} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.66), rgba(0,0,0,0) 56%)" }} />
      <div style={{ position: "absolute", left: 11, right: 10, bottom: 11 }}>
        <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 17, color: "#fff", lineHeight: 1 }}>{loc.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.82)", marginTop: 2 }}>{loc.country}</div>
        <div style={{ marginTop: 7, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {loc.from != null
            ? <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>From {window.HP.gbp(loc.from)}</span>
            : <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>Researching</span>}
          {isActive && <Ico.arrow width="15" height="15" style={{ color: "#fff" }} />}
        </div>
      </div>
    </div>
  );
}

function DirectionCMobile({ locations }) {
  const f = window.HP.featured;
  const locs = locations || f.locations;
  const [active, setActive] = useState(0);
  const railRef = useRef(null);
  const loc = locs[active];

  const pick = (i) => {
    setActive(i);
    const rail = railRef.current;
    if (rail) {
      const card = rail.children[i];
      if (card) rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", color: "#fff", background: "hsl(198 36% 9%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* hero bg */}
      {locs.map((l, i) => (
        <div key={l.slug} style={{ position: "absolute", inset: 0, opacity: active === i ? 1 : 0, transition: "opacity .8s cubic-bezier(.22,1,.36,1)" }}>
          <CoverFill loc={l} active={active === i} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,28,34,.9) 0%, rgba(8,28,34,.5) 34%, rgba(8,28,34,.18) 58%, rgba(8,28,34,.42) 100%)" }} />

      {/* top bar */}
      <div style={{ position: "absolute", top: 60, left: 18, right: 18, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <Wordmark light />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.34)", background: "rgba(255,255,255,.12)", backdropFilter: "blur(6px)", fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "rgba(255,255,255,.8)" }} />2 more trips
          </span>
        </div>
      </div>

      {/* title block */}
      <div style={{ position: "absolute", left: 18, right: 18, top: 188, zIndex: 8 }}>
        <div style={{ marginBottom: 12 }}><StatusChip label={f.status} tone="shortlisted" light /></div>
        <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 33, lineHeight: 1.06, letterSpacing: "-.02em", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,.34)" }}>{f.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, fontSize: 13, color: "rgba(255,255,255,.9)", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Ico.cal width="15" height="15" />{f.window}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, fontSize: 13, color: "rgba(255,255,255,.9)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Ico.coins width="15" height="15" />From {window.HP.gbp(f.fromPrice)} · ~{window.HP.gbp(f.perPerson)}pp</span>
        </div>
      </div>

      {/* deck */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, zIndex: 9 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 18px 12px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: "rgba(255,255,255,.74)" }}>
            Choosing between · {locs.length}
          </span>
          <span style={{ fontFamily: "Spectral, Georgia, serif", fontStyle: "italic", fontSize: 15, color: "#fff" }}>
            {loc.name}, {loc.country}
          </span>
        </div>
        <div ref={railRef} className="no-sb" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "10px 18px 6px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
          {locs.map((l, i) => <MobilePostcard key={l.slug} loc={l} i={i} active={active} onPick={pick} />)}
        </div>
        {/* dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {locs.map((l, i) => (
            <span key={i} onClick={() => pick(i)} style={{ width: active === i ? 18 : 6, height: 6, borderRadius: 999, background: active === i ? "#fff" : "rgba(255,255,255,.42)", transition: "all .35s", cursor: "pointer" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

window.DirectionCMobile = DirectionCMobile;
window.CoverFill = CoverFill;
