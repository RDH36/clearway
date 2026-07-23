# Audio assets — sources et licences

Règle : uniquement de l'audio libre de droits (licence permissive documentée) ou généré en interne. Jamais de musique protégée, jamais de voix.

| Fichier | Usage | Source | Licence |
|---|---|---|---|
| `assets/audio/ambient-air.mp3` | Bed ambient des sessions de respiration (boucle 90 s, crossfade tête/queue 4 s, loudnorm −18 LUFS, sans voix) | **« Meditation Impromptu 01 » — Kevin MacLeod (incompetech.com)** — https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2001.mp3 | **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/) — attribution requise : "Meditation Impromptu 01" Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0 — à afficher dans Settings → About/crédits avant release publique |
| `assets/audio/voice-in.mp3` / `voice-out.mp3` / `voice-hold.mp3` | Cues vocaux doux « Breathe in / Breathe out / Hold » aux changements de phase | **Générés en interne** avec Piper TTS (MIT), voix `en_US-ljspeech-high` — dataset **LJSpeech, domaine public** (https://keithito.com/LJ-Speech-Dataset/) | ✅ Usage commercial libre, aucune attribution requise |
| `assets/audio/breath-cue.mp3` | Ancien chime — **plus utilisé, plus embarqué dans le build** | Ajouté au build B4 (commit `2767dd9`) | N/A (non shippé ; à supprimer ou re-documenter avant tout réemploi) |
