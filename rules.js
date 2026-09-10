/* ==========================================================================
   rules.js — Spielregeln, Auflagen, Pflichtfelder, Maßnahmen, Stationen.
   Getrennt von data.js (Personendaten) und art.js (Bilder), damit sich
   Balancing ändern lässt, ohne im Spielcode zu suchen.
   ========================================================================== */

/* ---------- Geld ----------------------------------------------------------
   Das Spiel verwaltet NICHT die Baukosten (die sind gebunden), sondern das
   Ausstattungs- und Nebenkostenbudget. Genau das ist in echten öffentlichen
   Bauprojekten der Topf, der gekürzt wird, wenn etwas schiefgeht — und
   deshalb steht am Ende Linoleum statt Parkett.                            */
const BUDGET_START = 3_000_000;
const WEEK_COST    = 50_000;      // je Woche Verzögerung
const JURY_SIZE    = 9;           // ungerade — verlangt Auflage 2 (WSA §3 Abs. 3)

/* Honorar eines Beiratsmitglieds. Bewusst an SENIORITÄT gekoppelt, nicht an
   Prestige: lange durchgehende Praxis ist teuer — und das ist genau das
   Kriterium, das strukturell Männer bevorzugt.                             */
function expertFee(p){ return 25_000 + p.sig.seniority * 10_000; }

/* ---------- Ausgabenkategorien (für das Balkendiagramm im Cockpit) ------- */
const SPEND_CATS = [
  { key:"experts",      label:"Board fees",        color:"#5cb9da" },
  { key:"delay",        label:"Delay costs",       color:"#e8526b" },
  { key:"pr",           label:"PR & outreach",     color:"#ffcf4d" },
  { key:"compensation", label:"Compensation",      color:"#4fb286" },
  { key:"consultants",  label:"Consultants",       color:"#b48ad6" },
];

/* ---------- Die Auflagen aus dem Briefing --------------------------------
   Fünf Punkte, alle gleich trocken. Der vierte ist der, um den es geht —
   er nennt das Thema nicht beim Namen und geht zwischen den anderen unter.
   `key` erlaubt es, ihn im Reveal gezielt gelb zu markieren.

   ALLE FÜNF STEHEN AUF BELEGTEM RECHT (Recherche 10.09.2026). Die Quellen
   stehen in SOURCES weiter unten und gehören auf die Quellenseite des Spiels.
   Nichts hier ist erfunden — das war die ausdrückliche Vorgabe, weil das
   begleitende Uni-Paper die Belege braucht.                                */
const BRIEF_TERMS = [
  { key:"deadline",
    text:"The advisory board shall be constituted no later than 1 August 2026. Each week of delay is charged to the project at €50,000.",
    source:null },   // Spielmechanik, keine Rechtsnorm
  { key:"jurysize",
    text:"An odd number of jurors shall be appointed, no fewer than five. Where a particular professional qualification is required of entrants, at least half of the panel must hold the same or an equivalent qualification.",
    source:"WSA 2022, Teil B §3 Abs. 3 und 4" },
  { key:"accessibility",
    text:"Buildings for educational purposes must be designed and constructed barrier-free under §115 of the Vienna Building Code, including accessible toilets on every floor. Compliance must be certified on completion.",
    source:"Bauordnung für Wien §115 Abs. 1 Z 3 und Abs. 6; OIB-Richtlinie 4 (Mai 2023) via WBTV 2023" },
  { key:"balance",
    // ★ Der Satz, um den sich das Spiel dreht. WÖRTLICH aus dem
    //   Werkstattbericht 91 der Stadt Wien (2008), nur ins Englische gebracht.
    //   "wird angestrebt" — kein Muss, keine Frist, keine Sanktion. Und er
    //   steht dort im Grundsatzkapitel, nicht im Verfahrensteil.
    text:"A proportion of women on the jury of at least 25% and the participation of “young” jurors is aimed for.",
    source:"Stadt Wien, MA 18: Werkstattbericht Nr. 91 (Juni 2008), Kap. I, Grundsatz (4), S. 9" },
  { key:"records",
    text:"Jurors must be independent of all entrants. A written declaration of independence is to be submitted before the first session.",
    source:"BVergG 2018 §165 Abs. 4; WSA 2022, Teil B §3" },
];

/* Die einzige Muss-Bestimmung Österreichs — und ihr Schlupfloch.
   Sie bindet nur das Nominierungskontingent der Kammer, und sie ist durch
   eine ERSATZpreisrichterin erfüllbar: formal korrekt, ohne dass eine Frau
   mitstimmt. Im Spiel ist das der bequeme Knopf.                           */
const CHAMBER_RULE = {
  text:"At least one woman must belong to the jury as a specialist juror — either as a full juror or as a substitute.",
  source:"zt:Kammer Ost, Leitlinien für die Nominierung von Preisrichter:innen (Website-Stand 10.09.2026)",
  note:"Bindet nur das Kammerkontingent. Keine Sanktion. Durch eine Ersatzpreisrichterin erfüllbar.",
};

/* ---------- Was bei Nichterfüllung wirklich passiert ---------------------
   NICHTS von Rechts wegen. Keine Strafzahlung, kein Mitteleinbehalt.
   Die einzige Folge ist der Entzug der Kammer-Kooperation und die
   öffentliche Kennzeichnung des Verfahrens. Ein Reputationsmechanismus.
   Genau deshalb funktioniert "die Außenwelt reagiert, nicht das Spiel" —
   es ist real genau so. Alle Kosten im Spiel sind FREIWILLIG: Verzögerung
   durch Weitersuchen, PR nach schlechter Presse, Ausgleichsmaßnahmen zur
   Gesichtswahrung.                                                        */
const NON_COMPLIANCE = {
  legal:      null,
  chamber:    "Cooperation withdrawn. The competition is listed as “without cooperation” on architekturwettbewerb.at.",
  source:     "WSA 2022, Teil A Art. X Abs. 3",
};

/* ---------- Pflicht-Fachgebiete ------------------------------------------
   Aus dem STEK 68 abgeleitet. Sie geben der Auswahl ihren fachlichen Sinn:
   man wählt nicht "gute Leute", man deckt Anforderungen ab. Drei der sechs
   Felder sind im Bewerberfeld ausschließlich männlich besetzt — nicht als
   Trick, sondern weil die Datenlage in diesen Sparten so aussieht.
   `short` und `color` sind reine Anzeige (Tags auf den Karten, Checkliste). */
const FIELDS = [
  { key:"struct",  label:"Structures over live rail",      short:"Structure",   color:"#5cb9da",
    note:"ÖBB freight trains run under the slab. Every load path has to work around them." },
  { key:"vibro",   label:"Vibration & acoustics",          short:"Vibration",   color:"#b48ad6",
    note:"Lab and lecture use requires the structure to be decoupled from the tracks." },
  { key:"fire",    label:"Fire safety & escape routes",    short:"Fire",        color:"#e8526b",
    note:"Railway escape routes and fire brigade access must stay clear at all times." },
  { key:"climate", label:"Climate repair & open space",    short:"Climate",     color:"#4fb286",
    note:"Fully sealed site. 1.5 m of substrate on concrete, 30–40% shading, rainwater management." },
  { key:"procure", label:"Procurement & cost control",     short:"Procurement", color:"#ffcf4d",
    note:"Public money, public tendering, and a budget that has to hold." },
  { key:"edu",     label:"Educational building & accessibility", short:"Education", color:"#ff8a5c",
    note:"17,000 students, 1,000 pupils — and §115 of the Vienna Building Code across the whole site." },
];

/* Wer deckt welches Feld ab. Ein Profil kann mehrere Felder bedienen —
   genau das macht "Generalisten mit langer Praxis" so verführerisch.       */
const FIELD_MAP = {
  struct:  ["resch","hofer","deutsch","doppler"],
  vibro:   ["vogler","resch"],
  fire:    ["brunner","schwarz"],
  climate: ["brandstaetter","binder","alexander","dietl","graf"],
  procure: ["winkler","danneberg","schwarz"],
  edu:     ["mayr","berger","salzmann"],
};

function fieldsOf(id){
  return FIELDS.filter(f => FIELD_MAP[f.key].includes(id)).map(f => f.key);
}
function coverageOf(idSet){
  const covered = {};
  FIELDS.forEach(f => {
    covered[f.key] = FIELD_MAP[f.key].some(id => idSet.has(id));
  });
  return covered;
}
function missingFields(idSet){
  const c = coverageOf(idSet);
  return FIELDS.filter(f => !c[f.key]);
}

/* ---------- Ausgleichsmaßnahmen ------------------------------------------
   Der "Freikauf"-Weg. Alle wirken auf den Ruf, keiner ändert den Beirat.
   Das ist der Punkt: man löst nicht die Ursache, man liefert daneben etwas
   Gutes ab. Am Ende stehen beide Fakten nebeneinander.                     */
const COMPENSATIONS = [
  /* ★ Der bequeme Knopf. Erfüllt die einzige Muss-Regel Österreichs
     formal korrekt — die Frau sitzt auf der Ersatzbank und stimmt nicht mit.
     Billig, schnell, rechtlich einwandfrei. Das Spiel kommentiert es nicht;
     im Abspann steht nur, wer am Ende entschieden hat. */
  { key:"substitute", label:"Appoint a woman as substitute juror",
    desc:"Fulfils the Chamber's nomination guideline. Substitutes attend, but do not vote unless a full juror drops out.",
    cost:15_000, rep:8, isLoophole:true },
  { key:"girlscafe", label:"Girls' café in the ground floor",
    desc:"A youth-centre space on the campus edge, open to the district, run for and by young women.",
    cost:180_000, rep:18 },
  { key:"kindergarten", label:"On-site kindergarten",
    desc:"Childcare for staff and neighbourhood families. The single most effective measure — and the most expensive.",
    cost:340_000, rep:25 },
  { key:"youth", label:"Youth centre in the Grätzl",
    desc:"Funding an existing neighbourhood youth centre for five years.",
    cost:260_000, rep:20 },
  { key:"mentoring", label:"Mentoring programme for young architects",
    desc:"Three years of funded mentoring places at the Chamber. Cheap, quiet, slow.",
    cost:90_000, rep:10 },
];

/* ---------- PR-Maßnahmen (Station "Neighbours & PR") --------------------- */
const PR_ACTIONS = [
  { key:"fest",      label:"Street party for the neighbourhood",
    desc:"Augasse closed for an afternoon. Music, food, the plans on a board to look at.",
    cost:35_000, rep:12 },
  { key:"container", label:"Information container on site",
    desc:"A staffed container where anyone can walk in, ask questions and see the models.",
    cost:60_000, rep:16 },
  { key:"streetart", label:"Street-art strip along the hoarding",
    desc:"120 metres of construction hoarding released for spraying. Cheap, popular, slightly unpredictable.",
    cost:40_000, rep:14 },
  { key:"nothing",   label:"Do nothing for now",
    desc:"Save the money. The neighbours will notice the drilling either way.",
    cost:0, rep:-12 },
];

/* ---------- Die Stationen auf der Karte ----------------------------------
   Startzustand: die Karte erscheint vor der Auswahl, Station 1 ist offen.
   Mit dem Versand der Einladungen wird 1 erledigt und 2 geöffnet.           */
const STATIONS = [
  { key:"board",    label:"Expert advisory board", place:"MA 21A, Rathausstraße",
    desc:"Appoint the panel that decides which design wins.", state:"open" },
  { key:"pr",       label:"Neighbours & PR",       place:"Augasse, 9th district",
    desc:"The people who will live next to a building site for four years.", state:"locked" },
  { key:"permits",  label:"Building authority",    place:"MA 37, Baupolizei",
    desc:"Permits, objections, and the rules nobody can talk their way out of.", state:"locked" },
  { key:"partners", label:"Partners & investors",  place:"Wienerberg",
    desc:"Money that comes with conditions attached.", state:"locked" },
  { key:"material", label:"Material & resources",  place:"Urban mining depot",
    desc:"40% of the old concrete goes back in. The rest has to come from somewhere.", state:"locked" },
  { key:"build",    label:"Construction",          place:"Althangrund West",
    desc:"Four years over a live railway. Everything you decided until now shows up here.", state:"locked" },
];

/* ---------- Endqualität nach Restbudget (Punkt 8, noch nicht gebaut) ----- */
const FINISH_TIERS = [
  { min:2_200_000, key:"excellent" },
  { min:1_400_000, key:"solid" },
  { min:  700_000, key:"frugal" },
  { min:        0, key:"bare" },
];

/* ==========================================================================
   DAS ECHTE PREISGERICHT — Campus Althangrund
   Ausgeschrieben 06.08.2025 von der BIG, zweistufiger Realisierungswettbewerb.
   Erste Jurysitzungen 25.–27.02.2026, Entscheidung Ende 2026. Läuft also
   in genau dem Moment, in dem dieses Spiel abgegeben wird.

   Das ist der Abschluss: nach der eigenen Jury die echte. Kein erfundenes
   Beispiel — das reale Preisgericht für genau dieses Gebäude.
   Quelle: architekturwettbewerb.at/competition/campus-althangrund/12161
   ========================================================================== */
const REAL_JURY = {
  total:14, women:4, men:10,          // 28,6 %
  groups:[
    { label:"Chamber-nominated jurors", women:2, men:0 },
    { label:"Specialist jurors",        women:0, men:7 },   // ★ die Kernzahl
    { label:"Lay jurors",               women:2, men:3 },
  ],
  substitutes:{ women:1, men:1 },
  women_named:["Barbara Buser","Hemma Fasch","Eva Kuzmich","Eva Schulev-Steindl"],
  source:"architekturwettbewerb.at, Wettbewerb „Campus Althangrund“, abgerufen 10.09.2026",
  note:"Ausloberin ist die BIG, nicht die Stadt Wien — der 25%-Zielwert des "+
       "Werkstattberichts 91 galt hier formal gar nicht. Er ist mit 28,6% "+
       "erfüllt, aber durch Zufall, nicht durch Norm.",
};

/* ---------- Quellen für die Quellenseite im Spiel ------------------------ */
const SOURCES = [
  { key:"bvergg",   label:"Bundesvergabegesetz 2018, §165 „Durchführung von Wettbewerben“",
    url:"https://www.ris.bka.gv.at/Dokumente/Bundesnormen/NOR40206866/NOR40206866.html",
    note:"Kennt nur Unabhängigkeit und Qualifikation. Keine Geschlechtervorgabe." },
  { key:"wb91",     label:"Stadt Wien, MA 18: Werkstattbericht Nr. 91 (Juni 2008), S. 9",
    url:"https://www.digital.wienbibliothek.at/wbrup/download/pdf/4170505?originalFilename=true",
    note:"Quelle des 25%-Satzes. Soll-Bestimmung im Grundsatzkapitel, keine Sanktion." },
  { key:"wsa",      label:"Wettbewerbsstandard Architektur WSA, Neuauflage 2022",
    url:"https://bund.zt.at/fileadmin/user_upload/redakteure/Wettberwerbe/zt_Wettbewerbsstandard_Architektur_WSA_2022.pdf",
    note:"Gender-Aussagen stehen in Vorwort, Präambel und Teil A — nicht in §3, der Wettbewerbsordnung." },
  { key:"kammer",   label:"zt:Kammer Ost, Leitlinien für die Nominierung von Preisrichter:innen",
    url:"https://ost.zt.at/mitgliederservice/mitgliedschaft/wettbewerbe-und-vergabe",
    note:"Einzige Muss-Bestimmung Österreichs. Durch eine Ersatzpreisrichterin erfüllbar." },
  { key:"bo115",    label:"Bauordnung für Wien §115 „Barrierefreie Gestaltung von Bauwerken“",
    url:"https://www.ris.bka.gv.at/eli/lgbl/WI/1930/11/P115/LWI40013133",
    note:"Hochschulbauten fallen unter Abs. 1 Z 3, inkl. barrierefreier Toiletten in jedem Geschoß." },
  { key:"kammerst", label:"Kammer Wien/NÖ/Bgld, Jahresbericht 2025",
    url:"https://ost.zt.at/fileadmin/user_upload/redakteure_wnb/A_Aktuelles/derPlan_Jahresberichte/Jahresbericht_2025_Online.pdf",
    note:"Frauenanteil Architekt:innen mit aufrechter Befugnis 22,7 %, Ingenieurkonsulentinnen 6,1 %." },
  { key:"unidata",  label:"BMFWF/unidata, Studierende WS 2025/26, ISCED-F 0731",
    url:"https://unidata.gv.at/auswertungskatalog/studierende/studien/universitaeten",
    note:"Frauenanteil im Architekturstudium 57,6 %." },
  { key:"jury",     label:"architekturwettbewerb.at, Preisgericht „Campus Althangrund“",
    url:"https://www.architekturwettbewerb.at/competition/campus-althangrund/12161",
    note:"14 Hauptpreisrichter:innen, davon 4 Frauen. Unter den sieben Fachpreisrichtern keine." },
];

/* ---------- Die drei Zahlen für den Abspann ------------------------------
   Alle belegt, alle aus SOURCES. Ersetzen die bisherigen, unbelegten
   Werte (60 % / 11–15 % / <2 %) im Outro.                                  */
const OUTRO_FIGURES = [
  { n:"57.6%", t:"of architecture students in Austria are women.",
    src:"unidata" },
  { n:"22.7%", t:"of licensed architects in Vienna, Lower Austria and Burgenland are women. Among licensed engineering consultants: 6.1%.",
    src:"kammerst" },
  { n:"0 of 7", t:"specialist jurors on the real Campus Althangrund panel are women.",
    src:"jury" },
];
