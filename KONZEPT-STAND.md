# Pool of Experts — Konzeptstand nach Session 10.09.2026

Dieses Dokument ist die **maßgebliche Grundlage** für den Weiterbau. Es ersetzt
`design-notizen.md` und `HANDOVER.md` dort, wo es ihnen widerspricht — die
Widersprüche sind unten ausdrücklich benannt.

Sprache mit Anne: **Deutsch**. Spiel-Output: **Englisch**.
Zeitungs-Schlagzeilen in den SVGs bleiben **Deutsch** (authentische Wiener Artefakte).

---

## 1. Rahmen

| | |
|---|---|
| **Was** | Serious Game, HTML/CSS/JS, offline lauffähig, GitHub Pages |
| **Kurs** | Web Experiences for the Digital Humanities |
| **Team** | Anne, Kathi, Jana — drei Personen, dreifacher Umfang erwartet |
| **Arbeitsteilung** | **Anne baut das Spiel.** Kathi, Jana und Anne schreiben danach das Paper |
| **Abgabe** | **15. September 2026** — Paper (14–20 Seiten) **plus Link zur spielbaren Version** |
| **Hosting** | GitHub Pages, **Repo öffentlich** (Variante A). Pages geht auf dem Free-Plan nicht mit privatem Repo |
| **Git** | Lokales Repo liegt in `GAME 6/`, ein Commit mit dem Ist-Stand vor Umbau. Kein Remote |

### Der Anlass für den Umbau

Beim Testen an der Uni gab es **kein verwertbares Playtest-Feedback** — in der
Session wurden ~20 Spiele durchgespielt, danach war die Aufmerksamkeit weg.
Die eine Rückmeldung, die zählt, kam vom Professor:

> Es hatte sich ein Spannungsbogen aufgebaut, und als die Jury ausgewählt war,
> wollte er **weitermachen und die WU tatsächlich bauen**.

Daraus folgt der zentrale Schluss des Teams: **Der Gender-Teil ist nur ein Teil
des Spiels, nicht das ganze Spiel.**

---

## 2. Die Grundstruktur

**Spielziel ist jetzt das Gebäude, nicht die Jury.**

```
Ausgangslage: "Du musst die neue WU bauen"
      │
      ├── Station 1: Expertenbeirat besetzen   ← voll spielbar (der bestehende Teil)
      ├── Station 2: Anrainer & PR             ← anspielbar (eine Entscheidung)
      ├── Station 3: Baubehörde                ← gesperrt
      ├── Station 4: Partner & Investoren      ← gesperrt
      ├── Station 5: Material & Ressourcen     ← gesperrt
      └── Station 6: Bau                       ← gesperrt
      │
Ende: Die WU steht.
```

Der Prototyp zeigt **Anfang und Ende** und macht sichtbar, dass dazwischen alles
gemacht werden muss. Die gesperrten Stationen sind Teil der Aussage — sie zeigen
den Umfang des gedachten Spiels.

### Navigation & Anzeigen

- **Karte** zur Navigation zwischen den Stationen. Erscheint **nach** der Expertenauswahl.
- **Cockpit** ist immer sichtbar: Budget, Zeitplan, Fortschritt.
- **Budget zum Aufklappen** mit **Balkendiagramm**: wie viel Prozent wofür ausgegeben.
- **Anzeigen erscheinen dynamisch**, sobald eine Dimension relevant wird —
  kein Ausgewogenheits-Balken von Anfang an, sonst ist das Thema verraten.

*(Janas Bild vom Tetris-Kasten, in den man erworbene Teile einbaut, war Input für
die Fortschritts-Visualisierung, keine Anforderung.)*

---

## 3. Die Expertenauswahl — Kern der heutigen Session

### Der Fehler im bisherigen Stand

Gebaut waren **zwei unabhängige Auswahlrunden**: erst 10 aus 26 wählen, dann
nochmal 10 aus einem neuen Bewerberfeld. Die erste Auswahl wurde im Code
**nie wieder gelesen** (`state.phase1Women`, `state.weights` sind tot).

**Gedacht war etwas anderes:** *eine* Auswahl → das Spiel zeigt, dass sie nicht
passt → der Prozess geht weiter, Teile werden **mit dem neuen Wissen wiederholt**.

### Die richtige Struktur

1. **Eine Auswahl.** Ruhig, ohne Zeitdruck.
2. **Die Außenwelt reagiert** — nicht das Spiel.
3. **Korrekturschleife unter Druck.** Nachbessern kostet Zeit, Geld, Ruf.

Der Unterschied ist entscheidend: Die zweite Runde ist nicht „nochmal dasselbe",
sondern **Reparatur unter Druck** — und das ist die Erfahrung, um die es geht.

### Der Konflikt ist buchhalterisch, nicht moralisch

Drei Dinge sind gleichzeitig wahr und widersprechen einander:

- Das Gesetz verlangt eine ausgewogene Besetzung.
- Die Zahlen geben sie nicht her — es gibt zu wenige Architektinnen mit Befugnis.
- Die Öffentlichkeit sieht das Ergebnis und reagiert.

**Du kannst diesen Konflikt nicht lösen. Du kannst ihn nur bezahlen** — mit Zeit
oder mit Geld. Und dieses Geld fehlt später beim Bauen.

Der Satz, den die Spielerin mitnehmen soll:

> *„Du hast nichts falsch gemacht. Du hast getan, was möglich war.
> Die Rechnung dafür steht trotzdem — und du bezahlst sie aus dem Geld,
> mit dem du bauen wolltest."*

### Die Auflage im Briefing (der Amtsdeutsch-Trick)

Die erste Stadt-Wien-Mail listet **fünf Auflagen** auf. An **vierter Stelle**,
zwischen vier ebenso trockenen Punkten, steht:

> *„In accordance with the procurement guidelines of the City of Vienna, a
> balanced composition of the advisory board shall be ensured. Where this is not
> achieved, appropriate compensatory measures are to be taken."*

Regeln dafür:

- **Das Wort „Frauen" kommt nicht vor.** „Ausgewogene Zusammensetzung" reicht.
- Der Satz muss zwischen mindestens vier gleich langweiligen Auflagen stehen.
  Steht er allein, ist er ein Warnschild.
- **Im Reveal wird die alte Mail nochmal eingeblendet, der Satz gelb markiert.**
  „Das stand in Ihrem Briefing."

Warum: Es ist fair (es stand da), es überrascht trotzdem (niemand liest das), und
der Nebensatz ist **selbst schon die Lernbotschaft** — so funktioniert
Gleichstellungspolitik real: Die Vorgabe existiert, ist zahnlos formuliert, und
niemand nimmt sie ernst, bis die Rechnung kommt.

### Wie das Spiel „das passt nicht" sagt

**Über die Außenwelt, nicht über die Regel.** Kein Spiel-Urteil, keine Belehrung.
Stattdessen reagiert jemand: ein Zeitungsfoto der Jury, ein Kommentar bei der
Pressekonferenz, eine Anfrage im Bezirksrat. Das Spiel *bewertet* nicht — es
zeigt, wie andere hinschauen. Reagieren muss man, weil es sonst teuer wird.

### Drei Reaktionsmöglichkeiten

| | |
|---|---|
| **Reparieren** | Nachbesetzen. Kostet Zeit, und die Leute sind vielleicht weg |
| **Aussitzen** | Kritik ertragen. Kostet Ruf, und Ruf kostet später Geld |
| **Freikaufen** | Beirat bleibt, du lieferst daneben etwas Gutes ab |

**Freikaufen ist eine vollwertige Option** — man kommt damit durch.
**Aber es holt einen am Ende ein, ohne Vorwurf.** Zwei Fakten nebeneinander:

> Das Mädchencafé wurde im Mai eröffnet. 340 Besucherinnen im ersten Monat.
> Über den Entwurf entschieden haben: acht Männer, zwei Frauen.

Kein Kommentar dazu. Der Widerspruch macht die Arbeit.

### Der Aha-Moment

Bleibt **nach der Auswahl**. Danach darf emotional eine weitere Ebene aufgehen.

---

## 4. Pflicht-Fachgebiete (neu, gesetzt in dieser Session)

Damit die Auswahl fachlichen Sinn hat, nennt die Ausschreibung **sechs
Pflichtfelder**, die abgedeckt sein müssen — abgeleitet aus dem STEK 68:

| Feld | Warum |
|---|---|
| Tragwerk über Bahnbetrieb | ÖBB-Güterzüge fahren unter der Platte |
| Schwingung & Akustik | Labor- und Hörsaalnutzung braucht Entkoppelung |
| Brandschutz & Fluchtwege | ÖBB-Fluchtwege und Feuerwehrzufahrten |
| Klimareparatur & Freiraum | Vollversiegelt, 1,5 m Substrat, 30–40 % Beschattung |
| Vergaberecht & Kostensteuerung | Öffentliches Geld |
| Bildungsbau & Barrierefreiheit | 17.000 Studierende, ÖNORM B 1600 |

Sichtbar als **Checkliste** während der Auswahl. Das ist gleichzeitig die
Checklisten-Mechanik aus Kathis Konzept.

**Die Verteilung im Bewerberfeld** (nicht als Trick, sondern weil die Datenlage
so aussieht): Tragwerk, Schwingung und Brandschutz sind **ausschließlich
männlich** besetzt. Klimareparatur ist mehrheitlich weiblich.

→ Wer breit nach Fachlichkeit auswählt, landet bei 2–4 Frauen, ohne je an
Geschlecht gedacht zu haben. **Genau das ist der Punkt.**

**Rechnerisch geprüft:** Alle sechs Felder sind mit vier Personen abdeckbar.
50/50 ist also **erreichbar** — nur nicht, wenn man einfach fachlich optimiert.

---

## 5. Geld

**Budget: 3.000.000 €** — ausdrücklich **Ausstattungs- und Nebenkostenbudget**,
nicht Baukosten. In echten öffentlichen Bauprojekten ist genau das der Topf, der
gekürzt wird — deshalb steht am Ende Linoleum statt Parkett.

- **Verzögerung:** 50.000 € pro Woche
- **Honorare Beirat:** 25.000 € + 10.000 € pro Senioritätsstufe (35.000–55.000 €)
  → an **Seniorität** gekoppelt, nicht an Prestige. Lange durchgehende Praxis ist
  teuer, und genau dieses Kriterium bevorzugt strukturell Männer.
- **Ausgabenkategorien** fürs Balkendiagramm: Honorare · Verzögerung · PR ·
  Ausgleichsmaßnahmen · Berater

**Notlagen-Verhandlung: ja.** Wenn das Budget aufgebraucht ist, kann man
nachverhandeln — mit Konsequenzen.

**Man scheitert nie.** Die WU steht am Ende immer. Der Verlust materialisiert
sich **in der Qualität des Gebäudes**, nicht in einem Game Over. Das ist ein
besseres Ende, weil man sein Ergebnis ansehen kann.

---

## 6. PR & Anrainer (Station 2)

PR ist **mehr als Anrainer**. Gesammelt wurden:

- Kronenzeitung / Presse
- Fest für die Anrainer
- Info-Container zum Reingehen
- Teilnahme an Bewerben aller Art
- Streetart-Streifen am Bauzaun zum Sprayen während der Bauzeit
- Kindergarten einbauen
- **Barrierefreiheit — darf nie vergessen werden**

---

## 7. Disruptoren

**Ursprünglicher Vorschlag im Brainstorm:** 80 % Entscheidungen / 20 % Disruptoren,
davon 18 % gegen und 2 % für den Spieler.
**Kathis Papier sagt dazu etwas anderes:** 20 % reine Info-Ereignisse, positiv zu
negativ 50:50.

**Vorschlag zur Auflösung (noch nicht final beschlossen):**

- **70 % eigene Entscheidungen / 30 % Ereignisse von außen** — der Spieler soll
  sich handelnd fühlen, nicht bedient.
- Von den Ereignissen: **60 % negativ · 25 % positiv · 15 % reine Info**
  (keine Entscheidung, nur Atmosphäre).
- Der Trick liegt nicht im Verhältnis, sondern in der **Höhe**: Negative
  Ereignisse kosten spürbar, positive geben nur kleine Beträge zurück. Netto
  bleibt man im Minus — das Gefühl „das System mahlt" bleibt, aber es gibt genug
  Lichtblicke, dass man weiterspielt.

**Gesammelte Disruptoren** (aus beiden Brainstorm-Mitschriften):

*Negativ:* Schlechtwetter → Verzögerung · undichtes Dach · Schimmel · billiger
Installateur → Kabelbrand · Versicherungswahl rächt sich · Todesfall am Bau ·
Hitzewelle → Arbeitseffizienz bricht ein · geschützte Tiere/Pflanzen umsiedeln ·
archäologischer Fund → zwei Wochen Grabungsstopp · Lärmklage der Anrainer ·
Lieferkettenengpass Fassadenglas · Ransomware auf den BIM-Daten · Graffiti ·
Urheberrechtsstreit um eine Gebäudeform · Investor will Marmor

*Positiv:* Partner hat sein Werbebudget nicht ausgeschöpft und gibt Geld ab ·
Druckerei sponsert Eröffnungs-Flyer · Inflation sinkt · Holzpreise fallen ·
Förderung für Solaranlagen · Abbruchprojekt in der Nähe liefert
Recyclingmaterial gratis · Kaffeerösterei finanziert das Campus-Café ·
Alumni-Spende · Restposten Stahlfertigteile mit 40 % Rabatt

---

## 8. Widersprüche zu älteren Dokumenten

| Alt | Neu |
|---|---|
| `design-notizen.md`: 50/50 „erreichbar, aber unbezahlbar — NICHT unmöglich" | Erreichbar, aber nur gegen die fachliche Optimierung. Der Konflikt ist bezahlbar, nicht lösbar |
| Quota-Mail der Stadt bei 7 Einladungen | **Raus.** Die Außenwelt reagiert, das Spiel zitiert keine Regel |
| Zwei Auswahlrunden | **Eine** Auswahl, danach Korrekturschleife |
| Outro-Zahlen: 60 % / 11–15 % / < 2 % | Widersprechen dem eigenen Briefing. **Müssen belegt werden**, Recherche läuft |
| Reveal-Regel „kein Thema vor dem Ende" | Wird durch den Amtsdeutsch-Nebensatz sauber umgangen |

---

## 9. Codestand (10.09.2026)

**Neu angelegt:**

- `art.js` — alle SVG-Illustrationen an einem Ort, inhaltlich unverändert aus
  `game.js`, `draft-reveal.js`, `draft-letter.js` extrahiert
- `rules.js` — Budget, Honorare, Auflagen, Pflichtfelder, Ausgleichsmaßnahmen,
  PR-Maßnahmen, Stationen, Endqualitäts-Stufen
- `.gitignore`, lokales Git-Repo mit Ist-Stand-Commit

**Noch nicht angefasst:** `game.js`, `index.html`, `data.js`, die vier
`draft-*.js`. Der Umbau steht noch aus.

### Bekannte Altlasten

- Vier `draft-*.js` überschreiben Funktionen aus `game.js`; die Reihenfolge der
  `<script>`-Tags entscheidet, welche Version gilt
- `draft-intro.js` und `draft-sound.js` werden **gar nicht geladen** (toter Code).
  `draft-sound.js` ist ein fertiger Web-Audio-Layer ohne Dateien — brauchbar
- CSS steckt teils in `innerHTML`-Strings statt im Stylesheet
- Deadline wandert bei Verzögerung mit → man kann sie nie reißen
- Alle sechs Frauen haben `prestige: 3` — das ist ein Geschlechter-Tell im
  Signal-Set. Profil-Audit (gleiche Textlänge, abgeglichene Seniorität) offen

---

## 10. Offene Punkte

1. **Disruptor-Verteilung** final festlegen (Vorschlag in Abschnitt 7)
2. **Recherche** zu gesetzlichen Auflagen und Zahlen — Prompt liegt vor,
   läuft in eigenem Chat
3. **Profil-Audit**: Textlängen angleichen, Seniorität abgleichen, Prestige
   entkoppeln
4. **Punkt 8** — Endbildschirm mit dem Gebäude, dessen Qualität am Restbudget
   hängt. Heute ausdrücklich **nicht** gebaut
5. **GitHub-Remote** anlegen und pushen (Anne macht das selbst)
6. **Audio** einbinden (`draft-sound.js` existiert bereits)
7. **Quellen- und Methodenseite** im Spiel
8. **Settings / Barrierefreiheit**: Mute, „weniger Reize", Tastaturbedienung
