# Technical Spec — Quit-Vaping App ("Clearway")

> **For:** Claude Code — build the app from this.
> **Read alongside:** `clearway-design-brief.md` (visuals, screens, tokens, copy) and the
> `onboarding-funnel-rn` skill (the 5-step funnel implementation patterns).
> This document owns architecture, data, logic, integrations, and build order.
> The design brief owns look, layout, and copy. When they overlap, design wins on
> appearance, this spec wins on behavior.

---

## 0. Stack (fixed)

- **React Native + Expo** (managed, EAS Build). **Not Expo Go** — native modules (RevenueCat, widget, notifications) require a **development build**.
- **expo-router** — file-based navigation.
- **NativeWind** — styling (tokens from the design brief).
- **react-native-reanimated** (v4) — the **signature** motion only: the clearing atmosphere, the ticking counter, the breathing orb, the WOW reveal. (Also the engine pressto is built on.)
- **react-native-ease** — **simple, subtle** animations: screen fades, tile stagger, small UI transitions. Reach for this first; escalate to Reanimated *only* for the 4 signature moments. The rule is **subtle** — never animate everything.
- **pressto** — press states on **every** tappable element (spring-physics scale/opacity). Configure once at the root with `PressablesConfig`. Peers: reanimated + gesture-handler + worklets.
- **pulsar** — haptics (rich preset library). Wire a selection preset into pressto's global `onPress` handler so every tap feels, plus targeted presets on key moments.
- **expo-audio** — short UI sounds. Currently the soft bell chime on each 4-7-8 phase change (craving tool); a native module, so it needs a dev build.
- **react-native-keyboard-controller** — frame-perfect keyboard behavior for the few text inputs (reasons editing, edit details).
- **Zustand** + **AsyncStorage** (persist middleware) — all app state, 100% local.
- **react-native-purchases** (RevenueCat) — subscriptions + entitlements + restore.
- **expo-notifications** — local notifications.
- **expo-store-review** — in-app rating prompt.
- **react-native-android-widget** — the premium home-screen widget.
- No backend. No accounts. No server. RevenueCat is the only network dependency.

---

## 0b. Premium quality bar (NON-NEGOTIABLE — applies to every screen)

> The thesis: **premium is the sum of small details, not more effects.** Spend boldness in ONE place (the clearing atmosphere); everything else stays quiet, subtle, and precise. An app feels cheap when it animates everything and bare-bones its small states — not when it's restrained.

1. **Press states (pressto).** Every tappable element is a `PressableScale` / `PressableOpacity`. Set the spring once at the root with `PressablesConfig` (~`damping: 30, stiffness: 200, minScale: 0.95`). **No** raw `TouchableOpacity`/`Pressable` with no feedback anywhere in the app.
2. **Haptics (pulsar).** Wire a pulsar selection preset into `PressablesConfig.globalHandlers.onPress` so *every* tap feels — then add targeted presets: success on milestone reached, a soft tick on each breathing phase, a confirmation on purchase success, a gentle one on reset confirm. Use the preset library; don't hand-roll patterns.
3. **Subtle motion (react-native-ease + native transitions).** Default to simple eases for UI and **native** stack transitions between screens. Reanimated is reserved for the 4 signature moments only. If in doubt, animate *less*.
4. **Keyboard (react-native-keyboard-controller).** Every text input (reasons, edit-details) uses it — no jumpy layout, no field hidden behind the keyboard.
5. **Loading & empty states.** No bare spinners, no system `alert()`, no "No data." Labelled, on-theme, in the app's voice (design brief §5). Day-0 home reads as an invitation, not an empty state. This is where cheap apps betray themselves.

**Performance floor:** 60fps, **zero layout shift** on the ticking counter (fixed-width / mono numerals), tap feedback < 100ms, screen transitions never flash, reduced-motion respected. The clearing atmosphere is **ambient and slow** — a gentle drift, not a particle storm.

---



**Single source of truth:** the **quit timestamp** (UTC ms) — the moment the user marked themselves clean. *Everything* derives from it at render time. Never store a running counter; always compute `Date.now() - quitTimestamp`. This keeps the count correct across backgrounding, app restarts, and the widget.

```
quitTimestamp ──► time clean      = now - quitTimestamp
              ──► money saved     = (weeklySpend / WEEK_MS) * (now - quitTimestamp)
              ──► milestones      = which thresholds (now - quitTimestamp) has passed
              ──► health timeline = which recovery markers have unlocked
```

Premium status is a **separate** source of truth: the RevenueCat `premium` entitlement. One hook (`usePremium`) reads it; every gate uses that hook. Never persist premium state manually — RevenueCat is authoritative.

---

## 2. Data model (Zustand store, persisted to AsyncStorage)

```ts
type Reason = { id: string; glyph: string; title: string; note: string };  // §15 — structured "my why" card

type QuitState = {
  // core
  quitTimestamp: number | null;      // UTC ms; null until onboarding done
  longestStreakMs: number;           // best run ever; survives resets

  // from onboarding quiz
  weeklySpend: number;               // user's currency units
  currency: 'USD' | 'GBP' | 'CAD' | 'AUD';
  primaryMotivation: 'health' | 'money' | 'control' | 'someone';
  usageFrequency: string;            // Q3 answer
  worstCravingTime: string;          // Q5 answer
  reasons: Reason[];                 // "my why" cards, editable (was string[] — see §15; persist v2 + migrate)

  // app
  onboardingComplete: boolean;
  themePref: 'light' | 'dark' | 'system';   // default 'system'
  notifications: {
    enabled: boolean;
    dailyTime: string;               // "HH:mm"
    milestonesOn: boolean;
    streakNudgeOn: boolean;
  };

  // bookkeeping
  hasRequestedReview: boolean;       // in-app review fired once
};
```

**Reset logic (the "I slipped" flow):**
```
const current = Date.now() - quitTimestamp;
if (current > longestStreakMs) longestStreakMs = current;
quitTimestamp = Date.now();
// then: reschedule milestone notifications, refresh widget
```
Reset never erases `longestStreakMs`. Copy stays shame-free (see design brief B5).

---

## 3. Core logic modules (`lib/`)

### `lib/time.ts`
- `msClean(quitTimestamp): number`
- `formatClean(ms)` → `{ days, hours, minutes, seconds }`
- Home counter: derive every tick from `Date.now()`, do **not** increment a variable.

### `lib/money.ts`
- `moneySaved(weeklySpend, msClean)` = `weeklySpend * (msClean / WEEK_MS)`
- `projectedYear(weeklySpend)` = `weeklySpend * 52` (used in WOW moment + solution bridge).

### `lib/milestones.ts`
- Ordered thresholds: `1h, 1d, 3d, 1w, 2w, 1mo, 3mo, 6mo, 1y, …`.
- `reached(msClean)`, `current(msClean)`, `next(msClean)`.
- Gating: milestones beyond **1 month** are premium-locked (visual lock = "air not yet cleared", design brief C2). The lock is cosmetic — the data still computes; premium just reveals it.

### `lib/health.ts`
- Time-based recovery markers, each `{ atMs, title, body }` (e.g. `20m`, `3d`, `2w`…).
- `unlocked(msClean)` vs upcoming (dimmed + countdown). Factual, calm, never graphic.

### `lib/breathing.ts`
- 4-7-8 loop driver for the craving orb: inhale 4s (expand), hold 7s, exhale 8s (contract). The orb (Reanimated) and the guiding label both derive from this on a shared clock; a soft **sound** cue (expo-audio) fires on each phase change — see the §B4 build note (the original per-phase haptic was dropped: a long buzz on the hold felt disorienting).

---

## 4. Navigation (expo-router)

```
app/
  _layout.tsx                  // root: theme provider + RevenueCat init + gate on onboardingComplete
  onboarding/
    _layout.tsx                // stack: gestureEnabled:false, headerShown:false
    welcome.tsx                // A0
    quiz.tsx                   // A1 (drives 3–5 questions from a config array)
    empathy.tsx                // A2  — use `replace` to enter (no going back)
    solution.tsx               // A3
    wow.tsx                    // A4
    paywall.tsx                // A5 (soft, dismissable)
  (app)/
    _layout.tsx                // main stack
    index.tsx                  // B1 Home (hero) + "My why" card (§15)
    progress.tsx               // B2+B3 — Milestones/Recovery tabs (replaced milestones.tsx + health.tsx, see §15)
    craving.tsx                // B4 (presented as modal sheet)
    reset.tsx                  // B6 — transparent half-sheet over Home (§15)
    reasons.tsx                // B5 — editable "my why" cards (§15)
    settings.tsx               // D
    paywall.tsx                // C1 (modal, reused for all triggers)
```

**Rules (match the onboarding skill):**
- `gestureEnabled: false` across onboarding; no back button; no swipe-back.
- After empathy, use `router.replace` (the journey is one-way).
- On launch: if `!onboardingComplete` → `onboarding/welcome`, else → `(app)`.
- Store quiz answers into the Zustand store as they're tapped so empathy + paywall can reference them.

> **Library override vs the skill:** the `onboarding-funnel-rn` skill references Expo Haptics and uses Reanimated for everything. For this app, **override both**: use **pulsar** for haptics and **react-native-ease** for the simple funnel animations (option-select scale, fades, stagger), keeping Reanimated only for the WOW reveal. Apply the skill's *patterns and copy*, not its exact animation/haptics packages.

---

## 5. RevenueCat integration

### Setup (one-time, outside code)
1. RevenueCat account → add the Android app → paste the Play Store service credentials.
2. Play Console → create subscription products: **monthly**, **annual** (with a **7-day free trial** intro offer), and a **lifetime** one-time product. Prices per design brief (placeholders: $4.99 / $29.99 / $49.99).
3. RevenueCat → one **entitlement** `premium` → one **offering** `default` containing the 3 packages → attach products.

### Code
- Init once in root `_layout.tsx`:
  ```ts
  Purchases.configure({ apiKey: ANDROID_SDK_KEY });
  ```
- `lib/purchases.ts`:
  - `getOfferings()` → feed the custom paywall (design brief A5/C1).
  - `purchase(pkg)` → `Purchases.purchasePackage(pkg)`.
  - `restore()` → `Purchases.restorePurchases()`.
  - `usePremium()` hook → subscribes to `Purchases.addCustomerInfoUpdateListener`, returns `customerInfo.entitlements.active['premium'] != null`. **This is the only gate** used app-wide.
- Paywall is **custom UI** (the design brief screen). RevenueCat only supplies offerings + handles the purchase. Do **not** use the RevenueCatUI template.
- Trial: configured in Play Console as the intro offer; the SDK surfaces it automatically. Show "7-day free trial" + "No charge today" in the custom paywall.

### Premium gates (all via `usePremium()`)
- Home-screen widget · milestones past 1 month · full craving kit · detailed/extended stats · themes (later) · multi-addiction (later).

---

## 6. Notifications (`lib/notifications.ts`, expo-notifications)

- **Permission asked after the WOW moment** (A4 → A5), never on first launch. Frame as benefit.
- Schedule on quit start + reschedule on reset/settings change:
  - **Daily motivation** at `notifications.dailyTime`.
  - **Milestone hits** — schedule one notification per upcoming milestone at its exact future timestamp (`quitTimestamp + thresholdMs`).
  - **Streak nudge** — gentle re-engagement if the app hasn't been opened (e.g. a scheduled check).
- Cancel + reschedule all on reset (timestamps change).
- Respect the on/off + per-type toggles in settings.

---

## 7. In-app review (`expo-store-review`)

- Fire **once**, when the user first crosses the **7-day** milestone (the pride peak — design brief & funnel logic). Guard with `hasRequestedReview`. This is the primary organic-ASO lever; don't waste it earlier.

---

## 8. Android home-screen widget (the long-pole — flag clearly)

- Built with **react-native-android-widget** (Expo config plugin). Requires a dev build + real-device testing; **not** available in Expo Go.
- Two sizes (design brief E): **small** (day count only) · **medium** (day count + money saved + next milestone), rendered with a sliver of the clearing-atmosphere visual.
- **Data:** the widget reads the persisted `quitTimestamp` and computes the day count itself. Because the **day** number changes only once per day, widget updates can be infrequent (battery-friendly) — update on a periodic schedule and on app foreground/quit-change events. Do **not** try to tick seconds on the widget.
- **Gate:** premium-only. Free users see the locked widget card on Home (design brief C2) that opens the paywall.
- **Build risk:** if the widget threatens the launch date, ship Home + paywall first and fast-follow the widget in v1.1 — it's the one piece allowed to slip (the rest is pure RN).

---

## 9. Theming (`constants/theme.ts` + provider)

- Token objects for **light** and **dark** straight from the design brief §3 (hex values, type scale, radius, spacing).
- Resolve active theme from `themePref` + `Appearance` (system). Expose via context/hook; wire NativeWind dark variant.
- **Dark is primary** — build and verify it first.
- Honor **reduced motion** (`AccessibilityInfo`): replace the atmosphere animation with a static clarity level keyed to streak length.

---

## 10. Analytics (minimal, optional)

- Funnel only: `install → onboarding_complete → paywall_viewed → trial_started → converted`.
- RevenueCat already reports trial/convert. Add a lightweight client (PostHog RN or Firebase Analytics via config plugin) for the onboarding funnel events, or skip for v1 and rely on RevenueCat + Play Console. Keep it light — no heavy SDKs.

---

## 11. Correctness notes / edge cases

- **Always derive from timestamp**, never from an incrementing counter (survives backgrounding/restart).
- Store timestamps in **UTC ms**; format in local time for display.
- Device clock changes can be exploited to inflate the streak — acceptable for v1, don't over-engineer.
- **Offline:** the whole app works offline; only `getOfferings`/`purchase`/`restore` need network — handle those failures gracefully with the design brief's error copy ("No charge was made — try again or restore.").
- Onboarding answers must persist *before* empathy/paywall render (they reference them).
- After purchase success anywhere, the `usePremium()` listener flips all gates automatically — no manual refresh.

---

## 12. Build order (phased — build and verify in this sequence)

1. **Scaffold** — Expo + expo-router + NativeWind + Zustand store + theme provider (dark first). Wire the premium foundation up front: root `PressablesConfig` (pressto) with global pulsar haptics, `KeyboardProvider` (keyboard-controller), and the gesture-handler/worklets peers. Empty screens routing correctly, every placeholder button already pressable + haptic.
2. **Core logic** — `lib/time`, `lib/money`, `lib/milestones`, `lib/health` with unit-level sanity checks (no UI yet).
3. **Home (B1)** — the hero, fully realized with the clearing atmosphere + ticking counter. *Validate against the design first.*
4. **Onboarding funnel (A0–A5)** — per the `onboarding-funnel-rn` skill; wire answers into the store; WOW moment starts the counter.
5. **Core screens** — Milestones, Health, Craving (breathing orb), Reset, Reasons.
6. **RevenueCat + paywall** — init, offerings, custom paywall, `usePremium` gates, restore, contextual triggers (C2).
7. **Notifications** — permission after WOW, schedule/reschedule, settings toggles.
8. **In-app review** — at 7-day milestone, once.
9. **Widget** — small + medium, premium-gated. (Allowed to slip to v1.1 if it blocks launch.)
10. **Analytics + polish** — funnel events, reduced-motion, empty/error states, both themes verified.

---

## 13. Release checklist (Play Console)

- Subscription products + 7-day intro offer + lifetime product created and linked to RevenueCat.
- `premium` entitlement / `default` offering verified in a sandbox purchase.
- **Restore purchases** works (RevenueCat handles it — just verify).
- Privacy policy + terms URLs live (reuse the Vercel setup as with Flipia).
- **Data Safety** form: declare purchase/financial data handled via Google Play Billing + RevenueCat; the rest is local-only.
- Store listing keyworded for "quit vaping / stop vaping / quit nicotine" (see ASO direction).
- Dark + light both shipped; tested one-handed on a 6.5"+ device; tested on a real Android device (widget + notifications can't be validated in Expo Go).

---

### One-line summary for the engineer
A local-first Expo app whose entire state derives from a single quit-timestamp; RevenueCat owns the `premium` gate; the only hard part is the Android home-screen widget — everything else is pure React Native, so ship Home + paywall first and let the widget fast-follow if needed.

---

## 14. Post-spec changes (Step 3–4 build — as built)

Additions/changes made while building Home + the onboarding funnel that were **not in the original spec**:

**New native dependency**
- `@shopify/react-native-skia@2.6.2` — powers the procedural smoke. GOTCHA: pnpm v10 blocks its postinstall, so the prebuilt libs need `npx install-skia` (wired via `pnpm.onlyBuiltDependencies` in package.json). Using Skia REQUIRES a native rebuild (`npx expo run:android`); a JS reload alone crashes.

**Atmosphere — procedural smoke replaces the static SVG fog**
- `components/home/SmokeSkia.tsx` — full-screen SkSL shader (fbm + domain-warp) for drifting/curling smoke. Density = clarity-driven `a.fog.opacity` (same intent as §9: thins with clean time, resets on slip; new rendering).
- `lib/atmosphere.ts` + `components/home/Atmosphere.tsx` — added a `clarity` override + `smoke` prop so the onboarding can pin fixed haze states.
- Perf (heat/battery): throttled clock (`useSmokeClock` via `useFrameCallback`) + tiered quality via a `hq` prop — **Home = 30fps / 3 fbm octaves** (viewed repeatedly, keep it cool), **onboarding backdrop + WOW slider = 60fps / 4 octaves** (one-time premium first impression). NO time-based cutoff — smoke must persist even at long streaks (product decision).

**Store (§2)**
- Added `vapingDuration` (Q2 answer) — read back on the empathy screen.

**Onboarding transitions (§4)**
- Native-stack `animation` + Reanimated `entering` don't fire reliably on a freshly-mounted native screen, and `_layout` edits often need a full reload. Working approach: `_layout` uses `animation: 'none'`; the screen slide is a `useEffect`+`translateX` `SlideIn` inside `components/onboarding/Shell.tsx` (always fires on mount). Quiz question→question uses Reanimated `SlideInRight`/`SlideOutLeft` crossover.

**Onboarding components (`components/onboarding/`)**
- `Orb.tsx` — luminous 3D orb (SVG radial gradients) with a breathing loop.
- `QuizCard.tsx` — selected answer emphasized + others dimmed; premium tap effect (soft aqua glow + soft smoke wisps off the top/left borders + warm embers; all soft-edged SVG radial gradients, Reanimated — no Skia, ~0.8s, one option at a time).
- Quiz: a **previous button** (change the prior answer) with per-question `picks` memory + a `locked` transition guard.
- `Backdrop.tsx` (two-state haze crossfade), `Shell.tsx`, `Cta.tsx`, `content.ts` (5 questions + empathy copy).

**WOW moment (§A4) — before/after smoke slider**
- `components/home/SmokeCompare.tsx` (full-screen at the reward beat) — side-by-side before/after: one Skia `SmokeSplit` shader (`split` uniform, single canvas) + a draggable divider + an **interpolating day & money counter** driven by `useAnimatedReaction` (UI-thread; no per-frame React re-render, avoids the animated-TextInput reset glitch).

**Haptics (§0)**
- Pulsar ships with its engine DISABLED — added `initHaptics()` (`Settings.enableHaptics(true)`, logs the device support level) called once from `AppProviders`. Without it nothing is felt on device.

**UI tweaks**
- CTA button label colour = teal `#0C4A3E` on the aqua fill (not the design's dark near-black); quiz option text `#EAF4F2`; status bar forced light across onboarding.

**Home (§B1) — stats card**
- The right stats card now shows **"Air cleared %"** (= `min(99, round(clarity(ms)*100))`, ring fills with it) instead of the "next milestone · in Xh" countdown — a more meaningful, on-theme read of progress. **Capped at 99%** since the smoke never fully clears (consistent with the persist-forever smoke decision) and to keep some motivation. `components/home/StatsRow.tsx` takes `clearedPct` (was `milestoneLabel`/`remText`/`pct`); `lib/milestones.progress` no longer feeds it.

**Logo & Splash (design brief — `Clearway Logo & Splash.dc.html`)**
- `components/splash/SplashBackdrop.tsx` — the splash atmosphere (petrol linear gradient + aqua sky glow + dawn horizon glow) as static SVG; the brand launch frame, always dark (independent of the runtime theme).
- `components/splash/AnimatedSplash.tsx` — JS launch screen handed off from the native splash once fonts + persisted state are ready. **Smoke (reused `SmokeSkia`) drifts over the mark then clears** to reveal it ("The air clears from here."), the logo scales in inside two expanding aqua rings (`cwSplashRing`), wordmark + tagline rise, then the whole overlay fades into the app. Mounted as an overlay in `app/_layout.tsx` (state `splashDone`); native splash still held until `ready` so there's no flash.
- `assets/clearway-logo.png` — the 1024² square master from the design brief, copied into `assets/` (survives the gitignore of the brief bundle).
- `components/splash/Spinner.tsx` — shared aqua top-arc spinner (splash + transition loader).
- **App icons swapped to the brief's production exports** (the old files were low-res placeholders): `assets/icon.png` ← square master (iOS self-masks), `assets/adaptive-icon.png` ← adaptive foreground (orb in the 66% safe zone, bg `#0E1B1F`), `assets/splash.png` ← rounded 1024² icon. `app.json` splash `imageWidth` 200→120 to match the JS splash logo (seamless native→JS handoff). **Requires a native rebuild** (`npx expo prebuild` + `run:android`/`run:ios`) — a JS reload won't update the launcher icon or native splash.

**Paywall → Home transition (smoke-styled loader)**
- `components/splash/TransitionLoader.tsx` — same atmosphere as the splash; the fog thins as it "clears the air" with a spinner + label, then calls `onDone`. Wired in `app/onboarding/paywall.tsx`: `finish()` shows the loader; `setOnboardingComplete(true)` is only flipped in `onDone` — otherwise the onboarding `_layout` `Redirect` fires immediately and skips the transition.

**Craving tool (§B4) — breathing screen**
- `app/(app)/craving.tsx` + `components/craving/` (`BreathingOrb`, `CraveKit`, `SoundToggle`) + `hooks/useBreathPhase.ts`. Atmosphere screen — live `Atmosphere` behind, dark always, light status bar. Reached from Home's "I need a moment" as a modal: `slide_from_bottom`, `animationDuration: 750`, swipe-to-dismiss kept (see `app/(app)/_layout.tsx`).
- **Orb follows the phases.** The WOW glowing sphere; its scale is driven off the shared phase clock via the `phase` prop (Reanimated `withTiming` per phase — grow over the inhale, settle/hold at full, contract over the exhale). Re-anchored on every phase change so it stays locked to the guiding label — no independent-timer drift.
- **Guiding label + countdown** come from `useBreathPhase` (a JS clock over `phaseAt`); the word cross-fades softly on each change, and the whole screen settles in with a staggered fade on open.
- **Sound cue instead of haptic.** A long vibration on the 7s hold felt disorienting, so the per-phase pulse is now a soft bell chime — Mixkit "Relaxing bell chime", `assets/audio/breath-cue.mp3` (~2.7s, Mixkit License) — played via **expo-audio** (`lib/sound.ts`: one reused `AudioPlayer`, `playsInSilentMode`, guarded no-op without the native module). On/off is a **`SoundToggle`** pill on the title line; persisted as `breathSound` (default on), enabling it previews the chime. **Requires a native rebuild** (`expo run:android`/`ios`) for the expo-audio module.
- **Fog legibility.** A `textScrim` (from the design) darkens top/bottom behind the content, strengthening with the haze; the locked cards also darken with the haze (`CraveKit` takes `haze = 1 - clarity`), so the frosted rows keep contrast even at full smoke.
- **Premium craving kit** stays frosted-locked — visual only, no RevenueCat yet.

**Design handoff bundle**
- `clearway-design-brief/` (the exported Claude Design mockups) is gitignored — source mockups, not app code.

**Still deferred (per spec):** RevenueCat / real purchases (Step 6) — the A5 paywall is visual-only; × and CTA both just finish onboarding.

---

## 15. Post-spec changes (Step 5 Progress + Step 5b Reset/Reasons — as built)

**Progress screen (B2+B3) — merged into one tabbed screen**
- `app/(app)/progress.tsx` replaces `milestones.tsx` + `health.tsx`: "Milestones" / "Recovery" segmented tabs, opened from Home's top-right icon and the stats ring. Route: `slide_from_right`, 320 ms.
- Both tabs stay **mounted** (visibility via `display`) — a tab switch never remounts (remounting the ~70-view timeline cost 4 s+ on the test device); Recovery pre-warms hidden 700 ms after entry; scroll positions survive switches.
- **No smoke on this screen** (`Atmosphere smoke={false}` — gradients + scrim only; product call: the stagger IS the premium feel here). Timeline rows mount one frame late (`rowsReady` rAF) behind the stagger.
- `components/progress/` — ProgressTabs, TimelineRow (pulsing "current" node), MilestonesTab, RecoveryTab, icons. Reached = aqua/lit, current pulses, **>1 mo = frosted lock + "Air not yet cleared" + Premium pill**; free upcoming milestones show a countdown instead (the premium wording appears ONLY on actually-locked items). Recovery rows show real countdowns via `lib/format.durationLabel`/`countdownLabel`.

**Animation & perf doctrine (Android mid-range — hard-won, follow it)**
- **NEVER** Reanimated `entering`/`exiting` on a native-stack pushed screen → lag + black screen during the slide. Element appearance = `components/ui/StaggerIn.tsx`: a *manual* shared-value fade/lift with per-index delay; its `play` prop replays the cascade without remounting (used on tab switches).
- Push transitions: `slide_from_right` / `slide_from_bottom`, `animationDuration: 320` (craving's original 750 ms felt like button lag).
- **Tick isolation**: the 250 ms clock lives *inside* `HeroCounter`; screens tick `useNow(60000)`. Home re-renders 1×/min instead of 4×/s — this was the main tap-latency fix.
- **Smoke cost**: `SmokeSkia` non-hq renders at half resolution (canvas styled `50%` + `scale: 2`, `transformOrigin 'top left'` — size in **percent**, not window dims, which left an uncovered strip at the bottom) at 24 fps. Home kills its smoke the instant a nav starts (`navigating` state) and fades it back on focus (`SmokeFade`). `Atmosphere`'s gradient layers merged into 2 `<Svg>` views (was 4).

**Store (§2)**
- `reasons: string[]` → `Reason[]` `{ id, glyph, title, note }`; persist bumped to `version: 2` with a `migrate` (v1 arrays reset to `[]` — they were never populated). New actions: `addReason`, `updateReason(id, patch)`, `removeReason(id)`.

**Reset (B6) — transparent half-sheet over the live Home, not a full screen**
- Route: `presentation: 'transparentModal'` + `animation: 'fade'` (220 ms) + transparent `contentStyle`. The **real Home** (live counter) stays visible behind a radial veil; tapping the veil dismisses. The sheet slides in via manual Reanimated (translateY, 340 ms, ease-out) — not the route animation (that would slide the veil too).
- Sheet skin: bg `#152A31`, border `#3C5E68` top+sides (a drop-shadow gradient band above was tried and rejected — hard edge). Trophy card shows `max(longestStreakMs, current)` in days; confirm = `haptics.resetConfirm()` + `slip()` + back. Longest streak survives, per §2.
- **GOTCHA (Android):** RNGH-based pressables (pressto) inside a `transparentModal` or RN `Modal` receive **no touches** — taps fall through to the backdrop (symptom: "reset does nothing", the sheet just closes). Fix: wrap the modal content in its own `<GestureHandlerRootView>`. Applies to every future overlay.

**Reasons (B5) — editable, seeded, keyboard-safe**
- First open seeds one card from `primaryMotivation` (money copy uses the real `projectedYear`) — `components/reasons/seeds.ts`.
- `ReasonCard` is **display-only** (title + note as Texts); the pencil opens the edit modal, the trash deletes (`removeReason`).
- **Adding AND editing go through the same sheet** — `components/reasons/ReasonModal.tsx`: bottom sheet (Reset skin) with a glyph picker (✦ ✚ ♡ ◎ $ ★) + title + note; `initial` prop switches New/Edit mode (the form remounts fresh each open — conditional render).
- **The sheet is rendered IN-TREE (absoluteFill overlay), NOT inside an RN `<Modal>`.** An RN Modal is a separate Android window that escapes the `KeyboardProvider`: it does its own `adjustResize` AND the manual translate stacks on top → double shift, a gap between sheet and keyboard (the recurring bug already fixed in money-tracking's `BottomSheet.tsx`). In-tree also means no local `GestureHandlerRootView` is needed.
- **Sheet animations are manual**: one shared value drives backdrop fade + sheet slide on open (300 ms) AND on close (220 ms, `closing` state; `onClose` fires after the out-animation via setTimeout).
- **Keyboard handling MUST use react-native-keyboard-controller**: the screen list scrolls with its `KeyboardAwareScrollView` (`bottomOffset`); the sheet rides the keyboard via the **`useReanimatedKeyboardAnimation` hook** (sheet translateY += `keyboard.height.value`). Do not swap any of it for the RN built-ins.
- Screen: atmosphere without smoke + shared `components/ui/Scrim.tsx`, StaggerIn cascade, `slide_from_right` 320 ms.

**Home — "My why" card (new, above the Saved/Next cards)**
- `components/reasons/WhyCard.tsx`: same card skin as the stats cards, one slim row — glyph tile + MY WHY eyebrow + one-line reason + a "+" affordance. The whole card is a single PressableScale → `/reasons` (press spring + global haptic).
- Pulls real store reasons; falls back to the motivation seed (display-only) when empty. **Rotates on every Home focus AND every 10 s** (interval paused while unfocused). Each swap plays a mini ClearBurst — aqua radial burst + two grey vapor puffs + a content cross-fade — clipped inside the card so it never competes with the hero or the atmosphere.
