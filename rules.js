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
const JURY_SIZE    = 10;

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
   `key` erlaubt es, ihn im Reveal gezielt gelb zu markieren.               */
const BRIEF_TERMS = [
  { key:"deadline",
    text:"The advisory board shall be constituted no later than 1 August 2026. Each week of delay is charged to the project at €50,000." },
  { key:"procurement",
    text:"Appointments are subject to the Federal Procurement Act. Members must hold a valid professional licence." },
  { key:"accessibility",
    text:"Barrier-free design pursuant to ÖNORM B 1600 is mandatory for the entire site and must be represented on the board." },
  { key:"balance",
    text:"In accordance with the procurement guidelines of the City of Vienna, a balanced composition of the advisory board shall be ensured. Where this is not achieved, appropriate compensatory measures are to be taken." },
  { key:"records",
    text:"All deliberations are subject to documentation requirements. Minutes are to be submitted to MA 21A within ten working days." },
];

/* ---------- Pflicht-Fachgebiete ------------------------------------------
   Aus dem STEK 68 abgeleitet. Sie geben der Auswahl ihren fachlichen Sinn:
   man wählt nicht "gute Leute", man deckt Anforderungen ab. Drei der sechs
   Felder sind im Bewerberfeld ausschließlich männlich besetzt — nicht als
   Trick, sondern weil die Datenlage in diesen Sparten so aussieht.         */
const FIELDS = [
  { key:"struct",  label:"Structures over live rail",
    note:"ÖBB freight trains run under the slab. Every load path has to work around them." },
  { key:"vibro",   label:"Vibration & acoustics",
    note:"Lab and lecture use requires the structure to be decoupled from the tracks." },
  { key:"fire",    label:"Fire safety & escape routes",
    note:"Railway escape routes and fire brigade access must stay clear at all times." },
  { key:"climate", label:"Climate repair & open space",
    note:"Fully sealed site. 1.5 m of substrate on concrete, 30–40% shading, rainwater management." },
  { key:"procure", label:"Procurement & cost control",
    note:"Public money, public tendering, and a budget that has to hold." },
  { key:"edu",     label:"Educational building & accessibility",
    note:"17,000 students, 1,000 pupils — and ÖNORM B 1600 across the whole site." },
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

/* ---------- Die Stationen auf der Karte ---------------------------------- */
const STATIONS = [
  { key:"board",    label:"Expert advisory board", place:"MA 21A, Rathausstraße",
    desc:"Appoint the panel that decides which design wins.", state:"done" },
  { key:"pr",       label:"Neighbours & PR",       place:"Augasse, 9th district",
    desc:"The people who will live next to a building site for four years.", state:"open" },
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
