/* ==========================================================================
   art.js — alle SVG-Illustrationen an einem Ort.
   Extrahiert aus dem Prototyp v2 (game.js, draft-reveal.js, draft-letter.js),
   inhaltlich unverändert. Wird vor game.js geladen.
   ========================================================================== */

/* SVG art: the Alte WU over the railway (flat, thick-ink, limited palette) */
const ALTEWU_SVG = `<svg viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The old WU campus: a long concrete building raised on a platform over the railway tracks of the Franz-Josefs-Bahnhof, Augasse, Vienna">
  <rect x="0" y="0" width="620" height="240" fill="#d6f0fb" stroke="none"/>
  <circle cx="548" cy="36" r="20" fill="#ffcf4d" stroke="#143041" stroke-width="3"/>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <!-- distant Gründerzeit rooftops of the Augasse -->
    <g fill="#cfe6ef">
      <rect x="20" y="78" width="34" height="34"/>
      <path d="M20 78 l17 -14 l17 14 z"/>
      <rect x="60" y="84" width="30" height="28"/>
      <path d="M60 84 l15 -12 l15 12 z"/>
    </g>
    <!-- the platform ("die Platte") raised over the tracks -->
    <rect x="0" y="112" width="620" height="14" fill="#9fb6c0"/>
    <!-- the long concrete slab building (UZA 1) -->
    <rect x="70" y="40" width="480" height="72" fill="#e7edf0"/>
    <!-- grid of windows -->
    <g fill="#a3e5f7" stroke-width="2">
      <rect x="88" y="52" width="22" height="18"/><rect x="120" y="52" width="22" height="18"/>
      <rect x="152" y="52" width="22" height="18"/><rect x="184" y="52" width="22" height="18"/>
      <rect x="216" y="52" width="22" height="18"/><rect x="248" y="52" width="22" height="18"/>
      <rect x="280" y="52" width="22" height="18"/><rect x="312" y="52" width="22" height="18"/>
      <rect x="344" y="52" width="22" height="18"/><rect x="376" y="52" width="22" height="18"/>
      <rect x="408" y="52" width="22" height="18"/><rect x="440" y="52" width="22" height="18"/>
      <rect x="472" y="52" width="22" height="18"/><rect x="504" y="52" width="22" height="18"/>
      <rect x="88" y="80" width="22" height="18"/><rect x="120" y="80" width="22" height="18"/>
      <rect x="152" y="80" width="22" height="18"/><rect x="184" y="80" width="22" height="18"/>
      <rect x="216" y="80" width="22" height="18" fill="#fffdf6"/><rect x="248" y="80" width="22" height="18"/>
      <rect x="280" y="80" width="22" height="18"/><rect x="312" y="80" width="22" height="18" fill="#fffdf6"/>
      <rect x="344" y="80" width="22" height="18"/><rect x="376" y="80" width="22" height="18"/>
      <rect x="408" y="80" width="22" height="18"/><rect x="440" y="80" width="22" height="18" fill="#fffdf6"/>
      <rect x="472" y="80" width="22" height="18"/><rect x="504" y="80" width="22" height="18"/>
    </g>
    <!-- concrete support pillars carrying the slab down to track level -->
    <rect x="96" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="216" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="336" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="456" y="126" width="20" height="78" fill="#cdd9df"/>
    <!-- the active goods railway running underneath -->
    <rect x="0" y="204" width="620" height="36" fill="#bcdfe9"/>
    <g stroke="#3a6378" stroke-width="2">
      <line x1="0" y1="214" x2="620" y2="214"/>
      <line x1="0" y1="230" x2="620" y2="230"/>
    </g>
    <!-- a small train passing through the shadow under the platform -->
    <rect x="150" y="180" width="120" height="24" rx="4" fill="#5cb9da"/>
    <rect x="160" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <rect x="186" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <rect x="212" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <circle cx="172" cy="206" r="5" fill="#143041"/>
    <circle cx="248" cy="206" r="5" fill="#143041"/>
    <!-- a lone tree of the Augasse, surviving at the edge -->
    <line x1="586" y1="204" x2="586" y2="150"/>
    <circle cx="586" cy="140" r="16" fill="#6fc08c"/>
  </g>
</svg>`;

/* Same building at night, empty: dark sky, moon, dark windows with three still lit. */
const ALTEWU_NIGHT_SVG = ALTEWU_SVG
  .replace('aria-label="The old WU campus:', 'aria-label="The old WU campus at night, almost every window dark:')
  .replace('<rect x="0" y="0" width="620" height="240" fill="#d6f0fb" stroke="none"/>', '<rect x="0" y="0" width="620" height="240" fill="#1d3a4d" stroke="none"/>')
  .replace('<circle cx="548" cy="36" r="20" fill="#ffcf4d" stroke="#143041" stroke-width="3"/>', '<circle cx="548" cy="36" r="18" fill="#fffdf6" stroke="#143041" stroke-width="3"/><circle cx="556" cy="30" r="14" fill="#1d3a4d" stroke="none"/>')
  .replace('<g fill="#cfe6ef">', '<g fill="#31515f">')
  .replace('<rect x="70" y="40" width="480" height="72" fill="#e7edf0"/>', '<rect x="70" y="40" width="480" height="72" fill="#5d7480"/>')
  .replace('<g fill="#a3e5f7" stroke-width="2">', '<g fill="#233d4b" stroke-width="2">')
  .replace(/fill="#fffdf6"\/><rect x="248"/, 'fill="#ffcf4d"/><rect x="248"')
  .replace(/height="18" fill="#fffdf6"\/>\n      <rect x="344"/, 'height="18" fill="#ffcf4d"/>\n      <rect x="344"')
  .replace(/height="18" fill="#fffdf6"\/>\n      <rect x="472"/, 'height="18" fill="#ffcf4d"/>\n      <rect x="472"')
  .replace('<rect x="0" y="112" width="620" height="14" fill="#9fb6c0"/>', '<rect x="0" y="112" width="620" height="14" fill="#6b8490"/>')
  .replace(/fill="#cdd9df"/g, 'fill="#4e6672"')
  .replace('<rect x="0" y="204" width="620" height="36" fill="#bcdfe9"/>', '<rect x="0" y="204" width="620" height="36" fill="#2b4a5a"/>')
  .replace('<circle cx="586" cy="140" r="16" fill="#6fc08c"/>', '<circle cx="586" cy="140" r="16" fill="#3f7a58"/>');

/* The project as a small map: six stations on a path, the first one lit. */
const MAP_MINI_SVG = `<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A route of six numbered stations, the first one highlighted">
  <rect x="0" y="0" width="620" height="200" fill="#d6f0fb" stroke="none"/>
  <path d="M80 140 C 150 140, 150 60, 220 60 S 290 140, 360 140 S 430 60, 500 60 L 540 60" fill="none" stroke="#143041" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round" font-family="'VT323',monospace" font-size="30" text-anchor="middle">
    <rect x="52" y="112" width="56" height="56" rx="10" fill="#ffcf4d"/><text x="80" y="151" fill="#143041" stroke="none">1</text>
    <rect x="192" y="32" width="56" height="56" rx="10" fill="#fffdf6"/><text x="220" y="71" fill="#3a6378" stroke="none">2</text>
    <rect x="332" y="112" width="56" height="56" rx="10" fill="#fffdf6"/><text x="360" y="151" fill="#3a6378" stroke="none">3</text>
    <rect x="472" y="32" width="56" height="56" rx="10" fill="#fffdf6"/><text x="500" y="71" fill="#3a6378" stroke="none">4</text>
  </g>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round">
    <rect x="556" y="20" width="52" height="80" rx="6" fill="#e7edf0"/>
    <rect x="564" y="30" width="10" height="8" fill="#a3e5f7"/><rect x="580" y="30" width="10" height="8" fill="#a3e5f7"/>
    <rect x="564" y="46" width="10" height="8" fill="#a3e5f7"/><rect x="580" y="46" width="10" height="8" fill="#a3e5f7"/>
    <rect x="564" y="62" width="10" height="8" fill="#a3e5f7"/><rect x="580" y="62" width="10" height="8" fill="#a3e5f7"/>
    <rect x="540" y="100" width="80" height="10" fill="#9fb6c0"/>
    <circle cx="586" cy="150" r="14" fill="#6fc08c"/><line x1="586" y1="164" x2="586" y2="184"/>
  </g>
  <text x="80" y="188" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#3a6378" text-anchor="middle">Board</text>
  <text x="220" y="20" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#3a6378" text-anchor="middle">Neighbours</text>
  <text x="360" y="188" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#3a6378" text-anchor="middle">Permits</text>
  <text x="500" y="20" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#3a6378" text-anchor="middle">Partners …</text>
</svg>`;

/* ---------- SVG art ---------- */
function newspaper({masthead,mastColor,paper,line1,line2,sub}){
  return `<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${masthead}: ${line1} ${line2}">
    <g stroke="#143041" stroke-width="3" stroke-linejoin="round">
      <rect x="0" y="0" width="620" height="250" fill="${paper}" stroke="none"/>
      <rect x="0" y="0" width="620" height="48" fill="${mastColor}" stroke="none"/>
      <text x="20" y="35" font-family="'VT323',monospace" font-size="34" fill="#fff" stroke="none" letter-spacing="1">${masthead}</text>
      <path d="M560 14 l8 12 l10 -14 l10 14 l8 -12 v18 h-44 z" fill="#ffcf4d"/>
      <text x="20" y="66" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#3a6378" stroke="none">WIEN · FREITAG · UNABHÄNGIG · € 1,20</text>
      <line x1="0" y1="74" x2="620" y2="74" stroke="#143041" stroke-width="2"/>
      <text x="20" y="118" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="34" fill="#143041" stroke="none">${line1}</text>
      <text x="20" y="156" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="34" fill="#143041" stroke="none">${line2}</text>
      <text x="20" y="182" font-family="'Space Grotesk',sans-serif" font-size="14" fill="#3a6378" stroke="none">${sub}</text>
      <rect x="20" y="196" width="150" height="44" rx="4" fill="#d9e7ee"/>
      <g stroke="#c3d5dd" stroke-width="6"><line x1="190" y1="204" x2="600" y2="204"/><line x1="190" y1="218" x2="600" y2="218"/><line x1="190" y1="232" x2="520" y2="232"/></g>
    </g></svg>`;
}
const KRONE_SVG = newspaper({masthead:"KRONEN ZEITUNG",mastColor:"#d81e2c",paper:"#fffdf6",
  line1:"Freunderlwirtschaft",line2:"bei der Alten WU?",
  sub:"Vergabe unter Verdacht – Jury soll Bekannte bevorzugt haben."});
const ALTEDONAU_SVG = `<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Crowds swimming and lounging at the Alte Donau on a summer day, the Donauturm in the background">
  <rect x="0" y="0" width="620" height="200" fill="#d6f0fb"/>
  <circle cx="548" cy="34" r="22" fill="#ffcf4d" stroke="#143041" stroke-width="3"/>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <rect x="0" y="82" width="620" height="22" fill="#8bd0a0" stroke="none"/>
    <path d="M108 96 L112 40 M112 40 L116 96" fill="none"/>
    <ellipse cx="112" cy="44" rx="17" ry="7" fill="#d7f4ff"/>
    <line x1="112" y1="37" x2="112" y2="28"/>
    <line x1="206" y1="92" x2="206" y2="80"/><circle cx="206" cy="74" r="12" fill="#6fc08c"/>
    <line x1="250" y1="92" x2="250" y2="82"/><circle cx="250" cy="78" r="10" fill="#6fc08c"/>
    <line x1="420" y1="92" x2="420" y2="80"/><circle cx="420" cy="74" r="12" fill="#6fc08c"/>
    <rect x="0" y="100" width="620" height="100" fill="#5cb9da" stroke="none"/>
    <circle cx="70" cy="126" r="9" fill="#ffe1ef"/><path d="M58 132 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="150" cy="138" r="9" fill="#ffd9c2"/><path d="M138 144 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="225" cy="128" r="9" fill="#ffe1ef"/><path d="M213 134 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="470" cy="132" r="9" fill="#ffd9c2"/><path d="M458 138 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="540" cy="146" r="9" fill="#ffe1ef"/><path d="M528 152 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="370" cy="150" r="9" fill="#ffd9c2"/><path d="M358 156 q12 8 24 0" fill="none" stroke-width="2"/>
    <path d="M280 130 q40 22 70 0 z" fill="#ffc2df"/>
    <circle cx="300" cy="120" r="8" fill="#ffe1ef"/><circle cx="330" cy="120" r="8" fill="#ffd9c2"/>
    <g stroke="#a3e5f7" stroke-width="3" fill="none">
      <path d="M0 112 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
      <path d="M0 168 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
    </g>
    <rect x="0" y="180" width="620" height="20" fill="#ffe9b8" stroke="none"/>
    <line x1="0" y1="180" x2="620" y2="180"/>
    <rect x="40" y="184" width="60" height="10" rx="3" fill="#ff9bbf"/>
    <circle cx="60" cy="180" r="7" fill="#ffe1ef"/>
    <rect x="180" y="186" width="60" height="9" rx="3" fill="#ffcf4d"/>
    <circle cx="200" cy="182" r="7" fill="#ffd9c2"/>
    <rect x="470" y="185" width="60" height="9" rx="3" fill="#ff9bbf"/>
    <circle cx="500" cy="181" r="7" fill="#ffe1ef"/>
  </g></svg>`;

const KITCHEN_SVG = `<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="130" width="320" height="12" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="60" y="142" width="320" height="40" fill="#a3e5f7" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="72" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="142" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="212" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="282" y="148" width="88" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="60" y="60" width="140" height="60" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="68" y="66" width="58" height="48" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <rect x="134" y="66" width="58" height="48" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <rect x="220" y="88" width="40" height="42" rx="2" fill="#143041" stroke="#143041" stroke-width="3"/>
  <rect x="226" y="94" width="28" height="16" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <circle cx="240" cy="118" r="6" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
  <path d="M236 86 Q234 80 236 74" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <path d="M244 86 Q242 78 244 70" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <rect x="290" y="116" width="20" height="14" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <path d="M310 120 Q316 120 316 124 Q316 128 310 128" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <rect x="318" y="116" width="20" height="14" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <path d="M338 120 Q344 120 344 124 Q344 128 338 128" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <circle cx="116" cy="88" r="16" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="100" y="74" width="32" height="8" rx="4" fill="#143041"/>
  <rect x="100" y="104" width="32" height="36" rx="4" fill="#4fb286" stroke="#143041" stroke-width="3"/>
  <rect x="86" y="106" width="14" height="24" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="132" y="106" width="14" height="24" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <circle cx="182" cy="85" r="16" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="166" y="71" width="32" height="10" rx="4" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
  <rect x="166" y="101" width="32" height="36" rx="4" fill="#a3e5f7" stroke="#143041" stroke-width="3"/>
  <rect x="148" y="103" width="18" height="12" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <ellipse cx="148" cy="68" rx="26" ry="16" fill="#fffdf6" stroke="#143041" stroke-width="3"/>
  <polygon points="158,78 168,84 154,84" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <circle cx="136" cy="68" r="3" fill="#143041"/>
  <circle cx="148" cy="68" r="3" fill="#143041"/>
  <circle cx="160" cy="68" r="3" fill="#143041"/>
  <line x1="40" y1="182" x2="580" y2="182" stroke="#143041" stroke-width="3"/>
  <rect x="440" y="50" width="100" height="120" rx="4" fill="#a3e5f7" stroke="#143041" stroke-width="3"/>
  <line x1="490" y1="50" x2="490" y2="170" stroke="#143041" stroke-width="2"/>
  <line x1="440" y1="110" x2="540" y2="110" stroke="#143041" stroke-width="2"/>
  <ellipse cx="518" cy="158" rx="12" ry="10" fill="#4fb286" stroke="#143041" stroke-width="2"/>
</svg>`;

/* ---------- Amtsstempel auf dem Einladungsbrief (aus draft-letter.js) ---------- */
const STAMP_SVG = `<svg viewBox="0 0 80 80" width="80" height="80">
      <circle cx="40" cy="40" r="36" fill="none" stroke="#143041" stroke-width="3"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="#143041" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="40" y="32" text-anchor="middle" font-family="VT323,monospace" font-size="14" fill="#143041">STADT</text>
      <text x="40" y="48" text-anchor="middle" font-family="VT323,monospace" font-size="18" fill="#143041">WIEN</text>
      <text x="40" y="60" text-anchor="middle" font-family="VT323,monospace" font-size="10" fill="#143041">WETTBEWERB</text>
    </svg>`;

/* ---------- Pappfiguren & Kabinen (aus draft-reveal.js) ---------- */
function _paperDoll({ overflow = false, empty = false } = {}) {
  if (empty) {
    // Empty seat: dashed rectangle
    return `<svg width="50" height="80" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="42" height="72" rx="6"
        fill="none" stroke="#143041" stroke-width="2"
        stroke-dasharray="6 4" opacity="0.35"/>
      <text x="25" y="46" text-anchor="middle"
        font-family="VT323,monospace" font-size="22"
        fill="#143041" opacity="0.3">?</text>
    </svg>`;
  }

  const outlineColor = overflow ? '#e53935' : '#143041';
  const bgColor      = overflow ? '#ffc2df' : 'none';
  const bodyFill     = '#e8cfa0';
  const strokeW      = overflow ? '3' : '2.5';

  return `<svg width="50" height="80" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
    ${bgColor !== 'none' ? `<rect x="0" y="0" width="50" height="80" rx="7" fill="${bgColor}" opacity="0.45"/>` : ''}
    <!-- head -->
    <circle cx="25" cy="14" r="10"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- eyes -->
    <circle cx="21" cy="13" r="1.5" fill="${outlineColor}"/>
    <circle cx="29" cy="13" r="1.5" fill="${outlineColor}"/>
    <!-- torso -->
    <rect x="14" y="26" width="22" height="24" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- left arm -->
    <rect x="4" y="27" width="9" height="18" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- right arm -->
    <rect x="37" y="27" width="9" height="18" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- left leg -->
    <rect x="14" y="51" width="9" height="22" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- right leg -->
    <rect x="27" y="51" width="9" height="22" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
  </svg>`;
}

function _cabinIcon(label) {
  // Kleines Häuschen als Pool-Kabine
  return `<svg width="54" height="36" viewBox="0 0 54 36" xmlns="http://www.w3.org/2000/svg">
    <!-- Dach -->
    <polygon points="27,3 51,18 3,18"
      fill="#5cb9da" stroke="#143041" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Wand -->
    <rect x="8" y="17" width="38" height="18" rx="2"
      fill="#fffdf6" stroke="#143041" stroke-width="2.5"/>
    <!-- Nummer -->
    <text x="27" y="31" text-anchor="middle"
      font-family="VT323,monospace" font-size="13" fill="#143041">${label}</text>
  </svg>`;
}


/* ----------------------------------------------------------
   makeLane(label, count, target, overflowStyle)
   Renders one row of pool cabins with paper-doll figures.

   label        – row heading string
   count        – how many people are actually in this lane
   target       – how many slots the pool prepared (WOMEN_TARGET or MEN_TARGET)
   overflowStyle– 'overflow' | 'missing'  (not used directly; derived from count vs target)
   ---------------------------------------------------------- */

/* ---------- Schwimmhalle / Expert Pool (aus draft-reveal.js) ---------- */
const POOLHALL_SVG = `
        <svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="620" height="200" fill="#fffdf6"/>
          <rect x="60" y="90" width="500" height="80" fill="#a3e5f7" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="60" y="90" width="500" height="6" fill="#ffcf4d" stroke="none"/>
          <line x1="60" y1="115" x2="560" y2="115" stroke="#143041" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.5"/>
          <line x1="60" y1="140" x2="560" y2="140" stroke="#143041" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.5"/>
          <path d="M60 105 Q80 100 100 105 Q120 110 140 105 Q160 100 180 105 Q200 110 220 105 Q240 100 260 105 Q280 110 300 105 Q320 100 340 105 Q360 110 380 105 Q400 100 420 105 Q440 110 460 105 Q480 100 500 105 Q520 110 540 105 Q560 100 560 105" fill="none" stroke="#143041" stroke-width="1.5" opacity="0.4"/>
          <rect x="56" y="86" width="508" height="8" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="56" y="168" width="508" height="8" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="50" y="86" width="10" height="90" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="560" y="86" width="10" height="90" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="62" y="72" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="68" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="62" y="97" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="93" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="62" y="122" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="118" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="440" y="36" width="130" height="54" rx="3" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="448" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="448" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="448" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="480" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="480" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="480" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="512" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="512" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="512" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="544" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="544" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="544" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="440" y="26" width="130" height="12" rx="2" fill="#143041"/>
          <rect x="10" y="60" width="30" height="60" rx="2" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="4" y="56" width="42" height="8" rx="2" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="14" y="118" width="6" height="24" fill="#143041"/>
          <rect x="30" y="118" width="6" height="24" fill="#143041"/>
          <rect x="14" y="128" width="22" height="4" fill="#143041"/>
          <rect x="10" y="42" width="30" height="16" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
          <line x1="25" y1="42" x2="25" y2="26" stroke="#143041" stroke-width="2"/>
          <polygon points="25,26 38,30 25,34" fill="#ffc2df" stroke="#143041" stroke-width="1.5" stroke-linejoin="round"/>
          <rect x="0" y="176" width="620" height="24" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <ellipse cx="200" cy="128" rx="30" ry="6" fill="#fffdf6" opacity="0.3"/>
          <ellipse cx="380" cy="118" rx="20" ry="4" fill="#fffdf6" opacity="0.3"/>
        </svg>
`;
