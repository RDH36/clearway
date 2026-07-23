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

## 3. Onboarding — contenu et processus (rework « ritual », juillet 2026)

Flux linéaire de 8 écrans (`app/onboarding/`), navigation impérative écran → écran, **aucun retour arrière** (`gestureEnabled: false`, transitions `none`, paywall en modal `slide_from_bottom`). État persisté dans le store Zustand `useQuitStore` (AsyncStorage).

**Gates** : `(app)/_layout.tsx` redirige vers `/onboarding/welcome` tant que `onboardingComplete` est `false` ; `onboarding/_layout.tsx` redirige vers `/` si déjà `true`. Le root layout attend l'hydratation du store avant de rendre (pas de flash).

| # | Écran | Contenu | Sortie |
|---|---|---|---|
| 1 | `welcome` | Hero (« The air clears from here ») puis **beat prénom** : « What should we call you? », skippable → `userName` | GET STARTED → nom → quiz |
| 2 | `quiz` | **7 questions, une route** — inputs variés : cartes (why, tried_before, without_it, feeling), **échelle d'intensité** (frequency), **slider $** avec projection annuelle sous le pouce + haptique (spend), **timeline de journée** (worst). À la réponse : la sélection **monte**, les autres options disparaissent, l'**écho** s'affiche dessous en grand (avance au tap, auto ~2,4 s). Échos « écoute » : chaque réponse apporte un reframe/une info, jamais un accusé. Prénom préfixé sur les échos des questions 2 et 5 | Dernière réponse → empathy |
| 3 | `empathy` | Loader 1,9 s puis miroir : « {Ray —} here's what we heard » — `triedBefore` + pire moment + phrase du ressenti + preuve sociale (`buildEmpathy`) | **I feel seen →** reasons |
| 4 | `reasons` | « Now that we know you » — saisie de **sa raison**, tissage, première affirmation personnalisée ; skippable | **Keep it close →** solution |
| 5 | `solution` | **Révélation du plan — raisonnement seul, aucun horaire** : « Nights are when it hits you. We'll get ahead of it… », annonce du rituel (3 sessions/jour) + pattern dérivé, cadrage **anti-craving** (« It's the thing you reach for instead of the vape ») | **Start my streak →** wow |
| 6 | `wow` | **Scène continue** : peak (I'm starting now → compteur live + count-up argent + haze) → **bridge** (« Your counter is running. The urge will come — this is what you'll use when it does. ») → intro casque → **vraie session 4-7-8 de 30 s** (pattern dérivé du quiz, cues sonores, skippable) → « That calm, {Ray} — it's yours now. » | **Set up my ritual →** setup |
| 7 | `setup` | « Live it 1-2-3 » : ① **« That's one. Let's put three in your day. »** — 3 horaires dérivés (`buildSessionPlan`) éditables ±30 min, CTA **Schedule my ritual** → `sessions` (store, `enabled: true`) ② pin du widget ③ notifications « **we nudge you at your session times** » (+ notif de bienvenue nominative) | → paywall |
| 8 | `paywall` | PlanPicker ; à la fermeture : offre essai 3 jours (une fois) ; achat → RevenueCat | `TransitionLoader` → home |

### Le plan de sessions (`lib/sessionPlan.ts`)

Dérivation depuis le quiz — c'est le payoff, chaque réponse resurgit :

| Réponse | Pilote |
|---|---|
| `worst` | L'ancre, placée **avant** la fenêtre à risque : Mornings→7:30 · After meals→13:00 · Stress→12:00+17:30 · Nights→21:00 (+ phrase de raisonnement nommée) |
| `frequency` | Espacement : Constantly/lost count → resserré (9:00/13:30/19:30), sinon large (7:30/13:00/21:00) |
| `without_it` | Pattern par défaut : panic→4-7-8 · irritable→Box · focus→Coherent 5·5 · find_one→4-7-8 |
| `quitFeeling` | Ton du copy (rassurant scared/unsure, énergisant ready/tired) |
| `spend` (slider) | Projection annuelle live + écho `$X a year` |
| `triedBefore` | Miroir de l'écran empathy |

Stocké dans `sessions: { morning, midday, evening, enabled, anchor, defaultPattern }` — la base de la Phase 2 (rituel quotidien).

### Tracking PostHog du funnel

- `onboarding_step_viewed { step, step_index }` — ordre : welcome, quiz, empathy, reasons, solution, wow, setup, paywall
- `onboarding_quiz_answered { question_index, question, answer }` — ids : why, tried_before, frequency, spend, worst, without_it, feeling
- Events ponctuels : `onboarding_started`, `quit_started` (wow), `notifications_enabled`, `widget_add_*`, `paywall_viewed`, `trial_started`, `onboarding_completed`
- Funnel PostHog : insight [« Onboarding funnel — drop-off par phase »](https://us.posthog.com/project/119583/insights/rbScnf4e) (à réordonner : reasons avant solution, plus de step breathe)
