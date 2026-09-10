/* ==========================================================================
   parked-events.js — NOT LOADED by index.html.
   The pressure events of the old second round (kitchenette tip, Krone
   headline, holiday season, abroad enquiry) plus the City-of-Vienna mails
   they used. Kept as reference for the disruptor step (concept §7/§10).
   They still reference the old applicant list (state.candidates) and
   go("apps"); wiring them back in means rebuilding them on spend(),
   stations and the map. Art (KITCHEN_SVG, ALTEDONAU_SVG, KRONE_SVG) is in
   art.js. Like draft-sound.js: in the repo, not in the game.
   ========================================================================== */

/* City-of-Vienna narrator messages for the new flow:
   hand-pick → applications under pressure → pool reveal. No more "assistant". */
const VIENNA = {
  phase1: {
    subject:"New jury commission — the Old WU site",
    body:"Dear partner, the City of Vienna is delighted to entrust you with the jury for our Old WU competition. Please assemble nine excellent experts. Take your time — quality first. Warm regards, Stadt Wien.",
  },
  applications: {
    subject:"The official call has opened",
    body:"Wonderful start! We've now opened the formal public call, so candidates apply one by one and you review each in turn. A heads-up: the applicant field skews heavily male — that's the reality of the profession, not your doing. There's also a deadline. Do your best. Stadt Wien.",
  },
  deadline: {
    subject:"Deadline approaching",
    body:"A gentle reminder that the application window is closing. You may extend the call to wait for more applicants — but every extension delays the project start and adds cost. Your decision. Stadt Wien.",
  },
  quota: {
    subject:"Equal-representation guidelines",
    body:"For the record, our guidelines target a 50/50 jury. We know that's hard given who actually applies — so this is not a reproach to you. We simply have to note it. Stadt Wien.",
  },
  foreigners: {
    subject:"May we invite experts from abroad?",
    body:"You ask the City whether the pool could be widened to architects from outside Austria. The answer takes two weeks to come back: the call is restricted to the existing pool. No. Stadt Wien.",
  },
  moremen: {
    subject:"May we relax the balance target?",
    body:"You ask whether the 50/50 guideline could be set aside — simply fill the jury with whoever applied. That, too, has consequences. The city will need to officially respond, and the press will notice. Stadt Wien.",
  },
};

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
