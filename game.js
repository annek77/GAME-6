/* ==========================================================================
   POOL OF EXPERTS — game.js
   Flow: intro → map (station 1 open) → brief → Chamber letter → ONE selection in two rounds
         (deck: yes/maybe/no, then the table with hand and field slots) → letter →
         pool reveal → the outside world reacts → the brief again, one line marked
         → three ways (repair under
         pressure / sit it out / fund something alongside) → map (station 2:
         neighbours & PR, four stations locked) → the ending (the building)
   Station 1 closes with the real jury, three figures and an optional dossier.
   The former second round ("applications under pressure") is gone. Its
   pressure-event screens live in parked-events.js (not loaded) for a later
   disruptor step.
   Load order (index.html): data.js → rules.js → art.js → sound.js → game.js.
     data.js  — the 26 profiles and criteria
     rules.js — money (WEEK_COST, JURY_SIZE, …), brief terms, fields, measures
     art.js   — every SVG illustration
     sound.js — Web Audio layer (SFX), no files
   The former draft-*.js monkey-patches are merged in here.
   ========================================================================== */

/* Which station a screen belongs to — for the station strip under the cockpit.
   Everything from the brief to the real-world coda is station 1. */
const STATION_OF = { p1:"board", confirm:"board", sendletter:"board", intermezzo:"board",
  reveal:"board", reaction:"board", briefreveal:"board", options:"board", abroad:"board", repaired:"board",
  realworld:"board", dossier:"board", pr:"pr", prseason:"pr", praccess:"pr", latestations:"permits", outro:"build" };
/* the preview screen belongs to whichever locked station is being looked at */

function freshSpend(){ const o={}; SPEND_CATS.forEach(c=>o[c.key]=0); return o; }
function freshStations(){ const o={}; STATIONS.forEach(st=>o[st.key]=st.state); return o; }
const state = {
  screen:"intro",
  order:[],                    // shuffled profile ids
  selected:new Set(),          // the selection in progress
  deck:{ idx:0, yes:[], maybe:[], no:[] },   // round 1 piles
  deckDone:false, showNo:false,
  invited:[],                  // the confirmed board (ids)

  // the brief as it was sent: term keys in the order shown. Fixed order —
  // the fourth position is the point. The reveal re-renders exactly this.
  briefTerms:BRIEF_TERMS.map(t=>t.key),

  // after the board is public: how the outside world reacted, what you did about it
  reactionTier:null,           // 0..3, see REACTIONS
  response:null,               // "repair" | "sitout" | "compensate"
  compensation:null,           // key from COMPENSATIONS
  repairing:false, repairBase:[], repairSwaps:0,
  abroadAsked:false,           // the fourth way — asked once, answered once
  lateBilled:false, savings:0, // stations 3–6 billed once before the ending

  // the project map: station key → "done" | "open" | "locked"
  stations:freshStations(),
  prAction:null,               // key from PR_ACTIONS
  prSeason:null,               // "wait" | "now" — the holiday event
  previewKey:null,             // which locked station is being previewed
  accessAction:null,           // key from ACCESS_ACTIONS

  budget:BUDGET_START,
  spend:freshSpend(),          // per SPEND_CATS key
  delayWeeks:0, rep:100,
  hudSeen:{ time:false, rep:false },   // gauges appear once their dimension matters
  budgetOpen:false,            // the budget gauge unfolds into the spend chart
  dossierReturn:null,          // where "Back" from the dossier leads
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
const isChamber = id => CHAMBER_NOMINATION.ids.includes(id);
/* echoes of the board: active effects, current week cost, PR discount */
const echoes  = () => activeEchoes(state.invited);
const echo    = key => echoes().find(e=>e.key===key) || null;
const weekCost = () => { const e=echo("costcontrol"); return e ? e.effect.weekCost : WEEK_COST; };
const prPrice  = cost => { const e=echo("participation"); return e ? Math.round(cost*(1-e.effect.prDiscount)) : cost; };
/* who sits on the board, split the way the real jury is split */
function boardSplit(){
  const r={ chamber:{w:0,m:0}, own:{w:0,m:0} };
  state.invited.forEach(id=>{ const g=byId(id).gender==="woman"?"w":"m"; r[isChamber(id)?"chamber":"own"][g]++; });
  return r;
}
const feesOf = idSet => [...idSet].reduce((sum,id)=>sum+expertFee(byId(id)),0);
/* every euro leaves through here: category for the cockpit, budget for the ending */
function spend(cat,amount){
  state.spend[cat]=(state.spend[cat]||0)+amount;
  state.budget-=amount;
  if(amount>0) SFX.money();
  hudFlash("g-money"); renderHUD();
}

/* the station strip: six boxes, always visible after the intro.
   done = green, open = gold, locked = grey, current = outlined */
function renderPhasebar(){
  phasebar.innerHTML="";
  const cur = state.screen==="preview" ? state.previewKey : (STATION_OF[state.screen] || null);
  STATIONS.forEach((st,i)=>{
    const b=document.createElement("b");
    b.className = state.stations[st.key] + (st.key===cur ? " on" : "");
    b.innerHTML = `<i>${i+1}</i>${st.short}`;
    b.title = st.label + (state.stations[st.key]==="locked" ? " — locked" : "");
    phasebar.appendChild(b);
  });
  phasebar.style.display = state.screen==="intro" ? "none":"flex";
}
function go(screen){
  if(state.screen==="reveal" && screen!=="reveal") SFX.stop();
  state.screen=screen; renderPhasebar(); renderHUD(); stage.scrollTop=0;
  ({ intro:rIntro, p1:rPhase1, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
     reveal:rReveal, reaction:rReaction, briefreveal:rBriefReveal, options:rOptions, repaired:rRepaired,
     abroad:rAbroad, realworld:rRealWorld, dossier:rDossier, latestations:rLateStations,
     prseason:rPRSeason, praccess:rPRAccess, preview:rPreview,
     map:rMap, pr:rPR,
     outro:rOutro })[screen]();
}

/* ---------- HUD ---------- */
const HUD_SCREENS  = new Set(["p1","confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","abroad","repaired","realworld","dossier","map","pr","prseason","praccess","preview","latestations","outro"]);
const FEED_SCREENS = new Set(["confirm","sendletter","intermezzo","reveal","reaction","briefreveal","options","abroad","repaired","realworld","dossier","map","pr","prseason","praccess","preview","latestations","outro"]);
/* the deadline does not move. 1 March 2027 stays 1 March 2027; what moves
   is how late you are. (Game mechanic, see BRIEF_TERMS[0].) */
const DEADLINE = new Date(2027,2,1);
const fmtDate = (d,loc="en-GB",opt={day:"2-digit",month:"short",year:"numeric"}) => d.toLocaleDateString(loc,opt);
function hudDeadline(){ return "deadline: "+fmtDate(DEADLINE); }
function gameDate(){ const d=new Date(DEADLINE); d.setDate(d.getDate()+state.delayWeeks*7); return d; }
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
  document.getElementById("hud").setAttribute("aria-live","polite");
  document.getElementById("hud-spent").textContent   = spent>0 ? eur(spent)+" spent of "+eur(BUDGET_START) : "nothing spent yet";
  // schedule and reputation stay hidden until they first move
  document.getElementById("g-time").hidden = !state.hudSeen.time;
  document.getElementById("g-rep").hidden  = !state.hudSeen.rep;
  document.getElementById("hud-weeks").textContent   = state.delayWeeks ? `${state.delayWeeks} week${state.delayWeeks>1?"s":""} late` : "on time";
  document.getElementById("hud-deadline").textContent= hudDeadline();
  document.getElementById("hud-repword").textContent  = repWord();
  const f=document.getElementById("hud-repfill"); f.style.width=state.rep+"%"; f.style.background=repColor();
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
function hudAddDelay(weeks){ state.delayWeeks+=weeks; state.hudSeen.time=true; spend("delay",weeks*weekCost()); hudFlash("g-time"); }
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

/* small station tag on top of every screen inside a station */
function kicker(sub){
  const st=STATIONS.find(x=>x.key===(STATION_OF[state.screen]||"board"));
  const i=STATIONS.indexOf(st)+1;
  return el(`<div class="kicker"><b>Station ${i}</b> · ${st.label}${sub?` · <span>${sub}</span>`:""}</div>`);
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
  stage.appendChild(kicker("your briefing"));
  stage.appendChild(briefMail({ctaLabel:"Next", onCta:()=>renderChamberMail()}));
}

/* The Chamber's nomination — a quarter of the seats are not yours to fill. */
function renderChamberMail(){
  stage.innerHTML="";
  stage.appendChild(kicker("nomination by the Chamber"));
  const list=CHAMBER_NOMINATION.ids.map(id=>{const p=byId(id);return `<li><b>${p.name}</b>, ${p.title} — ${p.spec}</li>`;}).join("");
  const wrap=el(`<div>
    <div class="mail brief chamber">
      <div class="from">
        <div class="crest zt">ZT</div>
        <div class="who">zt:Kammer Ost<small>Chamber of Architects and Chartered Engineers · Vienna, Lower Austria, Burgenland</small></div>
      </div>
      <div class="subject">Campus Althangrund — nomination of jurors</div>
      <div class="body">
        <p>${CHAMBER_NOMINATION.text}</p>
        <ol class="nominees">${list}</ol>
        <p>${CHAMBER_NOMINATION.close}</p>
      </div>
    </div>
    <div class="btnbar"><button class="btn" id="cm-go">Start choosing</button></div>
  </div>`);
  stage.appendChild(wrap);
  document.getElementById("cm-go").onclick=()=>renderHandPick();
}

/* Repair: the table opens with the current board, every replacement costs REPAIR_WEEKS. */
const REPAIR_WEEKS = 2;
function repairSwaps(){ return [...state.selected].filter(id=>!state.repairBase.includes(id)).length; }

/* ---------- the selection, in two rounds ----------
   Round 1, the deck: every candidate once, one at a time, big. Yes / Maybe / No.
   Round 2, the table: the Yes and Maybe piles as compact cards, the hand of
   chosen people and the six field slots always in view. The No pile stays
   one click away. Repair mode skips the deck and shows everyone.           */
const OWN_SEATS = JURY_SIZE - CHAMBER_SHARE;
const SENIORITY_LABEL = ["under 5 years","5–10 years","10–20 years","20+ years"];
function candidateOrder(){ return state.order.filter(id=>!isChamber(id)); }
/* the piles must agree with the board: whoever is on the board is in Yes,
   whoever leaves it goes to Maybe (they were once considered) */
function setPile(id,pile){
  ["yes","maybe","no"].forEach(k=>{ state.deck[k]=state.deck[k].filter(x=>x!==id); });
  if(pile) state.deck[pile].push(id);
}

function renderHandPick(){
  if(state.order.length===0) state.order=shuffle(PROFILES.map(p=>p.id));
  CHAMBER_NOMINATION.ids.forEach(id=>state.selected.add(id));   // the Chamber's seats are taken
  if(state.repairing || state.deckDone) renderTable(); else renderDeck();
}

/* the sticky bar shared by both rounds: hand, slots, fees, confirm */
function selectionBar(){
  const bar=el(`
    <div class="selbar two">
      <div class="row1">
        <div class="counter"><span id="cnt">0</span>/${JURY_SIZE}<small id="cntsub">chosen</small></div>
        <div class="hand" id="hand"></div>
        <div class="fees" id="fees"></div>
        <button class="btn" id="confirm" disabled>Confirm the board</button>
      </div>
      <div class="row2">
        <div class="slots" id="slots"></div>
        <p class="hint" id="task"></p>
      </div>
    </div>`);
  bar.querySelector("#confirm").onclick=onConfirmHandPick;
  return bar;
}

function refreshSel(){
  const hand=document.getElementById("hand"), slots=document.getElementById("slots");
  if(!hand) return;
  const n=state.selected.size, missing=missingFields(state.selected), cov=coverageOf(state.selected);
  document.getElementById("cnt").textContent=n;
  document.getElementById("cntsub").textContent = n>=JURY_SIZE ? "full" : `${JURY_SIZE-n} seat${JURY_SIZE-n>1?"s":""} left`;
  // the hand: chosen people as small cards, chamber first
  const ids=[...CHAMBER_NOMINATION.ids, ...state.order.filter(id=>state.selected.has(id)&&!isChamber(id))];
  hand.innerHTML="";
  ids.forEach(id=>{ const p=byId(id);
    const c=el(isChamber(id)
      ? `<div class="hcard chamber" title="Nominated by the Chamber"><b>${p.name.split(" ").pop()}</b><small>Chamber</small></div>`
      : `<button type="button" class="hcard" title="Remove ${p.name}" aria-label="Remove ${p.name} from the board"><b>${p.name.split(" ").pop()}</b><small>${eur(expertFee(p))}</small></button>`);
    if(!isChamber(id)) c.onclick=()=>{ state.selected.delete(id); if(state.deck.yes.includes(id)) setPile(id,"maybe"); SFX.no(); refreshSel(); const card=document.querySelector(`.card[data-id="${id}"]`); if(card){ card.classList.remove("sel"); card.setAttribute("aria-pressed","false"); card.className=card.className.replace(/pile-\w*/,"pile-maybe"); } };
    hand.appendChild(c); });
  for(let i=n;i<JURY_SIZE;i++) hand.appendChild(el(`<div class="hcard empty"><b>·</b></div>`));
  // the six slots
  slots.innerHTML="";
  FIELDS.forEach(f=>{
    const by=[...state.selected].filter(id=>FIELD_MAP[f.key].includes(id)).map(id=>byId(id).name.split(" ").pop());
    const sl=el(`<button type="button" class="slot ${cov[f.key]?"ok":"missing"}" style="--fc:${f.color}" data-k="${f.key}" title="${f.label} — ${f.note}"><b>${f.short}</b><small>${cov[f.key]?by.join(", "):"missing"}</small></button>`);
    if(!cov[f.key]) sl.onclick=()=>showCoverers(f,sl);
    slots.appendChild(sl);
  });
  // task line
  const task=document.getElementById("task");
  task.innerHTML = state.repairing
    ? `<b>Replace whoever you want.</b> Every replacement is a new search: ${REPAIR_WEEKS} weeks, ${eur(REPAIR_WEEKS*weekCost())}.`
    : `<b>${OWN_SEATS} seats are yours; the Chamber filled ${CHAMBER_SHARE}. Cover all six fields. Stay within budget.</b> Every member is paid from your budget — long careers cost more.`;
  // confirm + fees
  const c=document.getElementById("confirm");
  const ready = n===JURY_SIZE && missing.length===0;
  c.disabled=!ready;
  if(state.repairing){
    const sw=repairSwaps(), delta=feesOf(state.selected)-feesOf(new Set(state.repairBase));
    const cost=sw*REPAIR_WEEKS*weekCost()+delta, over=cost>state.budget;
    document.getElementById("fees").innerHTML=`Delay <b>+${sw*REPAIR_WEEKS} weeks · ${eur(sw*REPAIR_WEEKS*weekCost())}</b><small>fees ${delta>=0?"+":"−"}${eur(Math.abs(delta))} · budget ${eur(state.budget)}</small>`;
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

/* a missing slot, clicked: who in the pool could fill it (data, not advice) */
function showCoverers(f,anchor){
  document.querySelectorAll(".pop").forEach(p=>p.remove());
  const who=candidateOrder().filter(id=>FIELD_MAP[f.key].includes(id)&&!state.selected.has(id));
  const pop=el(`<div class="pop"><b>${f.label}</b><span>${f.note}</span><div class="who">${who.map(id=>{const p=byId(id);const pile=state.deck.no.includes(id)?" · in your No pile":"";return `<button class="link" data-jump="${id}">${p.name}</button><small>${p.spec}${pile}</small>`;}).join("")||"<em>Nobody left in the pool.</em>"}</div></div>`);
  anchor.parentElement.appendChild(pop);
  pop.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>{ pop.remove(); jumpTo(b.dataset.jump); });
  setTimeout(()=>document.addEventListener("click",function h(e){ if(!pop.contains(e.target)){ pop.remove(); document.removeEventListener("click",h); } }),0);
}
function jumpTo(id){
  if(!state.deckDone && !state.repairing){                 // still in the deck: jump to that card
    state.deck.idx=candidateOrder().indexOf(id); renderDeck(); return;
  }
  if(state.deck.no.includes(id) && !state.showNo){ state.showNo=true; renderTable(); }
  const c=document.querySelector(`.card[data-id="${id}"]`); if(!c) return;
  if(c.scrollIntoView) c.scrollIntoView({behavior:"smooth",block:"center"});
  c.classList.remove("pulse"); void c.offsetWidth; c.classList.add("pulse");
}

/* ---- round 1: the deck ---- */
function renderDeck(){
  stage.innerHTML="";
  stage.appendChild(kicker("the candidates"));
  stage.appendChild(selectionBar());
  const order=candidateOrder(), i=state.deck.idx;
  if(i>=order.length){ state.deckDone=true; renderTable(); return; }
  const p=byId(order[i]);
  const own=[...state.selected].filter(id=>!isChamber(id)).length;
  const inYes=state.selected.has(p.id);
  const shell=el(`<div class="deck">
    <div class="deck-progress">Candidate ${i+1} of ${order.length} · <span>Yes ${state.deck.yes.length} + ${CHAMBER_SHARE} Chamber · Maybe ${state.deck.maybe.length} · No ${state.deck.no.length}</span></div>
    <div class="bigcard">
      <div class="nm">${p.name}</div>
      <div class="ti">${p.title} · ${p.edu}</div>
      <div class="sp">${p.spec}</div>
      <p class="bio">${p.bio}</p>
      <div class="fields">${fieldsOf(p.id).map(k=>{const f=FIELDS.find(x=>x.key===k);return `<span class="ftag" style="--fc:${f.color}" title="${f.label}">${f.short}</span>`;}).join("")||'<span class="ftag none">none of the six fields</span>'}</div>
      <div class="fee">${eur(expertFee(p))} fee · ${SENIORITY_LABEL[p.sig.seniority]} in practice</div>
    </div>
    <div class="deck-actions">
      <button class="btn yes" id="d-yes" ${own>=OWN_SEATS&&!inYes?"disabled":""}>${inYes?"✓ On the board":"Yes"}<span class="cost">${own>=OWN_SEATS&&!inYes?"your six seats are taken — use Maybe":"onto the board"}</span></button>
      <button class="btn ghost" id="d-maybe">Maybe<span class="cost">decide at the table</span></button>
      <button class="btn ghost no" id="d-no">No<span class="cost">to the No pile</span></button>
    </div>
    <div class="deck-nav">${i>0?'<button class="link" id="d-prev">← previous</button>':''}<span></span><button class="link" id="d-table">Skip to the table →</button></div>
  </div>`);
  stage.appendChild(shell);
  const put=(pile)=>{ (pile==="yes"?SFX.yes:pile==="no"?SFX.no:SFX.card)();
    setPile(p.id,pile);
    if(pile==="yes") state.selected.add(p.id); else state.selected.delete(p.id);
    state.deck.idx++; renderDeck(); };
  document.getElementById("d-yes").onclick=()=>put("yes");
  document.getElementById("d-maybe").onclick=()=>put("maybe");
  document.getElementById("d-no").onclick=()=>put("no");
  const prev=document.getElementById("d-prev"); if(prev) prev.onclick=()=>{ state.deck.idx--; renderDeck(); };
  document.getElementById("d-table").onclick=()=>{ state.deckDone=true; renderTable(); };
  shell.appendChild(el(`<p class="keys">Keys: <kbd>Y</kbd> yes · <kbd>M</kbd> maybe · <kbd>N</kbd> no · <kbd>←</kbd> previous</p>`));
  refreshSel();
}
/* deck shortcuts — only while the deck is on screen and nothing else has focus */
document.addEventListener("keydown", e => {
  if(state.screen!=="p1" || state.deckDone || state.repairing || !document.querySelector(".deck")) return;
  if((e.target.matches && e.target.matches("input,textarea")) || e.altKey || e.ctrlKey || e.metaKey) return;
  const k=e.key.toLowerCase();
  const hit = k==="y"||k==="j" ? "#d-yes" : k==="m" ? "#d-maybe" : k==="n" ? "#d-no" : k==="arrowleft" ? "#d-prev" : null;
  if(!hit) return;
  const b=document.querySelector(hit); if(b && !b.disabled){ e.preventDefault(); b.click(); }
});

/* ---- round 2: the table ---- */
function renderTable(){
  stage.innerHTML="";
  stage.appendChild(kicker(state.repairing?"reopen the search":"the table"));
  stage.appendChild(selectionBar());
  const order=candidateOrder();
  const unseen=order.filter(id=>!state.deck.yes.includes(id)&&!state.deck.maybe.includes(id)&&!state.deck.no.includes(id));
  const shown = state.repairing ? order
              : order.filter(id=>state.showNo || !state.deck.no.includes(id));
  const noCount=state.deck.no.length;
  const head=el(`<div class="tablehead">
    <span>${state.repairing ? "Everyone in the pool. Your board is marked." : `${shown.length} people on the table${unseen.length?` (${unseen.length} you skipped)`:""}. Tap a card to add or remove, tap the name for details.`}</span>
    ${!state.repairing&&noCount ? `<button class="link" id="t-no">${state.showNo?"Hide":"Show"} the No pile (${noCount})</button>` : ""}
  </div>`);
  stage.appendChild(head);
  const grid=el(`<div class="grid compact" id="grid"></div>`);
  shown.forEach(id=>grid.appendChild(makeCard(byId(id))));
  stage.appendChild(grid);
  const tno=document.getElementById("t-no"); if(tno) tno.onclick=()=>{ state.showNo=!state.showNo; renderTable(); };
  refreshSel();
}

function makeCard(p){
  const pile=state.deck.no.includes(p.id)?"no":state.deck.maybe.includes(p.id)?"maybe":state.deck.yes.includes(p.id)?"yes":"";
  const c=el(`
    <div class="card${state.selected.has(p.id)?" sel":""} pile-${pile}" data-id="${p.id}" tabindex="0" role="button" aria-pressed="${state.selected.has(p.id)}" aria-label="${p.name}, ${p.spec}">
      <button type="button" class="nm">${p.name}</button>
      <div class="sp">${p.spec}</div>
      <div class="more" hidden><div class="ti">${p.title} · ${p.edu}</div><div class="bio">${p.bio}</div></div>
      <div class="fields"></div>
      <div class="fee">${eur(expertFee(p))} · ${SENIORITY_LABEL[p.sig.seniority]}</div>
    </div>`);
  const fl=c.querySelector(".fields");
  fieldsOf(p.id).forEach(k=>{ const f=FIELDS.find(x=>x.key===k); fl.appendChild(el(`<span class="ftag" data-k="${k}" style="--fc:${f.color}" title="${f.label}">${f.short}</span>`)); });
  c.querySelector(".nm").onclick=(e)=>{ e.stopPropagation(); const m=c.querySelector(".more"); m.hidden=!m.hidden; };
  c.onclick=()=>toggleCard(p,c);
  c.onkeydown=(e)=>{ if(e.target!==c) return; if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleCard(p,c); } };
  return c;
}

function toggleCard(p,c){
  if(state.selected.has(p.id)){ state.selected.delete(p.id); c.classList.remove("sel"); if(state.deck.yes.includes(p.id)) setPile(p.id,"maybe"); SFX.no(); }
  else{
    if(state.selected.size>=JURY_SIZE){ flashFull(); return; }
    state.selected.add(p.id); c.classList.add("sel"); setPile(p.id,"yes"); SFX.yes();
  }
  c.setAttribute("aria-pressed",String(state.selected.has(p.id)));
  refreshSel();
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
    if(sw*REPAIR_WEEKS*weekCost()+feesOf(state.selected)-feesOf(new Set(state.repairBase))>state.budget) return;
    spend("experts",feesOf(state.selected)-feesOf(new Set(state.repairBase)));
    if(sw>0) hudAddDelay(sw*REPAIR_WEEKS);          // at the old board's week cost — the search happens before the newcomers start
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
    line:w=>[ "Alte WU: Neun Köpfe,", "eine einzige Frau" ],
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
    SFX.headline();
    hudAddRep(r.rep);
    hudFeed(r.feed[0], r.feed[1]);
  }
  const [l1,l2]=r.line(w);
  const svg=newspaper({masthead:r.masthead,mastColor:r.mastColor,paper:r.paper,line1:l1,line2:l2,sub:r.sub});
  const sp=boardSplit();
  const voices=r.voices.map(([who,txt])=>`<div class="voice"><b>${who}</b><p>${txt}</p></div>`).join("");
  // the one line every paper adds when it applies: who put the women there
  const chamber = (sp.own.w===0 && sp.chamber.w>0)
    ? `<div class="voice chamber"><b>The caption</b><p>${sp.chamber.w===1?"The one woman on the board was nominated by the Chamber, not by the project.":"Every woman on the board was nominated by the Chamber, not by the project."}</p></div>` : "";
  stage.innerHTML="";
  stage.appendChild(kicker("the week after the first session"));
  const card=el(`<div class="appcard wide">
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
  stage.appendChild(kicker("what now"));
  const wrap=el(`<div class="slide wide">
    <h1>${state.abroadAsked?"Three ways to go on":"Four ways to go on"}</h1>
    <p class="lede">Nobody can make you do anything. Each of these is your choice, and each costs something different.</p>
    <div class="ways">
      ${state.abroadAsked ? "" : `<div class="way">
        <h3>Look abroad</h3>
        <p>Ask the Competition Office whether the search can be widened to architects outside Austria. The answer takes about two weeks.</p>
        <button class="btn ghost" id="opt-abroad">Send the enquiry</button>
      </div>`}
      <div class="way">
        <h3>Reopen the search</h3>
        <p>Replace members of the board. Every replacement is a new search: ${REPAIR_WEEKS} weeks and ${eur(REPAIR_WEEKS*weekCost())} in delay costs, plus the difference in fees.</p>
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
      hudFeed("Stadt Wien", `${c.label}.`);
      go("realworld");
    };
    comp.appendChild(b);
  });
  stage.appendChild(wrap);
  document.getElementById("opt-repair").onclick=()=>{
    state.response="repair"; state.repairing=true; state.repairBase=[...state.invited]; state.selected=new Set(state.invited);
    state.screen="p1"; renderPhasebar(); renderHUD(); stage.scrollTop=0; renderHandPick();
  };
  const ab=document.getElementById("opt-abroad");
  if(ab) ab.onclick=()=>go("abroad");
  document.getElementById("opt-sit").onclick=()=>{
    state.response="sitout"; hudAddRep(-10);
    hudFeed("Newsroom", "The story runs a second week.");
    go("realworld");
  };
}

/* The fourth way: realistic, and a dead end. Two weeks for an answer that
   quotes the Competition Standard back at you; the morning paper notices.
   WSA §3 Abs. 3 — at least half the jury must hold the entrants' qualification. */
function rAbroad(){
  stage.innerHTML="";
  stage.appendChild(kicker("two weeks later"));
  if(!state.abroadAsked){
    state.abroadAsked=true; SFX.headline();
    hudAddDelay(2); hudAddRep(-10);
    hudFeed("Kronen Zeitung","Wettbewerbsbüro sucht Experten im Ausland?");
  }
  const half=Math.ceil(JURY_SIZE/2), free=JURY_SIZE-half;
  const svg=newspaper({masthead:"KRONEN ZEITUNG",mastColor:"#d81e2c",paper:"#fffdf6",
    line1:"Wettbewerbsbüro sucht",line2:"Experten im Ausland?",
    sub:"Jury-Suche für Alte WU: Keine geeigneten Österreicher gefunden?"});
  const wrap=el(`<div class="slide wide">
    <div class="mail">
      <div class="from"><div class="crest">WIEN</div><div class="who">Stadt Wien<small>Competition Office · MA 21A</small></div></div>
      <div class="subject">Re: Widening the search</div>
      <div class="body">
        <p>Dear colleague,</p>
        <p>nothing prevents you from appointing jurors from abroad. Please note, however, §3(3) of the Competition Standard:
        where entrants must hold a particular professional qualification — here, an Austrian licence as architect or
        chartered engineer — at least half of the jury must hold the same or an equivalent qualification.</p>
        <p>Of your ${JURY_SIZE} seats, ${half} therefore require the Austrian licence. The Chamber’s ${CHAMBER_SHARE} nominees count towards this.
        That leaves ${free} seats you could fill from abroad — through a new search, on the same terms as any other replacement.</p>
        <p>Kind regards,<br>Stadt Wien, Competition Office</p>
      </div>
    </div>
    <div class="art abroad-art">${svg}</div>
    <p class="lede note">The enquiry took two weeks. The morning paper wondered aloud why the search was stalling. Nothing else changed.</p>
    <div class="btnbar"><button class="btn" id="ab-back">Back to your options</button></div>
  </div>`);
  stage.appendChild(wrap);
  document.getElementById("ab-back").onclick=()=>go("options");
}

function rRepaired(){
  stage.innerHTML="";
  stage.appendChild(kicker("board revised"));
  const sw=state.repairSwaps;
  const list=state.invited.map(id=>{const p=byId(id);const isNew=!state.repairBase.includes(id);return `<li>${p.name} — ${p.spec}${isNew?' <small>new</small>':''}</li>`;}).join("");
  stage.appendChild(el(`<div class="slide">
    <h1>Board revised</h1>
    <p class="lede">${sw===0 ? "You kept the board as it was. Nothing changed, nothing was spent."
      : `${sw} member${sw>1?"s":""} replaced. The new search took ${sw*REPAIR_WEEKS} weeks. Fees now ${eur(state.spend.experts)}, delay costs ${eur(state.spend.delay)}.`}</p>
    <div class="verdict"><ul>${list}</ul></div>
    <div class="btnbar"><button class="btn" id="rp-go">Carry on</button></div>
  </div>`));
  document.getElementById("rp-go").onclick=()=>go("realworld");
}

/* ========================================================================
   CONFIRM → INTERMEZZO → POOL REVEAL
   ======================================================================== */
function rConfirm(){
  stage.innerHTML="";
  const list=state.invited.map(id=>{const p=byId(id);return `<li>${p.name} — ${p.spec} <small>${eur(expertFee(p))}${isChamber(id)?" · Chamber":""}</small></li>`;}).join("");
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
    spend("experts",-state.spend.experts); state.invited=[]; state.deckDone=true;
    state.screen="p1"; renderPhasebar(); renderHUD(); stage.scrollTop=0; renderHandPick();
  };
  document.getElementById("send").onclick=()=>go("sendletter");
}

/* ---------- the formal invitation letter (ex draft-letter.js) ---------- */
function rSendLetter(){
  stage.innerHTML="";
  SFX.letter();
  const dateStr=fmtDate(gameDate(),"de-AT",{day:"2-digit",month:"long",year:"numeric"});
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
  document.getElementById("sl-send").onclick=()=>{ SFX.confirm(); state.stations.board="done"; state.stations.pr="open"; go("intermezzo"); };
}

/* ---------- terminal ticker before the pool (ex draft-reveal.js) ---------- */
function rIntermezzo(){
  const lines=[
    "Board complete. Invitations sent.",
    "First session: the Expert Pool. Thursday, 09:00.",
    `${JURY_SIZE} cabins, ${JURY_SIZE} name tags, ${JURY_SIZE} towels.`,
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
  SFX.pool();
  stage.appendChild(kicker("first session"));
  const wrap=el(`<div class="dr-reveal">
      <h2 class="dr-title">The Expert Pool</h2>
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
  stage.appendChild(kicker("your briefing"));
  const wrap=el(`<div class="slide wide">
    <h1>That was in your briefing.</h1>
    <div class="reveal-row">
      <div class="reveal-mail"></div>
      <div class="reveal-facts">
        <div class="fact"><div class="n">${need}</div><div class="t">at least 25% of ${JURY_SIZE} jurors — term 4 of the brief</div></div>
        <div class="fact"><div class="n">${w}</div><div class="t">${w===1?"woman":"women"} on your board${boardSplit().chamber.w?` — ${boardSplit().chamber.w} of them nominated by the Chamber`:""}</div></div>
      </div>
    </div>
    <div class="btnbar"><button class="btn" id="br-go">What now?</button></div>
  </div>`);
  wrap.querySelector(".reveal-mail").appendChild(briefMail({highlight:"balance"}));
  stage.appendChild(wrap);
  document.getElementById("br-go").onclick=()=>go("options");
}

/* ========================================================================
   END OF STATION 1 — the real Vienna, then optional reading.
   Two juries next to each other, three figures, no comment. "Read more"
   opens the dossier; "Continue" goes back to the map.
   ======================================================================== */
function juryTable(rows){
  return `<table><tr><th></th><th>Women</th><th>Men</th></tr>${rows.map(r=>`<tr class="${r.cls||""}"><td>${r.l}</td><td>${r.w}</td><td>${r.m}</td></tr>`).join("")}</table>`;
}
function rRealWorld(){
  const {w,m}=countInvited();
  stage.innerHTML="";
  stage.appendChild(kicker("meanwhile, in the real Vienna"));
  const real=juryTable([
    ...REAL_JURY.groups.map(g=>({l:g.label,w:g.women,m:g.men})),
    {l:"Full jurors",w:REAL_JURY.women,m:REAL_JURY.men,cls:"sum"},
    {l:"Substitutes",w:REAL_JURY.substitutes.women,m:REAL_JURY.substitutes.men},
  ]);
  const sp=boardSplit();
  const yours=juryTable([
    {l:"Chamber-nominated jurors",w:sp.chamber.w,m:sp.chamber.m},
    {l:"Your appointments",w:sp.own.w,m:sp.own.m},
    {l:"Full jurors",w,m,cls:"sum"},
    ...(state.compensation==="substitute"?[{l:"Substitutes",w:1,m:0}]:[]),
  ]);
  const tiles=OUTRO_FIGURES.map(f=>{ const src=SOURCES.find(x=>x.key===f.src); return `<div class="stat"><div class="n">${f.n}</div><div class="t">${f.t}</div><div class="src">${src?src.label:""}</div></div>`; }).join("");
  const wrap=el(`<div class="slide wide">
    <h1>The real jury</h1>
    <p class="lede">The competition for Campus Althangrund is real. The BIG launched it on 6 August 2025;
      the jury first met on 25–27 February 2026 and decides at the end of 2026.</p>
    <div class="juries">
      <div class="jury"><h3>Your board</h3>${yours}${(()=>{const need=echoes().filter(e=>e.when==="absent");const have=echoes().filter(e=>e.when==="present");return `<p class="names">${have.length?`Brings: ${have.map(e=>e.label).join(", ")}.`:""} ${need.length?`Will be bought in later: ${need.map(e=>e.label.toLowerCase()).join(", ")}.`:""}</p>`;})()}</div>
      <div class="jury"><h3>Campus Althangrund, 2026</h3>${real}
        <p class="names">${REAL_JURY.women_named.join(" · ")}</p>
        <p class="src">${REAL_JURY.source}</p></div>
    </div>
    <div class="stat-row">${tiles}</div>
    <div class="btnbar">
      <button class="btn ghost" id="rw-more">Read more</button>
      <button class="btn" id="rw-go">Continue to the map</button>
    </div>
  </div>`);
  stage.appendChild(wrap);
  document.getElementById("rw-more").onclick=()=>go("dossier");
  document.getElementById("rw-go").onclick=()=>go("map");
}

function rDossier(){
  stage.innerHTML="";
  stage.appendChild(kicker("dossier"));
  const items=DOSSIER.map(d=>{ const src=SOURCES.find(x=>x.key===d.src); return `<section class="doss"><h3>${d.h}</h3><p>${d.t}</p>${src?`<a class="src" href="${src.url}" target="_blank" rel="noopener">${src.label}</a>`:""}</section>`; }).join("");
  const docs=SOURCES.map(x=>`<li><a href="${x.url}" target="_blank" rel="noopener">${x.label}</a></li>`).join("");
  const terms=BRIEF_TERMS.filter(t=>t.source).map(t=>`<li><span class="no">Term ${state.briefTerms.indexOf(t.key)+1}</span>${t.source}</li>`).join("")
             +`<li><span class="no">Chamber</span>${CHAMBER_RULE.source}</li>`;
  const wrap=el(`<div class="slide wide">
    <h1>What the documents say</h1>
    <p class="lede">Eight short notes. Everything here is documented; every rule in your briefing is translated from one of these sources.</p>
    <div class="dossier">${items}</div>
    <div class="srcgrid">
      <div><h3>Documents</h3><ul class="sources">${docs}</ul></div>
      <div><h3>The five terms</h3><ul class="sources terms-src">${terms}</ul>
        <p class="disc">This prototype uses woman/man as simplified analytical categories to make one form of
        selection bias visible — it does not claim gender is fundamentally binary. Student figures count
        enrolments, not persons.</p></div>
    </div>
    <div class="btnbar"><button class="btn" id="ds-back">Back</button></div>
  </div>`);
  stage.appendChild(wrap);
  document.getElementById("ds-back").onclick=()=>{ const back=state.dossierReturn||"realworld"; state.dossierReturn=null; go(back); };
}

/* ========================================================================
   THE MAP — six stations. One done, one open, four visibly locked.
   The locks are part of the statement: this is the size of the real job.
   ======================================================================== */
function stationResult(key){
  if(key==="board") return `${state.invited.length} members · fees ${eur(state.spend.experts)}`;
  if(key==="pr" && state.prAction){ const a=PR_ACTIONS.find(x=>x.key===state.prAction), c=ACCESS_ACTIONS.find(x=>x.key===state.accessAction); return `${a.label}${state.prSeason==="now"?" (August)":""} · ${c?c.label:""} · ${eur(prPrice(a.cost)+(c?c.cost:0))}`; }
  return "";
}
function rMap(){
  stage.innerHTML="";
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
      ${s==="locked"&&STATION_PREVIEWS[st.key]?`<button class="link st-peek">What happens here?</button>`:""}
    </div>`);
    if(s==="open") card.querySelector(".st-go").onclick=()=>go(st.key==="board"?"p1":st.key);
    const peek=card.querySelector(".st-peek"); if(peek) peek.onclick=()=>{ state.previewKey=st.key; go("preview"); };
    map.appendChild(card);
  });
  stage.appendChild(wrap);
  const b=document.getElementById("map-build"); if(b) b.onclick=()=>go("latestations");
}

/* ---------- Station 2: Neighbours & PR — one decision ---------- */
function rPR(){
  stage.innerHTML="";
  stage.appendChild(kicker("Augasse, 9th district"));
  const card=el(`<div class="appcard wide">
    <span class="badge">Decision 1 of 2 · information</span>
    <h2>Neighbours &amp; PR</h2>
    <p>Four years of building site over a live railway, and the people next door did not choose it.
       Whatever you do here, they will hear the drilling. The question is what else they hear from you.</p>
    <div class="btnbar col mt" id="pr-actions"></div>
  </div>`);
  const bar=card.querySelector("#pr-actions");
  const disc=echo("participation");
  if(disc) card.querySelector("p").insertAdjacentHTML("afterend",`<p class="echo-note">${disc.line}</p>`);
  PR_ACTIONS.forEach(a=>{
    const price=prPrice(a.cost);
    const priceHtml = !a.cost ? "no cost" : disc ? `<s>${eur(a.cost)}</s> ${eur(price)}` : eur(a.cost);
    const b=el(`<button class="btn ${a.cost?"":"ghost"}" data-k="${a.key}">${a.label}<span class="cost">${priceHtml} · ${a.desc}</span></button>`);
    if(price>state.budget){ b.disabled=true; b.title="Not enough budget left"; }
    b.onclick=()=>{
      state.prAction=a.key;
      if(price) spend("pr",price);
      hudFeed("Augasse", a.rep>0 ? `${a.label}. The neighbours take note.` : "The neighbours hear the drilling. Nothing else.");
      if(a.key==="nothing"){ hudAddRep(a.rep); go("praccess"); }   // nothing planned, nothing delayed
      else go("prseason");
    };
    bar.appendChild(b);
  });
  stage.appendChild(card);
}

/* ---------- a locked station, looked at: what would happen here ---------- */
function rPreview(){
  const st=STATIONS.find(x=>x.key===state.previewKey), pv=STATION_PREVIEWS[state.previewKey];
  const i=STATIONS.indexOf(st)+1;
  const mine=echoes().filter(e=>e.station===st.key);
  stage.innerHTML="";
  stage.appendChild(el(`<div class="kicker"><b>Station ${i}</b> · ${st.label} · <span>${pv.when}</span></div>`));
  const card=el(`<div class="appcard wide preview">
    <span class="badge locked">🔒 Not playable in this prototype</span>
    <h2>${st.label}</h2>
    <div class="st-place">${st.place}</div>
    <p>${pv.text}</p>
    <div class="btnbar col mt">${pv.options.map(o=>`<button class="btn ghost" disabled>${o.label}<span class="cost">${o.cost}</span></button>`).join("")}</div>
    ${mine.length?`<div class="echo-list"><b>Your board here:</b><ul>${mine.map(e=>`<li>${e.line}${e.effect.consultants?` <span class="cost">${eur(e.effect.consultants)}</span>`:e.effect.saving?` <span class="gain">+${eur(e.effect.saving)}</span>`:""}</li>`).join("")}</ul></div>`:`<p class="echo-none">Nothing here traces back to your board.</p>`}
    <div class="btnbar"><button class="btn" id="pv-back">Back to the map</button></div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("pv-back").onclick=()=>go("map");
}

/* ---------- Station 2, the event: whatever you planned lands in August ---------- */
function rPRSeason(){
  stage.innerHTML="";
  stage.appendChild(kicker("summer 2027"));
  const a=PR_ACTIONS.find(x=>x.key===state.prAction);
  const card=el(`<div class="appcard wide">
    <span class="badge">Meanwhile</span>
    <div class="art">${ALTEDONAU_SVG}</div>
    <h2>Holiday season</h2>
    <p>By the time your ${a.label.toLowerCase()} is ready to go, it is July — and half of Vienna is at the Alte Donau. The district office answers in
       September, the neighbourhood association not at all. Nothing you did. Just the calendar.</p>
    <div class="btnbar col mt">
      <button class="btn" id="ps-wait">Wait for September<span class="cost">+2 weeks · ${eur(2*weekCost())} · the measure lands with full effect</span></button>
      <button class="btn ghost" id="ps-now">Go ahead now, half-empty<span class="cost">no delay · the measure reaches half the people</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("ps-wait").onclick=()=>{ state.prSeason="wait"; hudAddDelay(2); hudAddRep(a.rep); hudFeed("Augasse", "September. The container opens, the street fills up."); go("praccess"); };
  document.getElementById("ps-now").onclick=()=>{ state.prSeason="now"; hudAddRep(Math.round(a.rep/2)); hudFeed("Augasse", "August. A quiet turnout."); go("praccess"); };
}

/* ---------- Station 2, decision 2: the platform during four years of building ---------- */
function rPRAccess(){
  stage.innerHTML="";
  stage.appendChild(kicker("the district council asks"));
  const card=el(`<div class="appcard wide">
    <span class="badge">Decision 2 of 2 · access</span>
    <h2>Getting onto the Platte</h2>
    <p>The platform is a public route: from the Augasse over the tracks to the station. During construction the lifts
       and the ramp go. A councillor asks, in writing, how people with wheelchairs, prams and walking frames will get
       across for the next four years. §115 of the Building Code covers the finished building. The building site, it does not.</p>
    <div class="btnbar col mt" id="ac-actions"></div>
  </div>`);
  const bar=card.querySelector("#ac-actions");
  ACCESS_ACTIONS.forEach(a=>{
    const b=el(`<button class="btn ${a.cost?"":"ghost"}" data-k="${a.key}">${a.label}<span class="cost">${a.cost?eur(a.cost):"no cost"} · ${a.desc}</span></button>`);
    if(a.cost>state.budget){ b.disabled=true; b.title="Not enough budget left"; }
    b.onclick=()=>{
      state.accessAction=a.key; state.stations.pr="done";
      if(a.cost) spend("pr",a.cost);
      hudAddRep(a.rep);
      hudFeed("Bezirksrat Alsergrund", a.rep>0 ? "Answered. The ramp goes up before the hoarding does." : "Answered. The question comes back in the next session.");
      go("map");
    };
    bar.appendChild(b);
  });
  stage.appendChild(card);
}

/* ========================================================================
   STATIONS 3–6 IN ONE LINE EACH — not playable in this prototype, but the
   board still echoes there: expertise that is missing gets bought in,
   expertise that is there saves money or keeps a feature. Billed once.
   ======================================================================== */
function rLateStations(){
  stage.innerHTML="";
  const acts=echoes().filter(e=>["permits","partners","material","build"].includes(e.station));
  if(!state.lateBilled){
    state.lateBilled=true;
    acts.forEach(e=>{
      if(e.effect.consultants) spend("consultants",e.effect.consultants);
      if(e.effect.saving){ state.savings+=e.effect.saving; state.budget+=e.effect.saving; renderHUD(); }
    });
    ["permits","partners","material","build"].forEach(k=>state.stations[k]="done");
    renderPhasebar();
  }
  const rows=STATIONS.slice(2).map((st,i)=>{
    const mine=acts.filter(e=>e.station===st.key);
    const lines=mine.length ? mine.map(e=>`<li class="${e.effect.consultants?"cost":e.effect.saving?"gain":"keep"}"><b>${e.label}</b> — ${e.line}${e.effect.consultants?` <span>${eur(e.effect.consultants)}</span>`:e.effect.saving?` <span>+${eur(e.effect.saving)}</span>`:""}</li>`).join("")
                             : `<li class="none">Nothing here traces back to the board.</li>`;
    return `<div class="late"><div class="st-head"><span class="st-no">${i+3}</span><span class="st-state">not playable in this prototype</span></div><h3>${st.label}</h3><ul>${lines}</ul></div>`;
  }).join("");
  stage.appendChild(el(`<div class="kicker"><b>Stations 3–6</b> · 2027–2032</div>`));
  stage.appendChild(el(`<div class="slide wide">
    <h1>Four stations, one line each</h1>
    <p class="lede">You did not play these. Your board did — what it knew came for free, what it lacked was bought in.</p>
    <div class="lates">${rows}</div>
    <div class="btnbar"><button class="btn" id="ls-go">Opening day →</button></div>
  </div>`));
  document.getElementById("ls-go").onclick=()=>go("outro");
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
  const sp=boardSplit();
  const ch = (w>0 && sp.own.w===0) ? (w===1?" She was nominated by the Chamber.":" All of them were nominated by the Chamber.") : "";
  const sub = state.compensation==="substitute" ? " One more woman sat on the substitutes’ bench. She did not vote." : "";
  return `The design was chosen by ${who}.${ch}${sub}`;
}

function rOutro(){
  const t=FINISH_TEXT[finishTier().key];
  const spent=SPEND_CATS.filter(c=>state.spend[c.key]>0).map(c=>`<li><i style="background:${c.color}"></i>${c.label}<b>${eur(state.spend[c.key])}</b></li>`).join("");
  stage.innerHTML="";
  stage.appendChild(el(`<div class="kicker"><b>Opening day</b> · 2032</div>`));
  stage.appendChild(el(`<div class="slide wide">
    <h1>${t.h}</h1>
    <div class="art">${newWuSvg(finishTier().key,{roof:!!echo("roof"),interior:!!echo("interior")})}</div>
    <p class="lede">The WU stands. ${t.t}${echo("roof")&&finishTier().key!=="excellent"?" The green roof was kept anyway — it had been detailed by the board from day one.":""}${echo("interior")&&finishTier().key!=="excellent"?" Floors and lighting were kept as planned; the board had drawn them as one package.":""}</p>
    <div class="bill"><div class="k">Left for fit-out and finishes</div><div class="v">${eur(Math.max(0,state.budget))}</div>
      <ul class="legend">${spent}${state.savings?`<li><i style="background:#fff"></i>Savings<b>+${eur(state.savings)}</b></li>`:""}</ul></div>
    <div class="facts2">
      <div class="fact2"><p>${measureSentence()}</p></div>
      <div class="fact2"><p>${decidedSentence()}</p></div>
    </div>
    <div class="btnbar">
      <button class="btn ghost" id="end-dossier">Read the dossier</button>
      <button class="btn" id="again">Play again</button>
    </div>
  </div>`));
  document.getElementById("end-dossier").onclick=()=>{ state.dossierReturn="outro"; go("dossier"); };
  document.getElementById("again").onclick=resetGame;
}

function resetGame(){
  state.order=[]; state.selected=new Set(); state.invited=[];
  state.deck={idx:0,yes:[],maybe:[],no:[]}; state.deckDone=false; state.showNo=false;
  state.budget=BUDGET_START; state.spend=freshSpend();
  state.delayWeeks=0; state.rep=100;
  state.hudSeen={time:false,rep:false}; state.budgetOpen=false;
  state.reactionTier=null; state.response=null; state.compensation=null;
  state.repairing=false; state.repairBase=[]; state.repairSwaps=0; state.abroadAsked=false;
  state.lateBilled=false; state.savings=0;
  state.stations=freshStations(); state.prAction=null; state.prSeason=null; state.accessAction=null; state.previewKey=null;
  state.dossierReturn=null; introStep=0;
  go("intro");
}

/* ---------- test jumps: index.html#pr, #reveal, #options, #realworld, #map,
   #latestations, #outro. Seeds a finished board (6 own picks: mostly men,
   one woman) so every later screen has something to show. Not linked
   anywhere in the game.                                                    */
function debugJump(){
  const target=(location.hash||"").slice(1);
  const seedable=new Set(["reveal","reaction","briefreveal","options","realworld","map","pr","latestations","outro"]);
  if(!seedable.has(target)) return false;
  state.order=shuffle(PROFILES.map(p=>p.id));
  ["resch","hofer","brunner","schwarz","graf","danneberg",...CHAMBER_NOMINATION.ids].forEach(id=>state.selected.add(id));
  state.invited=[...state.selected]; state.deckDone=true;
  spend("experts",feesOf(state.selected));
  state.stations.board="done"; state.stations.pr="open";
  if(["map","pr","latestations","outro"].includes(target)){ state.reactionTier=3; state.response="sitout"; state.hudSeen.rep=true; state.rep=90; }
  if(["latestations","outro"].includes(target)){ state.prAction="container"; state.prSeason="wait"; state.accessAction="ramp"; state.stations.pr="done"; spend("pr",150000); hudAddDelay(2); }
  go(target);
  return true;
}

/* every button clicks; the mute switch in the title bar remembers itself */
stage.addEventListener("click", e => { if(e.target.closest("button")) SFX.click(); });
(function(){
  const b=document.getElementById("mute");
  const paint=()=>{ b.textContent=SFX.isMuted?"🔇":"🔊"; b.setAttribute("aria-pressed",String(SFX.isMuted)); };
  b.onclick=()=>{ SFX.mute(); paint(); if(!SFX.isMuted) SFX.click(); };
  paint();
})();

/* errors show up in the game itself, so testers can report the exact line */
window.addEventListener("error", e => showError(e.message + (e.filename ? ` (${e.filename.split("/").pop().split("?")[0]}:${e.lineno})` : "")));
window.addEventListener("unhandledrejection", e => showError(String(e.reason)));
function showError(msg){
  let bar=document.getElementById("errbar");
  if(!bar){ bar=el(`<div id="errbar" class="errbar"><b>Something broke:</b> <span></span> <button type="button">×</button></div>`); document.body.appendChild(bar); bar.querySelector("button").onclick=()=>bar.remove(); }
  bar.querySelector("span").textContent=msg;
}

/* boot: index.html calls start() after this file has loaded. */
function start(){ if(!debugJump()) go("intro"); }
