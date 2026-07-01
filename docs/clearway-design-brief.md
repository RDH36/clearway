# Design Brief — Quit-Vaping App ("Clearway", working title)

> **For:** Claude Design — design the complete app, every screen, both themes.
> **Working name:** *Clearway* (swappable). Play Store title concept: **"Clearway — Quit Vaping & Nicotine."**
> **Platform:** Mobile app, React Native / Expo. Phone only (no tablet for V1).
> **Markets:** English-speaking (US / UK / CA / AU). **English copy only.**

This brief is self-contained. Design from it directly — you don't need anything outside this document.

---

## 1. The subject, the audience, the one job

**What it is.** A tracker for people quitting vaping (disposable "puff" vapes, pods, e-cigs) and nicotine. The user marks the moment they stopped; the app counts time clean, shows money saved, reveals health recovering over time, and helps them survive cravings. Storage is 100% local — no accounts, no backend.

**Who it's for.** Mostly young (late teens to mid-30s). Phone-native, design-literate, allergic to anything that feels clinical, preachy, or childish. They got hooked on nicotine without seeing it coming and are now motivated but struggling. They open the app at the *worst* moments — 2 a.m., the craving after a meal, the lonely hour.

**The single job of the app.** Make the user *feel* their progress strongly enough to protect their streak — and give them somewhere to go when a craving hits.

---

## 2. Art direction — the concept

### Signature idea: **the air clears**

Vapor is the thing they're escaping. So the app's atmosphere *is* the progress meter.

- **Early streak (0–3 days):** the home screen carries a faint haze — a soft, desaturated fog at the edges, the counter sitting in slightly clouded air.
- **As days accumulate:** the haze recedes, the air deepens and clears, the palette gains clarity and saturation.
- **At milestones:** a brief "exhale" — vapor particles drift up and dissipate, a dawn-warm light washes through, then settles into the new, clearer baseline.

This is the one memorable thing. The counter is the functional hero; the **clearing atmosphere** is the emotional hero. Everything else stays quiet so this lands.

**The breath motif is reused:** the craving tool is a slow-breathing orb made of the same "air." One visual language, two purposes (progress + calm).

### What to avoid (these read as AI-default — do not ship them)
- Big number + small label + generic gradient accent as the *only* idea.
- Cream background + high-contrast serif + terracotta.
- Near-black + single acid-green accent.
- Confetti-cannon celebrations, medical-app blue, cigarette/lung clip-art, red "danger" framing. This app is about *freedom and clarity*, never shame.

---

## 2b. Premium quality bar (the feel — applies to every screen)

> Premium is the sum of small details, **not** more effects. The clearing atmosphere is the ONE bold thing; everything else stays quiet, precise, subtle. An app feels cheap when it over-animates and bare-bones its small states — never when it's restrained.

Design these **explicitly** (don't leave them to chance):

- **Press states on everything.** Every tappable element scales/dims with spring physics when pressed. Show the pressed state in your comps — nothing taps "flat."
- **Subtle motion only.** Micro-animations and native transitions. The home screen is not a theme park. The atmosphere drifts **slowly and ambiently** — a gentle clearing, not a particle storm.
- **Haptics on key moments** (handled in code): every tap, milestone reached, breathing phase, reset confirm, purchase success. Design the *visual* beat that pairs with each.
- **Composed loading & empty states.** No bare spinners, no "No data." Loading is labelled and on-theme; the day-0 home is a designed invitation. This is exactly where cheap apps betray themselves — give these real comps.
- **Pixel precision.** 4px grid, consistent radii, optically-aligned numerals, **no hard drop-shadows** (dark = lighter surface + 1px line). The precision you feel without noticing.
- **Restraint (Chanel rule).** Before a screen is done, remove one element. Spend the boldness budget on the atmosphere; keep everything around it disciplined.

---

## 3. Design tokens

### Color — Dark mode (PRIMARY theme, design this first)

Used at night during cravings, so dark is the default and must be the more beautiful of the two.

| Token | Hex | Use |
|---|---|---|
| `bg/base` | `#0E1B1F` | App background — deep petrol, clean night air (never pure black) |
| `bg/surface` | `#16282E` | Cards, sheets, elevated surfaces |
| `bg/haze` | `#33474C` | The early-streak fog overlay (fades out as streak grows) |
| `text/primary` | `#EAF4F2` | Headlines, the counter |
| `text/muted` | `#7E9A9B` | Labels, captions, secondary |
| `accent/clear` | `#5BE0C6` | Fresh-air aqua — progress, primary CTA, active states. Use with restraint. |
| `accent/dawn` | `#FFB57A` | Milestone / pride moments only — warm sunrise. Rare, so it stays special. |
| `line` | `#23383E` | Hairlines, dividers, tile outlines |

### Color — Light mode

| Token | Hex | Use |
|---|---|---|
| `bg/base` | `#EEF5F2` | Cool clean mint-white |
| `bg/surface` | `#FFFFFF` | Cards |
| `bg/haze` | `#C9D8D6` | Early-streak fog (light) |
| `text/primary` | `#0E1B1F` | |
| `text/muted` | `#5C7375` | |
| `accent/clear` | `#13A88C` | Deeper aqua for contrast on light |
| `accent/dawn` | `#E8894C` | Milestone warm |
| `line` | `#DBE6E3` | |

### Typography

Deliberate, non-default pairing. Use Google Fonts (web-available) with system fallbacks.

- **Display + counter numerals:** **Bricolage Grotesque** (warm-modern, characterful). The big time-clean number is the personality of the app — give it weight and presence.
- **Body / UI:** **Hanken Grotesk** (clean, humanist, friendly — not Inter).
- **Data / ticking seconds:** **Geist Mono** (so seconds tick without the layout jittering).

**Type scale:**
| Role | Size / weight |
|---|---|
| Counter (hero number) | 64–80pt, Bricolage, Bold, tight line-height (1.0) |
| Counter unit labels | 13pt, Geist Mono, muted |
| Screen headline | 26–30pt, Bricolage, SemiBold, line-height 1.1 |
| Body | 16pt, Hanken, Regular, line-height 1.6 |
| Label / caption | 13pt, Hanken, Medium, muted |
| Button | 16pt, Hanken, SemiBold |

### Spacing, radius, elevation
- Horizontal screen padding: **24px**. Vertical rhythm in multiples of 4.
- Card radius: **20px**. Button radius: **16px** (or full pill for the primary CTA). Tile gap: **12px**.
- Elevation = soft, low. No harsh drop-shadows. In dark mode prefer a subtle lighter surface + 1px `line` border over shadows.

### Motion
- Screen entrance: FadeIn 200ms or SlideInRight 300ms.
- Seconds tick: the seconds digit cross-fades, never layout-shifts.
- Option select: scale 0.97 → 1.0 spring + haptic.
- Milestone: the "exhale" — 1.2s vapor-dissipate + dawn light wash, one haptic. Not confetti.
- Craving orb: 4-7-8 breathing loop (inhale 4s expand, hold 7s, exhale 8s contract).
- Respect reduced-motion: replace the atmosphere animation with a static clarity level.

---

## 4. Screens

Design every screen below in **both themes**, with the states listed. Primary CTAs always sit in the bottom ~40% (thumb zone, see §7).

### A. Onboarding (5-step funnel — the conversion engine)

The funnel philosophy: *the onboarding is a visit, the paywall is the souvenir shop.* Every screen should captivate, momentum pulls forward, no back button, no skip on the emotional screens. Progress bar starts at 0%.

**A0 — Welcome / splash.** Logo, one-line promise ("The air clears from here."), single CTA "Get started." The haze is at its thickest here — this is day zero.

**A1 — Problem discovery (quiz, 3–5 screens).** Single-choice, tap to advance, progress bar visible. Emotional question first, not demographics.
- Q1: "What's pushing you to quit?" → Health · Money · Control · Someone I care about
- Q2: "How long have you been vaping?" → <1 yr · 1–2 yrs · 3–5 yrs · 5+ yrs
- Q3: "How often do you reach for it?" → A few times a day · Hourly · Constantly · I've lost count
- Q4: "What do you spend a week?" → slider or tiers (£/$ — feeds money-saved)
- Q5: "When are cravings worst?" → Mornings · After meals · Stress · Nights
- Each screen: progress bar (top), soft illustration/emoji (mid), question + options (green zone), tiny "why we ask" label.

**A2 — Empathy mirror.** A 1.5s "Reading your answers…" analyse animation, then a reveal that uses their *exact* answers. Example: *"3–5 years in, and it's the nights that get you. You're not alone — most people who quit have tried before and the night cravings are the #1 reason streaks break."* One empathy line + one social-proof line. Single CTA "See my plan →." Staggered fade-in per line.

**A3 — Solution bridge.** Headline "Here's how the air clears." Exactly 3 outcome tiles (not features), each tied to their answers:
- "You'll watch every clean day add up" → the live counter
- "You'll see the money come back" → "~$X back in your pocket this year" (computed from Q4)
- "You'll have somewhere to go when it hits" → the craving tool
- Credibility line at the bottom. CTA "Build my plan →."

**A4 — WOW moment (the peak — make it unmistakable).** Interactive. The counter *starts in front of them*: tap "I'm starting now" and the number begins ticking from 0, the haze visibly thins one notch, and their projected 1-year money-saved animates up from $0 to the real figure (e.g. **$2,080**). Haptic on tap, a gentle vapor-dissipate flourish. This is the screen that sells the app — give it room.

**A5 — Soft paywall (dismissable).** Appears right after the WOW peak. **Has a clear dismiss (×).** Leads with what they just built ("Your plan is ready — your counter's already running"), not a feature list. Plan toggle with **annual pre-selected** ("$29.99/yr — about $2.50/mo") vs monthly ($4.99) vs lifetime ($49.99). Star rating + "Join 100,000+ people clearing the air" near the CTA. CTA "Start 7-day free trial." Below it, quiet: "No charge today · Cancel anytime · Restore." Dismiss → drop into the free core app.

### B. Core app (free — must be genuinely good, not crippled)

**B1 — Home (the hero screen).** The counter lives here inside the clearing atmosphere.
- Center: time clean — `12 days · 6 : 41 : 09` (days big in Bricolage, h:m:s in Geist Mono ticking).
- The background haze level reflects streak length (more days = clearer air).
- Below: a compact row — **money saved** · **air cleared %** (clarity of the haze as a %, with a mini progress ring). *(As built: this replaced the "next milestone · in Xh" card — the % is a more meaningful, on-theme read of progress than a countdown.)*
- One quiet primary action anchored bottom: **"I need a moment"** (opens craving tool) — phrased as support, not alarm.
- Top corners: settings (left), milestones/timeline (right). Both small, red-zone OK (non-primary).
- **States:** day 0 (max haze, encouraging copy), long streak (clear air, calm pride), post-reset (see B5).

**B2 — Milestones.** A vertical journey of clean-time badges (1d, 3d, 1 week, 2 weeks, 1 month, 3 months…). Reached = lit in `accent/clear`; current = pulsing; far ones = locked behind premium past the 1-month mark (lock styled as anticipation, not denial — "keep going to unlock"). Tapping a reached milestone replays its little exhale moment.

**B3 — Health timeline.** What's recovering, unlocking by elapsed time: e.g. "20 minutes — heart rate settles," "3 days — taste & smell return," "2 weeks — breathing easier." Past = revealed and lit; upcoming = dimmed with a countdown. Calm, factual, encouraging — never graphic. Detailed/extended entries can be a premium depth.

**B4 — Craving tool ("I need a moment").** The breathing orb (same air motif) running a 4-7-8 loop with a soft guiding label ("Breathe in… hold… out…"). One free exercise. Below, locked premium options (a full anti-craving kit: urge-surf timer, "play the tape forward," reasons reminder). Exit returns to home with a gentle "That one passed. So will the next." 

**B5 — Reset / "I slipped."** Reached from home. Honest, zero shame. "Slips happen. Your longest streak still stands." Confirms, resets the live counter, **keeps the record**. Copy is warm and forward-looking, never disappointed.

**B6 — My reasons.** The "why" they entered at onboarding, editable, shown as cards. Surfaced inside the craving tool too. This is their motivation anchor.

### C. Paywall + premium (powered by RevenueCat)

**C1 — Full paywall.** Same design as A5 but reached from premium triggers. Lead with the specific value of the trigger. Annual pre-selected, social proof by the CTA, trial framing, restore + cancel-anytime microcopy.

**C2 — Contextual trigger states (design the locked entry points):**
- **Locked widget** card on home → "Keep your streak on your home screen."
- **7-day milestone** → the strongest one: "You made it a week. Unlock every milestone ahead + your full stats." Fires on the pride peak.
- **Locked craving-kit** options in B4 → "Unlock your full craving kit."
- Each opens C1 with matching headline.

**Locked-state styling.** Locked = a soft frosted/hazy overlay (on-theme — *literally* not-yet-cleared) with a small lock and a one-line promise. Never a harsh grey-out. Locks should feel like "coming with premium," inviting, not punitive.

### D. Settings

A single clean list, grouped. Rows:

**Your quit**
- Edit my details (quit date, weekly cost, how often)
- Reset / start over
- My reasons

**App**
- **Appearance:** Light · Dark · System (default System)
- Notifications: toggle + time picker (daily motivation, milestone, streak nudge)

**Premium**
- Manage subscription (→ Play Store)
- Restore purchases

**Support**
- Rate the app
- Send feedback (email)
- Share Clearway

**About**
- Privacy policy · Terms
- Version
- Delete my data (clear local storage, with confirm)

> **Language: do NOT design a language picker for V1.** English only. Localization is a later growth lever, not a V1 setting. Leave it out.

### E. App icon + home-screen widget

**Icon.** The clearing-air concept in miniature — a clean exhale / fresh-air mark on deep petrol with the aqua accent. Must read at the smallest store thumbnail. No cigarette/vape imagery.

**Widget (premium, the key differentiator).** Home-screen widget showing the live day count + a sliver of the clearing atmosphere. Design 2 sizes (small: number only; medium: number + money saved + next milestone). It must look good enough that people *want* it on their home screen — that desire is what sells premium.

---

## 5. System states (design these — they're where apps feel cheap)

- **Loading / analysing:** labelled, on-theme ("Reading your answers…"), never a bare spinner.
- **Empty:** there are few empties (local app), but the day-0 home is effectively one — make it an invitation, full of forward momentum.
- **Error:** plain, in the app's voice, says what to do. No apology, no jargon. (e.g. purchase failed → "That didn't go through. No charge was made — try again or restore.")
- **Offline:** the app works fully offline; only the purchase/restore flow needs network — handle that one gracefully.
- **Notification permission prompt:** framed as benefit ("Get a nudge when a milestone lands"), asked *after* the WOW moment, never on first open.

---

## 6. Copy voice

Second person, present tense, sentence case. Warm but never saccharine, confident, specific. Active verbs ("Start," "See," "Unlock," "Breathe"). Name things by what the user controls. Failure/empty states give direction, not mood. Never shame, never preach, never clinical. The app is a calm, capable friend at 2 a.m. — not a doctor, not a coach yelling.

---

## 7. Quality floor (non-negotiable)

- **Thumb zones:** all primary CTAs in the bottom 40%, full-width, ≥48dp tall. Quiz options center-to-bottom. Top reserved for progress bar / headline / non-interactive only.
- **Touch targets** ≥48dp (Android) / 44pt (iOS), ≥8px apart, critical actions centered (works for left- and right-handed).
- **Both themes** fully designed; dark is primary.
- **Contrast** AA minimum on text.
- **Reduced motion** respected (static clarity level replaces the atmosphere animation).
- No back button / no swipe-back in onboarding; no skip on empathy or WOW.

---

## 8. Scope flags for design

**Design now (V1):** all of §4 A, B, C, D, E.
**Design lighter / later (don't over-invest):** rich premium stats graphs (a simple version is fine for V1), themes/color packs, multi-addiction tracking, language picker. Note these as "premium depth, later" rather than building full comps now.

---

### One-line summary for the designer
A calm, premium quit-vaping companion whose **atmosphere literally clears as the user stays clean** — the counter is the hero, the clearing air is the soul, the breathing orb carries them through cravings, and every locked feature feels like air not yet cleared rather than a wall.

---

## 9. As-built additions (Step 3–4 — beyond this brief)

- **The haze is now real drifting smoke** (procedural Skia shader, curling volutes), not flat fog — on Home + the onboarding backdrop. It thins with clean time and never fully vanishes (a faint haze persists even past a couple months).
- **The orb breathes** (slow scale/opacity loop) and reads as a lit 3D sphere.
- **A4 WOW** gained a full-screen **before/after smoke slider**: drag a divider to compare "today" (thick smoke) vs a cleared future, with the day counter + money saved interpolating live as you drag.
- **Quiz answer feedback**: the tapped option lights up (others dim) and emits a soft glow + smoke wisps + warm embers off its top-left border before the step slides; a **back button** lets the user change a previous answer.
