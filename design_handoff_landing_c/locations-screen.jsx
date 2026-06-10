/* Locations screen (trip page) — "Atelier" style.
   Header on seafoam, then one cinematic full-bleed band per candidate location.
   Each band carries: the place, its blurb, a late-October seasonal snapshot, the
   flight/season note, and a way into that location's accommodations. */

function SeasonStat({ icon: Icon, value, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, height: 38, padding: "0 14px", borderRadius: 999, background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.28)", backdropFilter: "blur(6px)", color: "#fff", whiteSpace: "nowrap" }}>
      <Icon width="17" height="17" style={{ opacity: 0.9 }} />
      <span style={{ fontWeight: 700, fontSize: 15 }}>{value}</span>
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.74)" }}>{label}</span>
    </span>
  );
}

function LocationBand({ loc, i }) {
  const [hover, setHover] = useState(false);
  const costed = loc.from != null;
  return (
    <section style={{ position: "relative", height: 482, overflow: "hidden", color: "#fff" }}>
      <SmartImage src={loc.image} alt={loc.imageAlt} seed={loc.slug}
        imgStyle={{ transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform 1.1s cubic-bezier(.22,1,.36,1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,28,34,.88) 0%, rgba(8,28,34,.34) 46%, rgba(8,28,34,.06) 72%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,28,34,.55) 0%, rgba(8,28,34,.12) 42%, transparent 64%)" }} />

      {/* index + status, top-left */}
      <div style={{ position: "absolute", top: 32, left: 48, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "Spectral, Georgia, serif", fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,.62)" }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <StatusChip label={loc.statusLabel} tone={loc.statusTone} light />
      </div>

      {/* bottom-left: identity + blurb + season */}
      <div style={{ position: "absolute", left: 48, bottom: 38, right: 400, maxWidth: 720 }}>
        <h2 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 54, lineHeight: 1, letterSpacing: "-.02em", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,.34)" }}>
          {loc.name}<span style={{ fontWeight: 400, fontStyle: "italic", fontSize: 30, opacity: 0.86 }}>, {loc.country}</span>
        </h2>
        <p style={{ margin: "12px 0 0", fontSize: 16.5, lineHeight: 1.5, color: "rgba(255,255,255,.9)", maxWidth: 580 }}>{loc.blurb}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: "rgba(255,255,255,.66)", marginRight: 2 }}>October</span>
          <SeasonStat icon={Ico.thermo} value={loc.season.high + "°"} label="day high" />
          <SeasonStat icon={Ico.wave} value={loc.season.sea + "°"} label="sea" />
          <SeasonStat icon={Ico.sun} value={loc.season.sun + "h"} label="sun" />
          <SeasonStat icon={Ico.plane} value={loc.flightTime.replace("~", "")} label={loc.airport.split(" (")[0]} />
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 13.5, color: "rgba(255,255,255,.66)", maxWidth: 560 }}>{loc.seasonNote}</p>
      </div>

      {/* bottom-right: price + CTA panel */}
      <div style={{ position: "absolute", right: 48, bottom: 38, width: 300, padding: 22, borderRadius: 18, background: "rgba(12,30,36,.5)", border: "1px solid rgba(255,255,255,.18)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,.78)" }}>
          <Ico.bed width="16" height="16" />
          {loc.accomm > 0 ? `${loc.accomm} stay${loc.accomm > 1 ? "s" : ""} being compared` : "No stays added yet"}
        </div>
        <div style={{ marginTop: 12, marginBottom: 18 }}>
          {costed ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.72)" }}>from</span>
              <span style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 34, color: "#fff" }}>{window.HP.gbp(loc.from)}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.72)" }}>· ~{window.HP.gbp(Math.round(loc.from / 4))}pp</span>
            </div>
          ) : (
            <div style={{ fontSize: 14.5, color: "rgba(255,255,255,.82)", lineHeight: 1.4 }}>
              Still researching villas — <span style={{ color: "#fff", fontWeight: 600 }}>price to confirm</span>
            </div>
          )}
        </div>
        <button className="dc-cta" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, height: 48, borderRadius: 999, border: "none", background: "#fff", color: "hsl(193 52% 22%)", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(0,0,0,.26)" }}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {costed ? "View accommodations" : "Add accommodations"} <Ico.arrow width="18" height="18" />
        </button>
      </div>
    </section>
  );
}

function LocationsScreen() {
  const f = window.HP.featured;
  return (
    <div style={{ width: "100%", background: "hsl(190 30% 98%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 66, borderBottom: "1px solid hsl(196 24% 90%)", position: "sticky", top: 0, background: "hsla(190,30%,98%,.86)", backdropFilter: "blur(8px)", zIndex: 20 }}>
        <Wordmark />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid hsl(196 24% 86%)", background: "#fff", color: "hsl(193 52% 25%)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add a trip</button>
      </div>

      {/* intro */}
      <header style={{ padding: "30px 48px 36px", maxWidth: 1240 }}>
        <a style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "hsl(199 14% 42%)", cursor: "pointer", fontWeight: 500 }}>
          <Ico.arrow width="15" height="15" style={{ transform: "scaleX(-1)" }} /> All trips
        </a>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginTop: 14 }}>
          <div>
            <div style={{ marginBottom: 12 }}><StatusChip label={f.status} tone="shortlisted" /></div>
            <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 56, lineHeight: 1.02, letterSpacing: "-.025em", margin: 0, color: "hsl(198 32% 14%)" }}>{f.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, fontSize: 15, color: "hsl(199 14% 42%)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Ico.cal width="16" height="16" />{f.window}</span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: "hsl(199 14% 70%)" }} />
              <span>{f.subtitle}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.55, color: "hsl(199 14% 38%)", maxWidth: 430, textWrap: "pretty" }}>
            Three Mediterranean coastlines in the running for late-October sun — same week, same four of us. Here's how they compare before we commit.
          </p>
        </div>
      </header>

      {/* location bands */}
      <div>
        {f.locations.map((l, i) => <LocationBand key={l.slug} loc={l} i={i} />)}
      </div>

      {/* footer */}
      <div style={{ padding: "26px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, color: "hsl(199 14% 46%)" }}>
        <span>Comparing {f.locations.length} locations for {f.name}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "hsl(193 52% 30%)", fontWeight: 600, cursor: "pointer" }}>+ Add another location <Ico.arrow width="15" height="15" /></span>
      </div>
    </div>
  );
}

window.LocationsScreen = LocationsScreen;
