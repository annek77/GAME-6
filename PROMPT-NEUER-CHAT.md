# Übergabe-Prompt für den Bau-Chat

Empfehlung: **Claude Fable 5**, Cowork, Ordner `Pool of experts` verbunden.
Ein Chat für den Code, sequenziell. Recherche und Paper laufen in eigenen Fenstern.

---

Wir bauen ein Serious Game fertig. **Deadline: 15. September 2026.** Heute ist der
Prototyp halbfertig — deine Aufgabe ist der Umbau, nicht der Neubau.

**Lies zuerst `GAME 6/KONZEPT-STAND.md` vollständig.** Das ist die maßgebliche
Grundlage. Sie ersetzt `design-notizen.md` und `HANDOVER.md` überall dort, wo sie
ihnen widerspricht — die Widersprüche sind darin ausdrücklich aufgelistet.
Lies danach `rules.js` (Budget, Auflagen, Pflichtfelder, Maßnahmen, Stationen)
und verschaffe dir einen Überblick über `game.js`, `index.html`, `data.js`.

## Arbeitsregeln

- Sprich mit mir **Deutsch**. Der Spiel-Output ist **Englisch**.
  Zeitungs-Schlagzeilen in den SVGs bleiben Deutsch — das ist Absicht.
- Arbeite **nur an dem, was ich nenne**. Ändere keine Dateien, Strukturen oder
  Code, die ich nicht genannt habe — auch nicht „zur Verbesserung".
- Wenn dir auffällt, dass etwas anderes auch gefixt gehört: **sag es mir,
  mach es nicht eigenständig.**
- Bei Unklarheit **sofort fragen**, nie still annehmen. Beste Option zuerst
  empfehlen, Alternativen kurz nennen.
- **Teste laufend mit**, nicht erst am Schluss. Nach jedem Abschnitt: `node --check`
  auf die geänderten Dateien, plus eine Logik-Simulation der Screen-Kette.
  Nichts gilt als fertig, bevor es einmal durchgelaufen ist.
- **Führe keine Git-Befehle aus.** Das Repo liegt in einem verbundenen
  Windows-Ordner; Git aus der Linux-Sandbox hinterlässt dort Lock-Dateien, die
  sich nicht mehr entfernen lassen und jeden weiteren Git-Befehl blockieren.
  Sag mir stattdessen nach jedem fertigen Punkt **einen Satz für die
  Commit-Nachricht** — ich committe und pushe selbst über GitHub Desktop.

## Umgebung

- Repo: `annek77/GAME-6`, Branch `master`, öffentlich.
- Live unter **https://annek77.github.io/GAME-6/** — ein bis zwei Minuten nach
  jedem Push. Das ist der Link, der abgegeben wird.
- Lokaler Pfad: `C:\Users\annek\Games\Pool of experts\GAME 6`
- Das Spiel läuft rein statisch, kein Build, kein Backend.

## Der Auftrag, in dieser Reihenfolge

1. **Aufräumen.** Die vier `draft-*.js` sind Monkey-Patches, die Funktionen aus
   `game.js` überschreiben — die Reihenfolge der `<script>`-Tags entscheidet, was
   gilt. Das in saubere Dateien auflösen. **`art.js` und `rules.js` liegen schon
   im Ordner, sind aber noch nirgends eingebunden** — das gehört zu diesem
   Punkt. `draft-intro.js` ist tot und kann weg.
   `draft-sound.js` ist ein funktionierender Web-Audio-Layer ohne externe
   Dateien — behalten, aber noch nicht einbinden. CSS aus den
   `innerHTML`-Strings ins Stylesheet ziehen.

2. **Auswahl-Fix.** Aktuell wählt man zweimal hintereinander Leute aus, und die
   erste Runde wird im Code nie wieder gelesen. Es gibt künftig **eine** Auswahl,
   danach die **Korrekturschleife unter Druck**. Details in Abschnitt 3 der
   Konzeptdoku.

3. **Briefing mit den fünf Auflagen.** Text steht in `rules.js` als
   `BRIEF_TERMS`. Der Ausgewogenheits-Satz steht an vierter Stelle und darf nicht
   hervorgehoben werden. Die Mail muss so gespeichert sein, dass sie im Reveal
   erneut angezeigt werden kann.

4. **Außenwelt-Reaktion + drei Optionen.** Die Quota-Mail der Stadt fliegt raus.
   Stattdessen reagiert die Öffentlichkeit auf das Ergebnis — Presse,
   Bezirksrat, Pressekonferenz. Drei Wege: reparieren, aussitzen, freikaufen
   (`COMPENSATIONS` in `rules.js`).

5. **Reveal.** Die Briefing-Mail nochmal einblenden, den Ausgewogenheits-Satz
   gelb markiert. „Das stand in Ihrem Briefing."

6. **Karte mit sechs Stationen** (`STATIONS` in `rules.js`). Erscheint nach der
   Expertenauswahl. Station 1 ist erledigt, Station 2 anspielbar, der Rest
   sichtbar gesperrt — die Sperren sind Teil der Aussage.

7. **Cockpit ausbauen.** Budget zum Aufklappen mit Balkendiagramm nach
   Ausgabenkategorien (`SPEND_CATS`), Fortschritt, Zeitplan. Anzeigen erscheinen
   erst, wenn die Dimension relevant wird — es darf **keinen**
   Ausgewogenheits-Balken von Anfang an geben, das verrät das Thema.

8. **Endbildschirm.** Die WU steht immer, man scheitert nie. Die Ausstattung
   hängt am Restbudget (`FINISH_TIERS`). Dazu die zwei Fakten nebeneinander:
   die Ausgleichsmaßnahme und die Zusammensetzung des Beirats — ohne Kommentar.

9. **Einmal komplett durchspielen**, jeden Pfad: mit und ohne Reparatur, mit
   Freikauf, mit Aussitzen, Budget knapp und Budget üppig. Keine Sackgassen,
   kein Screen, der zweimal feuert, HUD-Werte konsistent.

Wenn die Zeit knapp wird, hat **Punkt 8 Vorrang vor Politur** — ein Spiel ohne
Ende ist schlechter als eines mit rauen Kanten.

## Die wichtigste inhaltliche Regel

Das Spiel darf das Thema **vor dem Reveal nicht benennen**. Keine „Quote", keine
„Frauen", keine „Gleichstellung", keine Geschlechterzählung in einer Anzeige.
Die einzige Ausnahme ist der Amtsdeutsch-Nebensatz im Briefing, der bewusst
zwischen vier langweiligen Auflagen untergeht.

Der Konflikt im Spiel ist **buchhalterisch, nicht moralisch**: Das Gesetz
verlangt Ausgewogenheit, die Zahlen geben sie nicht her, die Öffentlichkeit
schaut zu. Man kann das nicht lösen, nur bezahlen — und das Geld fehlt später
beim Bauen. Das Spiel urteilt nie über die Spielerin.

## Was nicht deine Aufgabe ist

Erfinde keine neuen Mechaniken dazu. Abschnitt 10 der Konzeptdoku listet die
offenen Punkte — Disruptor-Verteilung, Profil-Audit, unbelegte Zahlen im Outro,
Audio, Quellenseite, Settings. Die sind bekannt und **nicht** Teil dieses
Auftrags. Wenn dir beim Bauen etwas davon in die Quere kommt, sag es mir.

## Fang so an

Lies die genannten Dateien, dann sag mir in kurzen Bulletpoints, wie du
Punkt 1 und 2 angehen willst — bevor du eine Zeile änderst.
