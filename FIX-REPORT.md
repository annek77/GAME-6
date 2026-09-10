# Fix-Report — Pool of Experts (Prototyp v2)

**Datum:** 03.07.2026 · **Anlass:** „Spiel steht irgendwo fest" — kompletter Code-Review + Fixes
**Geänderte Dateien:** `game.js`, `draft-foreigners.js`, `draft-p1-cards.js`, `draft-reveal.js`, `draft-letter.js`
**Nicht angefasst:** `index.html`, `data.js`, `assets/`, `backup/`, `demo-pressure-hud.html`, `wu-opening-scene.html`, `draft-intro.js`, `draft-sound.js`

---

## Der Blocker: Endlos-Schleife bei der „Foreigners"-Anfrage

**Symptom:** Nach 8 Einladungen erschien der Stadt-Wien-Brief „May we invite experts from abroad?" — und kam nach jeder weiteren Reserve/Reject-Entscheidung wieder. Jede Runde kostete +2 Wochen und −15 Reputation. Das Spiel wirkte eingefroren.

**Ursache:** `draft-foreigners.js` überschreibt `rForeigners()` aus `game.js`, setzte aber das Flag `state.foreignersShown` nie. `afterDecision()` prüfte das Flag nach jeder Entscheidung, fand es auf `false` — und feuerte den Screen erneut.

**Fix:** `state.foreignersShown = true` am Anfang von `rForeignersPress()` (draft-foreigners.js).

---

## Weitere Fixes

### 1. „More men"-Dilemma war unerreichbar (game.js)
Das Dilemma sollte bei 10 Einladungen feuern — aber bei 10 greift zuerst der Confirm-Screen. Der komplette Screen inkl. Standard-Schlagzeile war toter Code.
**Fix:** `QUOTA_AT` von 8 auf 7. Neue Trigger-Kette: Teeküche @3 · Urlaub @5 · Deadline @6 · Quota @7 · Foreigners @8 · More men @9 · Confirm @10. Alle Events feuern jetzt garantiert vor Spielende.

### 2. Duplikate im Bewerberfeld (game.js)
`addCandidates()` (Extension) und der Teeküchen-Tipp zogen frisch aus allen 26 Profilen — dieselbe Person konnte mehrfach als Bewerbung auftauchen und mehrfach eingeladen werden (zählte doppelt im Reveal). Bei nur 6 Frauen im Pool untergrub das die „50/50 erreichbar aber teuer"-Leitplanke.
**Fix:** Beide Stellen filtern jetzt auf Profile, die noch nicht beworben haben. Folge-Fix: Da der Pool endlich ist, blendet der „No more applications"-Screen den Extend-Button aus, wenn niemand mehr übrig ist (vorher: Wochen verbrennen für null neue Bewerbungen).

### 3. Jury konnte größer als 10 werden (game.js)
Über „Back to review" im Confirm-Screen ließ sich eine 11. Person einladen.
**Fix:** Invite-Button ist bei voller Jury deaktiviert (Tooltip „Jury is full").

### 4. HUD auf Dilemma-Screens unsichtbar (game.js)
Geld/Zeit/Ruf-Anzeigen fehlten genau auf den Screens, wo die Kosten entstehen (Teeküche, Krone-Presse, Urlaub, Foreigners, More men, Standard-Presse) — Widerspruch zur Design-Entscheidung „immer sichtbar".
**Fix:** Screens zu `HUD_SCREENS` hinzugefügt. Die Gauge-Flash-Effekte laufen jetzt sichtbar.

### 5. Sprachmix Deutsch/Englisch (alle Drafts)
Fixe Entscheidung war: Prototyp komplett Englisch. Die Drafts waren aber deutsch.
**Fix:** Übersetzt in `draft-p1-cards.js` (Progress, Buttons, End-Screens), `draft-reveal.js` (Lanes, Summary, Reflect-Text, CTA), `draft-foreigners.js` (Badge, Headline, Fließtext, CTA), `draft-letter.js` (Statuszeile, Buttons).
**Bewusste Ausnahmen (Regel: authentische Wiener Artefakte bleiben deutsch):**
- Zeitungs-Schlagzeilen in den SVGs (Krone, Standard)
- Der Einladungsbrief selbst in `draft-letter.js` (Amtsdeutsch als Stilmittel) — auf Zuruf übersetzbar

### 6. UX-Details
- **Phase 1:** „Remove" springt nicht mehr automatisch zur nächsten Karte — man sieht die Änderung auf der aktuellen Karte (draft-p1-cards.js).
- **Intermezzo:** Terminal-Screen von `min-height:100vh` auf `60vh` — kein seltsam hoher Scrollbereich mehr im Frame (draft-reveal.js).

---

## Verifikation

- `node --check` auf allen fünf geänderten Dateien: fehlerfrei.
- Headless-Simulation der echten Spiellogik (`prepareCandidates`, `addCandidates`, `afterDecision` direkt aus game.js extrahiert): Trigger-Kette vollständig (`kitchen → holiday → extend → quota → foreigners → moremen → confirm`), keine Duplikate auch nach 3 Extensions, kein Event feuert doppelt.

## Was laut HANDOVER weiterhin offen ist (unverändert)

1. Teeküchen-Bild (Richtung noch offen)
2. Pool-Schlussbild soll mit Alte-Donau-Szene rhymen
3. Sonnet-Briefing (AT-Zahlen mit Quellen, Alte-WU-Story, Profil-Audit) → danach finale Texte/Reveal
4. Pappspiel-Badegewand-Mechanik
5. Audio, Settings/Barrierefreiheit, Quellen-/Methoden-Seite
