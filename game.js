/* ==========================================================================
   POOL OF EXPERTS — game.js
   Flow: intro → brief → ONE selection (grid + field checklist) → letter →
         pool reveal → the outside world reacts → the brief again, one line marked
         → three ways (repair under
         pressure / sit it out / fund something alongside) → map (station 2:
         neighbours & PR, four stations locked) → outro
   The former second round ("applications under pressure") is gone. Its
   pressure-event screens (kitchen, press, holiday, abroad enquiry) are
   parked below, unreachable, until a later step decides on them.
   Load order (index.html): data.js → rules.js → art.js → game.js.
     data.js  — the 26 profiles, criteria, Vienna mails
     rules.js — money (WEEK_COST, JURY_SIZE, …), brief terms, fields, measures
     art.js   — every SVG illustration
   The former draft-*.js monkey-patches are merged in here.
   ========================================================================== */

const PHASES = [
  ["intro",  "Start"],
  ["p1",     "1 · The board"],
  ["reveal", "2 · The pool"],
  ["map",    "3 · The project"],
  ["outro",  "4 · What happened"],
];
/* which phase a sub-screen belongs to in the phase bar */
const PHASE_OF = { confirm:"p1", sendletter:"p1", intermezzo:"p1",
  reaction:"reveal", briefreveal:"reveal", options:"reveal", repaired:"reveal",
  pr:"map", reflect:"outro" };

function freshSpend(){ const o={}; SPEND_CATS.forEach(c=>o[c.key]=0); return o; }
function freshStations(){ const o={}; STATIONS.forEach(st=>o[st.key]=st.state); return o; }
const state = {
  screen:"intro",
  order:[],                    // shuffled profile ids for the grid
  selected:new Set(),          // the selection in progress
  invited:[],                  // the confirmed board (ids)

  // the brief as it was sent: term keys in the order shown. Fixed order —
  // the fourth position is the point. The reveal re-renders exactly this.
  briefTerms:BRIEF_TERMS.map(t=>t.key),

  // after the board is public: how the outside world reacted, what you did about it
  reactionTier:null,           // 0..3, see REACTIONS
  chamberOk:true,              // false when no woman sits on the board (CHAMBER_RULE)
  response:null,               // "repair" | "sitout" | "compensate"
  compensation:null,           // key from COMPENSATIONS
  repairing:false, repairBase:[], repairSwaps:0,

  // the project map: station key → "done" | "open" | "locked"
  stations:freshStations(),
  prAction:null,               // key from PR_ACTIONS

  budget:BUDGET_START,
  spend:freshSpend(),          // per SPEND_CATS key
  delayWeeks:0, extensions:0, rep:100,
  hudSeen:{ time:false, rep:false },   // gauges appear once their dimension matters

  // parked pressure events
  candidates:[],
  kitchenShown:false, holidayShown:false, foreignersShown:false,
};

const stage = document.getElementById("stage");
const phasebar = document.getElementById("phasebar");

/* ---------- helpers ---------- */
function byId(id){ return PROFILES.find(p=>p.id===id); }
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function el(h){const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstElementChild;}
function countInvited(){
  let w=0,m=0; state.invited.forEach(id=>{ byId(id).gender==="woman"?w++:m++; }); return {w,m};
}
const eur = n => "€"+n.toLocaleString("en-GB");
const feesOf = idSet => [...idSet].reduce((sum,id)=>sum+expertFee(byId(id)),0);
/* every euro leaves through here: category for the cockpit, budget for the ending */
function spend(cat,amount){
  state.spend[cat]=(state.spend[cat]||0)+amount;
  state.budget-=amount;
  hudFlash("g-money"); renderHUD();
}

function renderPhasebar(){
  phasebar.innerHTML="";
  const cur = PHASE_OF[state.screen] || state.screen;
  const idx = PHASES.findIndex(p=>p[0]===cur);
  PHASES.forEach(([key,label],i)=>{
    const b=document.createElement("b"); b.textContent=label;
    if(i===idx) b.classList.add("on"); else if(i<idx && idx>=0) b.classList.add("done");
    phasebar.appendChild(b);
  });
  phasebar.style.display = state.screen==="intro" ? "none":"flex";
}
function go(screen){
  state.screen=screen; renderPhasebar(); renderHUD(); stage.scrollTop=0;
  ({ intro:rIntro, p1:rPhase1, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
     reveal:rReveal, reaction:rReaction, briefreveal:rBriefReveal, options:rOptions, repaired:rRepaired,
     map:rMap, pr:rPR,
     outro:rOutro, reflect:rReflect })[screen]();
}

/* ---------- HUD ---------- */
const HUD_SCREENS  = new Set(["p1","confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","repaired","map","pr","outro","reflect"]);
const FEED_SCREENS = new Set(["confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","repaired","map","pr","outro","reflect"]);
function hudDeadline(){
  const d=new Date(2026,7,1); d.setDate(d.getDate()+state.delayWeeks*7);
  return "deadline: "+d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
const repWord  = ()=> state.rep>=80?"Solid":state.rep>=55?"Shaky":state.rep>=30?"Damaged":"In crisis";
const repColor = ()=> state.rep>=80?"var(--ok)":state.rep>=55?"var(--gold)":state.rep>=30?"var(--warn)":"var(--danger)";
function hudFlash(id){const g=document.getElementById(id);if(!g)return;g.classList.remove("gflash");void g.offsetWidth;g.classList.add("gflash");}
function renderHUD(){
  const show = HUD_SCREENS.has(state.screen);
  document.getElementById("hud").style.display  = show ? "flex" : "none";
  document.getElementById("feed").style.display = FEED_SCREENS.has(state.screen) ? "flex" : "none";
  if(!show) return;
  const spent = BUDGET_START-state.budget;
  document.getElementById("hud-money").textContent   = eur(state.budget);
  document.getElementById("hud-spent").textContent   = spent>0 ? eur(spent)+" spent of "+eur(BUDGET_START) : "nothing spent yet";
  // schedule and reputation stay hidden until they first move
  document.getElementById("g-time").hidden = !state.hudSeen.time;
  document.getElementById("g-rep").hidden  = !state.hudSeen.rep;
  document.getElementById("hud-weeks").textContent   = state.delayWeeks ? "+"+state.delayWeeks+"w late" : "on time";
  document.getElementById("hud-deadline").textContent= hudDeadline();
  document.getElementById("hud-repword").textContent  = repWord();
  const f=document.getElementById("hud-repfill"); f.style.width=state.rep+"%"; f.style.background=repColor();
}
function hudAddDelay(weeks){ state.delayWeeks+=weeks; state.hudSeen.time=true; spend("delay",weeks*WEEK_COST); hudFlash("g-time"); }
function hudAddRep(delta){ state.rep=Math.max(0,Math.min(100,state.rep+delta)); state.hudSeen.rep=true; hudFlash("g-rep"); renderHUD(); }
function hudFeed(src,text){ document.getElementById("feed").innerHTML=`<span class="src">${src}</span> — <b>${text}</b>`; }

/* ---------- Vienna email helper ---------- */
function viennaMail(which, ctaLabel, onCta, secondary){
  const m = VIENNA[which];
  const wrap = el(`<div>
    <div class="mail">
      <div class="from">
        <div class="crest">WIEN</div>
        <div class="who">Stadt Wien<small>Competition Office</small></div>
      </div>
      <div class="subject">${m.subject}</div>
      <div class="body">${m.body}</div>
    </div>
    <div class="btnbar"></div>
  </div>`);
  const bar = wrap.querySelector(".btnbar");
  if(secondary){
    const s=el(`<button class="btn ghost">${secondary.label}</button>`);
    s.onclick=secondary.onClick; bar.appendChild(s);
  }
  const c=el(`<button class="btn">${ctaLabel}</button>`); c.onclick=onCta; bar.appendChild(c);
  return wrap;
}

/* ---------- The briefing mail — five terms, one voice, no emphasis ----------
   Texts come verbatim from BRIEF_TERMS (rules.js); every one carries a source
   that the paper cites, so nothing here is reworded. `highlight` (a term key)
   is only used by the reveal, which shows the same mail again.               */
function briefMail({ctaLabel, onCta, highlight=null, intro=true}={}){
  const terms = state.briefTerms.map(k=>BRIEF_TERMS.find(t=>t.key===k));
  const items = terms.map((t,i)=>`<li class="term${t.key===highlight?" hl":""}"><span class="no">${i+1}.</span><span class="tx">${t.text}</span></li>`).join("");
  const wrap = el(`<div>
    <div class="mail brief">
      <div class="from">
        <div class="crest">WIEN</div>
        <div class="who">Stadt Wien<small>Competition Office · MA 21A</small></div>
      </div>
      <div class="subject">Campus Althangrund — constitution of the expert advisory board</div>
      <div class="body">
        ${intro?`<p>Dear colleague,</p>
        <p>the City of Vienna entrusts you with constituting the expert advisory board for the
        Campus Althangrund competition on the site of the former WU, Augasse, 1090 Vienna.
        A budget of ${eur(BUDGET_START)} is available for fees and ancillary costs.</p>
        <p>Please observe the following terms of the brief:</p>`:""}
        <ol class="terms">${items}</ol>
        ${intro?`<p>Kind regards,<br>Stadt Wien, Competition Office</p>`:""}
      </div>
    </div>
    <div class="btnbar"></div>
  </div>`);
  if(ctaLabel){ const c=el(`<button class="btn">${ctaLabel}</button>`); c.onclick=onCta; wrap.querySelector(".btnbar").appendChild(c); }
  return wrap;
}

/* ========================================================================
   INTRO — multi-beat opening scene (the Alte WU place-setter)
   Ported from wu-opening-scene.html. Plays first, before phase 1; the final
   CTA hands off into the brief via go("p1"), exactly like the old single slide.
   NO theme spoilers: no "bias", "gender", "discrimination", "quota", ratios.
   ======================================================================== */

/* the narrative beats: building, history, the people, the neighbourhood, your part */
const BEATS = [
  {
    label:"AUGASSE · 9th DISTRICT",
    art: ALTEWU_SVG,
    h:"There is a building over the tracks",
    body:`
      <p class="lede">In Vienna's 9th district, Alsergrund, the Augasse runs quietly past
      ordinary blocks until the ground simply lifts. A long concrete structure stands raised
      on a platform — the locals call it <em>die Platte</em> — bridging the railway lines of the
      Franz-Josefs-Bahnhof some metres above the street.</p>
      <p class="lede">Trains still move through the shadow beneath it. For decades, students moved
      through the floors above. People who grew up here just call it <strong>the old WU</strong>.</p>`
  },
  {
    label:"1975 — TODAY",
    h:"A campus the city built, then outgrew",
    body:`
      <p class="lede">It went up in the mid-1970s as the railway platform was constructed,
      and from 1982 it housed the Vienna University of Economics and Business.
      <!-- TODO: verify / fill from briefing — architects (briefing names "Büro Kurt Hlaweniczka" but flags as unverified) --></p>
      <p class="lede">The WU moved on to a new campus in 2013. The University of Vienna held part of it
      until 2021. Then the lecture halls fell silent. The signs came down, the corridors emptied,
      and a building made for tens of thousands of people was left waiting — half in use, half asleep.</p>`
  },
  {
    label:"GENERATIONS",
    h:"Almost everyone here knows it",
    body:`
      <p class="lede">Ask around the Augasse and the stories come easily. The first exam taken on the
      upper floors. The coffee from the machine that never quite worked. The friends made in a stairwell,
      the all-nighters, the graduation walked out through those doors.</p>
      <p class="lede">It was never a postcard. It was a place that decades of ordinary life passed through —
      and the kind of building a neighbourhood quietly measures itself against, even when it's standing empty.</p>`
  },
  {
    label:"NOW",
    h:"And now its future is open",
    body:`
      <p class="lede">The city has decided: the old WU will not stay as it is. The plan is to turn
      this concrete island over the tracks into a new education campus — open to the street again,
      greener, made for many thousands of people once more.</p>
      <p class="lede">But what it becomes is not yet decided. A competition is under way to choose the
      vision that wins. And a competition needs a jury — a small group of experts trusted to decide,
      on everyone's behalf, what this piece of Vienna turns into next.</p>`
  },
  {
    label:"YOUR PART",
    h:"That jury is your job",
    body:`
      <p class="lede">Choosing those experts is the task in front of you. You have a shortlist of
      candidates, a budget, and a deadline. The city is watching. The clock is already running.</p>
      <p class="lede">Pick the best people. That's the whole job.</p>`,
    cta:true
  }
];

let introStep=0;

function rIntro(){
  stage.innerHTML="";
  const b = BEATS[introStep];
  const last = introStep === BEATS.length - 1;

  const wrap = el(`<div class="slide fadein"></div>`);
  wrap.appendChild(el(`<div class="beatlabel">${b.label}</div>`));
  if(b.art) wrap.appendChild(el(`<div class="art">${b.art}</div>`));
  wrap.appendChild(el(`<h1>${b.h}</h1>`));
  const bodyHost = el(`<div></div>`);
  bodyHost.innerHTML = b.body;
  while(bodyHost.firstChild) wrap.appendChild(bodyHost.firstChild);

  // progress dots
  const nav = el(`<div class="dotnav"></div>`);
  BEATS.forEach((_,i)=>nav.appendChild(el(`<i class="${i===introStep?"on":""}"></i>`)));
  wrap.appendChild(nav);

  // buttons
  const bar = el(`<div class="btnbar"></div>`);
  if(introStep > 0){
    const back = el(`<button class="btn ghost">Back</button>`);
    back.onclick = ()=>{ introStep--; rIntro(); };
    bar.appendChild(back);
  }
  if(!last){
    const next = el(`<button class="btn">Continue →</button>`);
    next.onclick = ()=>{ introStep++; rIntro(); };
    bar.appendChild(next);
  } else {
    // final CTA — hands off into Phase 1, exactly like the old intro
    const goBtn = el(`<button class="btn" id="go">Open the brief</button>`);
    goBtn.onclick = ()=>{ introStep=0; go("p1"); };
    bar.appendChild(goBtn);
  }
  wrap.appendChild(bar);
  stage.appendChild(wrap);
}

/* ========================================================================
   THE SELECTION — one round, all 26 visible, six required fields to cover.
   You don't collect "good people", you cover the brief. Each member costs a
   fee (rules.js: expertFee, tied to seniority). Nothing else is counted here.
   ======================================================================== */
function rPhase1(){
  stage.innerHTML="";
  stage.appendChild(briefMail({ctaLabel:"Start choosing", onCta:()=>renderHandPick()}));
}

/* Also the repair screen: with state.repairing the grid opens pre-filled with
   the current board, and every replacement costs REPAIR_WEEKS of delay. */
const REPAIR_WEEKS = 2;
function repairSwaps(){ return [...state.selected].filter(id=>!state.repairBase.includes(id)).length; }

function renderHandPick(){
  stage.innerHTML="";
  if(state.order.length===0) state.order=shuffle(PROFILES.map(p=>p.id));

  const bar=el(`
    <div class="selbar">
      <div class="counter"><span id="cnt">0</span>/${JURY_SIZE}<small>chosen</small></div>
      <div class="checklist" id="checklist"></div>
      <div class="fees" id="fees"></div>
      <button class="btn" id="confirm" disabled>Confirm jury</button>
    </div>`);
  stage.appendChild(bar);
  const list=bar.querySelector("#checklist");
  FIELDS.forEach(f=>list.appendChild(el(`<span class="field" data-k="${f.key}" title="${f.note}"><i></i>${f.label}</span>`)));

  stage.appendChild(el(state.repairing
    ? `<p class="hint wide">Replace whoever you want. Every replacement means a new search: ${REPAIR_WEEKS} weeks and ${eur(REPAIR_WEEKS*WEEK_COST)} each. The six fields still have to be covered.</p>`
    : `<p class="hint wide">The brief requires all six fields to be covered. Tap a card to add or remove someone.</p>`));
  const grid=el(`<div class="grid" id="grid"></div>`);
  state.order.forEach(id=>grid.appendChild(makeCard(byId(id))));
  stage.appendChild(grid);
  document.getElementById("confirm").onclick=onConfirmHandPick;
  refreshSel();
}

function makeCard(p){
  const c=el(`
    <div class="card${state.selected.has(p.id)?" sel":""}" data-id="${p.id}">
      <div class="nm">${p.name}</div>
      <div class="ti">${p.title} · ${p.edu}</div>
      <div class="sp">${p.spec}</div>
      <div class="bio">${p.bio}</div>
      <div class="fields"></div>
      <div class="crit"></div>
      <div class="fee">Fee ${eur(expertFee(p))}</div>
    </div>`);
  const fl=c.querySelector(".fields");
  fieldsOf(p.id).forEach(k=>{
    const f=FIELDS.find(x=>x.key===k);
    fl.appendChild(el(`<span class="ftag" data-k="${k}">${f.label}</span>`));
  });
  const crit=c.querySelector(".crit");
  CRITERIA.forEach(cr=>{
    crit.appendChild(el(`<span class="chip shown" data-k="${cr.key}">${cr.label} <span class="val">${"●".repeat(p.sig[cr.key])||"–"}</span></span>`));
  });
  crit.appendChild(el(`<span class="chip comp shown">${COMPETENCE.label} <span class="val">${"●".repeat(p.sig.publicValue)||"–"}</span></span>`));
  c.onclick=()=>toggleCard(p,c);
  return c;
}

function toggleCard(p,c){
  if(state.selected.has(p.id)){ state.selected.delete(p.id); c.classList.remove("sel"); }
  else{
    if(state.selected.size>=JURY_SIZE){ flashFull(); return; }
    state.selected.add(p.id); c.classList.add("sel");
  }
  refreshSel();
}

function refreshSel(){
  const n=state.selected.size;
  document.getElementById("cnt").textContent=n;
  const cov=coverageOf(state.selected), missing=missingFields(state.selected);
  document.querySelectorAll("#checklist .field").forEach(f=>f.classList.toggle("ok",!!cov[f.dataset.k]));
  const c=document.getElementById("confirm");
  const ready = n===JURY_SIZE && missing.length===0;
  c.disabled=!ready;
  if(state.repairing){
    const sw=repairSwaps(), delta=feesOf(state.selected)-feesOf(new Set(state.repairBase));
    document.getElementById("fees").innerHTML=`Delay <b>+${sw*REPAIR_WEEKS} weeks · ${eur(sw*REPAIR_WEEKS*WEEK_COST)}</b><small>fees ${delta>=0?"+":"−"}${eur(Math.abs(delta))} · budget ${eur(state.budget)}</small>`;
    c.textContent = !ready ? (n<JURY_SIZE ? `Pick ${JURY_SIZE-n} more` : `${missing.length} field${missing.length>1?"s":""} not covered`)
                  : sw===0 ? "Keep the board as it is"
                  : `Confirm ${sw} replacement${sw>1?"s":""} (+${sw*REPAIR_WEEKS}w)`;
    return;
  }
  document.getElementById("fees").innerHTML=`Fees <b>${eur(feesOf(state.selected))}</b><small>budget ${eur(state.budget)}</small>`;
  c.textContent = ready ? "Confirm jury"
                : n<JURY_SIZE ? `Pick ${JURY_SIZE-n} more`
                : `${missing.length} field${missing.length>1?"s":""} not covered`;
}
function flashFull(){
  const bar=document.querySelector(".selbar");
  bar.style.borderColor="var(--danger)";
  setTimeout(()=>bar.style.borderColor="var(--ink)",1200);
}

/* Confirming is the moment the money moves: fees leave the budget, category "experts". */
function onConfirmHandPick(){
  if(state.selected.size!==JURY_SIZE || missingFields(state.selected).length) return;
  if(state.repairing){
    const sw=repairSwaps();
    spend("experts",feesOf(state.selected)-feesOf(new Set(state.repairBase)));
    if(sw>0) hudAddDelay(sw*REPAIR_WEEKS);
    state.invited=[...state.selected]; state.repairSwaps=sw; state.repairing=false;
    go("repaired"); return;
  }
  state.invited=[...state.selected];
  spend("experts",feesOf(state.selected));
  go("confirm");
}

/* ========================================================================
   THE OUTSIDE WORLD REACTS — press, district council, press conference.
   Not the game, not a rule: people look at the photo and count. Always
   happens; only the volume scales with the count. No verdict from the game.
   ======================================================================== */
const REACTIONS = [
  { min:0, rep:-30, masthead:"KRONEN ZEITUNG", mastColor:"#d81e2c", paper:"#fffdf6",
    line:w=>[ "Alte WU: Neun Köpfe,", w===0?"keine einzige Frau":"eine einzige Frau" ],
    sub:"Bezirksrat Alsergrund fordert Aufklärung vom Wettbewerbsbüro.",
    feed:["Kronen Zeitung", "Alte WU: Neun Köpfe, kaum Frauen"],
    voices:[
      ["Page one", "The photo from the first session runs on the front page. Nine chairs. The caption counts them."],
      ["District council", "A councillor tables a question for the next Alsergrund district council: on what basis the board was composed."],
      ["Press conference", "At the project press conference, the first question is not about the building."],
    ]},
  { min:2, rep:-18, masthead:"derStandard", mastColor:"#7a3b8f", paper:"#fbe9df",
    line:w=>[ "Wer entscheidet über", "die neue Alte WU?" ],
    sub:"Kommentar: Ein Beirat, der aussieht wie die Branche – zwei Frauen, sieben Männer.",
    feed:["Der Standard", "Wer entscheidet über die neue Alte WU?"],
    voices:[
      ["Commentary", "A columnist runs the numbers of your board next to the numbers of the profession. They match. That is her point."],
      ["Press conference", "Two questions on the composition of the board, one on the building."],
    ]},
  { min:3, rep:-8, masthead:"FALTER", mastColor:"#2e7d4f", paper:"#fffdf6",
    line:w=>[ "Beirat für die Alte WU", "steht – mit Fragen" ],
    sub:"Drei Frauen, sechs Männer: Bezirksrätin will wissen, wer die Auswahl getroffen hat.",
    feed:["Falter", "Beirat für die Alte WU steht – mit Fragen"],
    voices:[
      ["District council", "A councillor asks, in writing, who selected the board and by which criteria. The answer is due in four weeks."],
      ["Press conference", "One question on the composition. You answer it; the next question is about the trees."],
    ]},
  { min:4, rep:-3, masthead:"derStandard", mastColor:"#7a3b8f", paper:"#fbe9df",
    line:w=>[ "Alte WU: Beirat", "komplett besetzt" ],
    sub:"Neun Fachleute entscheiden über den Entwurf. Erste Sitzung im Herbst.",
    feed:["Der Standard", "Alte WU: Beirat komplett besetzt"],
    voices:[
      ["Local pages", "A short report on page 12. The photo shows nine people and the old slab behind them."],
      ["Press conference", "Someone asks how the board came about. You say: by the brief. That is the end of it."],
    ]},
];
function reactionFor(w){ let t=REACTIONS[0]; REACTIONS.forEach((r,i)=>{ if(w>=r.min) t=REACTIONS[i]; }); return t; }

function rReaction(){
  const {w}=countInvited();
  const r=reactionFor(w);
  if(state.reactionTier===null){          // effects only once
    state.reactionTier=REACTIONS.indexOf(r);
    state.chamberOk = w>0;
    hudAddRep(r.rep);
    hudFeed(r.feed[0], r.feed[1]);
  }
  const [l1,l2]=r.line(w);
  const svg=newspaper({masthead:r.masthead,mastColor:r.mastColor,paper:r.paper,line1:l1,line2:l2,sub:r.sub});
  const voices=r.voices.map(([who,txt])=>`<div class="voice"><b>${who}</b><p>${txt}</p></div>`).join("");
  const chamber = state.chamberOk ? "" : `<div class="voice chamber"><b>Chamber of Architects</b><p>${NON_COMPLIANCE.chamber}</p></div>`;
  stage.innerHTML="";
  const card=el(`<div class="appcard wide">
    <span class="badge">The week after the first session</span>
    <div class="art">${svg}</div>
    <h2>The board is public</h2>
    <div class="voices">${voices}${chamber}</div>
    <div class="btnbar mt"><button class="btn" id="rx-go">What now?</button></div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("rx-go").onclick=()=>go("briefreveal");
}

/* ---------- three ways, none of them required ---------- */
function rOptions(){
  stage.innerHTML="";
  const wrap=el(`<div class="slide wide">
    <h1>Three ways to go on</h1>
    <p class="lede">Nobody can make you do anything. Each of these is your choice, and each costs something different.</p>
    <div class="ways">
      <div class="way">
        <h3>Reopen the search</h3>
        <p>Replace members of the board. Every replacement is a new search: ${REPAIR_WEEKS} weeks and ${eur(REPAIR_WEEKS*WEEK_COST)} in delay costs, plus the difference in fees.</p>
        <button class="btn" id="opt-repair">Back to the selection</button>
      </div>
      <div class="way">
        <h3>Sit it out</h3>
        <p>The board stays. The story runs for another week or two and then something else happens. It costs nothing now.</p>
        <button class="btn ghost" id="opt-sit">Keep the board, carry on</button>
      </div>
      <div class="way">
        <h3>Do something alongside</h3>
        <p>The board stays. You fund a measure next to it. Pick one:</p>
        <div class="comp" id="comp"></div>
      </div>
    </div>
  </div>`);
  const comp=wrap.querySelector("#comp");
  COMPENSATIONS.forEach(c=>{
    const b=el(`<button class="btn ghost compbtn" data-k="${c.key}">${c.label}<span class="cost">${eur(c.cost)} · ${c.desc}</span></button>`);
    if(c.cost>state.budget){ b.disabled=true; b.title="Not enough budget left"; }
    b.onclick=()=>{
      state.response="compensate"; state.compensation=c.key;
      spend("compensation",c.cost); hudAddRep(c.rep);
      if(c.key==="substitute") state.chamberOk=true;
      hudFeed("Stadt Wien", `${c.label}.`);
      go("map");
    };
    comp.appendChild(b);
  });
  stage.appendChild(wrap);
  document.getElementById("opt-repair").onclick=()=>{
    state.response="repair"; state.repairing=true; state.repairBase=[...state.invited]; state.selected=new Set(state.invited);
    state.screen="p1"; renderPhasebar(); renderHUD(); stage.scrollTop=0; renderHandPick();
  };
  document.getElementById("opt-sit").onclick=()=>{
    state.response="sitout"; hudAddRep(-10);
    hudFeed("Newsroom", "The story runs a second week.");
    go("map");
  };
}

function rRepaired(){
  stage.innerHTML="";
  const sw=state.repairSwaps;
  const list=state.invited.map(id=>{const p=byId(id);const isNew=!state.repairBase.includes(id);return `<li>${p.name} — ${p.spec}${isNew?' <small>new</small>':''}</li>`;}).join("");
  stage.appendChild(el(`<div class="slide">
    <h1>Board revised</h1>
    <p class="lede">${sw===0 ? "You kept the board as it was. Nothing changed, nothing was spent."
      : `${sw} member${sw>1?"s":""} replaced. The new search took ${sw*REPAIR_WEEKS} weeks — ${eur(sw*REPAIR_WEEKS*WEEK_COST)} in delay costs. Fees now ${eur(state.spend.experts)}.`}</p>
    <div class="verdict"><ul>${list}</ul></div>
    <div class="btnbar"><button class="btn" id="rp-go">Carry on</button></div>
  </div>`));
  document.getElementById("rp-go").onclick=()=>go("map");
}

/* ========================================================================
   PRESSURE EVENTS — kept from the old second round, currently unreachable
   (not in go()'s map). Their go("apps") targets are placeholders.
   ======================================================================== */
/* ---------- Teeküche ---------- */
function rKitchen(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">The kitchenette</span>
    <div class="art">${KITCHEN_SVG}</div>
    <h2>A colleague has a tip</h2>
    <p>Over coffee, a colleague leans in: "I know two brilliant people — want me to put them forward?" It would bring you two more applicants. It would also look a lot like an inside job.</p>
    <div class="btnbar col mt">
      <button class="btn" id="k-take">Take the tip<span class="cost">+2 applicants · reputation takes a hit</span></button>
      <button class="btn ghost" id="k-decline">Decline — keep it clean<span class="cost">no new applicants</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("k-take").onclick=()=>{
    const seen=new Set(state.candidates.map(p=>p.id));
    const extra=shuffle(PROFILES.filter(p=>p.gender==="woman" && !seen.has(p.id))).slice(0,2);
    state.candidates=state.candidates.concat(extra);
    state.kitchenShown=true;
    hudAddRep(-25);
    hudFeed("Krone","Freunderlwirtschaft bei der Alten WU?");
    go("kronepress");
  };
  document.getElementById("k-decline").onclick=()=>{ state.kitchenShown=true; go("apps"); };
}

function rKronepress(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">The press picks it up</span>
    <div class="art">${KRONE_SVG}</div>
    <h2>The headline is out</h2>
    <p>The cronyism story is spreading. You can bring in a crisis-PR agency to calm it down — or ride it out and risk losing people.</p>
    <div class="btnbar col mt">
      <button class="btn" id="kp-pr">Hire crisis PR<span class="cost">+2 weeks delay · reputation recovers</span></button>
      <button class="btn ghost" id="kp-ride">Ride it out<span class="cost">a qualified woman withdraws</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("kp-pr").onclick=()=>{
    hudAddDelay(2); hudAddRep(20);
    hudFeed("Stadt Wien","Statement issued. The story cools down.");
    go("apps");
  };
  document.getElementById("kp-ride").onclick=()=>{
    const wIdx=state.candidates.findIndex((p,i)=>i>=state.idx && p.gender==="woman");
    if(wIdx>=0) state.candidates.splice(wIdx,1);
    hudAddRep(-10);
    hudFeed("Inbox","“Given the press, I’m withdrawing my application.”");
    go("apps");
  };
}

/* ---------- Holiday ---------- */
function rHoliday(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">Summer at the Alte Donau</span>
    <div class="art">${ALTEDONAU_SVG}</div>
    <h2>Holiday season</h2>
    <p>Half of Vienna is out at the Alte Donau. Replies trickle in slowly and decisions stall. Nothing you did — just the calendar.</p>
    <div class="btnbar col mt">
      <button class="btn" id="h-wait">Wait it out<span class="cost">+2 weeks delay</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("h-wait").onclick=()=>{
    state.holidayShown=true;
    hudAddDelay(2);
    hudFeed("Stadt Wien","Holiday season slows every reply. Two weeks lost.");
    go("apps");
  };
}

function rForeigners(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("foreigners","Understood",()=>rForeignersPress()));
}
/* newspaper fallout after the abroad enquiry. Sets foreignersShown here —
   without it afterDecision() would re-fire this screen after every decision. */
function rForeignersPress(){
  state.foreignersShown=true;
  hudAddDelay(2);
  hudAddRep(-15);
  hudFeed("Kronen Zeitung","Jury-Suche: Woher kommen die Experten?");
  const FOREIGNERS_SVG=newspaper({masthead:"KRONEN ZEITUNG",mastColor:"#d81e2c",paper:"#fffdf6",
    line1:"Wettbewerbsbüro sucht",line2:"Experten im Ausland?",
    sub:"Jury-Suche für Alte WU: Keine geeigneten Österreicher gefunden?"});
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">In the press</span>
    <div class="art">${FOREIGNERS_SVG}</div>
    <h2>It made the morning paper</h2>
    <p>A report speculates about why the jury search is stalling.
       No accusation — but the question is out there now. The enquiry
       cost two weeks, and gained nothing.</p>
    <div class="btnbar col mt">
      <button class="btn" id="fp-close">Close</button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("fp-close").onclick=()=>go("apps");
}

/* ========================================================================
   CONFIRM → INTERMEZZO → POOL REVEAL
   ======================================================================== */
function rConfirm(){
  stage.innerHTML="";
  const list=state.invited.map(id=>{const p=byId(id);return `<li>${p.name} — ${p.spec} <small>${eur(expertFee(p))}</small></li>`;}).join("");
  stage.appendChild(el(`
    <div class="slide">
      <h1>Jury complete</h1>
      <p class="lede">${state.invited.length} experts, all six fields covered. Fees: ${eur(state.spend.experts)}.</p>
      <div class="verdict"><ul>${list}</ul></div>
      <div class="btnbar">
        <button class="btn ghost" id="back">Back to the selection</button>
        <button class="btn send big" id="send">⚑ Send invitations</button>
      </div>
    </div>`));
  // going back un-books the fees; they are charged again on the next confirm
  document.getElementById("back").onclick=()=>{
    spend("experts",-state.spend.experts); state.invited=[];
    state.screen="p1"; renderPhasebar(); renderHUD(); stage.scrollTop=0; renderHandPick();
  };
  document.getElementById("send").onclick=()=>go("sendletter");
}

/* ---------- the formal invitation letter (ex draft-letter.js) ---------- */
function rSendLetter(){
  stage.innerHTML="";
  const dateStr=new Date().toLocaleDateString("de-AT",{day:"2-digit",month:"long",year:"numeric"});
  const wrap=el(`
    <div class="slide letter-wrap">
      <p class="letter-status">Sending the invitation letter …</p>
      <div class="letter" id="letter">
        <div class="head">
          <div class="sender">
            <div class="label">Absender</div>
            <b>Wettbewerbsbüro Wien</b><br>Ringstraße 1, 1010 Wien
          </div>
          <div class="stamp">${STAMP_SVG}</div>
        </div>
        <div class="date">Wien, ${dateStr}</div>
        <div class="subj">Einladung zur Jurytätigkeit — Architekturwettbewerb Alte WU, Augasse</div>
        <p class="greet">Sehr geehrte Damen und Herren,</p>
        <p class="para">Im Namen der Stadt Wien laden wir Sie herzlich ein, als Mitglied der Fachjury
          für den Architekturwettbewerb auf dem Areal der Alten WU, Augasse, 1090 Wien,
          tätig zu sein.</p>
        <p class="para last">Die Jury umfasst neun unabhängige Expertinnen und Experten. Der erste Arbeitstag
          ist für Donnerstag, 09:00 Uhr, im Expertinnen- und Expertenpool geplant. Wir
          ersuchen Sie um Bestätigung Ihrer Teilnahme.</p>
        <p class="close">Mit freundlichen Grüßen</p>
        <p class="sign">Stadt Wien, Wettbewerbsbüro</p>
      </div>
      <div class="btnbar letter-actions">
        <button class="btn ghost" id="sl-back">← Back</button>
        <button class="btn send" id="sl-send">Send ✉</button>
      </div>
    </div>`);
  stage.appendChild(wrap);
  document.getElementById("sl-back").onclick=()=>go("confirm");
  document.getElementById("sl-send").onclick=()=>go("intermezzo");
}

/* ---------- terminal ticker before the pool (ex draft-reveal.js) ---------- */
function rIntermezzo(){
  const delay=state.delayWeeks||0, ext=state.extensions||0;
  const lines=[
    "Jury complete.",
    "Invitations sent.",
    delay>0 ? `+${delay} week${delay!==1?"s":""} delay, ${ext} extension${ext!==1?"s":""}.` : "Project starts on schedule.",
    "Next meeting: the Expert Pool. Thursday, 09:00.",
    `The organisers prepared ${JURY_SIZE} stations, ${JURY_SIZE} name tags, ${JURY_SIZE} towels.`,
  ];
  stage.innerHTML="";
  const term=el(`<div class="im-terminal">
      <div class="im-lines" id="im-lines"></div>
      <div class="im-cursor" id="im-cursor">█</div>
      <div class="im-cta" id="im-cta" hidden><button class="im-btn" id="im-go">Enter the pool →</button></div>
    </div>`);
  stage.appendChild(term);
  document.getElementById("im-go").onclick=()=>go("reveal");
  const container=document.getElementById("im-lines"), cursor=document.getElementById("im-cursor"), cta=document.getElementById("im-cta");
  lines.forEach((text,i)=>{
    const div=document.createElement("div"); div.className="im-line"; div.textContent=text; container.appendChild(div);
    setTimeout(()=>{
      div.classList.add("visible");
      if(i===lines.length-1) setTimeout(()=>{ cursor.hidden=true; cta.hidden=false; },600);
    },(i+1)*1000);
  });
}

/* ---------- the pool reveal (ex draft-reveal.js) ---------- */
/* One row of changing-room cabins: exactly as many as there are people.
   No prepared seats, no overflow, no verdict — the two rows next to each
   other are the whole picture. */
function makeLane(label,count){
  let figures="";
  for(let i=0;i<count;i++){
    figures+=`<div class="dr-slot">${_cabinIcon(i+1)}<div class="dr-doll">${_paperDoll()}</div></div>`;
  }
  if(count===0) figures=`<span class="dr-none">—</span>`;
  return `<div class="dr-lane">
    <div class="dr-lane-label">${label}</div>
    <div class="dr-slots-row">${figures}</div>
  </div>`;
}

function rReveal(){
  const {w,m}=countInvited();
  stage.innerHTML="";
  const wrap=el(`<div class="dr-reveal">
      <h2 class="dr-title">Welcome to the Expert Pool.</h2>
      <div class="dr-venue-art">${POOLHALL_SVG}</div>
      <p class="dr-subtitle">Thursday, 09:00. First session. Everyone finds their changing room.</p>
      <div class="dr-pool-grid">
        ${makeLane("Women's changing rooms",w)}
        ${makeLane("Men's changing rooms",m)}
      </div>
      <div class="dr-summary">
        <span>Your board:</span>
        <strong>${w} ${w===1?"woman":"women"}</strong>
        <span>&amp;</span>
        <strong>${m} ${m===1?"man":"men"}</strong>
      </div>
      <button class="dr-btn-primary" id="dr-go">Continue →</button>
    </div>`);
  stage.appendChild(wrap);
  document.getElementById("dr-go").onclick=()=>go("reaction");
}

/* ========================================================================
   THE REVEAL — the same mail again, one line marked. Nothing else.
   ======================================================================== */
function rBriefReveal(){
  const {w}=countInvited();
  const need=Math.ceil(JURY_SIZE*0.25);
  stage.innerHTML="";
  const wrap=el(`<div class="slide wide">
    <h1>That was in your briefing.</h1>
    <div class="reveal-row">
      <div class="reveal-mail"></div>
      <div class="reveal-facts">
        <div class="fact"><div class="n">${need}</div><div class="t">at least 25% of ${JURY_SIZE} jurors — term 4 of the brief</div></div>
        <div class="fact"><div class="n">${w}</div><div class="t">${w===1?"woman":"women"} on your board</div></div>
      </div>
    </div>
    <div class="btnbar"><button class="btn" id="br-go">What now?</button></div>
  </div>`);
  wrap.querySelector(".reveal-mail").appendChild(briefMail({highlight:"balance"}));
  stage.appendChild(wrap);
  document.getElementById("br-go").onclick=()=>go("options");
}

/* ========================================================================
   THE MAP — six stations. One done, one open, four visibly locked.
   The locks are part of the statement: this is the size of the real job.
   ======================================================================== */
function stationResult(key){
  if(key==="board") return `${state.invited.length} members · fees ${eur(state.spend.experts)}`;
  if(key==="pr" && state.prAction){ const a=PR_ACTIONS.find(x=>x.key===state.prAction); return `${a.label} · ${eur(a.cost)}`; }
  return "";
}
function rMap(){
  stage.innerHTML="";
  const allDone = STATIONS.slice(0,2).every(st=>state.stations[st.key]==="done");
  const wrap=el(`<div class="slide wide">
    <h1>Campus Althangrund</h1>
    <p class="lede">Six stations between the decision and the building. Two of them are yours in this prototype.</p>
    <div class="map" id="map"></div>
    <div class="btnbar">${allDone?`<button class="btn" id="map-build">Build it →</button>`:""}</div>
  </div>`);
  const map=wrap.querySelector("#map");
  STATIONS.forEach((st,i)=>{
    const s=state.stations[st.key];
    const card=el(`<div class="station-card ${s}">
      <div class="st-head"><span class="st-no">${i+1}</span><span class="st-state">${s==="done"?"✓ done":s==="open"?"▶ open":"🔒 locked"}</span></div>
      <h3>${st.label}</h3>
      <div class="st-place">${st.place}</div>
      <p>${st.desc}</p>
      ${s==="done"?`<div class="st-result">${stationResult(st.key)}</div>`:""}
      ${s==="open"?`<button class="btn st-go">Go there</button>`:""}
    </div>`);
    if(s==="open") card.querySelector(".st-go").onclick=()=>go(st.key);
    map.appendChild(card);
  });
  stage.appendChild(wrap);
  const b=document.getElementById("map-build"); if(b) b.onclick=()=>go("outro");   // → ending (step 8)
}

/* ---------- Station 2: Neighbours & PR — one decision ---------- */
function rPR(){
  stage.innerHTML="";
  const card=el(`<div class="appcard wide">
    <span class="badge">Station 2 · Augasse, 9th district</span>
    <h2>Neighbours &amp; PR</h2>
    <p>Four years of building site over a live railway, and the people next door did not choose it.
       Whatever you do here, they will hear the drilling. The question is what else they hear from you.</p>
    <div class="btnbar col mt" id="pr-actions"></div>
  </div>`);
  const bar=card.querySelector("#pr-actions");
  PR_ACTIONS.forEach(a=>{
    const b=el(`<button class="btn ${a.cost?"":"ghost"}" data-k="${a.key}">${a.label}<span class="cost">${a.cost?eur(a.cost):"no cost"} · ${a.desc}</span></button>`);
    if(a.cost>state.budget){ b.disabled=true; b.title="Not enough budget left"; }
    b.onclick=()=>{
      state.prAction=a.key; state.stations.pr="done";
      if(a.cost) spend("pr",a.cost);
      hudAddRep(a.rep);
      hudFeed("Augasse", a.rep>0 ? `${a.label}. The neighbours take note.` : "The neighbours hear the drilling. Nothing else.");
      go("map");
    };
    bar.appendChild(b);
  });
  stage.appendChild(card);
}

/* ========================================================================
   OUTRO — verdict on the pool you built, real numbers, reflection
   ======================================================================== */
let outroIdx=0;
function rOutro(){ outroIdx=0; drawOutro(); }

function verdict(){
  const {w}=countInvited();
  if(w>=4 && w<=6) return { tag:"You built a balanced jury.",
    text:[`Your final jury came out ${w} women, ${JURY_SIZE-w} men — balanced, and all of them qualified. You reached the target.`,
      state.extensions>0
        ? `But look what it took: ${state.extensions} extension${state.extensions===1?"":"s"} and ${state.delayWeeks} weeks of delay. In reality, most people don't have that room — and the pressure is designed to make you stop sooner.`
        : `You managed it without extending — but notice how the deadline and the thin applicant field pushed against you the whole time. Most people give in to that.`] };
  if(w<=2) return { tag:"The structure won.",
    text:[`Your jury came out ${w} women, ${JURY_SIZE-w} men. With only about one in five applicants a woman, "just pick the best" lands here almost on its own.`,
      `That's the leaky pipeline made visible: the skew was in who got to apply, long before you decided anything.`] };
  return { tag:"Close, but the field tilted it.",
    text:[`Your jury landed at ${w} women, ${JURY_SIZE-w} men — near balance, but short. The applicant pool was ~80% men, and that pressure shows up in the result.`,
      `Reaching 5/5 here means actively working against the structure — and the deadline is built to discourage exactly that.`] };
}

const OUTRO=[
  {head:"Wait — what happened?", build:(w)=>{
    const v=verdict();
    const paras=v.text.map(t=>`<p>${t}</p>`).join("");
    w.appendChild(el(`<div class="slide">
      <p>You chose carefully. But the applicant field was skewed ~80/20 before you started,
      and a deadline pushed you to stop early. The result isn't really about who you are —
      it's about the structure you were handed.</p>
      <div class="verdict"><div class="tagline">${v.tag}</div>${paras}</div></div>`));
  }},
  {head:"This isn't just a game", build:(w)=>{
    w.appendChild(el(`<div class="slide">
      <p><b>First, the no-blame part:</b> if your experts didn't fit the system's swimwear,
      it doesn't mean you chose badly. You probably picked excellent people. The problem is
      the system, not you. Here's the reality in Austria:</p>
      <div class="stat-row">
        <div class="stat"><div class="n">60%</div><div class="t">of architecture students are women — often graduating top of their class.</div></div>
        <div class="stat"><div class="n">11–15%</div><div class="t">of active architecture licences are held by women.</div></div>
        <div class="stat"><div class="n">&lt; 2%</div><div class="t">women in civil engineering. Nearly 90% of independent firms are run by men.</div></div>
      </div>
      <p class="disc">Figures from the project's source material (verify before publishing).
      This prototype uses woman/man as simplified analytical categories to make one form of
      selection bias visible — it does not claim gender is fundamentally binary.</p></div>`));
  }},
  {head:"The leaky pipeline", build:(w)=>{
    w.appendChild(el(`<div class="slide">
      <p><b>Where do the qualified women go?</b> They're lost between university and leadership —
      rigid, family-unfriendly hours and male-dominated networks. By the time a public call goes
      out, the applicant pool is already thinned.</p>
      <p>We built this game to make those invisible filters visible. Fixing it isn't about
      blaming the chooser — it's about changing the structure so the system is ready for
      every talent.</p></div>`));
  }},
];

function drawOutro(){
  stage.innerHTML="";
  const s=OUTRO[outroIdx];
  const wrap=el(`<div></div>`);
  wrap.appendChild(el(`<h1>${s.head}</h1>`));
  s.build(wrap);
  const nav=el(`<div class="dotnav"></div>`);
  OUTRO.forEach((_,i)=>nav.appendChild(el(`<i class="${i===outroIdx?"on":""}"></i>`)));
  wrap.appendChild(nav);
  const bar=el(`<div class="btnbar"></div>`);
  if(outroIdx>0){const b=el(`<button class="btn ghost">Back</button>`);b.onclick=()=>{outroIdx--;drawOutro();};bar.appendChild(b);}
  const last=outroIdx===OUTRO.length-1;
  const n=el(`<button class="btn">${last?"To reflection":"Next"}</button>`);
  n.onclick=()=>{ if(last) go("reflect"); else {outroIdx++;drawOutro();} };
  bar.appendChild(n);
  wrap.appendChild(bar);
  stage.appendChild(wrap);
}

function rReflect(){
  stage.innerHTML="";
  const {w,m}=countInvited();
  stage.appendChild(el(`
    <div class="slide">
      <h1>What happened in there?</h1>
      <p class="lede">The interesting question isn't "who's to blame?" — it's which patterns formed,
      and how selection could be designed more fairly.</p>
      <div class="verdict"><p>Your jury: <b>${w}</b> women, <b>${m}</b> men${state.extensions?` · ${state.extensions} extension(s), ${state.delayWeeks}w delay`:""}.</p></div>
      <ol class="qlist">
        <li>How did the ~80/20 applicant field shape what felt possible?</li>
        <li>When the deadline appeared, did you change how you chose?</li>
        <li>Did extending feel worth the delay — and who, in reality, can afford that delay?</li>
        <li>Were the criteria that felt like "hard quality" fair ones for a public building?</li>
        <li>What would raise the number of women applying in the first place?</li>
      </ol>
      <div class="btnbar">
        <button class="btn" id="again">Play again</button>
      </div>
    </div>`));
  document.getElementById("again").onclick=resetGame;
}

function resetGame(){
  state.order=[]; state.selected=new Set(); state.invited=[];
  state.budget=BUDGET_START; state.spend=freshSpend();
  state.delayWeeks=0; state.extensions=0; state.rep=100;
  state.hudSeen={time:false,rep:false};
  state.reactionTier=null; state.chamberOk=true; state.response=null; state.compensation=null;
  state.repairing=false; state.repairBase=[]; state.repairSwaps=0;
  state.stations=freshStations(); state.prAction=null;
  state.candidates=[]; state.kitchenShown=false; state.holidayShown=false; state.foreignersShown=false;
  outroIdx=0; introStep=0;
  go("intro");
}

/* boot: index.html calls go("intro") after this file has loaded. */
