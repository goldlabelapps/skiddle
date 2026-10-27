# Architectural Guide: Event Promotion Studio & Flash Creative Engine

> **Target Audience:** Engineering Team & Technical Interview Panel (Adam Chandler, Chris Seaton, Neil Meredith) at Skiddle.  
> **Objective:** Document the architecture, rendering pipeline, Web Audio synthesis, and dynamic scene generation powering the Next.js 15 Event Promotion Studio (`/events/[id]/promote`) and its integration with `@goldlabelapps/flash` and GSAP.

---

## 🏛 1. Overview & Business Rationale

While traditional ticketing platforms provide static event listings, event promoters need engaging, high-energy promotional creative to drive social sharing and ticket conversion.

The **Event Promotion Studio** transforms raw Skiddle API event data into a dynamic, nostalgic **Flash-style interactive motion graphic movie**:
- Built on Next.js 15 App Router (`apps/web/src/app/events/[id]/promote/page.tsx`).
- Powered by `@goldlabelapps/flash` (`Stage`, `CleverText`, `LightningBolt`) and **GSAP (GreenSock Animation Platform)** for deterministic 60fps timeline playback.
- Utilizes the **Web Audio API** for real-time procedural synthesizer sound effects (intro sweeps, button clicks, and fanfares) with zero audio asset weight.
- Features real-time scene sequencing: **Scene 1 (Hero Title & Lightning Intro)** $\rightarrow$ **Scene 2 (Lineup / Artists)** $\rightarrow$ **Scene 3 (Venue & Calendar Date)** $\rightarrow$ **Scene 4 (Tickets CTA & Pricing)**.
- Provides interactive playback controls: Play/Pause, Timeline Scrubbing, Restart, Fullscreen Toggle, Audio Mute, and Social Sharing.

---

## ⚡ 2. Technical Architecture & Component Tree

```mermaid
flowchart TD
    Page["promote/page.tsx (Server Component)"] -->|"Extracts params.id & executes client.events.getListing()"| Client["PromoteFlashMovieClient.tsx ('use client')"]
    Client --> Stage["@goldlabelapps/flash: Stage (Canvas Wrapper)"]
    Stage --> CleverText["@goldlabelapps/flash: CleverText (Dynamic Typographic Motion)"]
    Stage --> Bolt["@goldlabelapps/flash: LightningBolt (Generative Vector Arcs)"]
    Client --> GSAP["GSAP Timeline (Scene Sequencing & 60fps Interpolation)"]
    Client --> Audio["Web Audio API (Procedural Oscillator / Gain Nodes)"]
    Client --> Controls["Playback & Sharing Controls (Scrubber, Mute, Fullscreen, Copy)"]
    Client --> Telemetry["Telemetry Drawer (Masked Debug Telemetry & Raw Payload)"]
```

### Component Breakdown
| Component | File Path | Responsibility |
| :--- | :--- | :--- |
| **Server Component** | `apps/web/src/app/events/[id]/promote/page.tsx` | Fetches single event data via `@skiddle/sdk` on the server using `process.env.SKIDDLE_API_KEY`. Provides SSR fallback and metadata. |
| **Client Studio** | `apps/web/src/components/PromoteFlashMovie/PromoteFlashMovieClient.tsx` | Manages animation playback state, Web Audio synthesizer, timeline scrubbing, and canvas stage lifecycle. |
| **Styling Module** | `apps/web/src/components/PromoteFlashMovie/PromoteFlashMovie.module.css` | Cyberpunk / retro-modern terminal styling, scanline overlays, CRT flicker, and responsive aspect-ratio containment. |
| **Unit Test Suite** | `apps/web/tests/unit/promote-page.test.tsx` | Tests rendering, timeline controls, audio toggle, and telemetry drawer without external network calls. |

---

## 🎨 3. Procedural Web Audio Synthesizer

Rather than bundling bulky MP3 or WAV audio assets, `PromoteFlashMovieClient` generates procedural audio in real time using the native browser **Web Audio API**:

```typescript
function playFlashSound(type: 'intro' | 'click' | 'share') {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'intro') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  } else if (type === 'share') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.08);
    osc.frequency.setValueAtTime(659.25, now + 0.16);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  }
  osc.start(now);
  osc.stop(now + 0.4);
}
```

### Benefits:
1. **0 KB Payload:** Zero bandwidth or network latency for audio delivery.
2. **Deterministic:** Instant response on mobile devices and modern desktop browsers.
3. **Mute by Default & Safe User Gesture:** Follows browser autoplay policies, resuming `AudioContext` only on explicit user interaction.

---

## 🎬 4. Dynamic Scene Sequencing & GSAP Timeline

The movie duration is normalized to 12 seconds across four distinct narrative beats:

1. **Scene 1 (0.0s – 3.0s) — Hero Electric Inception:**
   - Visual: Dynamic `LightningBolt` flashes across the canvas.
   - Text: `CleverText` animates the event name with high-contrast glowing neon typography.
   - Audio: Sawtooth upward pitch sweep (220Hz $\rightarrow$ 880Hz).

2. **Scene 2 (3.0s – 6.0s) — The Lineup:**
   - Visual: Artist names cycle onto the canvas with staggered entrance fades.
   - Data Source: `event.artists` array or parsed headline acts from `event.description`.

3. **Scene 3 (6.0s – 9.0s) — Venue & Date:**
   - Visual: Venue name, city, and formatted British date (`15 Apr 2027`) highlighted with map pin and calendar glyphs.
   - Text: High-energy subline ("LIVE AT THE VENUE").

4. **Scene 4 (9.0s – 12.0s) — Call to Action:**
   - Visual: Pulsing ticket price badge (`£27.50`), ticket availability status, and glowing Skiddle checkout URL.
   - Audio: Major triad fanfare (A4 $\rightarrow$ C#5 $\rightarrow$ E5) on loop restart or share action.

---

## 🧩 5. Modular PromoFlash & Canonical `/promo/[id]` Route

In Phase 2 of the creative engine modernization, the promotional canvas was decoupled into a reusable, standalone module:

### Architectural Highlights:
1. **Canonical Route (`/promo/[id]`)**:
   - Clean, isolated white canvas without application chrome (navigation bar or global footer).
   - Ideal for iframe embedding, full-screen display, and social preview cards.
   - Backward-compatible redirect from `/events/[id]/promote`.
2. **Modular MovieClips (`@goldlabelapps/flash`)**:
   - **`SkiddleLogoMC`**: Scalable vector Skiddle logo with ActionScript method attachment.
   - **`corkscrewActionScript` / `asMovieClip.corkScrew("in" | "out")`**: Threading motion modeling 720° spin, scale interpolation, and opacity ease.
   - **`TitleText`**: Responsive multi-line typography with dynamic `autoSize` scaling based on character count ($>60$ chars: `1.125rem`, $>35$ chars: `1.35rem`, $>20$ chars: `1.5rem`, $\le 20$ chars: `1.75rem`).
   - **`CleverText`**: Real-time typewriter typography streaming with `active` trigger synchronization.
   - **`ImageMC`**: 1:1 responsive square flyer container with elevation shadow and rounded borders (`width={160}` when venue/date and description are present).
   - **`PromoVenueDateMC`**: Integrated venue and date MovieClip cleanly presenting the event's date and doors time badge (`📅 Thu 15 Apr 2027 • Doors 19:30`) alongside the venue location badge (`📍 Depot Mayfield • Manchester`).
   - **`separatePromoActionScript`**: Coordinated counter-motion moving `CleverText` up to the upper promotion area (`y: -175` to `-185`), unfurling `ImageMC` into the center area (`y: -65`), animating `PromoVenueDateMC` into position (`y: 54`), and fading in the event description cleanly underneath (`y: 138`).
   - **`cleanDescription`**: Utility function stripping HTML markup and decoding HTML entities (`&amp;`, `&#39;`, `&pound;`, `&quot;`) with dynamic typography scaling ($>180$ chars: `0.75rem`).
   - **`PromoActionsMC` & `promoActionsActionScript`**: Configurable action buttons (Facebook, Twitter/X, Email, More Events/Search) with a 1-by-1 entrance sequence: pop-up to horizontal center with elevation scale and top z-index, reading description pill fade-in/out, and shrinking down into an auto-spaced resting bottom row.
3. **Dynamic Social Metadata (OpenGraph & Twitter Card)**:
   - Server-side metadata generator (`generateMetadata`) utilizing React `cache` request deduplication.
   - Designates `largeimageurl` for high-resolution OpenGraph (`og:image`) and Twitter (`twitter:image`, `card: 'summary_large_image'`) social cards.
4. **Interactive Stage Replay**:
   - Clicking or tapping anywhere on the canvas gracefully resets and replays the GSAP animation timeline from frame zero.

---

## 💼 6. Candidate CV & React Developer Job Spec Assets

To support the hiring assessment workflow, public documents are consolidated directly under `apps/web/public/docs/`:
- **Candidate CV**: `/docs/Chris Dorward - CV.pdf`
- **Job Spec**: `/docs/React Developer Job Spec - Sep 26.pdf`
- Linked in the global `Footer.tsx` under the Candidate column opening securely in new tabs (`target="_blank"`, `rel="noopener noreferrer"`).
- Tested and verified in `apps/web/tests/unit/footer.test.tsx`.

---

## 🧪 7. Testing & Quality Gate

The promote module is guarded by dedicated automated tests:

```bash
# Run PromoFlash, Venue & Date, and Promote Page Vitest Suites
pnpm --filter web test tests/unit/promo-flash.test.tsx tests/unit/promo-venue-date.test.tsx tests/unit/promote-page.test.tsx

# Run Full Monorepo Tests
pnpm test
```

### Verified Test Cases:
- ✔ Renders promotion canvas stage with event title, flyer image, venue, and date badges.
- ✔ Renders `PromoVenueDateMC` with calendar date badge, doors open time, and venue location pin.
- ✔ Formats British date typography cleanly (`Thu 15 Apr 2027 • Doors 19:30`).
- ✔ Gracefully omits venue/date elements when metadata is absent.
- ✔ Initializes `promoActionScript` GSAP timeline with responsive centering.
- ✔ Automatically scales `TitleText` font sizing for multi-line event titles without canvas overflow.
- ✔ Streams title typography via `CleverText` typewriter animation.
- ✔ Renders `ImageMC` thumbnail flyer component with `largeimageurl` priority.
- ✔ Renders `PromoActionsMC` with Facebook and Search action buttons auto-spaced in bottom row.
- ✔ Executes `promoActionsActionScript` 1-by-1 entrance, centered pop up with top z-index, label fading, and shrinking into the bottom row.
- ✔ Toggles audio mute/unmute and timeline playback controls.
- ✔ Opens and closes the debug telemetry drawer.
