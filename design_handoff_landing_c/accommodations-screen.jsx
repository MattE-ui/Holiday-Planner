/* Accommodations screen — stays compared for ONE location (Kalkan).
   The favourite is a large featured spread (image + details); the rest sit below
   as smaller horizontal tiles, 2 per row. Honest about cost. "Atelier" style. */

function SpecChip({ icon: Icon, children, small }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: small ? 27 : 30, padding: small ? "0 9px" : "0 11px", borderRadius: 9, background: "hsl(195 25% 94%)", color: "hsl(198 28% 22%)", fontSize: small ? 12 : 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
      <Icon width={small ? 14 : 15} height={small ? 14 : 15} style={{ opacity: 0.7 }} />
      {children}
    </span>
  );
}

function FeaturedStay({ stay, guests }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", background: "#fff", borderRadius: 22, overflow: "hidden", border: "2px solid hsl(193 52% 25%)", boxShadow: "0 2px 6px rgba(16,42,52,.06), 0 26px 54px rgba(16,42,52,.14)", minHeight: 480 }}
    >
      {/* image */}
      <div style={{ position: "relative", width: "56%", overflow: "hidden" }}>
        <SmartImage src={stay.image} alt={stay.imageAlt} seed={stay.slug}
          imgStyle={{ transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform 1.1s cubic-bezier(.22,1,.36,1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.34), transparent 36%), linear-gradient(to bottom, rgba(0,0,0,.24), transparent 28%)" }} />
        <div style={{ position: "absolute", top: 18, left: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <StatusChip label={stay.statusLabel} tone={stay.statusTone} light />
          <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,.94)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "hsl(193 52% 30%)" }}>
            <Ico.heart width="16" height="16" style={{ fill: "currentColor" }} />
          </span>
        </div>
        <div style={{ position: "absolute", top: 18, right: 18, display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,.95)", color: "hsl(198 32% 16%)", fontSize: 14, fontWeight: 700 }}>
          <Ico.star width="14" height="14" style={{ color: "hsl(38 92% 45%)" }} /> {stay.rating}
        </div>
        <div style={{ position: "absolute", bottom: 18, right: 18, display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: 999, background: "rgba(8,28,34,.56)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 12.5, fontWeight: 600 }}>
          <Ico.camera width="14" height="14" /> {stay.photoCount} photos
        </div>
      </div>

      {/* details */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "34px 38px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "hsl(190 45% 34%)" }}>Our front-runner</div>
          <h2 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 36, letterSpacing: "-.02em", lineHeight: 1.04, margin: "8px 0 0", color: "hsl(198 32% 14%)" }}>{stay.name}</h2>
          <p style={{ margin: "12px 0 0", fontSize: 15.5, lineHeight: 1.55, color: "hsl(199 14% 40%)", maxWidth: 460 }}>{stay.summary}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            <SpecChip icon={Ico.bed}>{stay.beds} bedrooms</SpecChip>
            <SpecChip icon={Ico.users}>Sleeps {stay.sleeps}</SpecChip>
            <SpecChip icon={Ico.bath}>{stay.baths} bathrooms</SpecChip>
            {stay.pool && <SpecChip icon={Ico.wave}>Private pool</SpecChip>}
            {stay.airCon && <SpecChip icon={Ico.snow}>A/C</SpecChip>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 18 }}>
            {stay.pros.slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "hsl(198 28% 24%)" }}>
                <Ico.check width="15" height="15" style={{ color: "hsl(142 58% 32%)", flexShrink: 0 }} /> {p}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "hsl(199 14% 50%)" }}>
              <Ico.pin width="15" height="15" style={{ flexShrink: 0 }} /> {stay.walk}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid hsl(196 24% 90%)", marginTop: 22, paddingTop: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 36, color: "hsl(198 32% 14%)" }}>{window.HP.gbp(stay.total)}</span>
              <span style={{ fontSize: 13, color: "hsl(199 14% 46%)" }}>total · {stay.nights} nights</span>
            </div>
            <div style={{ fontSize: 13.5, color: "hsl(199 14% 42%)", marginTop: 3 }}>~{window.HP.gbp(stay.perPerson)}pp · ~{window.HP.gbp(stay.perNight)}/night</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 9, fontSize: 12.5, fontWeight: 600, color: "hsl(142 58% 28%)" }}>
              <Ico.check width="14" height="14" /> {stay.cancel}
            </div>
          </div>
          <button className="dc-cta" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, height: 50, padding: "0 26px", borderRadius: 999, border: "none", background: "hsl(193 52% 25%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(16,42,52,.18)" }}>
            View full details <Ico.arrow width="18" height="18" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactStay({ stay }) {
  const [hover, setHover] = useState(false);
  const costed = stay.total != null;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid hsl(196 24% 88%)", boxShadow: hover ? "0 2px 6px rgba(16,42,52,.06), 0 18px 38px rgba(16,42,52,.12)" : "0 1px 2px rgba(16,42,52,.04), 0 8px 22px rgba(16,42,52,.06)", transform: hover ? "translateY(-3px)" : "none", transition: "transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s", minHeight: 208 }}
    >
      <div style={{ position: "relative", width: 248, flexShrink: 0, overflow: "hidden" }}>
        <SmartImage src={stay.image} alt={stay.imageAlt} seed={stay.slug}
          imgStyle={{ transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform .9s cubic-bezier(.22,1,.36,1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.3), transparent 40%), linear-gradient(to bottom, rgba(0,0,0,.2), transparent 34%)" }} />
        <div style={{ position: "absolute", top: 12, left: 12 }}><StatusChip label={stay.statusLabel} tone={stay.statusTone} light /></div>
        <div style={{ position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 9px", borderRadius: 999, background: "rgba(255,255,255,.94)", color: "hsl(198 32% 16%)", fontSize: 12.5, fontWeight: 700 }}>
          <Ico.star width="12" height="12" style={{ color: "hsl(38 92% 45%)" }} /> {stay.rating}
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 9px", borderRadius: 999, background: "rgba(8,28,34,.56)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 11.5, fontWeight: 600 }}>
          <Ico.camera width="12" height="12" /> {stay.photoCount}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px 20px", minWidth: 0 }}>
        <div>
          <h3 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 21, letterSpacing: "-.01em", margin: 0, color: "hsl(198 32% 14%)" }}>{stay.name}</h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.45, color: "hsl(199 14% 44%)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stay.summary}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
            <SpecChip icon={Ico.bed} small>{stay.beds} bed</SpecChip>
            <SpecChip icon={Ico.users} small>Sleeps {stay.sleeps}</SpecChip>
            <SpecChip icon={Ico.bath} small>{stay.baths} bath</SpecChip>
            {stay.pool && <SpecChip icon={Ico.wave} small>Pool</SpecChip>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
          <div>
            {costed ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 24, color: "hsl(198 32% 14%)" }}>{window.HP.gbp(stay.total)}</span>
                  <span style={{ fontSize: 12, color: "hsl(199 14% 48%)" }}>· ~{window.HP.gbp(stay.perPerson)}pp</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, fontWeight: 600, color: "hsl(142 58% 30%)" }}>
                  <Ico.check width="13" height="13" /> {stay.cancel}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 19, color: "hsl(198 28% 32%)" }}>Price to confirm</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, fontWeight: 600, color: "hsl(33 90% 34%)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "hsl(33 90% 42%)" }} /> {stay.cancel}
                </div>
              </>
            )}
          </div>
          <button className="dc-cta" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid hsl(196 24% 84%)", background: "#fff", color: "hsl(193 52% 25%)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            Details <Ico.arrow width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccommodationsScreen() {
  const f = window.HP.featured;
  const loc = f.locations.find((l) => l.slug === "kalkan");
  const stays = window.HP.staysByLocation.kalkan;
  const featured = stays.find((s) => s.favourite) || stays[0];
  const rest = stays.filter((s) => s !== featured);
  const costedFrom = Math.min(...stays.filter((s) => s.total != null).map((s) => s.total));
  return (
    <div style={{ width: "100%", background: "hsl(190 30% 98%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 66, borderBottom: "1px solid hsl(196 24% 90%)", position: "sticky", top: 0, background: "hsla(190,30%,98%,.86)", backdropFilter: "blur(8px)", zIndex: 20 }}>
        <Wordmark />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid hsl(196 24% 86%)", background: "#fff", color: "hsl(193 52% 25%)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add a trip</button>
      </div>

      {/* header */}
      <header style={{ padding: "28px 48px 22px" }}>
        <a style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "hsl(199 14% 42%)", cursor: "pointer", fontWeight: 500 }}>
          <Ico.arrow width="15" height="15" style={{ transform: "scaleX(-1)" }} /> {f.name} · all locations
        </a>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginTop: 14 }}>
          <div>
            <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 50, lineHeight: 1.02, letterSpacing: "-.025em", margin: 0, color: "hsl(198 32% 14%)" }}>
              Staying in {loc.name}<span style={{ fontWeight: 400, fontStyle: "italic", fontSize: 30, color: "hsl(199 14% 40%)" }}>, {loc.country}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, fontSize: 14.5, color: "hsl(199 14% 42%)", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Ico.bed width="16" height="16" />{stays.length} stays being compared</span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: "hsl(199 14% 70%)" }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Ico.cal width="16" height="16" />{stays[0].nights} nights · {stays[0].dates}</span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: "hsl(199 14% 70%)" }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Ico.users width="16" height="16" />{f.travellers} guests</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 12.5, color: "hsl(199 14% 46%)" }}>Costed options from</div>
            <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 30, color: "hsl(193 52% 25%)" }}>{window.HP.gbp(costedFrom)}</div>
            <div style={{ fontSize: 12, color: "hsl(199 14% 50%)" }}>party total · ~{window.HP.gbp(Math.round(costedFrom / f.travellers))}pp</div>
          </div>
        </div>
      </header>

      {/* featured */}
      <div style={{ padding: "4px 48px 0" }}>
        <FeaturedStay stay={featured} guests={f.travellers} />
      </div>

      {/* the rest */}
      <div style={{ padding: "30px 48px 8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 24, letterSpacing: "-.01em", margin: 0, color: "hsl(198 32% 14%)" }}>Also in the running</h2>
        <span style={{ fontSize: 13.5, color: "hsl(199 14% 46%)" }}>{rest.length} more being compared</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, padding: "8px 48px 28px" }}>
        {rest.map((s) => <CompactStay key={s.slug} stay={s} />)}
      </div>

      {/* footer */}
      <div style={{ padding: "8px 48px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "hsl(199 14% 46%)" }}>
        <span>Prices are party totals for the stay · figures shown as “to confirm” aren’t quoted yet</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "hsl(193 52% 30%)", fontWeight: 600, cursor: "pointer" }}>+ Add another stay <Ico.arrow width="15" height="15" /></span>
      </div>
    </div>
  );
}

window.AccommodationsScreen = AccommodationsScreen;
