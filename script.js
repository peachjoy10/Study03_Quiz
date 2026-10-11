"use strict";
// 상식 퀴즈. 구조는 PRD.md 5절: 상수 → 순수 로직 → 자체 점검 → 화면 처리 → 시작 코드.

// ===== 상수 =====
const CATEGORIES = [
  { code: "kh", name: "한국사" },
  { code: "wg", name: "세계지리" },
  { code: "sc", name: "과학" },
  { code: "ac", name: "예술과 문화" }
];

const MODES = {
  practice: { label: "연습", rule: "시간 제한과 힌트 없음, 맞히면 1점", ranked: false },
  speed: { label: "스피드", rule: "문항마다 15초, 시간이 지나면 오답", ranked: true },
  hint: { label: "힌트", rule: "문항마다 힌트 1번, 힌트를 쓰고 맞히면 0.5점", ranked: true }
};

const SPEED_SECONDS = 15;

// ===== 순수 로직 (화면과 무관) =====
function shuffle(arr, rand) {
  rand = rand || Math.random;
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out;
}

function scoreAnswer(correct, usedHint) {
  if (!correct) return 0;
  return usedHint ? 0.5 : 1;
}

function shuffleItem(item, rand) {
  const order = shuffle([0, 1, 2, 3], rand);
  return {
    id: item.id,
    category: item.category,
    question: item.question,
    choices: order.map(i => item.choices[i]),
    answer: order.indexOf(item.answer),
    explanation: item.explanation,
    source: item.source
  };
}

function pickHintRemovals(item, rand) {
  const wrong = [0, 1, 2, 3].filter(i => i !== item.answer);
  return shuffle(wrong, rand).slice(0, 2);
}

function wrongItems(results) {
  return results.filter(r => !r.correct).map(r => r.item);
}

function insertRecord(board, record) {
  // Array.prototype.sort는 안정 정렬이므로 동점이면 먼저 있던 기록이 위에 남는다.
  return board.concat([record]).sort((a, b) => b.score - a.score).slice(0, 5);
}

function isRecord(r) {
  return r !== null && typeof r === "object" &&
    typeof r.name === "string" && r.name !== "" &&
    typeof r.score === "number" && isFinite(r.score) &&
    typeof r.date === "string";
}

function getStorage() {
  try {
    const s = window.localStorage;
    const t = "quizA.check";
    s.setItem(t, t);
    s.removeItem(t);
    return s;
  } catch (e) {
    return null;
  }
}

function loadBoard(key, storage) {
  const s = storage || getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(key);
    if (raw === null) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(isRecord)) return [];
    return data.slice(0, 5);
  } catch (e) {
    return [];
  }
}

function saveBoard(key, board, storage) {
  const s = storage || getStorage();
  if (!s) return false;
  try {
    s.setItem(key, JSON.stringify(board));
    return true;
  } catch (e) {
    return false;
  }
}

function boardKey(mode, category) {
  const c = CATEGORIES.find(x => x.name === category);
  return "quizA.board." + mode + "." + c.code;
}

function todayString(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function buildRound(questions, category, rand) {
  const pool = questions.filter(q => q.category === category);
  return shuffle(pool, rand).slice(0, 10).map(q => shuffleItem(q, rand));
}

function validateQuestions(questions) {
  if (!Array.isArray(questions)) return ["문항 데이터가 배열이 아닙니다."];
  const errors = [];
  const seenIds = {};
  const counts = {};
  CATEGORIES.forEach(c => { counts[c.name] = 0; });

  questions.forEach((q, i) => {
    const label = q && typeof q.id === "string" ? q.id : (i + 1) + "번째 문항";
    if (!q || typeof q !== "object") {
      errors.push(label + ": 문항이 객체가 아닙니다.");
      return;
    }
    const cat = CATEGORIES.find(c => c.name === q.category);
    if (cat) counts[cat.name]++;
    else errors.push(label + ": 카테고리가 올바르지 않습니다.");

    if (typeof q.id !== "string" || !/^(kh|wg|sc|ac)-\d{2}$/.test(q.id)) {
      errors.push(label + ": id 형식이 올바르지 않습니다.");
    } else {
      if (cat && q.id.slice(0, 2) !== cat.code) errors.push(label + ": id 약자가 카테고리와 다릅니다.");
      if (seenIds[q.id]) errors.push(label + ": id가 중복됩니다.");
      seenIds[q.id] = true;
    }

    if (typeof q.question !== "string" || q.question.trim() === "") errors.push(label + ": 문제 문장이 없습니다.");

    if (!Array.isArray(q.choices) || q.choices.length !== 4 ||
        q.choices.some(c => typeof c !== "string" || c.trim() === "")) {
      errors.push(label + ": 보기는 글자 4개여야 합니다.");
    } else if (new Set(q.choices.map(c => c.trim())).size !== 4) {
      errors.push(label + ": 보기 4개가 서로 달라야 합니다.");
    }

    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(label + ": answer는 0~3이어야 합니다.");
    if (typeof q.explanation !== "string" || q.explanation.trim() === "") errors.push(label + ": 해설이 없습니다.");
    if (!q.source || typeof q.source.name !== "string" || q.source.name.trim() === "" ||
        typeof q.source.url !== "string" || !/^https?:\/\//.test(q.source.url)) {
      errors.push(label + ": 출처 이름과 URL이 필요합니다.");
    }
  });

  CATEGORIES.forEach(c => {
    if (counts[c.name] !== 10) errors.push(c.name + ": 문항이 " + counts[c.name] + "개입니다 (10개여야 함).");
  });
  return errors;
}

// ===== 자체 점검 =====
function runSelfTests(questions) {
  let pass = 0;
  let fail = 0;

  function check(name, fn) {
    try {
      if (fn() === true) {
        pass++;
        console.log("통과: " + name);
      } else {
        fail++;
        console.log("실패: " + name);
      }
    } catch (e) {
      fail++;
      console.log("실패: " + name + " (" + e.message + ")");
    }
  }

  function same(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // ---- 점검 도우미: 새 도우미는 이 줄 아래에 더한다 ----
  function makeQuestion(code, name, n) {
    const id = code + "-" + String(n).padStart(2, "0");
    return {
      id: id,
      category: name,
      question: id + " 문제",
      choices: ["가" + n, "나" + n, "다" + n, "라" + n],
      answer: 0,
      explanation: "해설",
      source: { name: "출처", url: "https://example.com/" + id }
    };
  }

  function makeValidSet() {
    const out = [];
    CATEGORIES.forEach(c => {
      for (let n = 1; n <= 10; n++) out.push(makeQuestion(c.code, c.name, n));
    });
    return out;
  }

  function fakeStorage(init) {
    const data = Object.assign({}, init);
    return {
      getItem: k => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v); }
    };
  }

  // ---- 점검 항목: 새 항목은 이 줄 아래, "점검 항목 끝" 줄 위에 차례로 더한다 ----
  check("shuffle: 같은 원소를 모두 담음", () => {
    const out = shuffle([1, 2, 3, 4, 5], Math.random);
    return same(out.slice().sort(), [1, 2, 3, 4, 5]);
  });
  check("shuffle: 원본 배열을 바꾸지 않음", () => {
    const arr = [1, 2, 3, 4];
    shuffle(arr, () => 0);
    return same(arr, [1, 2, 3, 4]);
  });
  check("shuffle: 고정 rand로 결과가 정해짐", () => same(shuffle([1, 2, 3, 4], () => 0), [2, 3, 4, 1]));
  check("scoreAnswer: 정답 1점, 힌트 정답 0.5점, 오답 0점", () =>
    scoreAnswer(true, false) === 1 &&
    scoreAnswer(true, true) === 0.5 &&
    scoreAnswer(false, false) === 0 &&
    scoreAnswer(false, true) === 0);
  check("validateQuestions: 정상 40문항은 오류 없음", () => validateQuestions(makeValidSet()).length === 0);
  check("validateQuestions: 배열이 아니면 오류", () => same(validateQuestions({}), ["문항 데이터가 배열이 아닙니다."]));
  check("validateQuestions: 카테고리 문항 수가 10개가 아니면 오류", () => {
    const qs = makeValidSet().filter(q => q.id !== "kh-10");
    return validateQuestions(qs).indexOf("한국사: 문항이 9개입니다 (10개여야 함).") !== -1;
  });
  check("validateQuestions: 보기가 겹치면 오류", () => {
    const qs = makeValidSet();
    qs[0].choices = ["가", "가", "나", "다"];
    return validateQuestions(qs).indexOf("kh-01: 보기 4개가 서로 달라야 합니다.") !== -1;
  });
  check("validateQuestions: answer가 0~3이 아니면 오류", () => {
    const qs = makeValidSet();
    qs[1].answer = 4;
    return validateQuestions(qs).indexOf("kh-02: answer는 0~3이어야 합니다.") !== -1;
  });
  check("validateQuestions: id가 겹치면 오류", () => {
    const qs = makeValidSet();
    qs[1].id = "kh-01";
    return validateQuestions(qs).indexOf("kh-01: id가 중복됩니다.") !== -1;
  });
  check("validateQuestions: 출처 URL이 없으면 오류", () => {
    const qs = makeValidSet();
    qs[2].source = { name: "출처", url: "" };
    return validateQuestions(qs).indexOf("kh-03: 출처 이름과 URL이 필요합니다.") !== -1;
  });
  check("buildRound: 고른 카테고리 문항 10개", () => {
    const round = buildRound(makeValidSet(), "과학", Math.random);
    return round.length === 10 && round.every(it => it.category === "과학");
  });
  check("buildRound: 보기를 섞어도 answer가 같은 정답을 가리킴", () => {
    const qs = makeValidSet();
    const round = buildRound(qs, "한국사", () => 0);
    const ok = round.every(it => {
      const orig = qs.find(q => q.id === it.id);
      return it.choices[it.answer] === orig.choices[orig.answer];
    });
    return ok && round.some(it => it.answer !== 0);
  });
  check("buildRound: 원본 문항을 바꾸지 않음", () => {
    const qs = makeValidSet();
    const before = JSON.stringify(qs);
    buildRound(qs, "세계지리", Math.random);
    return JSON.stringify(qs) === before;
  });
  check("실제 문항 데이터: validateQuestions 통과", () => {
    const errors = validateQuestions(questions);
    errors.forEach(e => console.log("  " + e));
    return errors.length === 0;
  });
  check("pickHintRemovals: 정답이 아닌 서로 다른 보기 2개를 고름", () => {
    for (let ans = 0; ans < 4; ans++) {
      for (let k = 0; k < 20; k++) {
        const r = pickHintRemovals({ answer: ans }, Math.random);
        if (r.length !== 2 || r[0] === r[1] || r.indexOf(ans) !== -1) return false;
        if (r.some(i => !Number.isInteger(i) || i < 0 || i > 3)) return false;
      }
    }
    return true;
  });
  check("pickHintRemovals: 고정 rand로 결과가 정해짐", () => same(pickHintRemovals({ answer: 1 }, () => 0), [2, 3]));
  check("wrongItems: 틀린 문항만 순서대로 돌려줌", () => {
    const results = [
      { item: { id: "kh-01" }, correct: true },
      { item: { id: "kh-02" }, correct: false },
      { item: { id: "kh-03" }, correct: false }
    ];
    return same(wrongItems(results).map(it => it.id), ["kh-02", "kh-03"]);
  });
  check("wrongItems: 다 맞히면 빈 배열", () => wrongItems([{ item: { id: "kh-01" }, correct: true }]).length === 0);
  check("insertRecord: 점수가 높은 순으로 정렬", () => {
    const board = insertRecord([{ name: "가", score: 5, date: "2026-10-01" }], { name: "나", score: 8, date: "2026-10-02" });
    return same(board.map(r => r.name), ["나", "가"]);
  });
  check("insertRecord: 동점이면 먼저 세운 기록이 위", () => {
    const board = [{ name: "가", score: 7, date: "2026-10-01" }, { name: "나", score: 5, date: "2026-10-01" }];
    return same(insertRecord(board, { name: "다", score: 7, date: "2026-10-02" }).map(r => r.name), ["가", "다", "나"]);
  });
  check("insertRecord: 상위 5건만 남김", () => {
    const board = [9, 8, 7, 6, 5].map((s, i) => ({ name: "n" + i, score: s, date: "2026-10-01" }));
    const low = insertRecord(board, { name: "low", score: 4, date: "2026-10-02" });
    const high = insertRecord(board, { name: "high", score: 10, date: "2026-10-02" });
    return low.length === 5 && low.every(r => r.name !== "low") &&
      high.length === 5 && high[0].name === "high" && high.every(r => r.score !== 5);
  });
  check("insertRecord: 원본 순위표를 바꾸지 않음", () => {
    const board = [{ name: "가", score: 5, date: "2026-10-01" }];
    insertRecord(board, { name: "나", score: 9, date: "2026-10-02" });
    return board.length === 1 && board[0].name === "가";
  });
  check("loadBoard: 깨진 JSON이면 빈 순위표", () => same(loadBoard("k", fakeStorage({ k: "{깨진" })), []));
  check("loadBoard: 형식이 틀린 값이면 빈 순위표", () =>
    same(loadBoard("k", fakeStorage({ k: JSON.stringify([{ name: "가" }]) })), []) &&
    same(loadBoard("k", fakeStorage({ k: JSON.stringify("문자열") })), []));
  check("loadBoard: 없는 키는 빈 순위표", () => same(loadBoard("없음", fakeStorage({})), []));
  check("saveBoard·loadBoard: 저장한 값을 그대로 읽음", () => {
    const s = fakeStorage({});
    const board = [{ name: "가", score: 9.5, date: "2026-10-11" }];
    return saveBoard("k", board, s) === true && same(loadBoard("k", s), board);
  });
  check("저장소 오류: saveBoard는 false, loadBoard는 빈 순위표", () => {
    const broken = {
      getItem: () => { throw new Error("막힘"); },
      setItem: () => { throw new Error("막힘"); }
    };
    return saveBoard("k", [], broken) === false && same(loadBoard("k", broken), []);
  });
  check("boardKey·todayString: 키와 날짜 형식", () =>
    boardKey("speed", "한국사") === "quizA.board.speed.kh" &&
    boardKey("hint", "예술과 문화") === "quizA.board.hint.ac" &&
    todayString(new Date(2026, 9, 1)) === "2026-10-01");

  // ---- 점검 항목 끝 ----

  console.log("자체 점검 결과: 통과 " + pass + ", 실패 " + fail);
  return { pass: pass, fail: fail };
}

// ===== 화면 처리 =====
const state = {
  category: null,
  mode: "practice",
  items: [],
  index: 0,
  score: 0,
  results: [],
  answered: false,
  usedHint: false,
  retry: false,
  firstResults: [],
  firstScore: 0,
  timerId: null,
  remaining: SPEED_SECONDS
};

function startRound(category, mode) {
  state.category = category;
  state.mode = mode;
  state.items = buildRound(QUESTIONS, category);
  state.index = 0;
  state.score = 0;
  state.results = [];
  state.retry = false;
  showScreen("quiz");
  renderQuestion();
}

function startRetry() {
  state.items = shuffle(wrongItems(state.results)).map(it => shuffleItem(it));
  state.index = 0;
  state.results = [];
  state.retry = true;
  showScreen("quiz");
  renderQuestion();
}

function renderScore() {
  $("quiz-score").textContent = state.retry ? "다시 풀기 · 채점 안 함" : "점수 " + state.score;
}

function renderQuestion() {
  const item = state.items[state.index];
  state.answered = false;
  state.usedHint = false;
  const hintBtn = $("btn-hint");
  hintBtn.hidden = state.mode !== "hint";
  hintBtn.disabled = false;
  hintBtn.textContent = "힌트 (오답 2개 지우기)";
  $("quiz-label").textContent = state.category + " · " + MODES[state.mode].label;
  $("quiz-progress").textContent = (state.index + 1) + " / " + state.items.length;
  renderScore();
  $("quiz-question").textContent = item.question;

  const box = $("quiz-choices");
  box.innerHTML = "";
  item.choices.forEach((text, i) => {
    const b = el("button", "choice", text);
    b.type = "button";
    b.addEventListener("click", () => chooseAnswer(i));
    box.appendChild(b);
  });

  $("quiz-feedback").hidden = true;
  $("btn-next").hidden = true;
  if (state.mode === "speed") startTimer();
  else $("quiz-timer").hidden = true;
}

function chooseAnswer(i) {
  if (state.answered) return;
  const item = state.items[state.index];
  const correct = i === item.answer;
  const points = state.retry ? 0 : scoreAnswer(correct, state.usedHint);
  state.score += points;
  state.results.push({ item: item, chosen: i, correct: correct, usedHint: state.usedHint, timedOut: false, points: points });
  finishQuestion(i, correct ? "정답!" : "오답");
}

function onHint() {
  if (state.answered || state.usedHint) return;
  const item = state.items[state.index];
  const buttons = $("quiz-choices").querySelectorAll("button");
  pickHintRemovals(item).forEach(i => {
    buttons[i].disabled = true;
    buttons[i].classList.add("removed");
  });
  state.usedHint = true;
  const h = $("btn-hint");
  h.textContent = "힌트 사용함";
  h.disabled = true;
}

function finishQuestion(chosen, verdict) {
  stopTimer();
  state.answered = true;
  $("btn-hint").disabled = true;
  const item = state.items[state.index];

  $("quiz-choices").querySelectorAll("button").forEach((b, idx) => {
    b.disabled = true;
    if (idx === item.answer) {
      b.classList.add("correct");
      b.appendChild(el("span", "tag", "정답"));
    } else if (idx === chosen) {
      b.classList.add("wrong");
      b.appendChild(el("span", "tag", "오답"));
    }
  });

  renderScore();
  const v = $("feedback-verdict");
  v.textContent = verdict;
  v.className = "verdict " + (verdict === "정답!" ? "ok" : "ng");
  $("feedback-explanation").textContent = item.explanation;
  const a = $("feedback-source");
  a.href = item.source.url;
  a.textContent = "출처: " + item.source.name;
  $("quiz-feedback").hidden = false;

  const last = state.index === state.items.length - 1;
  $("btn-next").textContent = last ? "결과 보기" : "다음";
  $("btn-next").hidden = false;
}

function startTimer() {
  stopTimer();
  state.remaining = SPEED_SECONDS;
  renderTimer();
  state.timerId = setInterval(() => {
    state.remaining--;
    renderTimer();
    if (state.remaining <= 0) onTimeout();
  }, 1000);
}

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function renderTimer() {
  const t = $("quiz-timer");
  t.hidden = false;
  t.textContent = "남은 시간 " + state.remaining + "초";
  t.classList.toggle("danger", state.remaining <= 5);
}

function onTimeout() {
  if (state.answered) return;
  const item = state.items[state.index];
  state.results.push({ item: item, chosen: null, correct: false, usedHint: false, timedOut: true, points: 0 });
  finishQuestion(null, "시간 초과");
}

function onNext() {
  if (state.index < state.items.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    renderResult();
  }
}

function resultLabel(r) {
  if (r.correct && r.usedHint) return "정답 (힌트 0.5점)";
  if (r.correct) return "정답";
  if (r.timedOut) return "시간 초과";
  return "오답";
}

function renderResult() {
  if (!state.retry) {
    state.firstResults = state.results;
    state.firstScore = state.score;
  }
  $("result-score").textContent = state.firstScore + " / " + state.firstResults.length;
  $("result-note").hidden = MODES[state.mode].ranked;

  const list = $("result-list");
  list.innerHTML = "";
  state.firstResults.forEach(r => {
    const li = el("li", r.correct ? "ok" : "ng");
    li.appendChild(el("p", "q", r.item.question));
    li.appendChild(el("p", "", resultLabel(r) + " · 정답: " + r.item.choices[r.item.answer]));
    list.appendChild(li);
  });

  const info = $("result-retry");
  info.hidden = !state.retry;
  if (state.retry) {
    const ok = state.results.filter(r => r.correct).length;
    info.textContent = "틀린 문제 다시 풀기: " + state.results.length + "문항 중 " + ok + "문항 맞힘 (점수에 반영하지 않음)";
  }

  $("btn-retry").hidden = !(state.mode === "practice" && wrongItems(state.results).length > 0);
  showScreen("result");
}

function $(id) {
  return document.getElementById(id);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showScreen(name) {
  stopTimer();
  document.querySelectorAll(".screen").forEach(s => {
    s.hidden = s.id !== "screen-" + name;
  });
  window.scrollTo(0, 0);
}

function renderStart(errors) {
  const box = $("category-buttons");
  box.innerHTML = "";
  CATEGORIES.forEach(c => {
    const b = el("button", "", c.name);
    b.type = "button";
    b.disabled = errors.length > 0;
    b.addEventListener("click", () => onCategory(c.name));
    box.appendChild(b);
  });

  const errBox = $("data-error");
  errBox.innerHTML = "";
  errBox.hidden = errors.length === 0;
  if (errors.length > 0) {
    errBox.appendChild(el("strong", "", "문항 데이터 오류"));
    const ul = el("ul");
    errors.forEach(e => ul.appendChild(el("li", "", e)));
    errBox.appendChild(ul);
  }
}

function onCategory(category) {
  renderModeSelect(category);
}

function renderModeSelect(category) {
  state.category = category;
  $("mode-title").textContent = category + " · 모드를 고르세요";
  const box = $("mode-buttons");
  box.innerHTML = "";
  Object.keys(MODES).forEach(key => {
    const m = MODES[key];
    const b = el("button", "mode");
    b.type = "button";
    b.appendChild(el("strong", "", m.label));
    b.appendChild(el("span", "rule", m.rule));
    if (!m.ranked) b.appendChild(el("span", "mode-note", "순위표에 기록되지 않음"));
    b.addEventListener("click", () => startRound(category, key));
    box.appendChild(b);
  });
  showScreen("mode");
}

function bindButtons() {
  $("btn-back").addEventListener("click", () => showScreen("start"));
  $("btn-hint").addEventListener("click", onHint);
  $("btn-retry").addEventListener("click", startRetry);
  $("btn-next").addEventListener("click", onNext);
  $("btn-again").addEventListener("click", () => startRound(state.category, state.mode));
  $("btn-home").addEventListener("click", () => showScreen("start"));
}

function init() {
  const questions = typeof QUESTIONS !== "undefined" ? QUESTIONS : null;
  renderStart(validateQuestions(questions));
  bindButtons();
  showScreen("start");
  if (new URLSearchParams(location.search).has("test")) runSelfTests(questions);
}

// ===== 시작 코드 =====
if (typeof document !== "undefined") init();
if (typeof module !== "undefined") module.exports = { runSelfTests: runSelfTests };
