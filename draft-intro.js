function rIntro(){
  stage.innerHTML="";
  stage.appendChild(el(`
    <div class="slide">
      <h1>Pool of<br>Experts</h1>
      <p class="lede">Vienna's 9th district, Augasse. A brutalist concrete structure spans
      the railway tracks — built in the 1970s, worn by decades, and now standing at the
      centre of one of the city's most ambitious projects: the old WU campus is being
      transformed into a mixed-use district for 18,000 students, researchers, and residents.</p>
      <p class="lede">The architectural competition is already running. The city needs a
      jury — seven independent experts who will decide which vision wins, and what this
      piece of Vienna becomes.</p>
      <p class="lede">That jury is your job. You have a shortlist of candidates, a budget,
      and a deadline. The city is watching. The clock is already running.</p>
      <p class="lede">Pick the best people. That's the whole job.</p>
      <div class="btnbar"><button class="btn" id="go">Open the brief</button></div>
    </div>`));
  document.getElementById("go").onclick=()=>go("p1");
}
