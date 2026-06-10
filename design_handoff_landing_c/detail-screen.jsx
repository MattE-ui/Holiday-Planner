/* Accommodation detail — one stay in full (Villa Veranda).
   Full-bleed gallery, the essentials, what's included, pros & cons, where it is,
   and an honest price breakdown ("to confirm" where not yet quoted). */

function Gallery({ stay }) {
  const [active, setActive] = useState(0);
  const imgs = stay.gallery || [stay.image];
  const thumbs = imgs.slice(1, 5);
  return (
    <div style={{ display: "flex", gap: 8, height: 472, padding: "0 8px" }}>
      <div style={{ position: "relative", flex: "1.6 1 0", borderRadius: 18, overflow: "hidden" }}>
        <SmartImage src={imgs[active]} alt={stay.imageAlt} seed={stay.slug + active} />
        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
          <StatusChip label={stay.statusLabel} tone={stay.statusTone} light />
        </div>
      </div>
      <div style={{ flex: "1 1 0", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
        {thumbs.map((src, k) => {
          const idx = k + 1;
          const last = k === thumbs.length - 1;
          return (
            <div key={idx} onClick={() => setActive(idx)}
              style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", outline: active === idx ? "3px solid hsl(193 52% 30%)" : "none", outlineOffset: -3 }}>
              <SmartImage src={src} alt={stay.name + " photo"} seed={stay.slug + idx}
                imgStyle={{ transition: "transform .5s", transform: active === idx ? "scale(1.04)" : "scale(1)" }} />
              {last && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(8,28,34,.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700 }}>
                    <Ico.camera width="17" height="17" /> All {stay.photoCount} photos
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Essential({ icon: Icon, value, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", border: "1px solid hsl(196 24% 90%)", borderRadius: 14, background: "#fff" }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: "hsl(190 38% 94%)", color: "hsl(193 52% 28%)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon width="19" height="19" />
      </span>
      <div>
        <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 16.5, color: "hsl(198 32% 14%)", lineHeight: 1.12 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "hsl(199 14% 46%)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function Section({ title, children, extra }) {
  return (
    <section style={{ marginTop: 38 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 24, letterSpacing: "-.01em", margin: 0, color: "hsl(198 32% 14%)" }}>{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

function PriceLine({ line }) {
  const confirmed = line.amount != null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "11px 0" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(198 30% 20%)" }}>{line.label}</div>
        <div style={{ fontSize: 12, color: "hsl(199 14% 50%)", marginTop: 2 }}>{line.detail}</div>
      </div>
      {confirmed ? (
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "hsl(198 32% 16%)", whiteSpace: "nowrap" }}>{window.HP.gbp(line.amount)}</span>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "hsl(33 90% 32%)", background: "hsl(33 90% 32% / .1)", padding: "4px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "hsl(33 90% 42%)" }} /> to confirm
        </span>
      )}
    </div>
  );
}

function PriceBreakdown({ stay, trip }) {
  const confirmedTotal = stay.costLines.filter((l) => l.amount != null).reduce((s, l) => s + l.amount, 0);
  const toConfirm = stay.costLines.filter((l) => l.amount == null).length;
  return (
    <aside style={{ position: "sticky", top: 90, width: 384, flexShrink: 0 }}>
      <div style={{ background: "#fff", border: "1px solid hsl(196 24% 88%)", borderRadius: 20, boxShadow: "0 1px 2px rgba(16,42,52,.04), 0 14px 34px rgba(16,42,52,.08)", overflow: "hidden" }}>
        <div style={{ padding: "22px 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 38, color: "hsl(198 32% 14%)" }}>{window.HP.gbp(stay.total)}</span>
            <span style={{ fontSize: 13.5, color: "hsl(199 14% 46%)" }}>accommodation</span>
          </div>
          <div style={{ fontSize: 13.5, color: "hsl(199 14% 42%)", marginTop: 4 }}>{stay.nights} nights · ~{window.HP.gbp(stay.perPerson)}pp · ~{window.HP.gbp(stay.perNight)}/night</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 12, fontSize: 13, color: "hsl(199 14% 42%)" }}>
            <Ico.cal width="15" height="15" /> {stay.dates}
          </div>
        </div>

        <div style={{ padding: "4px 24px", borderTop: "1px solid hsl(196 24% 91%)" }}>
          {stay.costLines.map((l, i) => <PriceLine key={i} line={l} />)}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid hsl(196 24% 91%)", background: "hsl(190 34% 97%)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "hsl(199 14% 44%)" }}>Confirmed so far</div>
              <div style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 26, color: "hsl(198 32% 14%)" }}>{window.HP.gbp(confirmedTotal)}</div>
            </div>
            <div style={{ fontSize: 12.5, color: "hsl(33 90% 32%)", fontWeight: 600, textAlign: "right", maxWidth: 130 }}>+ {toConfirm} costs still to confirm</div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid hsl(196 24% 91%)", display: "flex", gap: 10, fontSize: 12.5, color: "hsl(199 14% 46%)", lineHeight: 1.45 }}>
          <Ico.info width="16" height="16" style={{ flexShrink: 0, marginTop: 1, color: "hsl(190 45% 38%)" }} />
          <span>{stay.rateNote}</span>
        </div>

        <div style={{ padding: "16px 24px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="dc-cta" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, height: 50, borderRadius: 999, border: "none", background: "hsl(193 52% 25%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Open listing <Ico.ext width="17" height="17" />
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 999, border: "1px solid hsl(193 40% 60%)", background: "hsl(190 40% 96%)", color: "hsl(193 52% 25%)", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
            <Ico.heart width="16" height="16" style={{ fill: "currentColor" }} /> Saved as favourite
          </button>
        </div>
      </div>
      <p style={{ margin: "12px 4px 0", fontSize: 12, color: "hsl(199 14% 52%)", textAlign: "center" }}>Unconfirmed costs shown honestly — nothing hidden.</p>
    </aside>
  );
}

function AccommodationDetail() {
  const f = window.HP.featured;
  const loc = f.locations.find((l) => l.slug === "kalkan");
  const stay = window.HP.staysByLocation.kalkan[0];
  const a = stay;
  return (
    <div style={{ width: "100%", background: "hsl(190 30% 98%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", paddingBottom: 40 }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 66, borderBottom: "1px solid hsl(196 24% 90%)", position: "sticky", top: 0, background: "hsla(190,30%,98%,.86)", backdropFilter: "blur(8px)", zIndex: 30 }}>
        <Wordmark />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid hsl(196 24% 86%)", background: "#fff", color: "hsl(193 52% 25%)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add a trip</button>
      </div>

      {/* breadcrumb */}
      <div style={{ padding: "18px 48px 14px" }}>
        <a style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "hsl(199 14% 42%)", cursor: "pointer", fontWeight: 500 }}>
          <Ico.arrow width="15" height="15" style={{ transform: "scaleX(-1)" }} /> {loc.name} · {window.HP.staysByLocation.kalkan.length} stays
        </a>
      </div>

      {/* gallery */}
      <Gallery stay={a} />

      {/* body */}
      <div style={{ display: "flex", gap: 44, padding: "30px 48px 0", alignItems: "flex-start" }}>
        {/* main column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "hsl(198 32% 16%)" }}>
              <Ico.star width="15" height="15" style={{ color: "hsl(38 92% 45%)" }} /> {a.rating} <span style={{ color: "hsl(199 14% 46%)", fontWeight: 500 }}>· Excellent</span>
            </span>
          </div>
          <h1 style={{ fontFamily: "Spectral, Georgia, serif", fontWeight: 600, fontSize: 46, lineHeight: 1.02, letterSpacing: "-.025em", margin: "8px 0 0", color: "hsl(198 32% 14%)" }}>{a.name}</h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 15, color: "hsl(199 14% 42%)" }}>
            <Ico.pin width="16" height="16" /> {loc.name}, {loc.country} · {a.walk}
          </div>
          <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.6, color: "hsl(198 24% 28%)", maxWidth: 660, textWrap: "pretty" }}>{a.summary}</p>

          <Section title="The essentials">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Essential icon={Ico.bed} value={a.beds + " bedrooms"} label={"Sleeps " + a.sleeps} />
              <Essential icon={Ico.bath} value={a.baths + " bathrooms"} label="Two en-suite" />
              <Essential icon={Ico.ruler} value={a.sizeSqft.toLocaleString() + " sq ft"} label="Single storey" />
              <Essential icon={Ico.wave} value="Private pool" label="Sea view" />
              <Essential icon={Ico.snow} value="Air con" label="Every room" />
              <Essential icon={Ico.plane} value={loc.flightTime.replace("~", "") + " flights"} label={loc.airport} />
            </div>
          </Section>

          <Section title="What's included">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 28px", maxWidth: 640 }}>
              {a.extras.map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "hsl(198 26% 26%)" }}>
                  <Ico.check width="16" height="16" style={{ color: "hsl(142 58% 34%)", flexShrink: 0 }} /> {x}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Pros & cons">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ border: "1px solid hsl(142 40% 82%)", background: "hsl(142 45% 97%)", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "hsl(142 58% 28%)", marginBottom: 12 }}>Why we're keen</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {a.pros.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, color: "hsl(198 26% 24%)" }}>
                      <Ico.check width="16" height="16" style={{ color: "hsl(142 58% 34%)", flexShrink: 0, marginTop: 2 }} /> {p}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: "1px solid hsl(33 60% 82%)", background: "hsl(36 70% 97%)", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "hsl(33 80% 36%)", marginBottom: 12 }}>Worth noting</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {a.cons.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, color: "hsl(198 26% 24%)" }}>
                      <span style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "hsl(33 80% 40%)", fontWeight: 800 }}>!</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Where it is">
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid hsl(196 24% 88%)" }}>
              <div style={{ position: "relative", height: 230, background: "repeating-linear-gradient(135deg, hsl(190 24% 92%) 0 14px, hsl(190 24% 95%) 14px 28px)" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50% 50% 50% 2px", transform: "rotate(45deg)", background: "hsl(193 52% 28%)", boxShadow: "0 8px 20px rgba(16,42,52,.25)" }} />
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "hsl(199 14% 42%)", marginTop: 8 }}>map · {loc.name}, {loc.country} — drop a pin here</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", background: "#fff" }}>
                <div style={{ padding: "16px 18px", borderRight: "1px solid hsl(196 24% 91%)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "hsl(199 14% 46%)" }}><Ico.pin width="14" height="14" /> Town & harbour</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "hsl(198 30% 20%)", marginTop: 4 }}>{a.walk}</div>
                </div>
                <div style={{ padding: "16px 18px", borderRight: "1px solid hsl(196 24% 91%)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "hsl(199 14% 46%)" }}><Ico.plane width="14" height="14" /> Airport</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "hsl(198 30% 20%)", marginTop: 4 }}>{loc.airport} · {loc.flightTime.replace("~", "")}</div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "hsl(199 14% 46%)" }}><Ico.wave width="14" height="14" /> Beach</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "hsl(198 30% 20%)", marginTop: 4 }}>14 min to Kalkan Public Beach</div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* sidebar */}
        <PriceBreakdown stay={a} trip={f} />
      </div>
    </div>
  );
}

window.AccommodationDetail = AccommodationDetail;
