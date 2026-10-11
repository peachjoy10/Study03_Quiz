"use strict";
// 상식 퀴즈. 구조는 PRD.md 5절: 상수 → 순수 로직 → 자체 점검 → 화면 처리 → 시작 코드.

// ===== 상수 =====
const CATEGORIES = [
  { code: "kh", name: "한국사" },
  { code: "wg", name: "세계지리" },
  { code: "sc", name: "과학" },
  { code: "ac", name: "예술과 문화" }
];

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

  // ---- 점검 항목 끝 ----

  console.log("자체 점검 결과: 통과 " + pass + ", 실패 " + fail);
  return { pass: pass, fail: fail };
}

// ===== 화면 처리 =====
function init() {
  if (new URLSearchParams(location.search).has("test")) {
    runSelfTests(typeof QUESTIONS !== "undefined" ? QUESTIONS : null);
  }
}

// ===== 시작 코드 =====
if (typeof document !== "undefined") init();
if (typeof module !== "undefined") module.exports = { runSelfTests: runSelfTests };
