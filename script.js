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
