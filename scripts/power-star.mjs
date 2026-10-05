// Turns the snake from Platane/snk into a rainbow Power Star.
//
// Usage: node scripts/power-star.mjs <input.svg> <output.svg>
//
// What it does to the SVG snk spits out:
//   1. The snake head (.s0) becomes a big beveled star with a scrolling
//      rainbow gradient, like the Mario 64 Power Star.
//   2. The rest of the snake body is swapped for a trail of little stars
//      that follow the head's exact path, shrink, fade out and cycle
//      through the rainbow.
//   3. Every contribution square the star eats flashes through the
//      rainbow before it fades to empty.

import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/power-star.mjs <input.svg> <output.svg>");
  process.exit(1);
}

// ---- knobs ---------------------------------------------------------------

const CELL = 16; // snk default sizeCell
const STAR_RADIUS = 11; // head size, a bit bigger than one cell
const TRAIL_LENGTH = 14; // number of little stars behind the head
const TRAIL_SPACING_MS = 40; // how far behind each trail star is
const RAINBOW_CYCLE_S = 1.6; // how fast colors cycle
const EATEN_FADE_MS = 1400; // how long an eaten square shimmers

const RAINBOW = [
  "#ff2a2a", // red
  "#ff9a1f", // orange
  "#ffe81f", // yellow
  "#3bf03b", // green
  "#1ff0f0", // cyan
  "#2a6bff", // blue
  "#ff2aff", // magenta
];

// ---- helpers -------------------------------------------------------------

const starPoints = (outer, inner, cx = 0, cy = 0) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
};

const rainbowLoop = [...RAINBOW, RAINBOW[0]].join(";");

let svg = readFileSync(input, "utf8");

const durationMatch = svg.match(/\.c\{[^}]*animation:none (\d+)ms/);
if (!durationMatch) throw new Error("could not find the animation duration in the svg");
const duration = Number(durationMatch[1]);

// ---- 1. gradients --------------------------------------------------------

// spreadMethod=repeat + sliding the gradient by one full box = endless scroll
const gradientStops = [...RAINBOW, RAINBOW[0]]
  .map((c, i, a) => `<stop offset="${((i / (a.length - 1)) * 100).toFixed(1)}%" stop-color="${c}"/>`)
  .join("");

const defs = `<defs>
<linearGradient id="ps-rainbow" x1="0" y1="0" x2="0.35" y2="1" spreadMethod="repeat">${gradientStops}
<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="0 1" dur="${RAINBOW_CYCLE_S}s" repeatCount="indefinite"/>
</linearGradient>
<linearGradient id="ps-face" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#fff" stop-opacity=".3"/>
<stop offset="50%" stop-color="#fff" stop-opacity=".05"/>
<stop offset="100%" stop-color="#fff" stop-opacity=".15"/>
</linearGradient>
<radialGradient id="ps-glow">
<stop offset="0%" stop-color="#fff" stop-opacity=".55"/>
<stop offset="100%" stop-color="#fff" stop-opacity="0"/>
</radialGradient>
</defs>`;

svg = svg.replace("</style>", "</style>" + defs);

// ---- 2. the Power Star head ---------------------------------------------

const R = STAR_RADIUS;
const outerStar = starPoints(R, R * 0.55);
const innerStar = starPoints(R * 0.74, R * 0.74 * 0.55, 0, R * 0.03);
const highlight = (() => {
  // bright edge along the top-left arms, like light hitting the bevel
  const p = starPoints(R * 0.86, R * 0.86 * 0.55).split(" ");
  return [p[7], p[8], p[9], p[0]].join(" ");
})();

const head = `<g class="s s0"><g transform="translate(${CELL / 2} ${CELL / 2})">
<circle r="${R * 1.5}" fill="url(#ps-glow)">
<animate attributeName="opacity" values=".5;1;.5" dur="0.8s" repeatCount="indefinite"/>
</circle>
<g>
<animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="0.8s" repeatCount="indefinite"/>
<polygon points="${outerStar}" fill="url(#ps-rainbow)" stroke="url(#ps-rainbow)" stroke-width="2" stroke-linejoin="round"/>
<polygon points="${outerStar}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="0.6" stroke-linejoin="round"/>
<polygon points="${innerStar}" fill="url(#ps-face)" stroke="#000" stroke-opacity=".12" stroke-width="0.5" stroke-linejoin="round"/>
<polyline points="${highlight}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g></g>`;

// ---- 3. rainbow trail ----------------------------------------------------

// Each trail star reuses the head's movement (class s0) but starts a little
// later, so it sits exactly where the head was a moment ago.
const trail = [];
for (let i = TRAIL_LENGTH; i >= 1; i--) {
  const k = i / TRAIL_LENGTH; // 0 = right behind head, 1 = end of trail
  const r = R * (0.55 - 0.35 * k);
  const opacity = (0.9 * (1 - k) + 0.08).toFixed(2);
  const begin = (-(i * RAINBOW_CYCLE_S) / TRAIL_LENGTH).toFixed(2);
  trail.push(
    `<g class="s s0" style="animation-delay:${i * TRAIL_SPACING_MS}ms"><g transform="translate(${CELL / 2} ${CELL / 2}) rotate(${i * 17})" opacity="${opacity}">` +
      `<polygon points="${starPoints(r, r * 0.5)}" fill="${RAINBOW[0]}" stroke-linejoin="round">` +
      `<animate attributeName="fill" values="${rainbowLoop}" dur="${RAINBOW_CYCLE_S}s" begin="${begin}s" repeatCount="indefinite"/>` +
      `</polygon></g></g>`,
  );
}

// snk draws the body as <rect class="s sN" .../>. Drop them all and put the
// trail + head where they were (trail first so the head draws on top).
const snakeRects = /<rect class="s s\d+"[^>]*\/>/g;
const firstRect = svg.search(snakeRects);
if (firstRect === -1) throw new Error("could not find the snake in the svg");
svg = svg.replace(snakeRects, "");
svg = svg.slice(0, firstRect) + trail.join("") + head + svg.slice(firstRect);

// ---- 4. eaten squares shimmer rainbow -----------------------------------

// snk writes: @keyframes cX{T1%{fill:var(--cN)}T2%,100%{fill:var(--ce)}}
// We slot a quick run through the rainbow between T2 and the fade to empty.
const fadePct = (EATEN_FADE_MS / duration) * 100;
const pct = (x) => `${parseFloat(x.toFixed(3))}%`;

svg = svg.replace(
  /@keyframes (c[0-9a-z]+)\{([\d.]+)%\{fill:var\(--c(\d)\)\}([\d.]+)%,100%\{fill:var\(--ce\)\}\}/g,
  (match, name, t1, color, t2) => {
    const start = parseFloat(t2);
    const end = Math.min(start + fadePct, 99.99);
    if (end - start < 0.01) return match;

    const frames = [`${t1}%{fill:var(--c${color})}`];
    RAINBOW.forEach((c, i) => {
      const t = start + ((end - start) * i) / RAINBOW.length;
      frames.push(`${pct(t)}{fill:${c}}`);
    });
    frames.push(`${pct(end)},100%{fill:var(--ce)}`);
    return `@keyframes ${name}{${frames.join("")}}`;
  },
);

svg = svg.replace(
  "<desc>Generated with https://github.com/Platane/snk</desc>",
  "<desc>Generated with https://github.com/Platane/snk, Power Star mod</desc>",
);

writeFileSync(output, svg);
console.log(`⭐ wrote ${output}`);
