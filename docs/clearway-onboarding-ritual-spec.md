# Clearway — Onboarding rework & daily breathing ritual

> **For:** Claude Code. Two phases — **do Phase 1 first, stop, let me test, then Phase 2.**
> **Pairs with:** `clearway-technical-spec.md`, `clearway-premium-spec.md`, `clearway-affirmations-widget-onboarding.md` (current state).

---

## Why this change

The onboarding is rich, but after it there's nothing to *do* — the app is a counter that ticks. That drop is the real problem, not the onboarding itself. The fix: give the user a **daily ritual** (three guided breathing sessions), and make the onboarding warmer and more personal so the ritual feels earned.

This also gives premium a reason to exist: the ritual is where the extra patterns and the ambient audio live.

---

# PHASE 1 — Onboarding rework

Keep the existing 8-screen structure and all current logic (store writes, PostHog tracking, gates, no-back navigation). These are **modifications**, not a rebuild.

## 1.1 Ask for their name first

New first beat, right after `welcome` (or folded into it):

- Single question: **"What should we call you?"** — free text, short, skippable.
- Store as `userName: string | null`.
- Copy stays in voice: warm, no pressure. Skip is fine ("You can skip this").

**Then use it.** The name appears in affirmations, the empathy screen, the welcome notification, and the widget where it fits naturally. Add an optional `{name}` placeholder to `lib/affirmations.ts` — when `userName` is null, the templates must still read correctly (write templates so the name is additive, never required).

This is a handshake, not data collection. One question, then move on.

## 1.2 Make the quiz less generic

The current 6 questions are factual (how long, how much, when, how often). They collect *data* but build no intimacy. Keep the ones that feed real logic, and make the rest emotional.

**Keep as-is** (they drive real features):
- `spend` → weeklySpend (money math)
- `worst` → worstCravingTime (session timing + craving targeting)
- `frequency` → usageFrequency
- `why` → primaryMotivation (affirmation pools)

**Replace / add — emotional questions** (2–3 max, don't bloat the funnel):
- *"What happens when you don't have it on you?"* → Panic a little · Get irritable · Can't focus · I just find one
- *"Have you tried to quit before?"* → Never · Once · A few times · Lost count
- Keep `feeling` ("How does quitting feel?") — it's the one good emotional question already there.

Each answer keeps the existing **empathic echo** pattern (1.25s response before advancing) — that's what makes the quiz feel like a conversation. Write echoes that genuinely respond to the answer, e.g. "Tried before? That's not failure — that's practice."

Store the new answers and **use them twice**: in the empathy screen (`buildEmpathy`) and — more importantly — to generate the craving plan in §1.5. Nothing collected should go unused; that's what makes the quiz feel purposeful instead of generic.

## 1.3 Keep the reasons screen — don't remove it

The typed reason is the app's best emotional material (affirmations, the craving screen, the "My why" card). **Do not delete it.**

Change only its **position and framing**: it now comes after the emotional questions, when trust is established. Reframe the prompt so it follows the conversation rather than opening it.

## 1.4 Add a real breathing session inside the onboarding

After `wow` (once the streak has started), insert a **live 60–90s breathing session** — the actual craving tool, not a preview.

- Entry beat, 2–3s, then it starts: **"Headphones on if you can. Breathe through your nose — it settles you faster."**
- Runs the real 4-7-8 orb with the ambient audio playing (premium content, unlocked during onboarding as a taste).
- Ends with a calm line and moves on. Skippable.

Purpose: the user *experiences* the ritual before being asked to schedule it or pay for it.

## 1.5 Generate their personal craving plan

**This is the payoff of the quiz.** The answers must produce a visible, personalized result — otherwise the questions feel like data collection for nothing (which is exactly the current problem).

After the reasons screen, show a **"Your plan"** beat: the app reveals three breathing sessions placed around *their* hard moments, and says why.

**Derivation rules:**

| Answer | Drives |
|---|---|
| `worst` (worst craving time) | The anchor session — placed **before** the danger window, not during it. Mornings → ~7:30 · After meals → ~13:00 · Stress → ~midday + late afternoon · Nights → ~21:00 |
| `frequency` (how often they reach for it) | How tightly spaced the sessions are. "Constantly / lost count" → sessions closer together; "a few times a day" → spread out |
| *"What happens when you don't have it on you?"* | Which pattern is proposed by default. Panic → 4-7-8 (calming) · Irritable → Box breathing (steadying) · Can't focus → Coherent 5·5 · I just find one → 4-7-8 |
| `quitFeeling` | Tone of the plan copy (reassuring vs. energizing) |

**The reveal matters as much as the logic.** Name the reasoning back to them, e.g.:
> *"Nights are when it hits you. We'll get ahead of it — a session at 9 PM, before the pull starts."*

Then the three times are shown, **editable**, and confirmed with a single CTA.

The existing `setup` screen ("Live it 1-2-3") then continues:
1. **Confirm the plan** (the generated sessions above)
2. Pin the widget (existing)
3. Enable notifications (existing) — now framed as *"we'll nudge you at your session times"*, a far stronger reason to allow notifications than a generic daily message.

Store as `sessions: { morning: string, midday: string, evening: string, enabled: boolean, anchor: 'morning'|'midday'|'evening', defaultPattern: string }`.

**Stop after Phase 1. I'll test before Phase 2.**

---

# PHASE 2 — The daily ritual + premium audio

## 2.1 The ritual

Three scheduled breathing sessions per day, at the user's chosen times.

- **Notifications** fire at each session time, personalized (name + affirmation).
- **Home** shows the next session ("Next session — 6:30 PM") and whether today's sessions are done.
- **Completion tracking**: mark each session done; show today's progress (e.g. 2/3). Keep it light and non-punitive — a missed session is never a failure, no shame, consistent with the app's voice.
- Sessions are the same breathing tool, just entered from a scheduled moment rather than a craving.

## 2.2 Ambient audio — premium

- A soft looping ambient bed plays during sessions (calm texture — air, wind, low pad). No voice.
- **Use royalty-free audio only** (e.g. Pixabay, Freesound with permissive licences). Never copyrighted music — keep a note of each file's source and licence in the repo.
- The existing phase sounds (inhale/hold/exhale cues) stay as they are.

## 2.3 Free vs premium — updated

**Free:**
- The 4-7-8 breathing orb, **silent** (visual only — no phase sounds, no ambient bed)
- Craving tool available anytime
- One scheduled session per day (not three) — enough to feel the ritual, not enough to live it

**Premium:**
- **All audio** — phase cues + ambient beds
- The extra patterns (Box breathing, Coherent 5·5)
- **All three daily sessions**
- Everything already premium (affirmations, widget, far milestones, unlimited reasons)

Rationale: the ritual is felt daily, so the premium gap is felt daily — within the first three days, which is the window that matters. Audio is an *addition*, never a removal of a tracker basic, so the free core stays honest.

## 2.4 Technical notes

- Audio must **stop on screen blur and when the app is backgrounded** (already the rule for the existing sounds — same behaviour here).
- Respect the phone's silent mode.
- Persist the sound on/off toggle.
- Session schedule changes must **reschedule notifications**, and reset must clear them.
- Track in PostHog: `session_started`, `session_completed`, `session_skipped`, plus which pattern was used.

---

## Build order

1. Phase 1.1 → 1.5 (onboarding), stop and test.
2. Phase 2.1 (ritual + scheduling + home surface), test.
3. Phase 2.2 → 2.3 (audio + premium gating), test.

Don't do all three in one pass.
