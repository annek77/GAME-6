# Pool of Experts — draft sections for the paper

Raw text, written from the code and the design documents as they stand on 13 September 2026
(game version 20260913-1).
Sections 1–6 describe what was built and why; they do not contain a literature review, an
evaluation, or the team's reflection. Figures and legal statements are taken from `rules.js`
and the research file `recherche/Recherche_Serious-Game_Gender-Jurys-Architektur-AT.md`
(all sources retrieved 10 September 2026); nothing beyond those files has been added.
Cut, reorder and rephrase freely.

---

## 1. The game

*Pool of Experts* is a browser-based serious game about a decision that is rarely visible:
who gets to sit on the jury that chooses the design of a public building. It is set in Vienna's
9th district, on the site of the former Vienna University of Economics and Business (the
"old WU"), a 1970s concrete slab raised on a platform over the tracks of the Franz-Josefs-Bahnhof.
The city and the federal real estate company BIG are turning the site into a new education
campus; the architectural competition for it is real and, at the time of writing, undecided.

The player leads the project. The frame is deliberately larger than the topic: six stations lie
between the decision to build and the opening day — appointing the expert advisory board,
working with the neighbourhood, the building authority, partners and investors, material and
resources, and the construction itself. The prototype makes the first station fully playable,
the second station playable in three steps, and shows the remaining four as locked stations
with a preview of what would happen there. The gender dimension of jury composition is the
subject of station one; it occupies roughly a quarter of the imagined game and is never named
by the game itself until the player has made her choices.

### 1.1 Station 1 — the expert advisory board

**The brief.** A mail from the City of Vienna's competition office lists five terms. Four of
them are translated from Austrian procurement law, the profession's competition standard and
the Vienna Building Code; one is a game mechanic (a deadline with a weekly delay cost). The
fourth term reads, in full: *"A proportion of women on the jury of at least 25% and the
participation of 'young' jurors is aimed for."* It is a verbatim translation of principle (4)
in the City of Vienna's 2008 workshop report on architectural competitions (Werkstattbericht
Nr. 91, p. 9). It is not emphasised, not placed first or last, and formatted exactly like the
other four.

**The Chamber's share.** A second letter, from the Chamber of Architects and Chartered
Engineers for Vienna, Lower Austria and Burgenland, nominates three of the nine seats — a
quarter of the panel, as the competition standard requires (WSA 2022, Part B §3(6)). The
Chamber observes its own nomination guideline, which demands at least one woman among its
nominees, so one of the three is a woman. The three nominees are fixed, cannot be removed,
are paid from the project budget, and cover none of the six mandatory fields.

**The selection.** The player fills the remaining six seats from 23 candidates. The brief
requires six fields of expertise to be covered: structures over live rail, vibration and
acoustics, fire safety and escape routes, climate repair and open space, procurement and cost
control, educational building and accessibility. The fields are derived from the City's
framework resolution for the site (68th meeting of the urban development commission, STEK,
16 April 2024). Each candidate is shown with name, title and degree, specialisation, a short
biography, the fields she or he covers, a fee, and years in practice. The fee is €25,000 plus
€10,000 per seniority level — long, uninterrupted careers cost more.

Selection runs in two rounds. In the first, the deck, candidates appear one at a time and the
player says *Yes*, *Maybe* or *No*. In the second, the table, the *Yes* and *Maybe* piles are
laid out as compact cards; the *No* pile is one click away. Throughout, a fixed bar shows the
hand — nine small cards, three of them marked Chamber — the six field slots with the surname
of whoever fills them, the running total of fees, and the confirm button. A field that is not
covered is red; clicking it lists everyone in the pool who could cover it, including those
already sent to the *No* pile. The board can only be confirmed when all nine seats are filled,
all six fields are covered and the fees fit the budget.

Nothing on this screen counts, sorts or mentions gender. The candidates' gender is hidden
metadata in the data file; it is read for the first time after the board has been confirmed.

**The first session.** The confirmed board receives a formal invitation letter (in German, as
an artefact of Viennese administration) and meets in the Expert Pool. The scene shows two rows
of changing-room cabins — women's and men's — with exactly as many cabins as there are people.
There are no prepared seats, no empty slots, no verdict; the two rows next to each other are the
whole picture.

**The outside world reacts.** A week later the board is public. A newspaper page appears —
which paper, and how hard the headline, depends on how many women sit on the board: at one
woman, the *Kronen Zeitung* front page ("Alte WU: Neun Köpfe, eine einzige Frau"), a question
tabled in the district council and the first question at the press conference; at two, a
commentary in *Der Standard*; at three, a note in the *Falter* with a written question from a
councillor; at four or more, a short report on the local pages. If every woman on the board was
nominated by the Chamber, one more voice notes that. The player's reputation drops by 30, 18, 8
or 3 points respectively. The game itself passes no judgement; it shows how other people look.

**"That was in your briefing."** The original mail is shown again, term four highlighted in
yellow. Two figures stand next to it: *3* — at least 25% of nine jurors, term 4 of the brief —
and the number of women on the player's board, with a note on how many of them came from the
Chamber.

**Four ways to go on.** None is required, each costs something different.
*Look abroad*: an enquiry to the competition office takes two weeks (€100,000 in delay costs),
draws a headline, and is answered with the competition standard — half of the jury must hold
the qualification required of entrants, here an Austrian licence; four seats could be filled
from abroad, through a new search on the same terms as any other replacement. Nothing in the
pool changes.
*Reopen the search*: the table opens again with the current board; every replacement is a new
search costing two weeks of delay plus the difference in fees. The Chamber's seats stay locked.
*Sit it out*: the board stays; reputation drops another ten points; nothing else happens.
*Do something alongside*: the board stays and the player funds one of five measures — a woman
appointed as substitute juror (€15,000; attends, does not vote), a girls' café in the ground
floor (€180,000), an on-site kindergarten (€340,000), five years of funding for a neighbourhood
youth centre (€260,000), or a mentoring programme for young architects at the Chamber
(€90,000). The substitute is listed like the others, without comment.

**The real jury.** Station one closes with the player's board next to the actual jury of the
Campus Althangrund competition, in the same table format: Chamber-nominated jurors,
specialist jurors, lay jurors. The real panel has 14 full jurors, four of them women; both
women among the specialist jurors were nominated by the Chamber, and none of the seven other
specialist jurors is a woman. Three documented figures follow — 57.6% of architecture
enrolments in Austria are women; 22.7% of licensed architects in Vienna, Lower Austria and
Burgenland are women (6.1% of licensed engineering consultants); 0 of 7 specialist jurors on
the real panel are women — each with its source. A *Read more* button opens an optional
dossier of eight short notes; *Continue* returns to the map.

### 1.2 Station 2 — the neighbourhood

Three steps: a decision on information (street party, information container, street-art
strip, or nothing), a fixed event (whatever was planned lands in July; wait two weeks for full
effect or go ahead half-empty), and a decision on access — a district councillor asks in
writing how people with wheelchairs, prams and walking frames will cross the platform during
four years of construction. §115 of the Vienna Building Code covers the finished building; it
does not cover the building site. The player can fund a temporary ramp and lift (€90,000),
signpost a detour through the station, or defer the question to the new building.

### 1.3 Stations 3–6, the ending

The map that connects the stations doubles as the project's task list. Every station card
carries two or three to-do lines — for the board: nine seats, six fields covered, within
budget; for the neighbourhood: inform the neighbours, access across the platform during
construction; for the locked stations: what would have to be done there. Lines tick off from
the game state, so the map always shows where the project stands and what is still open. A
strip of six numbered stations under the cockpit repeats this on every screen.

The four remaining stations are locked. Each can be opened as a preview: two sentences on the
situation, three greyed-out decisions with prices, and a line showing what the player's board
already implies there. Before the ending, a screen bills these stations in one line each:
expertise missing from the board is bought in (no rail-infrastructure specialist → an external
ÖBB assessment, €120,000; no BIM coordinator → €60,000), expertise present saves money or keeps
a feature.

The building always gets built. Its finish depends on what is left of the €3,000,000 budget
for fit-out and ancillary costs: oak parquet, green roof and a neighbourhood café at the top
tier; grey screed, a gravel roof and a ground floor left as a shell at the bottom. Two sentences
stand next to each other without comment — what the player did about the board ("The girls'
café opened in May. 340 visitors in the first month.") and who decided the design ("The design
was chosen by 8 men and 1 woman. She was nominated by the Chamber.").

---

## 2. Design rationale

### 2.1 The subject is a station, not the game

The first prototype (June 2026) was a game about jury composition and nothing else. Playtests
at the university produced one usable observation: when the jury was complete, a player wanted
to go on and build the building. The redesign took that literally. The player's goal is the
campus; the board is the first of six things she has to do to get there. This changes the
character of the gender dimension from the topic of the game to a decision embedded in a
larger project — which is where such decisions are made in practice. The locked stations are
part of the statement: they show the size of the real job, and they let consequences of the
board decision surface later, in places that have nothing to do with gender.

### 2.2 The game never names the subject before the player has acted

No screen before the newspaper page counts women, mentions balance, quotas or equality, or
gives a hint. The one exception is term four of the brief, which is deliberately not disguised:
it says "women" and "25%" because the original document does. It works not by hiding but by
being one of five equally dry administrative sentences — and by the well-documented fact that
nobody reads administrative prose. A design that softened or reworded the term would have
undermined the paper's claim that the game's rules are real. A design that highlighted it would
have made the game a test of attention rather than of priorities.

### 2.3 The outside world reacts, not the rule

The research found no enforceable gender requirement for Austrian competition juries. The
Federal Procurement Act (§165 BVergG 2018) asks only for independence and qualification. The
profession's competition standard (WSA 2022) speaks of women and diversity in its foreword,
preamble and Part A — not in Part B §3, the section that governs jury composition. The City of
Vienna's 25% figure is a target in the principles chapter of a 2008 report, "aimed for", with
no deadline and no sanction. The only sanction anywhere is reputational: the Chamber withdraws
its cooperation and marks the competition as such online. The game reproduces this exactly.
There is no penalty, no authority withholding funds, no game-over. What reacts is a newspaper,
a district councillor, a press conference. Every cost that follows is voluntary — the delay of
another search, the money for a measure, the reputation lost by doing nothing — and the money
comes from the same pot that later pays for parquet or linoleum.

### 2.4 Every way forward is legitimate

The four ways are presented as equals, in the same card format, with no recommended option.
The substitute juror is the cheapest measure and is listed first, without irony. It corresponds
to the only "must" rule in Austria — the Chamber's guideline that at least one woman belong to
the jury as a full or substitute juror — which is satisfiable without a woman voting. The game
does not comment on this. At the end it states who decided, and that the substitute did not
vote. The judgement, if any, is the player's.

### 2.5 The Chamber's share

Modelling the Chamber's quarter of the seats was a late addition and, in the authors' view, the
most consequential one. It makes the game's minimum one woman rather than zero — as in reality,
where the guideline is always met by the Chamber's own nominees — and it reproduces the
structure of the actual Althangrund panel, where both women among the specialist jurors came
through the Chamber. In the game, a board selected purely on the six fields typically ends with
one woman, and the newspaper caption notes that she was not the project's choice.

### 2.6 Fees tied to seniority

Each board member costs €25,000 plus €10,000 per level of seniority. This is the one place
where the profiles' signals still act mechanically. Seniority — years of uninterrupted practice
— is the criterion that most reliably favours men in a profession with the career pattern
documented in section 3. The consequence is not announced but arithmetical: a player who
economises on fees ends up with more women (see section 4).

### 2.7 Echoes

Seven "echoes" tie the board to later stations. They are all keyed to expertise stated in the
candidates' biographies, never to gender: a participation specialist on the board makes
neighbourhood measures 30% cheaper; a cost-control specialist lowers the weekly delay cost from
€50,000 to €40,000; a missing rail-infrastructure specialist means an external assessment
(€120,000); a missing BIM coordinator means bought-in coordination (€60,000); a roof-greening
specialist keeps the green roof one budget tier longer; an interiors specialist keeps floors and
lighting; a prefabrication specialist returns €100,000. Because climate and participation
expertise sit mostly with the women in the candidate pool, a board optimised on "experience"
tends to pay for its composition at the end — without the game ever saying so.

### 2.8 No defeat

The building is always finished. Loss materialises as the quality of the result, not as a
game-over. This keeps the player in the position of a project lead who did what was possible
and pays for it out of the money she wanted to build with — the sentence the design document
gives as the intended takeaway: *You did nothing wrong. You did what was possible. The bill
still stands, and you pay it from the money you meant to build with.*

### 2.9 What the game deliberately does not do

It does not randomise. All events are fixed, so that the cost of every choice is legible and
comparable between players. It does not model disruptors, negotiations or the four locked
stations as play. It does not name the architects of the original building, because the only
source at hand is secondary. It does not use the widely quoted "15% of Austrian architects are
women" figure, which could not be traced to a citable source.

---

## 3. Fact base

Every rule, figure and quotation in the game is documented. The following table maps each
element of the game to its source and its function. Sources were retrieved on 10 September 2026;
the STEK document was re-checked against the original PDF on 11 September 2026.

| Element in the game | Source | Function in the game |
|---|---|---|
| Term 2: odd number of jurors, at least five; at least half must hold the entrants' qualification | Wettbewerbsstandard Architektur (WSA) 2022, Part B §3(3) and (4) | Fixes the panel at nine; grounds the answer to the "look abroad" enquiry |
| Term 3: barrier-free educational buildings, accessible toilets on every floor, certification on completion | Bauordnung für Wien §115(1) no. 3 and (6); OIB-Richtlinie 4 (May 2023) via WBTV 2023 | Brief; station 2 access question (the code covers the building, not the site) |
| Term 4: "A proportion of women on the jury of at least 25% and the participation of 'young' jurors is aimed for." | Stadt Wien, MA 18: Werkstattbericht Nr. 91 (June 2008), ch. I, principle (4), p. 9 | The sentence the game turns on; target of 3 of 9 |
| Term 5: independence from entrants, written declaration | BVergG 2018 §165(4); WSA 2022 Part B §3 | Brief |
| Term 1: deadline 1 March 2027, €50,000 per week of delay | — (game mechanic) | Cost of time |
| Chamber nominates at least a quarter of voting jurors | WSA 2022, Part B §3(6) | Three of nine seats fixed |
| At least one woman among the Chamber's nominees, as full or substitute juror | zt:Kammer Ost, guidelines for the nomination of jurors (website, 10 Sept 2026) | One Chamber nominee is a woman; the substitute measure |
| No legal sanction; only withdrawal of Chamber cooperation and public marking | WSA 2022, Part A Art. X(3); BVergG 2018 §165 | Design principle: the outside world reacts, all costs are voluntary |
| Six mandatory fields: rail, vibration, fire, climate, procurement, education | 68. STEK, 16 April 2024, slides 12, 13, 15 (1.5 m substrate on ≥10% of roofs/slab; 30%/40% shading; rainwater; vibrations from rail operation; c. 17,000 students) | The selection task |
| Real jury: 14 full jurors, 4 women; Chamber 2/0, specialist 0/7, lay 2/3; substitutes 1/1; names of the four women | architekturwettbewerb.at, competition "Campus Althangrund" (10 Sept 2026) | Closing comparison of station 1; figure "0 of 7" |
| Competition launched 6 Aug 2025 by BIG; first jury session 25–27 Feb 2026; decision end of 2026; occupation from 2032 | TED notice 515101-2025; architekturwettbewerb.at; Stadt Wien project page (6 July 2026) | Framing text; "Opening day 2032" |
| 57.6% of architecture enrolments are women (WS 2025/26) | BMFWF/unidata, ISCED-F 0731, studies not persons | Closing figure; dossier |
| 54.3% of architecture degrees go to women (2024/25) | BMFWF/unidata, table 4.6 | Dossier |
| 22.7% of licensed architects and 6.1% of licensed engineering consultants in Vienna/Lower Austria/Burgenland are women (2025) | Kammer Wien/NÖ/Bgld, Jahresbericht 2025, p. 2 | Closing figure; dossier |
| The Chamber's 2019 survey of 387 jurors did not record gender | IMAD Marktforschung, final report April 2019 (for bAIK) | Dossier: no Austrian statistic on women in juries exists |
| Equal success rates (18%/17%), half the direct invitations (11% vs 22%) | ARCH-E, Architects' Needs Report (2024), p. 52 | Dossier: the gap is access, not judgement |
| Vienna mandates parity for internal commissions, not for juries | Wiener Gleichbehandlungsgesetz §9(1) | Dossier |

The game's own texts — newspaper headlines, the voices at the press conference, the measures'
descriptions, the station previews, the four finish descriptions — are fiction and are marked
as such in the design document.

---

## 4. Balancing

To check that the selection task produces the intended tension without steering, the candidate
pool was simulated with 2,000 boards per strategy (six own seats, plus the Chamber's three
nominees including one woman). A "strategy" is a rule for filling the six seats so that all
fields are covered.

| Strategy | Women on the board (mean) | Reaches 3 (25%) |
|---|---:|---:|
| Highest assertiveness and availability | 1.0 | never |
| Highest seniority | 1.8 | 16% |
| Random valid board | 2.3 | 36% |
| Broadest coverage (multi-field candidates first) | 2.6 | 53% |
| Cheapest coverage | 3.0 | always |
| Highest public-good fit | 3.6 | always |

Two observations. A player who chooses by "experience", or who simply picks a valid board,
ends below the 25% target about two thirds of the time — the newspaper reaction is the common
case, not an edge case. And the cheapest valid board always reaches the target, because the
women in the pool have shorter careers and therefore lower fees. This was not designed; it
follows from tying fees to seniority, and it is true of the profession the pool models. The
game does not point it out.

The pool itself (26 profiles, 6 women, 20 men) predates the redesign. Three of the six fields
— rail structures, vibration and fire safety — are covered only by men; climate is covered
mostly by women. The design document treats this as a representation of the field rather than
a device, and the simulation confirmed that the distribution did not need adjusting.

---

## 5. Implementation

The game is a static web page: HTML, CSS and JavaScript, no build step, no backend, no
account, hosted on GitHub Pages. It separates data from logic: `data.js` holds the 26
profiles; `rules.js` holds everything factual and tunable (budget, fees, the brief's terms, the
Chamber rule, fields, measures, stations, echoes, previews, the real jury, figures, sources,
dossier); `art.js` holds all illustrations as inline SVG, drawn in a flat, thick-ink style with
a limited palette; `sound.js` generates all sounds with the Web Audio API (no audio files);
`game.js` holds the screens and state. Cache-busting version parameters ensure that players
always load the current files.

Illustrations are drawn in code so that they can vary with the game state: the old WU by day
and at night, the new campus in four finishes with features (roof, ground floor, trees) that
respond to budget tier and board echoes, four newspaper front pages, the Expert Pool.
German headlines in the newspapers are deliberate: they are Viennese artefacts.

Accessibility: the candidate deck responds to keys (Y/M/N, arrow left); cards on the table are
focusable and toggle with Enter or Space, with `aria-pressed` state; the cockpit is an
`aria-live` region; focus is visible throughout; `prefers-reduced-motion` disables animation;
sound is optional and remembered. The layout adapts to phone width.

Testing: a headless test harness (jsdom) plays four complete paths on every change — one woman
with abroad enquiry, repair and consultants; two women with sit-out; three women with the
substitute at a tight budget; four women with the kindergarten and the participation echo — and
checks bookkeeping (budget, categories, delay weeks, reputation) against the state at every
step, along with the deck, the table, keyboard input, the popover and the test entry points.
For reviewers, appending `#pr`, `#options`, `#realworld`, `#latestations` or `#outro` to the URL
starts the game at that screen with a pre-filled board.

---

## 6. Status and limitations

The prototype was built between 10 and 13 September 2026 on the basis of a design session on
10 September and a fact research completed the same day. Station one is complete; station two
is playable; stations three to six are previewed but not playable; the ending exists.

Known limitations:

- The candidate profiles were written for the first prototype and have not been fully audited.
  Five of the six women carry the highest "prestige" signal; the signal is no longer shown in
  the interface, but it remains in the data. Biography lengths differ.
- All events are fixed. The disruptor system sketched in the design document (weather, finds,
  supply, sponsorship) is not implemented.
- The four locked stations exist as previews and one-line bills only.
- Emergency renegotiation of the budget (design document §5) is not implemented; the budget
  cannot fall below zero, and consultants' costs are floored at the remaining budget.
- Reputation is displayed but does not yet cost money at later stations, as the design document
  intends.
- The game uses woman/man as simplified analytical categories to make one form of selection
  bias visible; it does not claim that gender is binary. This is stated in the dossier.
- The student figures count enrolments, not persons (unidata does not publish the field by
  person). This is stated in the dossier.
- The 2008 workshop report has not been re-issued since the 2018 procurement act; whether an
  updated version exists could not be established.

---

## Appendix A — playtest instrument

Players were asked to play once without explanation and to note, in keywords:

1. Where did you get stuck? Screen and last click.
2. When did you realise what the game is about — and what gave it away?
3. What would you have chosen differently, had you known?
4. How many women were on your board, and did you think about gender while choosing?
5. Which of the four ways did you take, and why?
6. What was your building at the end, and did it feel earned?
7. One sentence: what stays with you?

Reviewers were additionally asked to check the game's own texts for four things: whether any
text before the newspaper page gives the subject away; whether the game passes judgement
anywhere; whether the substitute-juror measure is presented without irony; and whether the
German headlines sound like the papers they imitate.
