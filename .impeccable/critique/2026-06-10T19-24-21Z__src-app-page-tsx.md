---
target: homepage (src/app/page.tsx)
total_score: 27
p0_count: 0
p1_count: 1
timestamp: 2026-06-10T19-24-21Z
slug: src-app-page-tsx
---
# Critique — Homepage (src/app/page.tsx → AtelierLanding / Welcome)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active card, counter, dots, "Now showing" all communicate state; no aria-live announcement of hero change; no pending state on navigation |
| 2 | Match System / Real World | 4 | "Now showing", "Deciding together", "Researching", "Photo to come" — fluently human, on-voice |
| 3 | User Control and Freedom | 3 | Arrows, dots, swipe, direct card click; nothing traps the user; no keyboard arrow support on the deck |
| 4 | Consistency and Standards | 3 | Wordmark mirrors SiteHeader; pill buttons consistent; landing forgoes global chrome (deliberate, immersive) |
| 5 | Error Prevention | 3 | Honest nulls ("Researching"), derived status, zero-location branch handled; remote image rot unhandled |
| 6 | Recognition Rather Than Recall | 3 | Everything visible and labeled; aria-labels + aria-current present |
| 7 | Flexibility and Efficiency | 2 | No keyboard arrows, no shortcuts; mobile swipe + dots fine; only one path through |
| 8 | Aesthetic and Minimalist Design | 3 | Composed, imagery-led, restrained — but md-breakpoint collision (768–~1350px) wrecks the composition on tablets |
| 9 | Error Recovery | 2 | No image error fallback (hero goes dark void if a remote URL 404s); little other error surface |
| 10 | Help and Documentation | 1 | No help anywhere; contextual labels partially compensate; low stakes for a domestic tool |
| **Total** | | **27/40** | **Acceptable (top of band)** |

## Anti-Patterns Verdict

**LLM assessment: passes the slop test.** The cinematic re-skinning hero driven by a tactile postcard deck is a committed, non-template move; dark-teal drench + Spectral display serif is the brand's own, not the cream-SaaS default. Microcopy carries real voice. The one-off uppercase labels ("Choosing between · 2", Welcome's "A calm place to plan") are single deliberate kickers, not section grammar. Glass surfaces sit on photography where they earn their keep.

**Deterministic scan: clean.** `detect.mjs` over page.tsx, atelier-landing.tsx, welcome.tsx, cover.tsx → 0 findings, exit 0. The two `broken-image` warnings from the earlier repo-wide sweep (accommodation-gallery.tsx:147, import-wizard.tsx:178) are dynamic-`src` false positives and are not on this surface.

**Browser visualization: not available** (no browser automation in this session). Fallback evidence: fetched the rendered page from the dev server (localhost:3000) — content is server-rendered and visible without JS-gated reveals; one h1 exposed per breakpoint (the other is display:none).

## Overall Impression

This is a genuinely distinctive landing — the deck-to-hero interaction sells the "deciding together" job emotionally and the honest price labels keep it trustworthy. The single biggest opportunity: the desktop layout activates at 768px with fixed-width absolutely-positioned blocks, so the entire tablet-to-small-laptop range collides. Fix that and the surface is close to shipping quality.

## What's Working

1. **The deck-drives-the-hero interaction.** One source of truth (`active`) re-skins the whole scene; hover previews, click commits, the active card becomes the link. It makes comparison feel like flipping postcards — exactly PRODUCT.md's "magazine, not spreadsheet".
2. **Honest-cost rendering.** Null prices show as "Researching", the from-price is a real min over costed holidays, and the status chip is data-derived with a dot + text (never color alone).
3. **Resilient motion defaults.** `atelier-rise` animates only under `prefers-reduced-motion: no-preference` with a fully-visible base state — SSR, print, and headless renders never ship blank.

## Priority Issues

1. **[P1] Tablet/small-desktop collision (768–~1350px).** The "desktop" layout mounts at `md` with a fixed `w-[720px]` deck pinned `right-10` and an absolute title block `left-10 max-w-[560px]`. At 768px the deck's left edge is at ~8px; cards and the 72px h1 + CTA overlap outright. **Why:** every iPad and half-width laptop window gets a broken composition on the front door. **Fix:** gate the desktop composition at `lg`/`xl`, keep the mobile stack through tablet, and make deck width fluid (e.g. `min(720px, 52vw)`); also swap the fixed `text-[72px]` h1 for a clamp. **Command:** /impeccable adapt
2. **[P2] The headline price is mobile-only.** Mobile title block shows "From £1,559 · ~£390pp"; the desktop title block shows only dates + location count, leaving per-card "From" prices to carry cost alone. **Why:** "the numbers are trustworthy at a glance" is a core principle, and desktop is where the family decides. **Fix:** add the from/per-person line to the desktop meta row. **Command:** /impeccable polish
3. **[P2] No image-failure fallback.** Hero and cards render remote Unsplash/Booking URLs with no `onError`; a rotted URL leaves a near-black void behind the title. The `Cover` gradient fallback exists but only for *missing* images, not *failed* ones. **Why:** remote-hotlinked images rot; the failure mode is the worst screen in the app. **Fix:** on image error, fall back to `Cover` (client-side error state in HeroFill/CardFace). **Command:** /impeccable harden
4. **[P2] Deck motion ignores reduced-motion.** The crossfade (acceptable) but also the Ken Burns hero scale (1.14→1.06 over 1600ms) and card lift/rotate transforms run via inline styles with no `prefers-reduced-motion` gate, unlike the CSS animations which are gated. **Fix:** a `useReducedMotion` check (or `motion-reduce:` utilities) to zero the scale/rotate and keep an instant or crossfade-only switch. **Command:** /impeccable animate
5. **[P2] Tiny mobile dot targets + silent hero changes for screen readers.** Dots are 6×6–18×6px (vs 44×44 minimum) — redundant with swipe but still interactive; and the "Now showing {location}" line isn't `aria-live`, so non-visual users get no feedback when arrows/dots change the hero. **Fix:** pad the dot hit area (visual size can stay), add `aria-live="polite"` to the Now-showing line. **Command:** /impeccable polish

## Persona Red Flags

**Casey (Distracted Mobile User):** Deck and dots sit in the thumb zone — good. Red flags: dot tap targets ~6px tall with 6px gaps (mis-taps guaranteed; swipe saves it); two full-bleed 1600w images load stacked on every visit (slow on 3G — only the first is `priority`, but both eventually fetch); active-card state resets on return (harmless here).

**Sam (Accessibility-Dependent):** Controls genuinely labeled (`aria-label` on arrows/cards, `aria-current` on dots) — better than most. Red flags: hero change produces zero screen-reader feedback (no live region); inactive hero layers are `opacity: 0` but remain in the accessibility tree, so both location images are exposed at once; active card is a link while inactive cards are buttons, so the role under focus changes as selection moves — disorienting on a re-tab; `text-white/[0.62]` metadata over a 0.5-alpha scrim on an unknown photo is a contrast gamble (the diagonal scrim helps on the title side only).

**Riley (Stress Tester):** Zero-location branch is handled with a styled invitation — good. Red flags: a dead image URL ships a black hero with no recovery; desktop h1 is a fixed 72px (not clamped), so a long trip name wraps to a wall of display type; empty `blurb` strings make the "Now showing" line trail into a bare em-dash-free fragment (data currently has no blurbs, so the editorial line under-delivers today).

## Minor Observations

- The desktop deck counter ("01 / 02") is a legitimate sequence indicator, not numbered-eyebrow scaffolding.
- Welcome screen's two glass cards share an icon-heading-text-link skeleton; with only two, differentiated by filled vs outline icon, it stays on the right side of "identical card grid" — worth watching if a third option is ever added.
- `DeckControl` disabled state is opacity-only (40%); fine for disabled semantics but pair with `cursor-not-allowed` for clarity.
- No focus-visible styling beyond browser defaults on the white-on-photo controls; default rings can vanish against bright photos.

## Questions to Consider

- What would the hero feel like if the *price story* re-skinned with the location too — the from-price crossfading as part of the scene rather than living only on the cards?
- The deck works beautifully for 2–5 locations; what happens to the composition the first time a trip has 8?
- The landing celebrates one featured trip — is `trips[0]` the right "featured" forever, or should the most-recently-worked-on trip win?
