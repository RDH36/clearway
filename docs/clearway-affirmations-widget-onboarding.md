# Clearway — Affirmations, Widget & Onboarding

État du code au 2026-07-23 (versionCode 21).

---

## 1. Système d'affirmations

Source unique : `lib/affirmations.ts`. Tous les textes sont des templates anglais avec 3 placeholders remplis au moment de l'affichage :

| Placeholder | Rempli avec |
|---|---|
| `{reason}` | 1ʳᵉ raison saisie par l'utilisateur (`reasons[0].title`), sinon fallback par motivation |
| `{days}` | Jours clean (minimum 1) |
| `{money}` | Argent économisé formaté (`moneySaved(weeklySpend, ms)`) |

Fallbacks de `{reason}` si aucune raison saisie (`reasonLabel`) : health → *"your health"*, money → *"the money you keep"*, control → *"taking back control"*, someone → *"the people you love"*.

### Les 7 pools

| Pool | Taille | Ton |
|---|---|---|
| `HEALTH` | 12 | Corps qui se répare, souffle, énergie (*"Day {days}. Your lungs are already clearing…"*) |
| `MONEY` | 12 | Argent récupéré (*"{money} back in your pocket. That used to go up in vapor."*) |
| `CONTROL` | 12 | Reprise de contrôle (*"Nothing in your pocket owns you anymore."*) |
| `SOMEONE` | 12 | Pour un proche (*"You're doing this for {reason}… they'd be proud."*) |
| `UNIVERSAL` | 12 | Neutres, toujours mélangées aux pools motivation (*"One breath at a time."*) |
| `EARLY` | 12 | Jours 1-3, sevrage physique (*"Three days for the nicotine to leave."*) |
| `CRAVING` | 10 | Urgence, vague qui passe (*"Three minutes. That's all it asks."*) |
| `MILESTONE` | 6 | Célébration de palier (*"{days} days clear. You earned every one."*) |

### Sélection (`pickAffirmation`)

Déterministe : `index = |seed| % pool.length` — pas de hasard, la même seed redonne la même phrase (important pour que widget, notification et app restent cohérents).

```
moment 'craving'            → pool CRAVING
moment 'milestone'          → pool MILESTONE
moment 'early' OU days ≤ 3  → EARLY + pool(motivation) + UNIVERSAL
sinon                       → pool(motivation) + UNIVERSAL
```

### Où les affirmations apparaissent

| Surface | Fichier | Moment | Seed → rotation | Gating |
|---|---|---|---|---|
| Carte home (`AffirmationCard`) | `components/premium/AffirmationCard.tsx` | `general` | `days` → change 1×/jour | Premium ; free : 1 jour sur 3 (`shouldShowFreeTaste = days % 3 === 0`) |
| Écran craving | `app/(app)/craving.tsx:83` | `craving` | heure courante → change chaque heure | Premium uniquement |
| Notification quotidienne | `lib/notifications.ts:89` | `general` | jours au moment de la livraison | Premium + notifs activées ; 1 notif/jour à heure fixe |
| **Widget Android** | `components/widget/data.ts:50` | `general` | `Date.now() / HOUR_MS` → change chaque heure | Voir §2 |
| Onboarding — reasons | `app/onboarding/reasons.tsx:46` | `early`, seed 1 | fixe | Révélée après saisie de la raison |
| Onboarding — setup | `app/onboarding/setup.tsx:66` | `general`, seed 6 | fixe | Aperçu de « l'affirmation du matin » (beat 1/3) |

---

## 2. Widget Android

Lib : `react-native-android-widget`. Deux widgets déclarés : **Clearway** (medium) et **ClearwaySmall**. Tap n'importe où → `OPEN_APP`.

### Données (`components/widget/data.ts`)

Le widget lit **directement AsyncStorage** (`clearway-quit-store`, le persist Zustand) — il fonctionne donc même app fermée. Trois phases :

| Phase | Condition | Ce que le widget affiche |
|---|---|---|
| `why` | Pas de `quitTimestamp` ou moins d'1 jour clean | Label `✦ WE'RE WITH YOU` + **affirmation** (small : 4 lignes, medium : 3) |
| `live` | ≥ 1 jour clean **et** premium (ou onboarding pas fini) | Compteur de jours ; medium ajoute : `SAVED` (argent), `NEXT` (prochain milestone + anneau SVG de progression `nextPct`), bandeau santé (dernier bienfait débloqué, ex. *"Recovery begins now"*) |
| `expired` | ≥ 1 jour clean mais pas premium | `✦ CLEARWAY PREMIUM` — *"Reactivate premium / Your streak kept counting. Premium brings it back here."* |

Détails notables :
- **L'affirmation du widget tourne chaque heure** (seed = heure epoch), pool `general` de la motivation de l'utilisateur — c'est la même logique que l'app, donc même phrase que la carte home quand les seeds coïncident.
- `premiumFromPersisted(state) || !state.onboardingComplete` : pendant l'onboarding le widget est traité comme premium (permet la démo du widget au beat 2/3 du setup).
- Fallback complet si le store est illisible : phase `why`, affirmation *"The air clears from here. One breath at a time."*

### Rendu (`ClearwayWidget.tsx`)

Fond SVG (dégradé sombre + halos aqua/ambre, coins 30 px), typo Bricolage (chiffres), Hanken (texte), Geist Mono (labels). Le small affiche jours **ou** message ; le medium fait la mise en page 2 colonnes + bandeau santé.

### Rafraîchissement

| Déclencheur | Où |
|---|---|
| Système : `WIDGET_ADDED` / `WIDGET_UPDATE` / `WIDGET_RESIZED` | `taskHandler.tsx` |
| Changement d'état premium | `PremiumSync.tsx:28` → `refreshWidget()` |
| Ajout du widget via pin | `useWidgetPin.ts:29-31` — refresh immédiat + retries à 4 s et 12 s |

`refreshWidget()` (`components/widget/refresh.tsx`) reconstruit les données et pousse les deux tailles ; no-op hors Android.

---

## 3. Onboarding — contenu et processus

Flux linéaire de 8 écrans (`app/onboarding/`), navigation impérative écran → écran, **aucun retour arrière** (`gestureEnabled: false`, transitions `none`, paywall en modal `slide_from_bottom`). État persisté dans le store Zustand `useQuitStore` (AsyncStorage).

**Gates** : `(app)/_layout.tsx` redirige vers `/onboarding/welcome` tant que `onboardingComplete` est `false` ; `onboarding/_layout.tsx` redirige vers `/` si déjà `true`. Le root layout attend l'hydratation du store avant de rendre (pas de flash).

| # | Écran | Progress | Contenu | Sortie |
|---|---|---|---|---|
| 1 | `welcome` | (barre cachée) | Orb + « Clearway — The air clears from here », promesse *"No lectures. No shame."* | CTA **GET STARTED** → quiz |
| 2 | `quiz` | 0.10 → 0.65 (`0.1 + i×0.11`) | **6 questions sur une seule route** (state local `index`), chaque option applique un `patch` au store + affiche un `echo` empathique 1,25 s avant d'avancer ; flèche retour intra-quiz | Dernière réponse → empathy |
| 3 | `empathy` | 0.82 | Loader *"Reading your answers…"* 1,9 s puis miroir personnalisé (`buildEmpathy`) : durée de vape + pire moment + phrase selon le ressenti + preuve sociale | CTA **See my plan →** solution |
| 4 | `solution` | 0.92 | « Your plan » : 3 tuiles — streak live, `~$X back this year` (projection annuelle), outil craving 90 s ciblé sur son pire moment | CTA **Build my plan →** reasons |
| 5 | `reasons` | 0.97 | Saisie libre de **sa raison** (écho de la motivation du quiz) ; tissage 1,1 s puis **première affirmation** (pool early, personnalisée) ; skippable | **That's my why →** (ou Skip) → wow |
| 6 | `wow` | (fond `cleared`) | Moment pivot : **I'm starting now** → `startQuit()` (timestamp), machine à étapes pre→pulse→counting→reward : compteur qui démarre en live, count-up de l'argent annuel, comparaison SmokeCompare | Continue → setup |
| 7 | `setup` | (fond `cleared`) | « Live it 1-2-3 » : ① aperçu affirmation du matin ② **pin du widget** (`useWidgetPin`) ③ activation notifications (envoie une notif de bienvenue immédiate) ; chaque beat skippable | → paywall |
| 8 | `paywall` | modal | Compteur qui tourne en header, PlanPicker (annual/monthly/lifetime) ; à la fermeture sans achat : offre **3 jours d'essai gratuit sans carte** (une seule fois, `trialUsed`) ; achat → RevenueCat | `TransitionLoader` → `onboardingComplete = true` → home |

### Données collectées par le quiz (`components/onboarding/content.ts`)

| Question (id) | Champ store | Options |
|---|---|---|
| `why` — What's pushing you to quit? | `primaryMotivation` | Health / Money / Control / Someone I care about |
| `duration` — How long have you been vaping? | `vapingDuration` | <1 an / 1–2 / 3–5 / 5+ |
| `frequency` — How often do you reach for it? | `usageFrequency` | A few times a day / Hourly / Constantly / Lost count |
| `spend` — What do you spend a week? | `weeklySpend` (+`currency`) | ~$20 / ~$40 / ~$60 / $80+ (85) |
| `worst` — When are cravings worst? | `worstCravingTime` | Mornings / After meals / Stress / Nights |
| `feeling` — How does quitting feel? | `quitFeeling` | Scared / Ready / Tired of it / Not sure |

Ces réponses alimentent **tout le reste** : l'empathie (écran 3), la projection d'argent (4, 6, widget), le ciblage du pire moment (4, craving), la motivation des pools d'affirmations (partout), et la personnalisation de la notif de bienvenue.

### Tracking PostHog du funnel

- `onboarding_step_viewed { step, step_index }` au mount de chaque écran (hook `useOnboardingStepTracked`, `lib/analytics.ts`)
- `onboarding_quiz_answered { question_index, question, answer }` à chaque réponse
- Events ponctuels : `onboarding_started`, `quit_started` (wow), `notifications_enabled`, `widget_add_*`, `paywall_viewed`, `trial_started`, `onboarding_completed`
- Funnel PostHog : insight [« Onboarding funnel — drop-off par phase »](https://us.posthog.com/project/119583/insights/rbScnf4e)
