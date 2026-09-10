# HANDOVER — Pool of Experts (Stand: Bau-Phase, Prototyp v2)

Für den nächsten Chat: **Erst `design-notizen.md` lesen** (alle Entscheidungen & Ideen),
dann diese Datei für den aktuellen Stand + offene Punkte. Sprache mit Anne: Deutsch.
Spiel-Output: Englisch. Schlagzeilen in Bildern: Deutsch (authentisch wienerisch).

## Was das ist
Serious Game über Hiring-Bias (Uni-Kurs „Web Experiences for the Digital Humanities").
HTML, offline, für GitHub Pages. Man besetzt die Experten-Jury für einen Architektur-
wettbewerb der Stadt Wien (Standort: **Alte WU**, Augasse). Kernbotschaft, die NICHT
vorab gespoilert werden darf: *Das Faire ist da und qualifiziert — aber die Struktur
macht es unbezahlbar; schuld ist das System, nicht die wählende Person.*

## Dateien im Ordner `GAME 6`
- `index.html`, `game.js`, `data.js`, `assets/` — **der echte Prototyp, bisher UNANGETASTET.**
- `design-notizen.md` — gesammelte Design-Entscheidungen (maßgeblich).
- `demo-pressure-hud.html` — eigenständige Demo zum Feel des Druck-HUD (nicht das echte Spiel).
- `sonnet-prompt-briefing.md` — Prompt für separaten Chat, der Annes Material zu einem
  Briefing konsolidiert (liefert später AT-Zahlen, Alte-WU-Story, Profil-Audit).
- `HANDOVER.md` — diese Datei.

## Wichtige Arbeitsregeln (von Anne)
- Nur an dem arbeiten, was explizit genannt ist. Nichts „zur Verbesserung" nebenbei ändern.
- Bestehenden Prototyp nicht brechen — Neues additiv / als separate Datei, bis Anne „rein damit" sagt.
- Bei Unklarheit fragen, nie still annehmen. Beste Option zuerst empfehlen.
- Schritt für Schritt; Anne gibt den Takt vor.

## Fixe Entscheidungen
- Spoiler-Untertitel **„a game about hiring bias" muss weg** (index.html Titelleiste).
- **Eröffnungs-Story** über die Alte WU (emotional reinziehen, bevor Mechanik startet).
- **Prototyp-Sprache: Englisch.** Texte zentral ablegen → DE/EN-Umschalter später billig (nicht im Prototyp).
- Druck-Mechanik: **€50.000/Woche Verzögerung als Steuergeld**, immer sichtbar; drei Anzeigen
  Geld/Zeit/Ruf. Dilemmata: Neu-Ausschreiben, Teeküche (→ Krisen-PR €20k+2W ODER Frau springt ab),
  Urlaubszeit (+2W), Stadt-Anfrage „Ausländer:innen?" (Nein), Stadt-Anfrage „mehr Männer?"
  (Nein + schlechte PR). Immer ein billiger **„bequemer Knopf"**.
- 50/50 soll **erreichbar, aber unbezahlbar** sein — NICHT buchstäblich unmöglich.
- **Filter sichtbar machen** (betontes Kriterium zeigt „X qualifizierte Leute fallen raus").
- **Pappspiel-Badegewand:** genderlose 2D-Figur drunter, Schwimmkleidung als Schicht drüber
  (Basis: die Sprites `single_male.png` / `single_female.png`).
- **Pool-Szene am Ende deutlicher** (echte Schwimmhalle/Wasser); **Audio** je Szene
  (Pool/Wasser, Teeküche/Kaffee, sonst Büro) + SFX (€-Cha-ching, Uhr), Mute-Toggle, CC0.
- **Quellen-/Methoden-Seite** unbedingt; **Settings/Barrierefreiheit** ja.
- Verworfen: „Das Gebäude spricht".

## Stand der Demo `demo-pressure-hud.html`
- Im Original-Look gebaut (Frame, Titlebar, Wasser-Hintergrund, `.mail`-Brief-Optik, Original-Buttons).
- Drei Gauges + PR-Schlagzeilen-Ticker funktionieren; alle Dilemmata durchklickbar.
- Stadt-Wien-Meldungen erscheinen als **Brief** (`.mail`).
- Schlechte Presse zeigt **Kronen-Zeitung** (rot) bzw. **Der Standard** (lachsrosa) als
  Titelseiten-SVG mit **deutschen** Schlagzeilen.
- „Holiday season" zeigt die **Alte Donau** (Köpfe im Wasser, Donauturm) — bewusst als
  Teaser auf das Pool-Schlussbild.

## OFFENE PUNKTE (hier weitermachen)
1. **Teeküchen-Bild:** altes gefiel Anne nicht, wurde entfernt. Richtung noch offen —
   Optionen: zwei Kolleg:innen tuscheln / eine:r reicht Zettel / nur Kaffee-Ecke / kein Bild.
   (Unbenutzte `KITCHEN`-SVG-Konstante steht noch im Demo-File, kann ersetzt/gelöscht werden.)
2. **Pool-Schlussbild** soll mit der Alte-Donau-Szene visuell rhymen (Figuren im Wasser).
3. **Sonnet-Briefing** noch ausständig → liefert AT-Zahlen (mit Quellen), Alte-WU-Story,
   Profil-Audit. Erst danach finale Texte/Reveal bauen.
4. **Pappspiel-Badegewand** als nächste sichtbare Mechanik noch zu prototypen.

## Empfohlene nächste Bau-Scheiben (Reihenfolge)
1. Titel-Fix + zentrale Textablage (EN). 2. Druck-HUD in echten Flow (Phase 2). 3. Dilemmata + PR.
4. Filter-Mechanik sichtbar. 5. Pool-Szene + Pappspiel + Audio + Settings. 6. Reveal + Quellen (braucht Briefing).
