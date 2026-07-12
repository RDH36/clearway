# Clearway — Premium & Monetization Spec

> **For:** Claude Code — this is the monetization build phase.
> **Pairs with:** `clearway-technical-spec.md` (architecture) and `clearway-design-brief.md` (visuals).
> **Build order for this phase:** (1) premium features → (2) rework onboarding to make them *lived* → (3) 3-day free trial logic → (4) RevenueCat. Do them in this order. RevenueCat is LAST.

---

## 0. The positioning shift

Clearway is no longer just a tracker. It's an **emotional companion** that encourages the user on *their own reasons* for quitting. The premium experience is: personalized daily encouragement + a widget that grows with their journey + encouragement notifications. The free core still fully works — premium only *adds*, it never removes what a tracker user expects for free.

---

## 1. Free vs Premium (exact split)

**FREE core (always stays — never lock these, they protect our reviews):**
- Counter, clearing atmosphere, money saved
- Milestones + health timeline up to ~1 month (the near ones)
- Craving tool: the single 4-7-8 breathing exercise
- Reasons: up to 3
- One affirmation shown occasionally (a taste)

**PREMIUM (new value — this is what the trial unlocks, and what locks after):**
- **Personalized daily affirmations** on the user's reasons (unlimited, daily)
- **Encouragement notifications** (daily, personalized to their reasons)
- **Evolving widget** (day count + money + next milestone + a health/recovery line)
- **Expanded craving kit** (2–3 extra breathing patterns + the phase sounds)
- **Unlimited reasons** (beyond 3)
- **Far milestones + health markers** (beyond 1 month)

**Rule:** premium NEVER removes a free-core feature. When premium expires, the user keeps the free core and only loses the premium *additions* (locked with a frosted preview, not deleted).

---

## 2. Personalized affirmations (NO AI — template bank)

Affirmations are generated from a **local template bank**, not an AI API. Zero cost, works offline, no risk of off-tone output on a sensitive topic. (AI generation via Mistral is a possible v2 upgrade, not now.)

**How it works:**
- Templates are categorized by **motivation** (health / money / control / someone) and by **moment** (day 1–3 / craving / milestone / general).
- Each template has a `{reason}`, `{days}`, or `{money}` slot filled from the store.
- The app picks a template matching the user's `primaryMotivation` + current context, inserts their data, and shows it. Rotate so the same one doesn't repeat back-to-back.

**Tone:** second person, present, warm, never preachy. "No lectures. No shame." Short.

**Starter bank (use these, expand as needed):**

*Health:*
- "Day {days}. Your lungs are already clearing — {reason} is worth every breath."
- "{reason}. That's not a small thing. It's the whole thing. Keep going."
- "Your body's been repairing since the moment you stopped. {days} days of it."
- "The air's getting cleaner. So are you. One day closer to {reason}."

*Money:*
- "{money} back in your pocket. That used to go up in vapor. Not anymore."
- "Day {days}. Every day clean is money that's yours again — {reason}."
- "You're not spending it. You're keeping it. {money} and counting."

*Control:*
- "A small device used to decide your day. Not for {days} days. {reason}."
- "You took the wheel back. {days} days of proving it to yourself."
- "{reason}. Every craving you rode out was you choosing you."

*Someone:*
- "You're doing this for {reason}. {days} days in, they'd be proud. So should you."
- "Day {days}. The people you love get more of you now — clear-headed, present."

*Craving moment:*
- "This one passes. They all do. Remember {reason}."
- "Breathe. You've made it {days} days. One craving doesn't undo that."
- "Right now is hard. {reason} is why it's worth it. Ride it out."

*Milestone:*
- "{days} days clear. You earned every one of them. {reason}."
- "Look how far the air has cleared. This is what {reason} looks like."

---

## 3. The 3-day free trial (LOCAL — no card, not Google Play)

This is the key conversion mechanic. **It does NOT go through Google Play or RevenueCat.** It's a local unlock managed by the app.

**Flow:**
1. Onboarding ends → **paywall** (the RevenueCat one, offers sub/lifetime).
2. If the user **dismisses without buying** → instead of dropping to free, offer: *"For taking the first step, here's 3 days of Clearway premium — free, no card needed."*
3. On accept → set `trialStartedAt = Date.now()` in the store. Premium unlocked for 3 days. **No payment, no card, Google not involved.**
4. During the 3 days → the user lives all premium features. Show gentle reminders ("2 days of premium left").
5. At day 3 → premium features **lock** (frosted preview, not deleted). Re-show the paywall at this peak-loss moment.
6. The free core remains fully usable throughout and after.

**Premium state = a single hook `usePremium()` that returns true if EITHER:**
- `trialStartedAt` exists AND `Date.now() - trialStartedAt < 3 days` (local trial active), **OR**
- RevenueCat `premium` entitlement is active (real purchase).

Store additions: `trialStartedAt: number | null`, `trialUsed: boolean` (so the 3-day trial can only be taken once).

---

## 4. Onboarding rework — make premium *lived*

Rework the onboarding so the user *experiences* the premium features before the paywall (the "aquarium" principle — live the magic, then be offered to keep it):

- Add a **reasons section** where the user enters their own reasons (in addition to the quiz motivation). The app immediately responds with a **first personalized affirmation** built from what they typed — this is the emotional wow.
- During onboarding, let them **see/feel**: a sample affirmation, a preview of the evolving widget, a taste of an encouragement notification. They live the premium experience.
- End → paywall → (if dismissed) → 3-day trial offer.

Keep the existing funnel structure, WOW moment, and staged animations. This adds the reasons/affirmation beat and the premium preview.

---

## 5. Encouragement notifications (premium)

- Daily personalized notification pulling from the affirmation bank (their reason + days).
- Scheduled locally via expo-notifications; reschedule on reset.
- Premium-only: free users don't get the daily encouragement stream (they keep milestone/streak notifications from the base spec).

---

## 6. RevenueCat (LAST step of this phase)

Only after 1–5 are built and working:
- Install `react-native-purchases`, configure per the technical spec §5.
- Products (finalize prices — market data suggests): monthly ~5.99, lifetime ~29.99 "best deal" front and center, optional annual. Lifetime sells best in this niche.
- Entitlement `premium`; `usePremium()` checks RevenueCat **plus** the local 3-day trial (§3).
- The paywall UI already exists — wire the buttons to real purchases + restore.
- Requires uploading a build with billing to Play Console (internal testing) before subscriptions can be created — plan for that.

---

## 7. Build order recap (do NOT skip ahead to RevenueCat)

1. Premium features: affirmations bank + evolving widget + expanded craving kit + unlimited reasons + far milestones.
2. `usePremium()` hook + frosted-lock states on all premium features.
3. Rework onboarding (reasons section + first affirmation + premium preview).
4. 3-day local trial logic (trialStartedAt, trialUsed, reminders, lock at day 3).
5. RevenueCat (install, products, wire paywall + restore).

The whole free core keeps working at every step. Premium only adds.
