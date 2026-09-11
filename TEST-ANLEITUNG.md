# Pool of Experts — Testanleitung für Kathi und Jana

Live: https://annek77.github.io/GAME-6/ · Stand 11.09.2026
Bei Problemen: einmal neu laden. Erscheint unten ein roter Streifen, bitte den Text abfotografieren.

---

## Teil A — Blind spielen (zuerst, ohne Teil B gelesen zu haben)

Einmal komplett durchspielen, ohne Erklärung, ohne nachzufragen. Dauer etwa 15 Minuten.
Dabei mitschreiben, Stichworte reichen:

1. **Wo hast du gehangen?** Screen und was du geklickt hast. Auch wenn es nur zwei Sekunden Ratlosigkeit waren.
2. **Wann hast du gemerkt, worum es geht?** Beim Pool, bei der Zeitung, beim gelben Satz — oder schon früher, und woran?
3. **Was hättest du anders gewählt, wenn du es vorher gewusst hättest?**
4. **Wie viele Frauen waren in deinem Beirat?** (steht am Ende von Station 1) — und hast du beim Auswählen an Geschlecht gedacht?
5. **Welchen der vier Wege hast du genommen** (Ausland, Reparieren, Aussitzen, Ausgleich) und warum?
6. **Was war am Ende dein Gebäude** (Überschrift) und hat sich das verdient angefühlt?
7. Ein Satz: Was bleibt hängen?

Wer Lust hat: zweiter Durchlauf mit einer anderen Strategie (z. B. bewusst die billigste Runde, oder bewusst nur nach Erfahrung).

---

## Teil B — Gegenlesen (nach dem Spielen)

Alle Fakten, Zahlen und Rechtsnormen im Spiel stammen aus der Recherche (`recherche/`).
Die folgenden Texte hat Claude formuliert — sie sind Spielfiktion und brauchen einen kritischen Blick auf **Ton, Englisch, und ob etwas zu dick aufgetragen ist**:

| Wo im Spiel | Was | Datei |
|---|---|---|
| Intro, 3 Bilder | Einleitungstexte | `game.js` → `BEATS` |
| Station 1, Briefing | Anrede und Rahmen um die fünf Auflagen (die Auflagen selbst sind belegt, nicht ändern) | `game.js` → `briefMail` |
| Station 1, Kammerbrief | Text der Nominierung | `rules.js` → `CHAMBER_NOMINATION` |
| Station 1, Stapel/Tisch | Aufgabenzeile, Knopf-Texte | `game.js` → `refreshSel`, `renderDeck` |
| Station 1, Reaktion | Vier Zeitungsseiten (Deutsch!) und die englischen „Stimmen" | `game.js` → `REACTIONS` |
| Station 1, vier Wege | Beschreibung der Wege, Antwort der Stadt zur Ausland-Anfrage | `game.js` → `rOptions`, `rAbroad` |
| Station 1, Ausgleich | Fünf Maßnahmen mit Beschreibung und Preis | `rules.js` → `COMPENSATIONS` |
| Station 1, Ende | „The real jury" Einleitungssatz | `game.js` → `rRealWorld` |
| Dossier („Read more") | Acht Notizen | `rules.js` → `DOSSIER` |
| Station 2 | Anrainer-Texte, Sommer-Ereignis, Zugangs-Frage und drei Optionen | `game.js` → `rPR`, `rPRSeason`, `rPRAccess`; `rules.js` → `PR_ACTIONS`, `ACCESS_ACTIONS` |
| Stationen 3–6 Vorschau | Je zwei Sätze Lage und drei Optionen | `rules.js` → `STATION_PREVIEWS` |
| Stationen 3–6, eine Zeile | Echo-Sätze | `rules.js` → `ECHOES` |
| Ende | Vier Ausstattungs-Absätze, Maßnahmen-Sätze | `game.js` → `FINISH_TEXT`, `MEASURE_TEXT` |

Besonders prüfen:

- **Verrät irgendein Text vor der Zeitungsseite das Thema?** Wörter wie Quote, Gleichstellung, Frauen, Balance dürfen vor der Reaktion nirgends stehen (außer wörtlich in Auflage 4 — das ist Absicht).
- **Urteilt das Spiel irgendwo?** Es soll nie sagen, was richtig war. Wenn ein Satz belehrend klingt, markieren.
- **Ersatzpreisrichterin:** Steht gleichwertig neben den anderen Maßnahmen, ohne Ironie. Klingt das so?
- **Die deutschen Schlagzeilen:** Klingen sie nach Krone, Standard, Falter?

---

## Teil C — Nur Kathi: die Profile (`data.js`)

- Die sechs Frauen haben fast alle `prestige: 3` und kürzere Bios als die Männer. Im Spiel sind die Kriterien-Punkte nicht mehr sichtbar, aber Bio-Länge und Seniorität (als „5–10 years" auf der Karte) schon. Fällt beim Lesen der Karten auf, wer Frau ist — außer am Namen?
- Zwei, drei Frauen mit mehr Seniorität (2 → 3) würden das Feld ehrlicher machen. Welche?
- Die Zuordnung, wer welches Pflichtfeld abdeckt, steht in `rules.js` → `FIELD_MAP`. Passt sie zu den Bios?

---

## Was ihr nicht ändern sollt

`BRIEF_TERMS`, `CHAMBER_RULE`, `NON_COMPLIANCE`, `REAL_JURY`, `OUTRO_FIGURES`, `SOURCES` in `rules.js` — das sind die belegten Fakten fürs Paper. Wenn dort etwas falsch aussieht: sagen, nicht ändern.

Rückmeldungen an Anne, als Stichwortliste. Screenshots helfen bei allem, was mit Layout zu tun hat.
