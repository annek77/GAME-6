# Pool of Experts — Design-Notizen

Gesammelte Ideen & Entscheidungen aus dem Brainstorming. Arbeitsdokument, fließt
ins Sonnet-Briefing und in den Bau. Stand: Sammeln (noch nichts am Code geändert).

Kernbotschaft (NICHT vorab spoilern): Das Faire ist da und qualifiziert — aber die
Struktur macht es unbezahlbar. Schuld ist am Ende das System, nicht die wählende Person.

---

## Entscheidungen (fix)

- **Titel:** „Pool of Experts" bleibt. Die Spoiler-Zeile **„a game about hiring
  bias" muss weg** (Titelleiste, `index.html` Z. 224). Reveal lebt vom Selbst-Entdecken.
- **Eröffnungs-Story** über die Alte WU (Augasse) — emotional reinziehen, echten Ort
  etablieren, bevor Mechanik startet.
- **Filter-Mechanik** (Highlight): Betont man ein Kriterium, zeigt das Spiel sichtbar
  die „Opfer" — „Damit fallen X qualifizierte Leute raus." Bias wird im Moment sichtbar,
  nicht erst im Outro.
- **Badeanzug-Anprobe als Pappspiel:** Figuren sind 2D und genderlos in neutraler
  Unterwäsche; das Badegewand ist eine separate Schicht, die man wie beim Anzieh-/
  Pappspiel drüberklappt. Konzeptlogik: unter der Kleidung alle gleich, der Bias steckt
  im Gewand, das das System drüberzwängt. Stützt den woman/man-Disclaimer am Ende.
- **Pool-Szene deutlicher machen** — der „Expert Pool" als echter Ort: Wasser, Schwimmhalle,
  Badeanzüge, Handtücher, Bademeister-Stuhl. Höhepunkt des Spiels.
- **Quellen-/Methoden-Seite:** unbedingt (belegte Zahlen + woman/man-Disclaimer).
- **Settings & Barrierefreiheit:** Mute-Toggle, „weniger Reize"-Modus, Tastatur-Bedienung,
  Restart, klare Button-Labels.

## Verworfen

- „Das Gebäude spricht" / personifizierte Alte WU als Erzählerin — **nein**.

---

## Mechanik: Zeitdruck & Geld

- **€50.000 / Woche Verzögerung**, immer sichtbar. Als **öffentliches Geld / Steuergeld**
  rahmen → moralisches Gewicht: man verbrennt das Geld der Allgemeinheit, *um* das
  Richtige zu tun.
- Drei sichtbare Anzeigen: **Budget/Verzögerung (€)**, **Zeit (Wochen)**, **Ruf/PR**.
  Jede Entscheidung zahlt auf eine ein — nichts ist gratis.
- **Doppelte Zeit-Falle:** Jede Woche Verzögerung springen auch gute Leute ab (anderer
  Job). Hetzen → schiefes Feld. Warten → Pool schrumpft. Kein „einfach abwarten".
- **Der bequeme Knopf:** immer eine billige, schnelle „Jury einfach auffüllen"-Option —
  Weg des geringsten Widerstands ist buchstäblich der größte Button, führt ins schiefe
  Ergebnis. Reibung ist asymmetrisch.

### Verzögerungs-/Dilemma-Gründe
- Hinweis „zu viele Männer genommen" → neu ausschreiben → Verzögerung.
- **Teeküche:** mit Kolleg:in reden, ob sie wen kennt → +2 Bewerber, ABER schlechte
  Presse (Freunderlwirtschaft). Danach: Krisen-PR-Agentur (€20.000 + 2 Wochen) ODER
  ablehnen → dann springt sicher eine Frau ab wegen schlechter PR.
- Weitere Ausschreibung → Verzögerung.
- Urlaubszeit → Leute antworten verzögert → +2 Wochen.
- Anfrage Stadt „dürfen wir Ausländer:innen nehmen?" → Verzögerung + Nein.
  (heikel — bewusst & vorsichtig texten: „System blockiert jeden Workaround")
- Anfrage Stadt „dürfen wir mehr Männer nehmen?" → Verzögerung + schlechte PR + Nein.
  (zeigt: sogar das Aufgeben des Ziels wird bestraft — jede Richtung kostet)

### Design-Leitplanke (wichtig)
- 50/50 soll **erreichbar, aber unbezahlbar** sein — NICHT buchstäblich unmöglich.
  Sonst fühlt man sich vom *Spiel* betrogen (statt von der Struktur) und das Ende kippt
  zu „man kann eh nichts tun". Frust soll heißen: *das Faire war da, aber unleistbar.*

---

## Story & Tonalität

- Erst den Ort lieben lassen (Alte WU: Innenhof, Generationen, Grätzl), dann „du besetzt
  die Jury über ihre Zukunft".
- **Jury-Zusammensetzung formt heimlich das Ergebnis:** `publicValue`-Signale ziehen
  weiblich. Kippt das Feld, gewinnt am Ende der Entwurf „Luxus statt Gemeinwohl". Schluss:
  „Die Jury, die du gebaut hast, hat *diesen* Entwurf gewählt." Bias bekommt ein sichtbares
  Gebäude als Konsequenz.
- **Stadt-Wien-Mails** bleiben freundlich & entschuldigend, während das System zermahlt —
  höfliche Bürokratie-Ironie behalten.
- Wiederkehrende **Teeküchen-Kolleg:in**, die immer wieder Abkürzungen vorschlägt
  (menschlicher Versuchungs-Faden).
- **PR-Feed:** echte Wiener Schlagzeilen reagieren auf Entscheidungen
  (z.B. „Krone: Freunderlwirtschaft beim Wettbewerb Alte WU?", „Der Standard: Jury-Vorsitz
  will Frauenquote aufweichen"). Macht „schlechte PR" konkret.

---

## Reveal / Ende

- **Kriterien sind die Falle:** späte Umdeutung — availability/assertiveness/prestige/
  seniority klingen nach Merit, sind teils geschlechts-codierte Proxys. An Filter-Mechanik
  andocken: „Du hast nicht nach Qualität gefiltert, sondern nach Verfügbarkeit für
  60-Stunden-Wochen."
- **Gegenfaktische Geister:** leere Pool-Plätze zeigen Gesichter/Namen qualifizierter
  Frauen, die nicht reinkamen. Gut-Punch: direkter CV-Vergleich „eingeladener Mann vs.
  abgelehnte Frau" mit fast identischen Lebensläufen.
- Ablauf: persönliches Verdict („X Wochen, €Y, Z Ruf — und trotzdem nur 3 Frauen") →
  echte AT-Zahlen (mit Quellen) → konkrete **Hebel** statt Schuld: Kinderbetreuung,
  flexible Stunden, anonymisierte Vorauswahl, Mentoring.
- Optional **„Was wäre wenn"-Replay:** nochmal mit anonymisierter Vorauswahl/fixer Quote —
  zeigt, dass strukturelle Fixes schneller/billiger zu 50/50 führen. Konstruktive Pointe.

---

## Audio

- **Szenen-Ambiente** (wechselt mit Phase): Pool = Wasser/Hall/Echo; Teeküche =
  Kaffeemaschine/Tassen/Geplauder; sonst = dezentes Großraumbüro (Tastatur, fernes Telefon).
- **SFX drauf:** Kassen-„cha-ching" bei jeder €50k-Stufe; tickende Uhr bei nahender Deadline.
- **Technik:** Mute-Toggle fix sichtbar; respektiert „weniger Reize"; kleine geloopte
  CC0-Dateien (mp3/ogg) in `assets/sound/`; Ton-Unlock beim ersten Klick; sanftes Überblenden.

---

## Visuals (im Hinterkopf)

- **Wasserstand IST die Anzeige** (evtl. ausprobieren): Verzögerung senkt den Pegel,
  €-Stufen trüben das Wasser → am Ende halbleeres, trübes Becken. Meter + Metapher verschmelzen.

---

## Offene Fragen / TODOs

- **Prototyp-Sprache:** **Englisch (fix).** DE als zweite Schicht später. Texte zentral
  sammeln → DE/EN-Umschalter später billig.
- **DE/EN-Umschalter:** nicht im Prototyp, aber Text-Architektur dafür vorbereiten.
- **Ausländer:innen-Anfrage:** Wortlaut bewusst & vorsichtig festlegen.
- **AT-Zahlen:** echte Quellen (kommt aus dem Sonnet-Briefing).
- **Profil-Audit:** gleiche Textlänge, abgeglichene Seniorität, Signale bewusst gesetzt.
- **„mehr Männer"-Anfrage (bestätigt):** soll zeigen, dass auch das Aufgeben des
  50/50-Ziels bestraft wird — jede Richtung kostet, man sitzt in der Falle.
