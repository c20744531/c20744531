// ---------- Sign drawings ----------
// Every sign is drawn as an SVG so there are no image files to manage.
const YELLOW = "#FFD100";
const RED = "#D21F26";
const BLUE = "#0057A8";
const BLACK = "#111";

const svg = (inner) =>
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// Yellow diamond used for Irish warning signs
const warning = (inner) =>
  svg(`<rect x="41" y="41" width="118" height="118" rx="10" transform="rotate(45 100 100)"
        fill="${YELLOW}" stroke="${BLACK}" stroke-width="7"/>${inner}`);

// White circle with red ring used for most regulatory signs
const roundel = (inner) =>
  svg(`<circle cx="100" cy="100" r="84" fill="#fff" stroke="${RED}" stroke-width="18"/>${inner}`);

// Blue circle used for mandatory signs
const mandatory = (inner) =>
  svg(`<circle cx="100" cy="100" r="90" fill="${BLUE}"/>${inner}`);

const line = (d, width = 14, colour = BLACK) =>
  `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linejoin="round"/>`;

const slash = `<line x1="42" y1="42" x2="158" y2="158" stroke="${RED}" stroke-width="16"/>`;

const speed = (n) =>
  roundel(`<text x="100" y="114" text-anchor="middle" font-family="Arial, sans-serif"
            font-weight="700" font-size="60">${n}</text>
           <text x="100" y="146" text-anchor="middle" font-family="Arial, sans-serif"
            font-weight="700" font-size="20">km/h</text>`);

function octagon() {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    pts.push(`${100 + 90 * Math.cos(a)},${100 + 90 * Math.sin(a)}`);
  }
  return pts.join(" ");
}

// Small arrowheads around a circle for the roundabout sign (clockwise in Ireland)
const roundaboutArrows = [0, 120, 240]
  .map((a) => `<path d="M114 100 L138 100 L126 118 Z" fill="${BLACK}" transform="rotate(${a} 100 100)"/>`)
  .join("");

// Simple figure of a child for the school sign
const child = (x, scale) =>
  `<g transform="translate(${x} 0) scale(${scale})" fill="${BLACK}">
     <circle cx="0" cy="70" r="9"/>
     <path d="M-9 82 h18 l3 30 h-24 z"/>
     ${line("M-6 112 L-12 140 M6 112 L12 140", 7)}
   </g>`;

// ---------- Sign data ----------
// category is used to pick sensible wrong answers (similar type of sign).
const SIGNS = [
  // Warning signs
  {
    name: "Crossroads ahead",
    category: "warning",
    svg: warning(line("M100 55 V145 M55 100 H145")),
    explain:
      "A road crosses yours ahead. Slow down, look both ways and be ready to give way to traffic on the other road.",
  },
  {
    name: "T-junction ahead",
    category: "warning",
    svg: warning(line("M100 145 V75 M56 75 H144")),
    explain:
      "Your road ends ahead and you'll have to turn left or right. Slow down and be ready to stop and yield to traffic on the main road.",
  },
  {
    name: "Side road on the left",
    category: "warning",
    svg: warning(line("M108 148 V52 M108 100 H60")),
    explain:
      "A minor road joins from the left ahead. Watch for vehicles pulling out of it, and for vehicles slowing to turn in.",
  },
  {
    name: "Dangerous bend to the right",
    category: "warning",
    svg: warning(line("M85 148 V110 Q85 72 128 64", 16)),
    explain:
      "There's a sharp bend to the right ahead. Get your speed down before the bend, not while you're in it, and keep left.",
  },
  {
    name: "Series of bends, first to the left",
    category: "warning",
    svg: warning(line("M112 150 C112 122 82 122 88 100 C94 80 120 80 108 52", 14)),
    explain:
      "More than one bend is coming up, and the first goes to the left. Slow down and don't overtake through the bends.",
  },
  {
    name: "Roundabout ahead",
    category: "warning",
    svg: warning(
      `<circle cx="100" cy="100" r="26" fill="none" stroke="${BLACK}" stroke-width="10"/>${roundaboutArrows}`
    ),
    explain:
      "A roundabout is coming up. Slow down, pick your lane early and yield to traffic already on the roundabout, coming from your right.",
  },
  {
    name: "Traffic lights ahead",
    category: "warning",
    svg: warning(`<rect x="80" y="50" width="40" height="100" rx="8" fill="${BLACK}"/>
      <circle cx="100" cy="70" r="11" fill="#e53935"/>
      <circle cx="100" cy="100" r="11" fill="#ffb300"/>
      <circle cx="100" cy="130" r="11" fill="#43a047"/>`),
    explain:
      "There are traffic lights ahead that you might not see yet, maybe around a bend. Be ready to stop.",
  },
  {
    name: "Road narrows on both sides",
    category: "warning",
    svg: warning(line("M76 150 V122 L90 96 V50 M124 150 V122 L110 96 V50", 11)),
    explain:
      "The road gets narrower ahead. Slow down and watch for oncoming traffic, especially wide vehicles.",
  },
  {
    name: "School ahead",
    category: "warning",
    svg: warning(child(86, 1) + child(116, 0.85)),
    explain:
      "There's a school nearby, so expect children crossing or walking along the road. Slow down, and watch out for school wardens.",
  },
  {
    name: "Slippery road ahead",
    category: "warning",
    svg: warning(`<rect x="74" y="62" width="52" height="30" rx="8" fill="${BLACK}"/>
      <rect x="70" y="86" width="14" height="14" rx="3" fill="${BLACK}"/>
      <rect x="116" y="86" width="14" height="14" rx="3" fill="${BLACK}"/>
      ${line("M84 108 q10 10 0 20 q-10 10 0 20 M116 108 q10 10 0 20 q-10 10 0 20", 6)}`),
    explain:
      "The road surface can be slippery. Slow down, avoid harsh braking or steering, and leave a bigger gap.",
  },
  {
    name: "Traffic merging from the left",
    category: "warning",
    svg: warning(line("M112 150 V50 M68 140 L112 96", 13)),
    explain:
      "Traffic will join your road from the left ahead. Watch for merging vehicles and let them in where it's safe.",
  },
  {
    name: "Level crossing without gates or barriers",
    category: "warning",
    svg: warning(`<rect x="62" y="84" width="76" height="34" fill="${BLACK}"/>
      <rect x="106" y="66" width="32" height="20" fill="${BLACK}"/>
      <rect x="70" y="70" width="10" height="16" fill="${BLACK}"/>
      <circle cx="76" cy="124" r="8" fill="${BLACK}"/>
      <circle cx="100" cy="124" r="8" fill="${BLACK}"/>
      <circle cx="124" cy="124" r="8" fill="${BLACK}"/>`),
    explain:
      "A railway line crosses the road ahead with no gates or barriers. Slow down, look and listen both ways, and only cross when you're sure no train is coming.",
  },

  // Regulatory signs
  {
    name: "Stop",
    category: "regulatory",
    svg: svg(`<polygon points="${octagon()}" fill="${RED}" stroke="#fff" stroke-width="6"/>
      <text x="100" y="116" text-anchor="middle" font-family="Arial, sans-serif"
       font-weight="700" font-size="48" fill="#fff">STOP</text>`),
    explain:
      "You must come to a full stop at the stop line, even if the road looks clear. Then yield to traffic on the main road before moving off.",
  },
  {
    name: "Yield",
    category: "regulatory",
    svg: svg(`<path d="M22 38 H178 L100 176 Z" fill="#fff" stroke="${RED}" stroke-width="14" stroke-linejoin="round"/>
      <text x="100" y="76" text-anchor="middle" font-family="Arial, sans-serif"
       font-weight="700" font-size="26">YIELD</text>
      <text x="100" y="98" text-anchor="middle" font-family="Arial, sans-serif"
       font-weight="700" font-size="14">GÉILL SLÍ</text>`),
    explain:
      "Give way to traffic on the road you're joining. You don't have to stop if it's clear, but you must not make other traffic slow down or swerve.",
  },
  {
    name: "No entry",
    category: "regulatory",
    svg: svg(`<circle cx="100" cy="100" r="90" fill="${RED}"/>
      <rect x="42" y="86" width="116" height="28" fill="#fff"/>`),
    explain:
      "You can't drive into this road from this side. You'll usually see it at the exit end of a one-way street.",
  },
  {
    name: "Speed limit 50 km/h",
    category: "regulatory",
    svg: speed(50),
    explain:
      "Maximum speed is 50 km/h until a sign shows a different limit. It's the usual limit in towns and built-up areas.",
  },
  {
    name: "Speed limit 60 km/h",
    category: "regulatory",
    svg: speed(60),
    explain:
      "Maximum speed is 60 km/h. Since 2025 this is the default limit on rural local roads, which used to be 80 km/h.",
  },
  {
    name: "Speed limit 100 km/h",
    category: "regulatory",
    svg: speed(100),
    explain:
      "Maximum speed is 100 km/h. You'll mostly see this on national primary roads. Remember it's a limit, not a target.",
  },
  {
    name: "Speed limit 120 km/h",
    category: "regulatory",
    svg: speed(120),
    explain:
      "Maximum speed is 120 km/h, the highest limit in Ireland. It applies on motorways.",
  },
  {
    name: "No right turn",
    category: "regulatory",
    svg: roundel(
      line("M84 145 V98 Q84 80 102 80 H118") +
        `<path d="M116 64 L142 80 L116 96 Z" fill="${BLACK}"/>` +
        slash
    ),
    explain: "You are not allowed to turn right at the junction ahead.",
  },
  {
    name: "No left turn",
    category: "regulatory",
    svg: roundel(
      `<g transform="translate(200 0) scale(-1 1)">` +
        line("M84 145 V98 Q84 80 102 80 H118") +
        `<path d="M116 64 L142 80 L116 96 Z" fill="${BLACK}"/></g>` +
        `<line x1="158" y1="42" x2="42" y2="158" stroke="${RED}" stroke-width="16"/>`
    ),
    explain: "You are not allowed to turn left at the junction ahead.",
  },
  {
    name: "No U-turn",
    category: "regulatory",
    svg: roundel(
      line("M122 148 V92 Q122 64 100 64 Q78 64 78 92 V104") +
        `<path d="M62 102 L94 102 L78 128 Z" fill="${BLACK}"/>` +
        slash
    ),
    explain: "You must not turn your vehicle around to go back the way you came on this stretch of road.",
  },
  {
    name: "No parking",
    category: "regulatory",
    svg: roundel(
      `<text x="100" y="132" text-anchor="middle" font-family="Arial, sans-serif"
        font-weight="700" font-size="92">P</text>` + slash
    ),
    explain:
      "You can't park here during the times shown on any plate under the sign. You can still stop briefly to pick up or drop off passengers.",
  },

  // Mandatory signs
  {
    name: "Turn left ahead",
    category: "mandatory",
    svg: mandatory(
      line("M116 148 V100 Q116 78 94 78 H82", 16, "#fff") +
        `<path d="M86 58 L56 78 L86 98 Z" fill="#fff"/>`
    ),
    explain: "You must turn left at the junction ahead. You can't go straight on or turn right.",
  },
  {
    name: "Keep left",
    category: "mandatory",
    svg: mandatory(
      line("M138 62 L84 116", 16, "#fff") + `<path d="M58 142 L66 100 L100 134 Z" fill="#fff"/>`
    ),
    explain:
      "Pass on the left side of the sign. You'll see it on traffic islands and in the middle of the road where it splits.",
  },
  {
    name: "Straight ahead only",
    category: "mandatory",
    svg: mandatory(line("M100 150 V80", 16, "#fff") + `<path d="M78 84 L100 48 L122 84 Z" fill="#fff"/>`),
    explain: "You must go straight on at the junction ahead. No turning left or right.",
  },

  // Information signs
  {
    name: "Motorway ahead",
    category: "information",
    svg: svg(`<rect x="12" y="28" width="176" height="144" rx="14" fill="${BLUE}"/>
      <rect x="22" y="38" width="156" height="124" rx="8" fill="none" stroke="#fff" stroke-width="4"/>
      ${line("M64 150 L88 68 M136 150 L112 68", 10, "#fff")}
      <rect x="52" y="76" width="96" height="14" fill="#fff"/>
      ${line("M100 104 V118 M100 130 V146", 6, "#fff")}`),
    explain:
      "You're about to join a motorway. Learner drivers, motorbikes under 50cc, cyclists and pedestrians are not allowed on motorways.",
  },
];

// ---------- Quiz logic ----------
const QUESTIONS_PER_ROUND = 15;

const $ = (id) => document.getElementById(id);
const startScreen = $("start");
const quizScreen = $("quiz");
const resultScreen = $("result");

let round = [];
let current = 0;
let score = 0;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 4 answers: the right one plus 3 wrong ones, ideally from the same category
function buildOptions(sign) {
  const sameType = shuffle(SIGNS.filter((s) => s !== sign && s.category === sign.category));
  const otherType = shuffle(SIGNS.filter((s) => s.category !== sign.category));
  const wrong = [...sameType, ...otherType].slice(0, 3);
  return shuffle([sign, ...wrong]);
}

function show(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function startQuiz() {
  round = shuffle(SIGNS).slice(0, QUESTIONS_PER_ROUND);
  current = 0;
  score = 0;
  show(quizScreen);
  showQuestion();
}

function showQuestion() {
  const sign = round[current];

  $("progress").textContent = `Question ${current + 1} of ${round.length}`;
  $("score").textContent = `Score: ${score}`;
  $("barFill").style.width = `${(current / round.length) * 100}%`;
  $("sign").innerHTML = sign.svg;
  $("feedback").classList.add("hidden");
  $("nextBtn").classList.add("hidden");

  const box = $("options");
  box.innerHTML = "";
  buildOptions(sign).forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option.name;
    btn.addEventListener("click", () => checkAnswer(btn, option === sign, sign));
    box.appendChild(btn);
  });
}

function checkAnswer(clicked, isRight, sign) {
  const buttons = [...document.querySelectorAll(".option")];
  buttons.forEach((b) => (b.disabled = true));

  if (isRight) {
    score++;
    clicked.classList.add("correct");
  } else {
    clicked.classList.add("wrong");
    // Always show which one was right
    buttons.find((b) => b.textContent === sign.name).classList.add("correct");
  }

  // Fade the answers that weren't picked and weren't right
  buttons
    .filter((b) => !b.classList.contains("correct") && !b.classList.contains("wrong"))
    .forEach((b) => b.classList.add("faded"));

  const feedback = $("feedback");
  feedback.classList.remove("hidden", "good", "bad");
  feedback.classList.add(isRight ? "good" : "bad");
  $("feedbackTitle").textContent = isRight ? "Correct!" : `Not quite. It's "${sign.name}".`;
  $("explanation").textContent = sign.explain;
  $("score").textContent = `Score: ${score}`;

  const next = $("nextBtn");
  next.textContent = current === round.length - 1 ? "See my score" : "Next sign";
  next.classList.remove("hidden");
  next.focus();
}

function nextQuestion() {
  current++;
  if (current < round.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const pct = Math.round((score / round.length) * 100);
  $("resultTitle").textContent = `You got ${score} out of ${round.length} (${pct}%)`;
  $("resultText").textContent =
    pct >= 87
      ? "Brilliant. You know your signs."
      : pct >= 60
      ? "Not bad. Have another go to tighten up the ones you missed."
      : "Keep practising. Each round mixes up the signs so you'll see new ones.";
  show(resultScreen);
}

$("startBtn").addEventListener("click", startQuiz);
$("nextBtn").addEventListener("click", nextQuestion);
$("restartBtn").addEventListener("click", startQuiz);
