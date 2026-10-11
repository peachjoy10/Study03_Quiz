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
