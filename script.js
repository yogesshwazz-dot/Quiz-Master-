(function(){
"use strict";
const BANK = {
  webdev: {
    label: "Web Dev",
    questions: [
      { q:"Which language runs natively in the browser?", o:["Python","Java","JavaScript","C++"], a:2 },
      { q:"What does HTML stand for?", o:["Hyper Text Markup Language","Home Tool Markup Language","Hyperlinks Text Mode","None of these"], a:0 },
      { q:"CSS is primarily used for?", o:["Styling web pages","Managing databases","Running servers","Training AI models"], a:0 },
      { q:"Which keyword declares a block-scoped variable in JS?", o:["var","let","global","static"], a:1 },
      { q:"In JavaScript, arrays are indexed starting at?", o:["1","0","-1","2"], a:1 },
      { q:"DOM stands for?", o:["Document Object Model","Data Object Mapper","Desktop Output Manager","Direct Object Mutation"], a:0 },
      { q:"Which HTML tag creates a hyperlink?", o:["<img>","<a>","<p>","<div>"], a:1 },
      { q:"Which company originally created JavaScript?", o:["Netscape","Google","Microsoft","Apple"], a:0 },
      { q:"Which of these is NOT a JavaScript framework/library?", o:["React","Vue","Laravel","Angular"], a:2 },
      { q:"What does CSS stand for?", o:["Cascading Style Sheets","Creative Style System","Computer Styled Sections","Colorful Style Syntax"], a:0 },
      { q:"Which HTTP method is typically used to submit form data that changes server state?", o:["GET","POST","LINK","VIEW"], a:1 },
      { q:"Which symbol is used for CSS class selectors?", o:["#","*",".","&"], a:2 },
    ]
  },
  science: {
    label: "Science",
    questions: [
      { q:"What planet is known as the Red Planet?", o:["Venus","Mars","Jupiter","Saturn"], a:1 },
      { q:"What gas do plants primarily absorb for photosynthesis?", o:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"], a:2 },
      { q:"What is the chemical symbol for gold?", o:["Go","Gd","Au","Ag"], a:2 },
      { q:"How many bones are in the adult human body?", o:["206","186","226","256"], a:0 },
      { q:"What force keeps planets in orbit around the sun?", o:["Magnetism","Gravity","Friction","Inertia"], a:1 },
      { q:"What is the powerhouse of the cell?", o:["Nucleus","Ribosome","Mitochondria","Golgi body"], a:2 },
      { q:"Sound travels fastest through which medium?", o:["Air","Water","Steel","Vacuum"], a:2 },
      { q:"What is the boiling point of water at sea level in Celsius?", o:["90°C","100°C","110°C","120°C"], a:1 },
    ]
  },
  general: {
    label: "General",
    questions: [
      { q:"What is the capital of Japan?", o:["Seoul","Beijing","Tokyo","Bangkok"], a:2 },
      { q:"Which ocean is the largest by surface area?", o:["Atlantic","Indian","Arctic","Pacific"], a:3 },
      { q:"How many continents are there on Earth?", o:["5","6","7","8"], a:2 },
      { q:"Which country is home to the Great Barrier Reef?", o:["Brazil","Australia","Mexico","Egypt"], a:1 },
      { q:"What is the longest river in the world?", o:["Amazon","Nile","Yangtze","Mississippi"], a:1 },
      { q:"Which language has the most native speakers worldwide?", o:["English","Hindi","Mandarin Chinese","Spanish"], a:2 },
      { q:"What currency is used in Japan?", o:["Yuan","Won","Yen","Ringgit"], a:2 },
      { q:"Mount Everest is located in which mountain range?", o:["Andes","Alps","Himalayas","Rockies"], a:2 },
    ]
  },
  logic: {
    label: "Logic & Math",
    questions: [
      { q:"What is 2 + 2 × 2?", o:["6","8","4","2"], a:0 },
      { q:"If today is Monday, what day is it in 10 days?", o:["Wednesday","Thursday","Friday","Tuesday"], a:1 },
      { q:"What is the next number: 2, 4, 8, 16, ...?", o:["18","24","32","20"], a:2 },
      { q:"A dozen equals how many items?", o:["10","12","14","16"], a:1 },
      { q:"What is the square root of 81?", o:["7","8","9","11"], a:2 },
      { q:"If a train travels 60 km in 1 hour, how far in 30 minutes?", o:["20 km","25 km","30 km","45 km"], a:2 },
      { q:"How many sides does a hexagon have?", o:["5","6","7","8"], a:1 },
      { q:"What is 15% of 200?", o:["15","20","30","35"], a:2 },
    ]
  }
};

const DIFFICULTY_SECONDS = { easy: 20, normal: 15, hard: 10 };
const ROUNDS_PER_GAME = 10;
const LEADERBOARD_KEY = "quizmaster_leaderboard_v1";
const MAX_LEADERBOARD = 8;

const el = (id) => document.getElementById(id);
const screens = {
  start: el("screen-start"),
  quiz: el("screen-quiz"),
  result: el("screen-result"),
  board: el("screen-board"),
};

const categoryRow = el("categoryRow");
const difficultyRow = el("difficultyRow");
const playerNameInput = el("playerName");
const startBtn = el("startBtn");
const showBoardBtn = el("showBoard");
const backHomeBtn = el("backHome");
const boardFromResultBtn = el("boardFromResult");

const roundNumEl = el("roundNum");
const roundTotalEl = el("roundTotal");
const timerFill = el("timerFill");
const timerNum = el("timerNum");
const streakBadge = el("streakBadge");
const streakNum = el("streakNum");
const progressDots = el("progressDots");
const questionText = el("questionText");
const optionsWrap = el("optionsWrap");
const liveScore = el("liveScore");
const nextBtn = el("nextBtn");

const resultEyebrow = el("resultEyebrow");
const finalScore = el("finalScore");
const finalPct = el("finalPct");
const finalStreak = el("finalStreak");
const verdictText = el("verdictText");
const saveScoreBtn = el("saveScoreBtn");
const playAgainBtn = el("playAgainBtn");

const boardList = el("boardList");
const boardEmpty = el("boardEmpty");
const soundToggle = el("soundToggle");

let state = {
  category: null,
  difficulty: "normal",
  playerName: "",
  questions: [],
  index: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answers: [],   // 'correct' | 'wrong' per round
  timer: null,
  timeLeft: 15,
  soundOn: true,
};

const RING_CIRC = 175.9;

let audioCtx = null;
function beep(freq, duration, type){
  if(!state.soundOn) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }catch(e){ /* audio unsupported — fail silently */ }
}
const sfx = {
  correct: () => { beep(880, 0.12, "square"); setTimeout(()=>beep(1180,0.14,"square"),90); },
  wrong: () => beep(160, 0.28, "sawtooth"),
  tick: () => beep(1400, 0.03, "sine"),
  select: () => beep(600, 0.05, "sine"),
  finish: () => { beep(660,0.1); setTimeout(()=>beep(880,0.1),110); setTimeout(()=>beep(1100,0.16),220); },
};

soundToggle.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  soundToggle.textContent = state.soundOn ? "🔊" : "🔇";
});

function showScreen(name){
  Object.entries(screens).forEach(([key, node]) => {
    node.setAttribute("data-active", key === name ? "true" : "false");
  });
}

function buildCategoryChips(){
  categoryRow.innerHTML = "";
  Object.entries(BANK).forEach(([key, cat]) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.dataset.cat = key;
    btn.textContent = cat.label;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      state.category = key;
      [...categoryRow.children].forEach(c => c.setAttribute("aria-pressed", c === btn ? "true" : "false"));
      sfx.select();
      validateStart();
    });
    categoryRow.appendChild(btn);
  });
}
buildCategoryChips();

[...difficultyRow.children].forEach(btn => {
  btn.setAttribute("aria-pressed", btn.dataset.diff === "normal" ? "true" : "false");
  btn.addEventListener("click", () => {
    state.difficulty = btn.dataset.diff;
    [...difficultyRow.children].forEach(c => c.setAttribute("aria-pressed", c === btn ? "true" : "false"));
    sfx.select();
  });
});

playerNameInput.addEventListener("input", validateStart);
function validateStart(){
  const nameOk = playerNameInput.value.trim().length > 0;
  startBtn.disabled = !(nameOk && state.category);
}

startBtn.addEventListener("click", () => {
  state.playerName = playerNameInput.value.trim().slice(0,14) || "Player";
  startGame();
});

showBoardBtn.addEventListener("click", () => { renderLeaderboard(); showScreen("board"); });
boardFromResultBtn.addEventListener("click", () => { renderLeaderboard(); showScreen("board"); });
backHomeBtn.addEventListener("click", () => showScreen("start"));


function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function startGame(){
  const pool = shuffle(BANK[state.category].questions);
  const count = Math.min(ROUNDS_PER_GAME, pool.length);
  state.questions = pool.slice(0, count);
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.answers = [];

  roundTotalEl.textContent = count;
  buildProgressDots(count);
  liveScore.textContent = "0";

  showScreen("quiz");
  loadQuestion();
}

function buildProgressDots(count){
  progressDots.innerHTML = "";
  for(let i=0;i<count;i++){
    const d = document.createElement("span");
    d.className = "dot";
    progressDots.appendChild(d);
  }
}

function updateDots(){
  [...progressDots.children].forEach((dot, i) => {
    dot.classList.remove("current","done-correct","done-wrong");
    if(state.answers[i] === "correct") dot.classList.add("done-correct");
    else if(state.answers[i] === "wrong") dot.classList.add("done-wrong");
    else if(i === state.index) dot.classList.add("current");
  });
}

function loadQuestion(){
  clearInterval(state.timer);
  const q = state.questions[state.index];
  roundNumEl.textContent = state.index + 1;
  questionText.textContent = q.q;
  updateDots();
  nextBtn.style.visibility = "hidden";

  // Shuffle options but remember correct answer's new position
  const order = shuffle(q.o.map((text, i) => ({ text, orig: i })));
  const correctNewIndex = order.findIndex(o => o.orig === q.a);
  currentCorrectIndex = correctNewIndex;

  optionsWrap.innerHTML = "";
  order.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "opt-btn";
    b.innerHTML = `<span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(opt.text)}</span>`;
    b.addEventListener("click", () => pickAnswer(i, correctNewIndex, b));
    optionsWrap.appendChild(b);
  });

  startTimer();
}

function escapeHtml(str){
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function startTimer(){
  const total = DIFFICULTY_SECONDS[state.difficulty];
  state.timeLeft = total;
  timerNum.textContent = state.timeLeft;
  timerFill.style.stroke = "var(--teal)";
  timerFill.style.strokeDashoffset = 0;

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    timerNum.textContent = Math.max(state.timeLeft, 0);
    const pct = state.timeLeft / total;
    timerFill.style.strokeDashoffset = RING_CIRC * (1 - pct);
    if(state.timeLeft <= 3 && state.timeLeft > 0){
      timerFill.style.stroke = "var(--coral)";
      sfx.tick();
    }
    if(state.timeLeft <= 0){
      clearInterval(state.timer);
      timeUp();
    }
  }, 1000);
}

function timeUp(){
  const q = state.questions[state.index];
  const buttons = [...optionsWrap.children];
  buttons.forEach(b => b.disabled = true);
  // reveal correct answer without a selected wrong one
  const order = [...buttons];
  const correctBtn = order.find((b,i) => i === currentCorrectIndex);
  if(correctBtn) correctBtn.classList.add("correct");
  registerAnswer(false);
}

let currentCorrectIndex = -1;

function pickAnswer(pickedIndex, correctIndex, btnEl){
  currentCorrectIndex = correctIndex;
  clearInterval(state.timer);
  const buttons = [...optionsWrap.children];
  buttons.forEach(b => b.disabled = true);

  const isCorrect = pickedIndex === correctIndex;
  buttons[correctIndex].classList.add("correct");
  if(!isCorrect) btnEl.classList.add("wrong");

  registerAnswer(isCorrect);
}

function registerAnswer(isCorrect){
  state.answers[state.index] = isCorrect ? "correct" : "wrong";
  if(isCorrect){
    state.score += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    sfx.correct();
    streakBadge.classList.add("pulse");
    setTimeout(()=>streakBadge.classList.remove("pulse"), 350);
  } else {
    state.streak = 0;
    sfx.wrong();
  }
  liveScore.textContent = state.score;
  streakNum.textContent = state.streak;
  updateDots();
  nextBtn.style.visibility = "visible";
  nextBtn.focus();
}

nextBtn.addEventListener("click", () => {
  state.index += 1;
  if(state.index < state.questions.length){
    loadQuestion();
  } else {
    finishGame();
  }
});


document.addEventListener("keydown", (e) => {
  if(screens.quiz.getAttribute("data-active") !== "true") return;
  if(["1","2","3","4"].includes(e.key)){
    const idx = Number(e.key) - 1;
    const btn = optionsWrap.children[idx];
    if(btn && !btn.disabled) btn.click();
  } else if(e.key === "Enter" && nextBtn.style.visibility === "visible"){
    nextBtn.click();
  }
});


function finishGame(){
  sfx.finish();
  const total = state.questions.length;
  const pct = Math.round((state.score/total)*100);
  finalScore.textContent = `${state.score}/${total}`;
  finalPct.textContent = `${pct}%`;
  finalStreak.textContent = state.bestStreak;

  let verdict, eyebrow;
  if(pct === 100){ verdict = "Flawless run — certified Quiz Master! 🏆"; eyebrow = "Perfect Score"; }
  else if(pct >= 80){ verdict = "Sharp instincts. The buzzer respects you."; eyebrow = "Excellent"; }
  else if(pct >= 50){ verdict = "Solid effort — the leaderboard is within reach."; eyebrow = "Nice Try"; }
  else { verdict = "Every legend has a rocky first show. Run it back!"; eyebrow = "Game Over"; }
  verdictText.textContent = verdict;
  resultEyebrow.textContent = eyebrow;

  saveScoreBtn.disabled = false;
  saveScoreBtn.textContent = "Save to Leaderboard";
  showScreen("result");
}

playAgainBtn.addEventListener("click", () => showScreen("start"));

saveScoreBtn.addEventListener("click", () => {
  const entry = {
    name: state.playerName,
    score: state.score,
    total: state.questions.length,
    category: BANK[state.category].label,
    difficulty: state.difficulty,
    streak: state.bestStreak,
    date: new Date().toISOString(),
  };
  const board = loadLeaderboard();
  board.push(entry);
  board.sort((a,b) => (b.score/b.total) - (a.score/a.total) || b.streak - a.streak);
  saveLeaderboard(board.slice(0, MAX_LEADERBOARD));
  saveScoreBtn.disabled = true;
  saveScoreBtn.textContent = "Saved ✓";
  renderLeaderboard();
});


function loadLeaderboard(){
  try{
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveLeaderboard(board){
  try{ localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board)); }catch(e){ /* storage unavailable */ }
}

function renderLeaderboard(){
  const board = loadLeaderboard();
  boardList.innerHTML = "";
  if(board.length === 0){
    boardEmpty.style.display = "block";
    return;
  }
  boardEmpty.style.display = "none";
  board.forEach((entry, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="rank">#${i+1}</span>
      <span class="b-name">${escapeHtml(entry.name)}
        <div class="b-meta">${escapeHtml(entry.category)} · ${escapeHtml(entry.difficulty)}</div>
      </span>
      <span class="b-score">${entry.score}/${entry.total}</span>
    `;
    boardList.appendChild(li);
  });
}


showScreen("start");

})();