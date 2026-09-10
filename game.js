/* ==========================================================================
   POOL OF EXPERTS — game.js
   Flow: intro → map (station 1 open) → brief → ONE selection (grid + field checklist) → letter →
         pool reveal → the outside world reacts → the brief again, one line marked
         → three ways (repair under
         pressure / sit it out / fund something alongside) → map (station 2:
         neighbours & PR, four stations locked) → the ending (building, the
         real jury, three figures, sources)
   The former second round ("applications under pressure") is gone. Its
   pressure-event screens live in parked-events.js (not loaded) for a later
   disruptor step.
   Load order (index.html): data.js → rules.js → art.js → game.js.
     data.js  — the 26 profiles and criteria
     rules.js — money (WEEK_COST, JURY_SIZE, …), brief terms, fields, measures
     art.js   — every SVG illustration
   The former draft-*.js monkey-patches are merged in here.
   ========================================================================== */

const PHASES = [
  ["map",    "Map"],
  ["p1",     "1 · The board"],
  ["reveal", "2 · The pool"],
  ["pr",     "3 · Neighbours"],
  ["outro",  "4 · The building"],
];
/* which phase a sub-screen belongs to in the phase bar, and when a phase counts as done */
const PHASE_OF = { confirm:"p1", sendletter:"p1", intermezzo:"p1",
  reaction:"reveal", briefreveal:"reveal", options:"reveal", repaired:"reveal" };
const PHASE_DONE = {
  p1:     ()=>state.invited.length>0 && !state.repairing,
  reveal: ()=>state.response!==null,
  pr:     ()=>state.stations.pr==="done",
};

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
  delayWeeks:0, rep:100,
  hudSeen:{ time:false, rep:false, progress:false },   // gauges appear once their dimension matters
  budgetOpen:false,            // the budget gauge unfolds into the spend chart
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
  PHASES.forEach(([key,label])=>{
    const b=document.createElement("b"); b.textContent=label;
    if(key===cur) b.classList.add("on"); else if(PHASE_DONE[key] && PHASE_DONE[key]()) b.classList.add("done");
    phasebar.appendChild(b);
  });
  phasebar.style.display = state.screen==="intro" ? "none":"flex";
}
function go(screen){
  state.screen=screen; renderPhasebar(); renderHUD(); stage.scrollTop=0;
  ({ intro:rIntro, p1:rPhase1, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
     reveal:rReveal, reaction:rReaction, briefreveal:rBriefReveal, options:rOptions, repaired:rRepaired,
     map:rMap, pr:rPR,
     outro:rOutro })[screen]();
}

/* ---------- HUD ---------- */
const HUD_SCREENS  = new Set(["p1","confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","repaired","map","pr","outro"]);
const FEED_SCREENS = new Set(["confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","repaired","map","pr","outro"]);
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
  if(!show){ document.getElementById("budget-panel").hidden=true; return; }
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
  // progress: stations done, once the map exists
  document.getElementById("g-progress").hidden = !state.hudSeen.progress;
  const done=STATIONS.filter(st=>state.stations[st.key]==="done").length;
  document.getElementById("hud-progress").textContent = `Station ${Math.min(done+1,STATIONS.length)} of ${STATIONS.length}`;
  document.getElementById("hud-progfill").style.width = Math.round(done/STATIONS.length*100)+"%";
  renderBudgetPanel();
}
/* the unfolded budget: one stacked bar over SPEND_CATS, legend only for
   categories that actually hold money — an empty "Compensation" row would
   announce a mechanic before it exists */
function renderBudgetPanel(){
  const panel=document.getElementById("budget-panel"), g=document.getElementById("g-money");
  panel.hidden=!state.budgetOpen; g.setAttribute("aria-expanded",String(state.budgetOpen)); g.classList.toggle("open",state.budgetOpen);
  if(!state.budgetOpen) return;
  const stack=document.getElementById("budget-stack"), legend=document.getElementById("budget-legend");
  stack.innerHTML=""; legend.innerHTML="";
  let spentTotal=0;
  SPEND_CATS.forEach(c=>{
    const v=state.spend[c.key]||0; if(v<=0) return; spentTotal+=v;
    stack.appendChild(el(`<i style="width:${v/BUDGET_START*100}%;background:${c.color}" title="${c.label}: ${eur(v)}"></i>`));
    legend.appendChild(el(`<li><i style="background:${c.color}"></i>${c.label}<b>${eur(v)}</b><small>${Math.round(v/BUDGET_START*100)}%</small></li>`));
  });
  stack.appendChild(el(`<i class="rest" style="width:${Math.max(0,state.budget)/BUDGET_START*100}%" title="Remaining: ${eur(state.budget)}"></i>`));
  legend.appendChild(el(`<li class="rest"><i></i>Remaining<b>${eur(state.budget)}</b><small>${Math.round(Math.max(0,state.budget)/BUDGET_START*100)}%</small></li>`));
  if(spentTotal===0) legend.insertBefore(el(`<li class="none">Nothing spent yet.</li>`),legend.firstChild);
}
document.getElementById("g-money").onclick=()=>{ state.budgetOpen=!state.budgetOpen; renderBudgetPanel(); };
function hudAddDelay(weeks){ state.delayWeeks+=weeks; state.hudSeen.time=true; spend("delay",weeks*WEEK_COST); hudFlash("g-time"); }
function hudAddRep(delta){ state.rep=Math.max(0,Math.min(100,state.rep+delta)); state.hudSeen.rep=true; hudFlash("g-rep"); renderHUD(); }
function hudFeed(src,text){ document.getElementById("feed").innerHTML=`<span class="src">${src}</span> — <b>${text}</b>`; }

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
  const bar=wrap.querySelector(".btnbar");
  if(ctaLabel){ const c=el(`<button class="btn">${ctaLabel}</button>`); c.onclick=onCta; bar.appendChild(c); }
  else bar.remove();
  return wrap;
}

/* ========================================================================
   INTRO — three beats, then the map.
   NO theme spoilers: no "bias", "gender", "discrimination", "quota", ratios.
   ======================================================================== */

/* three beats, each with a picture: the building, the empty years, your job */
const BEATS = [
  {
    label:"AUGASSE · 9th DISTRICT",
    art: ALTEWU_SVG,
    h:"There is a building over the tracks",
    body:`
      <p class="lede">In Vienna's Alsergrund, the Augasse runs past ordinary blocks until the ground
      lifts: a long concrete slab on a platform — <em>die Platte</em> — bridging the railway of the
      Franz-Josefs-Bahnhof. Trains still pass beneath it.</p>
      <p class="lede">Everyone here calls it <strong>the old WU</strong>.</p>`
  },
  {
    label:"1982 — 2021",
    art: ALTEWU_NIGHT_SVG,
    h:"Empty since 2021",
    body:`
      <p class="lede">Built with the platform in the 1970s; home to the Vienna University of Economics
      and Business from 1982. The WU left in 2013, the University of Vienna in 2021.</p>
      <p class="lede">Ask around and the stories come easily — first exams, bad coffee, friends made in a
      stairwell. Then the signs came down.</p>`
  },
  {
    label:"YOUR PART",
    art: MAP_MINI_SVG,
    h:"Build the new WU",
    body:`
      <p class="lede">The city has decided: the slab becomes a new education campus for 17,000 students.
      You lead the project.</p>
      <p class="lede">${eur(BUDGET_START)} for fit-out and ancillary costs. Six stations between this
      decision and the opening day.</p>`,
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
    const goBtn = el(`<button class="btn" id="go">Open the map</button>`);
    goBtn.onclick = ()=>{ introStep=0; go("map"); };
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
      <button class="btn" id="confirm" disabled>Confirm the board</button>
    </div>`);
  stage.appendChild(bar);
  const list=bar.querySelector("#checklist");
  FIELDS.forEach(f=>list.appendChild(el(`<span class="field" data-k="${f.key}" style="--fc:${f.color}" title="${f.label} — ${f.note}"><i></i>${f.short}</span>`)));

  stage.appendChild(el(state.repairing
    ? `<p class="hint wide"><b>Replace whoever you want.</b> Every replacement means a new search: ${REPAIR_WEEKS} weeks and ${eur(REPAIR_WEEKS*WEEK_COST)} each. Nine seats, all six fields covered, within budget.</p>`
    : `<p class="hint wide"><b>${JURY_SIZE} seats. Cover all six fields. Stay within budget.</b> Every member is paid a fee from your budget — long careers cost more. Tap a card to add or remove someone.</p>`));
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
      <div class="fee">${eur(expertFee(p))} fee</div>
    </div>`);
  const fl=c.querySelector(".fields");
  fieldsOf(p.id).forEach(k=>{
    const f=FIELDS.find(x=>x.key===k);
    fl.appendChild(el(`<span class="ftag" data-k="${k}" style="--fc:${f.color}" title="${f.label}">${f.short}</span>`));
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
    const cost=sw*REPAIR_WEEKS*WEEK_COST+delta, over=cost>state.budget;
    document.getElementById("fees").innerHTML=`Delay <b>+${sw*REPAIR_WEEKS} weeks · ${eur(sw*REPAIR_WEEKS*WEEK_COST)}</b><small>fees ${delta>=0?"+":"−"}${eur(Math.abs(delta))} · budget ${eur(state.budget)}</small>`;
    if(over) c.disabled=true;
    c.textContent = !ready ? (n<JURY_SIZE ? `Pick ${JURY_SIZE-n} more` : `${missing.length} field${missing.length>1?"s":""} not covered`)
                  : over ? "Not enough budget left"
                  : sw===0 ? "Keep the board as it is"
                  : `Confirm ${sw} replacement${sw>1?"s":""} (+${sw*REPAIR_WEEKS}w)`;
    return;
  }
  document.getElementById("fees").innerHTML=`Fees <b>${eur(feesOf(state.selected))}</b><small>budget ${eur(state.budget)}</small>`;
  c.textContent = ready ? "Confirm the board"
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
    if(sw*REPAIR_WEEKS*WEEK_COST+feesOf(state.selected)-feesOf(new Set(state.repairBase))>state.budget) return;
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
        <button class="btn" id="opt-repair">Reopen the search</button>
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
   CONFIRM → INTERMEZZO → POOL REVEAL
   ======================================================================== */
function rConfirm(){
  stage.innerHTML="";
  const list=state.invited.map(id=>{const p=byId(id);return `<li>${p.name} — ${p.spec} <small>${eur(expertFee(p))}</small></li>`;}).join("");
  stage.appendChild(el(`
    <div class="slide">
      <h1>Board complete</h1>
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
  document.getElementById("sl-send").onclick=()=>{ state.stations.board="done"; state.stations.pr="open"; go("intermezzo"); };
}

/* ---------- terminal ticker before the pool (ex draft-reveal.js) ---------- */
function rIntermezzo(){
  const lines=[
    "Board complete.",
    "Invitations sent.",
    state.delayWeeks>0 ? `+${state.delayWeeks} week${state.delayWeeks!==1?"s":""} delay.` : "Project starts on schedule.",
    "First session: the Expert Pool. Thursday, 09:00.",
    `The organisers prepared ${JURY_SIZE} cabins, ${JURY_SIZE} name tags, ${JURY_SIZE} towels.`,
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
  if(!state.hudSeen.progress){ state.hudSeen.progress=true; renderHUD(); }
  const allDone = STATIONS.slice(0,2).every(st=>state.stations[st.key]==="done");
  const wrap=el(`<div class="slide wide">
    <h1>Campus Althangrund</h1>
    <p class="lede">Six stations between the decision and the opening day. Two of them are playable in this prototype.</p>
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
    if(s==="open") card.querySelector(".st-go").onclick=()=>go(st.key==="board"?"p1":st.key);
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
   THE ENDING — the building stands, always. Its finish follows the budget
   that is left. Then two facts side by side, then the real jury, then three
   figures, then the sources. No verdict anywhere.
   ======================================================================== */
const FINISH_TEXT = {
  excellent:{ h:"Finished as planned",
    t:"Oak parquet in the lecture halls, a green roof over the whole slab, the library open until midnight. The neighbourhood café on the ground floor has its own entrance from the Augasse." },
  solid:{ h:"Finished, with cuts",
    t:"Linoleum in the corridors, parquet only in the main hall. The roof is green where the structure allows it. The café is there; the terrace is not." },
  frugal:{ h:"Finished, stripped back",
    t:"Linoleum throughout. The green roof shrank to planters along the edge. The library closes at eight; the café became a wall of vending machines." },
  bare:{ h:"Finished. Just.",
    t:"Grey screed floors, a gravel roof, the ground floor left as a shell for a later tenant. The lecture halls work. Everything else was cut." },
};
function finishTier(){ return FINISH_TIERS.find(t=>state.budget>=t.min) || FINISH_TIERS[FINISH_TIERS.length-1]; }

/* what you did about the board — one dry sentence, no adjective */
const MEASURE_TEXT = {
  substitute:  "A woman was appointed substitute juror. She attended every session.",
  girlscafe:   "The girls' café opened in May. 340 visitors in the first month.",
  kindergarten:"The kindergarten opened with the building. Sixty places, twenty of them for the neighbourhood.",
  youth:       "The youth centre in the Grätzl is funded until 2031.",
  mentoring:   "Twelve mentoring places at the Chamber, three years each.",
};
function measureSentence(){
  if(state.response==="compensate") return MEASURE_TEXT[state.compensation];
  if(state.response==="repair") return state.repairSwaps>0
    ? `You reopened the search. ${state.repairSwaps} member${state.repairSwaps>1?"s":""} replaced, ${state.repairSwaps*REPAIR_WEEKS} weeks lost.`
    : "You reopened the search and kept the board as it was.";
  return "You kept the board. The story ran for two weeks, then something else happened.";
}
function decidedSentence(){
  const {w,m}=countInvited();
  const who = `${m} ${m===1?"man":"men"} and ${w} ${w===1?"woman":"women"}`;
  const sub = state.compensation==="substitute" ? " One more woman sat on the substitutes' bench. She did not vote." : "";
  return `The design was chosen by ${who}.${sub}`;
}

const ENDING=[
  { head:()=>FINISH_TEXT[finishTier().key].h, build:(box)=>{
      const t=FINISH_TEXT[finishTier().key];
      const spent=SPEND_CATS.filter(c=>state.spend[c.key]>0).map(c=>`<li><i style="background:${c.color}"></i>${c.label}<b>${eur(state.spend[c.key])}</b></li>`).join("");
      box.appendChild(el(`<div class="slide wide">
        <p class="lede">The WU stands. ${t.t}</p>
        <div class="bill"><div class="k">Left for fit-out and finishes</div><div class="v">${eur(Math.max(0,state.budget))}</div>
          <ul class="legend">${spent}</ul></div>
        <div class="facts2">
          <div class="fact2"><p>${measureSentence()}</p></div>
          <div class="fact2"><p>${decidedSentence()}</p></div>
        </div>
      </div>`));
  }},
  { head:()=>"The real jury", build:(box)=>{
      const {w,m}=countInvited();
      const rows=REAL_JURY.groups.map(g=>`<tr><td>${g.label}</td><td>${g.women}</td><td>${g.men}</td></tr>`).join("");
      box.appendChild(el(`<div class="slide wide">
        <p class="lede">The competition for Campus Althangrund is real. It was launched by the BIG on 6 August 2025;
        the jury first met on 25–27 February 2026 and decides at the end of 2026.</p>
        <div class="juries">
          <div class="jury">
            <h3>Your board</h3>
            <table><tr><th></th><th>Women</th><th>Men</th></tr>
              <tr><td>Members</td><td>${w}</td><td>${m}</td></tr>
              ${state.compensation==="substitute"?`<tr><td>Substitutes</td><td>1</td><td>0</td></tr>`:""}
            </table>
          </div>
          <div class="jury">
            <h3>The real jury</h3>
            <table><tr><th></th><th>Women</th><th>Men</th></tr>${rows}
              <tr class="sum"><td>Full jurors</td><td>${REAL_JURY.women}</td><td>${REAL_JURY.men}</td></tr>
              <tr><td>Substitutes</td><td>${REAL_JURY.substitutes.women}</td><td>${REAL_JURY.substitutes.men}</td></tr>
            </table>
            <p class="names">${REAL_JURY.women_named.join(" · ")}</p>
            <p class="src">Source: ${REAL_JURY.source}</p>
          </div>
        </div>
      </div>`));
  }},
  { head:()=>"Three figures", build:(box)=>{
      const tiles=OUTRO_FIGURES.map(f=>{ const s=SOURCES.find(x=>x.key===f.src); return `<div class="stat"><div class="n">${f.n}</div><div class="t">${f.t}</div><div class="src">${s?s.label:""}</div></div>`; }).join("");
      box.appendChild(el(`<div class="slide wide"><div class="stat-row">${tiles}</div></div>`));
  }},
  { head:()=>"Sources", build:(box)=>{
      const list=SOURCES.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`).join("");
      const terms=BRIEF_TERMS.filter(t=>t.source).map(t=>`<li><span class="no">Term ${state.briefTerms.indexOf(t.key)+1}</span>${t.source}</li>`).join("")
                 +`<li><span class="no">Chamber</span>${CHAMBER_RULE.source}</li>`;
      box.appendChild(el(`<div class="slide wide">
        <p class="lede">Every rule, figure and quotation in this game is documented. The brief's terms are translated from these documents; nothing was invented.</p>
        <div class="srcgrid">
          <div><h3>Documents</h3><ul class="sources">${list}</ul></div>
          <div><h3>The five terms</h3><ul class="sources terms-src">${terms}</ul></div>
        </div>
        <p class="disc">This prototype uses woman/man as simplified analytical categories to make one form of
        selection bias visible — it does not claim gender is fundamentally binary.</p>
      </div>`));
  }},
];

let outroIdx=0;
function rOutro(){ outroIdx=0; drawOutro(); }
function drawOutro(){
  stage.innerHTML="";
  const s=ENDING[outroIdx];
  const wrap=el(`<div></div>`);
  wrap.appendChild(el(`<h1>${s.head()}</h1>`));
  s.build(wrap);
  const nav=el(`<div class="dotnav"></div>`);
  ENDING.forEach((_,i)=>nav.appendChild(el(`<i class="${i===outroIdx?"on":""}"></i>`)));
  wrap.appendChild(nav);
  const bar=el(`<div class="btnbar"></div>`);
  if(outroIdx>0){const b=el(`<button class="btn ghost">Back</button>`);b.onclick=()=>{outroIdx--;drawOutro();};bar.appendChild(b);}
  const last=outroIdx===ENDING.length-1;
  const n=el(`<button class="btn" id="${last?"again":"next"}">${last?"Play again":"Next"}</button>`);
  n.onclick=()=>{ if(last) resetGame(); else {outroIdx++;drawOutro();} };
  bar.appendChild(n);
  wrap.appendChild(bar);
  stage.appendChild(wrap);
}

function resetGame(){
  state.order=[]; state.selected=new Set(); state.invited=[];
  state.budget=BUDGET_START; state.spend=freshSpend();
  state.delayWeeks=0; state.rep=100;
  state.hudSeen={time:false,rep:false,progress:false}; state.budgetOpen=false;
  state.reactionTier=null; state.chamberOk=true; state.response=null; state.compensation=null;
  state.repairing=false; state.repairBase=[]; state.repairSwaps=0;
  state.stations=freshStations(); state.prAction=null;
  outroIdx=0; introStep=0;
  go("intro");
}

/* boot: index.html calls go("intro") after this file has loaded. */
