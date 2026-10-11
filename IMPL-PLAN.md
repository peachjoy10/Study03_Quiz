# 상식 퀴즈 구현 계획서 (IMPL-PLAN)

> **에이전트 실행자에게:** 필수 하위 스킬: superpowers:subagent-driven-development(권장) 또는 superpowers:executing-plans로 이 계획을 태스크 단위로 실행한다. 단계는 체크박스(`- [ ]`)로 진행 상황을 표시한다.

> **실행자는 이 계획과 `PRD.md`를 함께 읽습니다.** 계획은 PRD를 근거로 쓰였으므로, 화면 문구·규칙이 헷갈리면 PRD의 해당 절을 따른다. 이 계획에만 있는 결정은 "계획에서 정한 것"으로 표시했다.

**목표:** 카테고리 4개 × 10문제의 4지선다 상식 퀴즈 웹 앱을 3단계(연습 모드와 점수 → 스피드·힌트·틀린 문제 다시 풀기 → 점수 저장과 순위표)로 만든다.

**구조:** 서버 없이 `index.html`을 더블클릭해도(`file://`) 동작하는 정적 페이지. `questions.js`가 전역 상수 `QUESTIONS`를 만들고, `script.js`가 순수 로직 → 자체 점검(`runSelfTests`) → 화면 처리 순서로 들어 있다. 같은 `script.js`를 Node로도 읽어 자체 점검을 돌린다.

**기술:** HTML, CSS, 바닐라 자바스크립트(ES2019, 모듈·`fetch` 없음), Node.js(자체 점검 실행용), 깃허브 Pages(배포).

**명세:** `PRD.md` (2026-10-11, 작성자 2601933 김지유)

## 전역 제약

- 앱 파일은 정확히 4개: `index.html`, `style.css`, `script.js`, `questions.js`. 점검용 파일을 따로 만들지 않는다. (PRD 1, 7)
- `index.html`은 `questions.js`를 먼저, `script.js`를 나중에 `<script src>`로 읽는다. `import`/`export`와 `fetch`는 쓰지 않는다. (PRD 5.3)
- 모든 화면 맨 위 머리글 문구는 정확히 `학번 2601933 이름 김지유`. 그 아래 제목은 "상식 퀴즈". (PRD 1.1, 3.1)
- 폭 360px에서 가로 스크롤이 생기지 않는다. (PRD 3.1)
- 카테고리 4개(한국사, 세계지리, 과학, 예술과 문화) × 정확히 10문항 = 40문항. id는 `kh`/`wg`/`sc`/`ac` + `-` + 두 자리 번호. (PRD 4.1)
- 점수: 맞히면 1점, 힌트를 쓰고 맞히면 0.5점, 틀리면(시간 초과 포함) 0점. (PRD 2)
- 스피드 모드는 문항마다 15초. 연습 모드는 순위표에 기록하지 않고 "순위표에 기록되지 않음"을 표시. 틀린 문제 다시 풀기는 연습 모드에서만. (PRD 2)
- 무작위가 필요한 순수 함수는 `rand` 인자를 받는다(생략하면 `Math.random`). (PRD 5.1)
- 자체 점검의 마지막 줄은 `자체 점검 결과: 통과 n, 실패 0`. (PRD 7)
- 태스크 끝은 **점검 명령 통과 후 커밋**으로 마무리한다. 커밋 메시지는 `feat: 〈태스크 이름〉` 형식이다.
- 각 단계(1·2·3)가 끝나면 작업을 멈추고 사람의 브라우저 확인을 기다린다. (PRD 6)

### 점검 명령 (모든 태스크에서 같은 명령)

프로젝트 폴더(`Study03_QuizA`)에서 실행한다. bash와 PowerShell 모두 같은 줄을 쓴다.

```bash
node -e "const s=require('./script.js');const r=s.runSelfTests(require('./questions.js'));process.exitCode=r.fail?1:0"
```

출력 각 줄은 `통과: 〈항목 이름〉` 또는 `실패: 〈항목 이름〉 (오류 내용)`이고, 마지막 줄이 `자체 점검 결과: 통과 n, 실패 m`이다. 단계별 최종 기대값: 1단계 `통과 15, 실패 0`, 2단계 `통과 19, 실패 0`, 3단계 `통과 29, 실패 0`.

### 화면 확인 방법 (클로드용)

UI 태스크 끝에서 클로드는 로컬 정적 서버(예: 프로젝트 폴더에서 `python -m http.server 8000`, 없으면 `npx --yes http-server -p 8000`)로 띄워 내장 브라우저에서 화면을 확인한다. `file://` 더블클릭 확인은 사람에게 맡긴다. 서버 설정 파일(`.claude/launch.json` 등)은 앱 파일이 아니다.

## 리뷰 초점

명세가 암시하지만 자동 점검이 다루지 못해 사용자를 가장 괴롭힐 만한 경우 다섯 가지. 각 줄의 확인 방법을 해당 태스크에 넣었다.

1. **스피드 타이머가 겹치거나 화면 밖에서 계속 도는 경우** — `다음`을 빠르게 눌러도 1초에 1씩만 줄고, `처음으로`·결과 화면으로 가면 타이머가 멈춰 다른 화면에서 "시간 초과"가 생기지 않아야 한다. → 태스크 11(`showScreen`에서 `stopTimer`, `startTimer`가 먼저 `stopTimer`), 2단계 확인 8·9번.
2. **0초와 클릭이 겹치는 경우** — 한 문항에 결과가 두 번 기록되면 안 된다. → 태스크 11(`state.answered` 검사), 2단계 확인 6번.
3. **다시 풀기 판이 점수를 바꾸는 경우** — 다시 푼 판에서 맞혀도 결과 점수는 처음 10문제 그대로여야 한다. → 태스크 13, 2단계 확인 16번.
4. **순위표 이름에 HTML 글자를 넣는 경우** — `<b>홍</b>`을 넣어도 굵은 글씨가 아니라 글자 그대로 보여야 한다. → 태스크 15(모든 출력은 `textContent`), 3단계 확인 3번.
5. **localStorage 값이 깨졌거나 쓸 수 없는 경우** — 빈 순위표로 시작하거나 "기록을 저장할 수 없음"을 보이고, 퀴즈는 계속된다. → 태스크 14 점검 24·25·28번.

---

## 파일 구조

| 파일 | 맡는 일 | 만드는 태스크 |
|---|---|---|
| `index.html` | 화면 틀(머리글, 시작·모드 선택·문제·결과 화면). 화면은 `<section class="screen">` 하나씩 | 1, 10, 11, 12, 13, 15 |
| `style.css` | 모바일 우선 스타일, 정답/오답/흐림/빨간 시간 표시 | 1, 10, 11, 12, 15 |
| `questions.js` | 전역 상수 `QUESTIONS` 40문항 + Node용 `module.exports` | 1, 5 |
| `script.js` | 순수 로직, `runSelfTests`, 화면 처리, 브라우저에서만 `init()` | 1~15 |

`script.js`의 영역 순서: ① 상수(`CATEGORIES`, `MODES`, `SPEED_SECONDS`) ② 순수 로직 ③ 자체 점검 ④ 화면 처리 ⑤ 시작 코드(`init()` 호출, `module.exports`). 함수 선언은 호이스팅되므로 영역 안의 순서는 바뀌어도 된다.

---

# 1단계: 연습 모드와 점수 (태스크 1~8)

**만들 것:** 파일 4개의 뼈대와 머리글, 시작 화면(연습 안내 포함), 문제 화면(즉시 채점, 해설, 출처), 결과 화면(`같은 모드 다시`, `처음으로`), 문항 40개, 문항 검수표.
**아직 만들지 않는 것:** 모드 선택 화면, 스피드, 힌트, 틀린 문제 다시 풀기, 순위표.
**완료 기준:** 점검 명령 `자체 점검 결과: 통과 15, 실패 0` (`shuffle`, `scoreAnswer`, `validateQuestions`, `buildRound` 점검과 실제 40문항 검사).

### Task 1: 파일 4개 뼈대, 머리글, 자체 점검 틀

**Files:**
- Create: `index.html`, `style.css`, `questions.js`, `script.js`

**Interfaces:**
- Consumes: 없음
- Produces: 전역 `CATEGORIES`(`{code, name}` 4개), `runSelfTests(questions) → {pass, fail}`, `module.exports = { runSelfTests }`, 브라우저 전역 `QUESTIONS`, `questions.js`의 `module.exports = QUESTIONS`. `runSelfTests` 안의 도우미 `check(name, fn)`, `same(a, b)`.

- [ ] **Step 1: `index.html` 작성 (1단계 화면 틀)**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>상식 퀴즈</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="student">학번 2601933 이름 김지유</header>
  <main>
    <h1>상식 퀴즈</h1>

    <section id="screen-start" class="screen">
      <p>카테고리를 고르세요. 한 판은 10문제입니다.</p>
      <p id="practice-note" class="note">연습 모드 · 순위표에 기록되지 않음</p>
      <div id="data-error" class="error" hidden></div>
      <div id="category-buttons" class="button-list"></div>
    </section>

    <section id="screen-quiz" class="screen" hidden>
      <div class="status">
        <span id="quiz-label"></span>
        <span id="quiz-progress"></span>
        <span id="quiz-score"></span>
      </div>
      <p id="quiz-question" class="question"></p>
      <div id="quiz-choices" class="choices"></div>
      <div id="quiz-feedback" class="feedback" hidden>
        <p id="feedback-verdict" class="verdict"></p>
        <p id="feedback-explanation"></p>
        <a id="feedback-source" target="_blank" rel="noopener noreferrer"></a>
      </div>
      <button id="btn-next" type="button" hidden>다음</button>
    </section>

    <section id="screen-result" class="screen" hidden>
      <h2>결과</h2>
      <p id="result-score" class="big"></p>
      <p id="result-note" class="note" hidden>순위표에 기록되지 않음</p>
      <ol id="result-list" class="result-list"></ol>
      <div class="button-list">
        <button id="btn-again" type="button">같은 모드 다시</button>
        <button id="btn-home" type="button" class="secondary">처음으로</button>
      </div>
    </section>
  </main>

  <script src="questions.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

`<link rel="icon" href="data:,">`는 `file://`로 열 때 favicon 요청 오류가 콘솔에 찍히지 않게 한다(계획에서 정한 것).

- [ ] **Step 2: `style.css` 작성 (1단계 스타일)**

```css
* { box-sizing: border-box; }
[hidden] { display: none !important; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.5;
  color: #1f2328;
  background: #f6f7f9;
}
.student { padding: 8px 16px; background: #1f2d3d; color: #fff; font-weight: 700; text-align: center; }
main { max-width: 640px; margin: 0 auto; padding: 16px; }
h1 { margin: 8px 0 16px; font-size: 1.6rem; }
h2 { margin: 0 0 12px; font-size: 1.25rem; }
p, li, a { overflow-wrap: anywhere; word-break: keep-all; }

button {
  font: inherit;
  width: 100%;
  margin: 0 0 8px;
  padding: 12px 14px;
  border: 1px solid #c8ccd2;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow-wrap: anywhere;
  word-break: keep-all;
}
button:hover:not(:disabled) { border-color: #3b6fd6; }
button:disabled { cursor: default; }
button.secondary { background: #eef0f3; text-align: center; }

.note { color: #5b6470; font-size: .95rem; }
.error { margin-bottom: 12px; padding: 12px; border: 1px solid #d33; border-radius: 8px; background: #fdecec; color: #a11; }

.status { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-bottom: 12px; font-weight: 700; }
.question { font-size: 1.15rem; font-weight: 700; }
.choice:disabled { opacity: 1; color: inherit; }
.choice.correct { border-color: #1e7d32; background: #e6f4ea; }
.choice.wrong { border-color: #c62828; background: #fdecec; }
.tag { margin-left: 8px; font-size: .9rem; font-weight: 700; }
.correct .tag { color: #1e7d32; }
.wrong .tag { color: #c62828; }

.feedback { margin: 12px 0; padding: 12px; border: 1px solid #e1e4e8; border-radius: 8px; background: #fff; }
.verdict { margin: 0 0 4px; font-weight: 700; }
.verdict.ok { color: #1e7d32; }
.verdict.ng { color: #c62828; }
.feedback a { color: #3b6fd6; }
#btn-next { background: #3b6fd6; border-color: #3b6fd6; color: #fff; text-align: center; }

.big { margin: 0; font-size: 2rem; font-weight: 700; }
.result-list { padding-left: 1.4em; }
.result-list li { margin-bottom: 10px; }
.result-list p { margin: 0; }
.result-list .q { font-weight: 700; }
.result-list .ok p:last-child { color: #1e7d32; }
.result-list .ng p:last-child { color: #c62828; }
```

- [ ] **Step 3: `questions.js` 뼈대 작성**

```js
// 상식 퀴즈 문항 데이터. 형식은 PRD.md 4.1, 작성 규칙은 PRD.md 4.2를 따른다.
const QUESTIONS = [
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
```

- [ ] **Step 4: `script.js` 뼈대 작성**

```js
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
```

- [ ] **Step 5: 점검 명령 실행**

Run: 점검 명령
Expected: 마지막 줄 `자체 점검 결과: 통과 0, 실패 0`, 종료 코드 0

- [ ] **Step 6: 화면 확인**

로컬 서버로 열어 맨 위에 `학번 2601933 이름 김지유`, 그 아래 "상식 퀴즈", 안내 문구와 "연습 모드 · 순위표에 기록되지 않음"이 보이는지 확인한다(카테고리 버튼은 아직 없음).

- [ ] **Step 7: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html style.css questions.js script.js
git commit -m "feat: 파일 4개 뼈대와 머리글, 자체 점검 틀"
```

---

### Task 2: `shuffle`, `scoreAnswer`

**Files:**
- Modify: `script.js` (순수 로직 영역, 점검 항목 영역)

**Interfaces:**
- Consumes: `check`, `same` (Task 1)
- Produces: `shuffle(arr, rand) → 새 배열`(원본 불변, Fisher–Yates), `scoreAnswer(correct: boolean, usedHint: boolean) → 1 | 0.5 | 0`

- [ ] **Step 1: 점검 항목 1~4 추가** (점검 항목 영역)

```js
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
```

- [ ] **Step 2: 점검 명령 실행 → 실패 확인**

Expected: `통과 0, 실패 4`, 실패 줄에 `shuffle is not defined` / `scoreAnswer is not defined`

- [ ] **Step 3: 구현** (순수 로직 영역)

```js
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
```

- [ ] **Step 4: 점검 명령 실행 → 통과 확인**

Expected: `자체 점검 결과: 통과 4, 실패 0`

- [ ] **Step 5: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: shuffle, scoreAnswer"
```

---

### Task 3: `validateQuestions`

**Files:**
- Modify: `script.js` (순수 로직, 점검 도우미, 점검 항목)

**Interfaces:**
- Consumes: `CATEGORIES`
- Produces: `validateQuestions(questions) → string[]`(오류 없으면 `[]`). 오류 문구는 `"〈id 또는 n번째 문항〉: 〈내용〉"` 또는 `"〈카테고리〉: 문항이 n개입니다 (10개여야 함)."`. 점검 도우미 `makeQuestion(code, name, n)`, `makeValidSet() → 40문항`(모든 `answer`는 0).

- [ ] **Step 1: 점검 도우미 추가** (점검 도우미 영역)

```js
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
```

- [ ] **Step 2: 점검 항목 5~11 추가** (점검 항목 영역, 4번 아래)

```js
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
```

- [ ] **Step 3: 점검 명령 실행 → 실패 확인**

Expected: `통과 4, 실패 7`, `validateQuestions is not defined`

- [ ] **Step 4: 구현** (순수 로직 영역)

```js
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
```

- [ ] **Step 5: 점검 명령 실행 → 통과 확인**

Expected: `자체 점검 결과: 통과 11, 실패 0`

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: validateQuestions"
```

---

### Task 4: `buildRound`, `shuffleItem`

**Files:**
- Modify: `script.js` (순수 로직, 점검 항목)

**Interfaces:**
- Consumes: `shuffle` (Task 2), `makeValidSet` (Task 3)
- Produces:
  - `shuffleItem(item, rand) → 새 문항 객체` — 보기 순서를 섞고 `answer`를 새 위치로 다시 계산. `{id, category, question, choices, answer, explanation, source}`. 원본 문항과 라운드 문항 모두 받을 수 있다(태스크 13 다시 풀기에서 재사용).
  - `buildRound(questions, category, rand) → 라운드 문항 배열(최대 10개)` — 해당 카테고리 문항을 섞어 10개를 고르고 각각 `shuffleItem`. 원본 불변.

- [ ] **Step 1: 점검 항목 12~14 추가**

```js
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
```

- [ ] **Step 2: 점검 명령 실행 → 실패 확인**

Expected: `통과 11, 실패 3`, `buildRound is not defined`

- [ ] **Step 3: 구현**

```js
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

function buildRound(questions, category, rand) {
  const pool = questions.filter(q => q.category === category);
  return shuffle(pool, rand).slice(0, 10).map(q => shuffleItem(q, rand));
}
```

- [ ] **Step 4: 점검 명령 실행 → 통과 확인**

Expected: `자체 점검 결과: 통과 14, 실패 0`

- [ ] **Step 5: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: buildRound, shuffleItem"
```

---

### Task 5: 문항 40개와 문항 검수표

**Files:**
- Modify: `questions.js`, `script.js` (점검 항목 15)

**Interfaces:**
- Consumes: `validateQuestions` (Task 3), `runSelfTests(questions)`의 `questions` 인자
- Produces: `QUESTIONS` 40문항(`kh-01`~`kh-10`, `wg-01`~`wg-10`, `sc-01`~`sc-10`, `ac-01`~`ac-10`)

- [ ] **Step 1: 점검 항목 15 추가**

```js
  check("실제 문항 데이터: validateQuestions 통과", () => {
    const errors = validateQuestions(questions);
    errors.forEach(e => console.log("  " + e));
    return errors.length === 0;
  });
```

- [ ] **Step 2: 점검 명령 실행 → 실패 확인**

Expected: `통과 14, 실패 1`, 그 위에 `한국사: 문항이 0개입니다 (10개여야 함).` 등 4줄

- [ ] **Step 3: 문항 40개 작성**

PRD 4.1 형식과 4.2 규칙을 따른다. 문항 하나를 쓸 때마다 다음 순서를 지킨다.

1. 문제 문장과 보기 4개를 쓴다. 정답은 하나뿐이어야 하고, 보기 4개는 서로 다르며, "가장 ~한"을 쓰면 기준과 시점을 문제 문장에 밝힌다.
2. 출처 페이지를 실제로 열어(WebFetch 등) 정답과 해설 속 연도·수치를 확인한다. 확인하지 못한 사실은 쓰지 않고 다른 문항으로 바꾼다.
3. 해설은 60자 안팎의 한 줄로 쓴다.
4. `source.name`에는 페이지 이름, `source.url`에는 실제로 열어 본 주소를 적는다.
5. `answer`는 보기 배열에서 정답의 위치(0~3)다. 화면에서는 보기를 섞으므로, 작성할 때 정답 위치가 한쪽으로 몰려도 된다.

계획에서 정한 것(PRD에 없음):
- 출처는 공공기관·백과사전·박물관·학회 등 신뢰할 만한 페이지를 쓴다. 위키백과·나무위키·개인 블로그는 출처로 쓰지 않는다.
- 문제 문장을 "~이 아닌 것은?" 같은 부정형으로 쓰지 않는다.
- 시간이 지나면 바뀌는 사실(현재 인구 순위, 최신 기록 등)은 피하거나 시점을 밝힌다.

형식 예시(내용은 실제 확인한 것으로 채움):

```js
const QUESTIONS = [
  {
    id: "kh-01",
    category: "한국사",
    question: "문제 문장",
    choices: ["보기1", "보기2", "보기3", "보기4"],
    answer: 0,
    explanation: "60자 안팎의 한 줄 해설",
    source: { name: "출처 페이지 이름", url: "실제로 열어 본 출처 페이지 주소" }
  },
  // ... kh-02 ~ ac-10까지 모두 40개
];
```

- [ ] **Step 4: 점검 명령 실행 → 통과 확인**

Expected: `자체 점검 결과: 통과 15, 실패 0`

- [ ] **Step 5: 문항 검수표 작성** — 1단계 완료 보고에 붙인다(파일로 만들지 않음, 앱 파일 4개 유지).

| id | 정답 | 출처에서 확인한 내용 | 출처 |
|---|---|---|---|
| kh-01 | 〈정답 보기〉 | 〈출처 페이지에서 정답·수치를 확인한 문장 요약〉 | 〈출처 이름〉 |

40행 모두 채운다.

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add questions.js script.js
git commit -m "feat: 문항 40개"
```

---

### Task 6: 시작 화면, 화면 전환, 문항 데이터 오류 표시

**Files:**
- Modify: `script.js` (화면 처리 영역)

**Interfaces:**
- Consumes: `CATEGORIES`, `validateQuestions`, `runSelfTests`
- Produces: `$(id)`, `el(tag, className, text)`, `showScreen(name)`(`"start" | "quiz" | "result"`, 2단계에 `"mode"` 추가), `renderStart(errors)`, `onCategory(category)`, `bindButtons()`. `init()`이 이 순서로 호출: 검사 → `renderStart` → `bindButtons` → `showScreen("start")` → `?test`면 `runSelfTests`.

- [ ] **Step 1: 화면 처리 영역의 `init`을 아래 코드 전체로 바꾼다**

```js
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

// 1단계에는 모드 선택이 없으므로 곧바로 연습 모드로 시작한다. 2단계(태스크 10)에서 모드 선택으로 바꾼다.
function onCategory(category) {
  startRound(category, "practice");
}

function bindButtons() {
}

function init() {
  const questions = typeof QUESTIONS !== "undefined" ? QUESTIONS : null;
  renderStart(validateQuestions(questions));
  bindButtons();
  showScreen("start");
  if (new URLSearchParams(location.search).has("test")) runSelfTests(questions);
}
```

`startRound`는 태스크 7에서 만든다. 이 태스크에서는 카테고리 버튼을 누르지 않는다.

- [ ] **Step 2: 점검 명령 실행** — Expected: `통과 15, 실패 0` (Node에서는 `init`이 돌지 않음)

- [ ] **Step 3: 화면 확인**
  - 머리글, 제목, 안내 문구, 연습 안내, 카테고리 버튼 4개가 보인다.
  - `questions.js`의 첫 문항 `answer`를 잠시 `9`로 바꿔 새로고침하면 "문항 데이터 오류"와 `kh-01: answer는 0~3이어야 합니다.`가 보이고 카테고리 버튼이 눌리지 않는다. 확인 후 원래 값으로 되돌리고 점검 명령으로 `통과 15`를 다시 확인한다.

- [ ] **Step 4: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: 시작 화면과 문항 데이터 오류 표시"
```

---

### Task 7: 문제 화면 (즉시 채점, 해설, 출처, 다음)

**Files:**
- Modify: `script.js` (상수 영역, 화면 처리 영역)

**Interfaces:**
- Consumes: `buildRound`, `scoreAnswer`, `$`, `el`, `showScreen`
- Produces:
  - 상수 `MODES = { practice: { label, rule, ranked } }` (2단계에서 `speed`, `hint` 추가)
  - 상태 객체 `state = { category, mode, items, index, score, results, answered }`
  - 결과 한 건: `{ item, chosen: number|null, correct: boolean, usedHint: boolean, timedOut: boolean, points: number }`
  - `startRound(category, mode)`, `renderQuestion()`, `renderScore()`, `chooseAnswer(i)`, `finishQuestion(chosen, verdict)`(`verdict`는 `"정답!" | "오답" | "시간 초과"`), `onNext()`

- [ ] **Step 1: 상수 영역에 `MODES` 추가** (`CATEGORIES` 아래)

```js
const MODES = {
  practice: { label: "연습", rule: "시간 제한과 힌트 없음, 맞히면 1점", ranked: false }
};
```

- [ ] **Step 2: 화면 처리 영역 맨 위(`$` 함수 위)에 상태와 문제 화면 함수 추가**

```js
const state = {
  category: null,
  mode: "practice",
  items: [],
  index: 0,
  score: 0,
  results: [],
  answered: false
};

function startRound(category, mode) {
  state.category = category;
  state.mode = mode;
  state.items = buildRound(QUESTIONS, category);
  state.index = 0;
  state.score = 0;
  state.results = [];
  showScreen("quiz");
  renderQuestion();
}

function renderScore() {
  $("quiz-score").textContent = "점수 " + state.score;
}

function renderQuestion() {
  const item = state.items[state.index];
  state.answered = false;
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
}

function chooseAnswer(i) {
  if (state.answered) return;
  const item = state.items[state.index];
  const correct = i === item.answer;
  const points = scoreAnswer(correct, false);
  state.score += points;
  state.results.push({ item: item, chosen: i, correct: correct, usedHint: false, timedOut: false, points: points });
  finishQuestion(i, correct ? "정답!" : "오답");
}

function finishQuestion(chosen, verdict) {
  state.answered = true;
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

function onNext() {
  if (state.index < state.items.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    renderResult();
  }
}
```

- [ ] **Step 3: `bindButtons`를 아래로 바꾼다**

```js
function bindButtons() {
  $("btn-next").addEventListener("click", onNext);
}
```

- [ ] **Step 4: 점검 명령 실행** — Expected: `통과 15, 실패 0`

- [ ] **Step 5: 화면 확인** — [한국사] → 상단 "한국사 · 연습", "1 / 10", "점수 0". 정답을 고르면 초록색과 "정답", "정답!", 해설, 출처 링크. 오답을 고르면 고른 보기 빨간색 "오답", 정답 보기 초록색 "정답". 답을 고른 뒤 다른 보기를 눌러도 변화 없음. 10번째 문항에서 버튼이 "결과 보기"(`renderResult`는 태스크 8).

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: 문제 화면 즉시 채점과 해설"
```

---

### Task 8: 결과 화면 (`같은 모드 다시`, `처음으로`)

**Files:**
- Modify: `script.js` (화면 처리 영역)

**Interfaces:**
- Consumes: `state`, `MODES`, `startRound`, `showScreen`
- Produces: `resultLabel(result) → "정답 (힌트 0.5점)" | "정답" | "시간 초과" | "오답"`, `renderResult()`

- [ ] **Step 1: 결과 화면 함수 추가** (`onNext` 아래)

```js
function resultLabel(r) {
  if (r.correct && r.usedHint) return "정답 (힌트 0.5점)";
  if (r.correct) return "정답";
  if (r.timedOut) return "시간 초과";
  return "오답";
}

function renderResult() {
  $("result-score").textContent = state.score + " / " + state.results.length;
  $("result-note").hidden = MODES[state.mode].ranked;

  const list = $("result-list");
  list.innerHTML = "";
  state.results.forEach(r => {
    const li = el("li", r.correct ? "ok" : "ng");
    li.appendChild(el("p", "q", r.item.question));
    li.appendChild(el("p", "", resultLabel(r) + " · 정답: " + r.item.choices[r.item.answer]));
    list.appendChild(li);
  });

  showScreen("result");
}
```

- [ ] **Step 2: `bindButtons`를 아래로 바꾼다**

```js
function bindButtons() {
  $("btn-next").addEventListener("click", onNext);
  $("btn-again").addEventListener("click", () => startRound(state.category, state.mode));
  $("btn-home").addEventListener("click", () => showScreen("start"));
}
```

- [ ] **Step 3: 점검 명령 실행** — Expected: `자체 점검 결과: 통과 15, 실패 0`

- [ ] **Step 4: 화면 확인** — 한 판을 끝까지 풀어 "n / 10", "순위표에 기록되지 않음", 문항별 목록. [같은 모드 다시] → 점수 0, 문항·보기 순서가 바뀜. [처음으로] → 시작 화면. 폭 360px에서 가로 스크롤 없음. `?test` → 콘솔 마지막 줄 `자체 점검 결과: 통과 15, 실패 0`.

- [ ] **Step 5: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: 결과 화면"
```

## ⏸ 1단계 종료: 여기서 멈추고 사람의 확인을 기다린다

완료 보고에 문항 검수표(태스크 5 Step 5)를 붙인다.

### 1단계 직접 확인 항목 13개 (탐색기에서 `index.html` 더블클릭)

1. 시작 화면 맨 위에 `학번 2601933 이름 김지유`, 카테고리 버튼 4개, "연습 모드 · 순위표에 기록되지 않음"이 보인다.
2. [한국사]를 누르면 상단에 "한국사 · 연습", "1 / 10", "점수 0"이 보인다.
3. 정답을 고르면 그 보기가 초록색이 되고 "정답"이 붙으며, 아래에 "정답!", 한 줄 해설, 출처 링크가 나온다.
4. 오답을 고르면 고른 보기는 빨간색과 "오답", 정답 보기는 초록색과 "정답"으로 표시된다.
5. 답을 고른 뒤 다른 보기를 눌러도 아무 변화가 없다.
6. 출처 링크를 누르면 새 탭에서 열린다.
7. 10번째 문항에서 버튼이 [결과 보기]로 바뀐다.
8. 결과 화면에 "n / 10", "순위표에 기록되지 않음", 문항별 정답/오답 목록이 보인다.
9. [같은 모드 다시]를 누르면 점수가 0으로 돌아가고 문항과 보기 순서가 바뀐다.
10. [처음으로]를 누르면 시작 화면으로 돌아간다.
11. F12 → 기기 툴바에서 폭 360px로 바꿔도 가로 스크롤이 생기지 않는다.
12. 주소 끝에 `?test`를 붙여 열면 콘솔 마지막 줄이 `자체 점검 결과: 통과 15, 실패 0`이다.
13. 문항 내용(정답, 해설, 출처)이 맞는지 사람이 따로 확인한다(검수표 참고).

**확인 후:** 사람이 지시하면 깃허브 공개 저장소를 만들어 올리고 Pages로 배포한다. (PRD 6.1)

---

# 2단계: 스피드 모드, 힌트 모드, 틀린 문제 다시 풀기 (태스크 9~13)

**만들 것:** 모드 선택 화면(시작 화면의 연습 안내를 옮김), 15초 타이머와 시간 초과, 힌트 버튼과 0.5점, 연습 모드의 틀린 문제 다시 풀기.
**완료 기준:** 점검 명령 `자체 점검 결과: 통과 19, 실패 0` (1단계 점검 유지 + `pickHintRemovals`, `wrongItems`).

### Task 9: `pickHintRemovals`, `wrongItems`

**Files:**
- Modify: `script.js` (순수 로직, 점검 항목)

**Interfaces:**
- Consumes: `shuffle`
- Produces: `pickHintRemovals(item, rand) → number[2]`(정답이 아닌 보기 위치 2개), `wrongItems(results) → item[]`(`correct`가 false인 결과의 `item`, 순서 유지)

- [ ] **Step 1: 점검 항목 16~19 추가**

```js
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
```

- [ ] **Step 2: 점검 명령 실행 → 실패 확인** — Expected: `통과 15, 실패 4`

- [ ] **Step 3: 구현**

```js
function pickHintRemovals(item, rand) {
  const wrong = [0, 1, 2, 3].filter(i => i !== item.answer);
  return shuffle(wrong, rand).slice(0, 2);
}

function wrongItems(results) {
  return results.filter(r => !r.correct).map(r => r.item);
}
```

- [ ] **Step 4: 점검 명령 실행 → 통과 확인** — Expected: `자체 점검 결과: 통과 19, 실패 0`

- [ ] **Step 5: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: pickHintRemovals, wrongItems"
```

---

### Task 10: 모드 선택 화면

**Files:**
- Modify: `index.html`, `style.css`, `script.js`

**Interfaces:**
- Consumes: `MODES`, `startRound`, `showScreen`, `el`
- Produces: `MODES`에 `speed`, `hint` 추가. `renderModeSelect(category)`. `onCategory`가 모드 선택 화면으로 간다.

- [ ] **Step 1: `index.html` 수정**
  - 시작 화면에서 `<p id="practice-note" class="note">연습 모드 · 순위표에 기록되지 않음</p>` 줄을 지운다.
  - `screen-start` 섹션 바로 아래에 추가:

```html
    <section id="screen-mode" class="screen" hidden>
      <h2 id="mode-title"></h2>
      <div id="mode-buttons" class="button-list"></div>
      <button id="btn-back" type="button" class="secondary">뒤로</button>
    </section>
```

- [ ] **Step 2: `style.css` 끝에 추가**

```css
.mode strong, .mode .rule, .mode .mode-note { display: block; }
.mode .rule { font-size: .95rem; }
.mode .mode-note { color: #a15c00; font-size: .9rem; }
```

- [ ] **Step 3: `script.js`의 `MODES`를 바꾼다**

```js
const MODES = {
  practice: { label: "연습", rule: "시간 제한과 힌트 없음, 맞히면 1점", ranked: false },
  speed: { label: "스피드", rule: "문항마다 15초, 시간이 지나면 오답", ranked: true },
  hint: { label: "힌트", rule: "문항마다 힌트 1번, 힌트를 쓰고 맞히면 0.5점", ranked: true }
};
```

- [ ] **Step 4: `onCategory`를 바꾸고 `renderModeSelect` 추가**

```js
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
```

- [ ] **Step 5: `bindButtons`에 한 줄 추가**

```js
  $("btn-back").addEventListener("click", () => showScreen("start"));
```

- [ ] **Step 6: 점검 명령 실행** — Expected: `통과 19, 실패 0`

- [ ] **Step 7: 화면 확인** — 시작 화면에 연습 안내 없음. [과학] → "과학 · 모드를 고르세요", 모드 3개와 규칙 한 줄, "순위표에 기록되지 않음"은 연습에만. [뒤로] → 시작 화면. (스피드·힌트는 아직 연습과 같이 동작)

- [ ] **Step 8: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html style.css script.js
git commit -m "feat: 모드 선택 화면"
```

---

### Task 11: 스피드 모드 타이머와 시간 초과

**Files:**
- Modify: `index.html`, `style.css`, `script.js`

**Interfaces:**
- Consumes: `state`, `finishQuestion`, `renderQuestion`, `showScreen`
- Produces: 상수 `SPEED_SECONDS = 15`, `state.timerId`(`null` 또는 interval id), `state.remaining`, `startTimer()`, `stopTimer()`, `renderTimer()`, `onTimeout()`. 불변식: 타이머는 하나만 돈다. `finishQuestion`과 `showScreen`은 언제나 `stopTimer()`를 부른다.

- [ ] **Step 1: `index.html`** — `.status` 안 `quiz-score` 아래에 추가:

```html
        <span id="quiz-timer" hidden></span>
```

- [ ] **Step 2: `style.css` 끝에 추가**

```css
#quiz-timer.danger { color: #c62828; }
```

- [ ] **Step 3: `script.js` 상수 영역에 추가**

```js
const SPEED_SECONDS = 15;
```

`state` 객체에 두 줄 추가: `timerId: null,` `remaining: SPEED_SECONDS`

- [ ] **Step 4: 타이머 함수 추가** (`finishQuestion` 아래)

```js
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
```

- [ ] **Step 5: 기존 함수 수정**
  - `finishQuestion` 첫 줄에 `stopTimer();`를 넣는다(`state.answered = true;` 위).
  - `showScreen` 첫 줄에 `stopTimer();`를 넣는다.
  - `renderQuestion` 끝에 추가:

```js
  if (state.mode === "speed") startTimer();
  else $("quiz-timer").hidden = true;
```

`showScreen("quiz")`가 `renderQuestion`보다 먼저 불리므로(`startRound`), 새 타이머가 화면 전환으로 멈추는 일은 없다.

- [ ] **Step 6: 점검 명령 실행** — Expected: `통과 19, 실패 0`

- [ ] **Step 7: 화면 확인** — 스피드 시작 → "남은 시간 15초"부터 1초씩 감소, 5초 이하 빨간색, 0초에 "시간 초과"와 정답 초록·해설·보기 잠김. 답을 고르면 멈춤. [다음] → 15초부터 다시. [다음]을 빠르게 눌러도 1초에 1씩만 준다. 판 도중 결과 화면이나 시작 화면으로 가면 남은 시간이 사라지고 "시간 초과"가 새로 생기지 않는다.

- [ ] **Step 8: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html style.css script.js
git commit -m "feat: 스피드 모드 타이머와 시간 초과"
```

---

### Task 12: 힌트 모드

**Files:**
- Modify: `index.html`, `style.css`, `script.js`

**Interfaces:**
- Consumes: `pickHintRemovals`, `scoreAnswer`, `state`
- Produces: `state.usedHint: boolean`(문항마다 초기화), `onHint()`. 결과 한 건의 `usedHint`가 실제 값을 갖는다.

- [ ] **Step 1: `index.html`** — `quiz-choices` div 바로 아래에 추가:

```html
      <button id="btn-hint" type="button" hidden>힌트 (오답 2개 지우기)</button>
```

- [ ] **Step 2: `style.css` 끝에 추가**

```css
.choice.removed { opacity: .4; text-decoration: line-through; }
#btn-hint { text-align: center; }
```

- [ ] **Step 3: `script.js` 수정**
  - `state`에 `usedHint: false,` 추가.
  - `renderQuestion`의 `state.answered = false;` 아래에 추가:

```js
  state.usedHint = false;
  const hintBtn = $("btn-hint");
  hintBtn.hidden = state.mode !== "hint";
  hintBtn.disabled = false;
  hintBtn.textContent = "힌트 (오답 2개 지우기)";
```

  - `chooseAnswer`의 점수 계산과 결과 기록을 바꾼다:

```js
  const points = scoreAnswer(correct, state.usedHint);
  state.score += points;
  state.results.push({ item: item, chosen: i, correct: correct, usedHint: state.usedHint, timedOut: false, points: points });
```

  - `finishQuestion`의 `state.answered = true;` 아래에 `$("btn-hint").disabled = true;` 추가.
  - `onHint` 추가 (`chooseAnswer` 아래):

```js
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
```

  - `bindButtons`에 `$("btn-hint").addEventListener("click", onHint);` 추가.

- [ ] **Step 4: 점검 명령 실행** — Expected: `통과 19, 실패 0`

- [ ] **Step 5: 화면 확인** — 힌트 모드에서 버튼을 누르면 오답 2개가 흐려지고 취소선, 눌리지 않음, 버튼 "힌트 사용함" 잠김. 다음 문항에서 다시 사용 가능. 힌트 쓰고 맞히면 점수 +0.5. 결과에 "정답 (힌트 0.5점)", 점수가 "8.5 / 10"처럼 표시. 연습·스피드에는 힌트 버튼 없음.

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html style.css script.js
git commit -m "feat: 힌트 모드"
```

---

### Task 13: 틀린 문제 다시 풀기 (연습 모드)

**Files:**
- Modify: `index.html`, `script.js`

**Interfaces:**
- Consumes: `wrongItems`, `shuffle`, `shuffleItem`, `renderQuestion`, `renderResult`
- Produces: `state.retry: boolean`, `state.firstResults`, `state.firstScore`, `startRetry()`. 다시 푸는 판은 점수에 반영하지 않는다. 결과 화면의 점수와 목록은 언제나 처음 판(`firstResults`, `firstScore`)이다.

- [ ] **Step 1: `index.html`** — 결과 화면에서 `result-list` 아래에 `<p id="result-retry" class="note" hidden></p>`, 버튼 묶음 맨 앞에 추가:

```html
        <button id="btn-retry" type="button" hidden>틀린 문제 다시 풀기</button>
```

- [ ] **Step 2: `script.js` 수정**
  - `state`에 `retry: false,` `firstResults: [],` `firstScore: 0,` 추가.
  - `startRound`의 `state.results = [];` 아래에 `state.retry = false;` 추가.
  - `renderScore`를 바꾼다:

```js
function renderScore() {
  $("quiz-score").textContent = state.retry ? "다시 풀기 · 채점 안 함" : "점수 " + state.score;
}
```

  - `chooseAnswer`의 점수 두 줄을 바꾼다:

```js
  const points = state.retry ? 0 : scoreAnswer(correct, state.usedHint);
  state.score += points;
```

  - `startRetry` 추가:

```js
function startRetry() {
  state.items = shuffle(wrongItems(state.results)).map(it => shuffleItem(it));
  state.index = 0;
  state.results = [];
  state.retry = true;
  showScreen("quiz");
  renderQuestion();
}
```

  - `renderResult`를 아래 전체로 바꾼다:

```js
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
```

  - `bindButtons`에 `$("btn-retry").addEventListener("click", startRetry);` 추가.

- [ ] **Step 3: 점검 명령 실행** — Expected: `자체 점검 결과: 통과 19, 실패 0`

- [ ] **Step 4: 화면 확인** — 연습에서 일부러 3문항 틀림 → [틀린 문제 다시 풀기] → "1 / 3", 상단 "다시 풀기 · 채점 안 함". 다시 푼 뒤 결과 점수는 처음 그대로, "다시 풀기: 3문항 중 m문항 맞힘". 또 틀리면 버튼이 다시 나오고, 다 맞히면 사라짐. 스피드·힌트 결과에는 버튼 없음. [같은 모드 다시]는 새 10문항 판.

- [ ] **Step 5: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html script.js
git commit -m "feat: 틀린 문제 다시 풀기"
```

## ⏸ 2단계 종료: 여기서 멈추고 사람의 확인을 기다린다

### 2단계 직접 확인 항목 17개

**모드 선택 (3)**
1. 시작 화면에 "연습 모드 · 순위표에 기록되지 않음" 문구가 없다.
2. 카테고리를 누르면 "〈카테고리〉 · 모드를 고르세요"와 모드 버튼 3개(연습, 스피드, 힌트)가 규칙 한 줄과 함께 보이고, "순위표에 기록되지 않음"은 연습 버튼에만 있다.
3. [뒤로]를 누르면 시작 화면으로 돌아간다.

**스피드 (6)**
4. 스피드 모드를 시작하면 "남은 시간 15초"부터 1초에 1씩 줄어든다.
5. 5초 이하가 되면 남은 시간이 빨간색이 된다.
6. 0초가 되면 "시간 초과"가 나오고, 정답 보기가 초록색 "정답"으로 보이며, 해설과 출처가 나오고 보기가 잠긴다.
7. 시간 안에 답을 고르면 남은 시간이 그 자리에서 멈춘다.
8. [다음]을 누르면 다음 문항에서 15초부터 다시 센다. [다음]을 빠르게 눌러도 1초에 1씩만 줄어든다(타이머 하나만).
9. 결과 화면 목록에 시간이 지난 문항은 "시간 초과"로 표시되고, 결과·시작 화면에는 남은 시간이 보이지 않는다.

**힌트 (4)**
10. [힌트 (오답 2개 지우기)]를 누르면 오답 2개가 흐려지고 취소선이 그어지며 눌리지 않고, 버튼은 "힌트 사용함"으로 잠긴다.
11. 다음 문항에서는 힌트 버튼을 다시 쓸 수 있다.
12. 힌트를 쓰고 맞히면 점수가 0.5, 힌트 없이 맞히면 1 오른다.
13. 결과 화면에 힌트를 쓰고 맞힌 문항은 "정답 (힌트 0.5점)"으로 보이고, 점수가 "8.5 / 10"처럼 표시된다.

**연습·틀린 문제 다시 풀기 (4)**
14. 연습 모드 결과에 틀린 문항이 있으면 [틀린 문제 다시 풀기]가 보인다(스피드·힌트 결과에는 없다).
15. 누르면 틀린 문항만 나오고(예: 3개 틀리면 "1 / 3"), 상단에 "다시 풀기 · 채점 안 함"이 보인다.
16. 다시 푼 뒤 결과 화면의 점수는 처음 10문제 점수 그대로다.
17. 또 틀리면 버튼이 다시 나오고, 다 맞히면 버튼이 사라진다.

참고: `?test` → 콘솔 마지막 줄 `자체 점검 결과: 통과 19, 실패 0`.

**확인 후:** 사람이 지시하면 Pages를 갱신한다. (PRD 6.2)

---

# 3단계: 점수 저장과 순위표 (태스크 14~15)

**만들 것:** 스피드·힌트 결과 화면의 이름 입력과 `기록 저장`, 모드×카테고리별 상위 5건 순위표(localStorage 키 8개).
**완료 기준:** 점검 명령 `자체 점검 결과: 통과 29, 실패 0` (앞 단계 유지 + `insertRecord`, `loadBoard`, `saveBoard`, `boardKey`, `todayString`).

### Task 14: 순위표 로직 (`insertRecord`, `loadBoard`, `saveBoard`)

**Files:**
- Modify: `script.js` (순수 로직, 점검 도우미, 점검 항목)

**Interfaces:**
- Consumes: `CATEGORIES`
- Produces:
  - 기록 한 건 `{ name: string, score: number, date: "YYYY-MM-DD" }`
  - `insertRecord(board, record) → 새 배열` — 점수 내림차순, 동점이면 먼저 있던 기록이 위, 상위 5건. 원본 불변.
  - `getStorage() → localStorage | null` — 쓸 수 없으면 `null`.
  - `loadBoard(key, storage) → 기록 배열` — 값이 없거나 깨졌으면 `[]`.
  - `saveBoard(key, board, storage) → boolean` — 실패하면 `false`.
  - `storage`는 생략하면 `getStorage()`를 쓴다(점검에서 가짜 저장소를 넣으려고 PRD 시그니처에 인자 하나를 더한 것, 계획에서 정한 것).
  - `boardKey(mode, category) → "quizA.board.〈mode〉.〈code〉"` (예: `quizA.board.speed.kh`)
  - `todayString(date) → "YYYY-MM-DD"`(지역 시간)
  - 점검 도우미 `fakeStorage(init)`

- [ ] **Step 1: 점검 도우미 추가**

```js
  function fakeStorage(init) {
    const data = Object.assign({}, init);
    return {
      getItem: k => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v); }
    };
  }
```

- [ ] **Step 2: 점검 항목 20~29 추가**

```js
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
```

- [ ] **Step 3: 점검 명령 실행 → 실패 확인** — Expected: `통과 19, 실패 10`

- [ ] **Step 4: 구현** (순수 로직 영역)

```js
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
```

- [ ] **Step 5: 점검 명령 실행 → 통과 확인** — Expected: `자체 점검 결과: 통과 29, 실패 0`

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add script.js
git commit -m "feat: 순위표 저장 로직"
```

---

### Task 15: 결과 화면의 기록 저장과 순위표

**Files:**
- Modify: `index.html`, `style.css`, `script.js`

**Interfaces:**
- Consumes: `insertRecord`, `loadBoard`, `saveBoard`, `getStorage`, `boardKey`, `todayString`, `state.firstScore`
- Produces: `state.saved: boolean`(한 판에 한 번만 저장), `renderRanking()`, `renderBoard(board)`, `onSave()`. 모든 출력은 `textContent`(이름에 HTML을 넣어도 글자 그대로).

- [ ] **Step 1: `index.html`** — 결과 화면에서 `result-retry` 줄 아래에 추가:

```html
      <div id="ranking" class="ranking" hidden>
        <div class="save-row">
          <input id="ranking-name" type="text" maxlength="12" placeholder="이름" aria-label="이름">
          <button id="btn-save" type="button">기록 저장</button>
        </div>
        <p id="ranking-message" class="note"></p>
        <h3 id="ranking-title"></h3>
        <ol id="ranking-list"></ol>
      </div>
```

- [ ] **Step 2: `style.css` 끝에 추가**

```css
.ranking { margin: 16px 0; padding: 12px; border: 1px solid #e1e4e8; border-radius: 8px; background: #fff; }
.save-row { display: flex; gap: 8px; }
.save-row input { flex: 1; min-width: 0; padding: 10px; border: 1px solid #c8ccd2; border-radius: 8px; font: inherit; }
.save-row button { width: auto; margin: 0; text-align: center; white-space: nowrap; }
.ranking h3 { margin: 8px 0; font-size: 1.05rem; }
#ranking-list .empty { list-style: none; color: #5b6470; }
```

- [ ] **Step 3: `script.js` 수정**
  - `state`에 `saved: false,` 추가.
  - 함수 추가 (`renderResult` 아래):

```js
function renderRanking() {
  const box = $("ranking");
  box.hidden = !MODES[state.mode].ranked;
  if (box.hidden) return;

  state.saved = false;
  const canStore = getStorage() !== null;
  $("ranking-name").value = "";
  $("ranking-name").disabled = !canStore;
  $("btn-save").disabled = !canStore;
  $("ranking-message").textContent = canStore ? "" : "기록을 저장할 수 없음";
  $("ranking-title").textContent = state.category + " · " + MODES[state.mode].label + " 순위표";
  renderBoard(loadBoard(boardKey(state.mode, state.category)));
}

function renderBoard(board) {
  const list = $("ranking-list");
  list.innerHTML = "";
  if (board.length === 0) {
    list.appendChild(el("li", "empty", "아직 기록이 없습니다."));
    return;
  }
  board.forEach(r => list.appendChild(el("li", "", r.name + " · " + r.score + "점 · " + r.date)));
}

function onSave() {
  if (state.saved) return;
  const name = $("ranking-name").value.trim();
  if (name === "") {
    $("ranking-message").textContent = "이름을 입력하세요";
    return;
  }
  const key = boardKey(state.mode, state.category);
  const board = insertRecord(loadBoard(key), { name: name, score: state.firstScore, date: todayString(new Date()) });
  if (!saveBoard(key, board)) {
    $("ranking-message").textContent = "기록을 저장할 수 없음";
    return;
  }
  state.saved = true;
  $("ranking-name").disabled = true;
  $("btn-save").disabled = true;
  $("ranking-message").textContent = "기록을 저장했습니다";
  renderBoard(board);
}
```

  - `renderResult`의 `showScreen("result");` 바로 위에 `renderRanking();` 추가.
  - `bindButtons`에 추가:

```js
  $("btn-save").addEventListener("click", onSave);
  $("ranking-name").addEventListener("keydown", e => {
    if (e.key === "Enter") onSave();
  });
```

- [ ] **Step 4: 점검 명령 실행** — Expected: `자체 점검 결과: 통과 29, 실패 0`

- [ ] **Step 5: 화면 확인** — 아래 3단계 확인 항목을 클로드가 먼저 훑어본다.

- [ ] **Step 6: 커밋** — 점검 명령 통과를 확인한 뒤 커밋한다.

```bash
git add index.html style.css script.js
git commit -m "feat: 기록 저장과 순위표 화면"
```

## ⏸ 3단계 종료: 여기서 멈추고 사람의 확인을 기다린다

### 3단계 직접 확인 항목 11개

1. 스피드 모드 결과 화면에 이름 입력칸, [기록 저장], "〈카테고리〉 · 스피드 순위표"가 보인다.
2. 이름을 비워 두고 [기록 저장]을 누르면 "이름을 입력하세요"가 나오고 저장되지 않는다.
3. 이름을 넣고 저장하면 순위표에 이름, 점수, 오늘 날짜(YYYY-MM-DD)가 나온다. 이름에 `<b>홍</b>`을 넣어도 굵은 글씨가 아니라 글자 그대로 보인다.
4. 저장한 뒤에는 입력칸과 버튼이 잠겨 같은 판을 두 번 저장할 수 없다.
5. 새로고침(F5) 후 같은 카테고리·같은 모드로 한 판을 끝내면 앞서 저장한 기록이 그대로 있다.
6. 힌트 모드 순위표는 스피드 모드 순위표와 따로 관리된다.
7. 다른 카테고리의 순위표는 따로 관리된다.
8. 힌트 모드에서 0.5점이 섞인 점수가 순위표에 "8.5점"처럼 표시된다.
9. 같은 순위표에 6번째 기록을 저장하면 가장 낮은 기록이 밀려나 5건만 남는다.
10. 점수가 같으면 먼저 저장한 기록이 위에 있다.
11. 연습 모드 결과 화면에는 이름 입력칸과 순위표가 없고 "순위표에 기록되지 않음"이 보인다.

참고: `?test` → 콘솔 마지막 줄 `자체 점검 결과: 통과 29, 실패 0`.

**확인 후:** 사람이 지시하면 Pages를 갱신한다. (PRD 6.3)

---

## PRD 대응표

| PRD 항목 | 구현 태스크 |
|---|---|
| 1 파일 4개, 1.1 `file://`·Pages 동작 | 1 (모듈·fetch 없음), 1단계 확인 |
| 1.1·3.1 머리글 `학번 2601933 이름 김지유`, 제목 | 1 |
| 2 게임 모드 규칙(점수, 15초, 힌트, 연습 미기록) | 2, 7, 10, 11, 12, 13, 15 |
| 3.1 한 번에 한 화면, 360px | 1(CSS), 6(`showScreen`) |
| 3.2 시작 화면(1단계 연습 안내, 2단계 제거) | 1, 6, 10 |
| 3.3 모드 선택 화면 | 10 |
| 3.4 문제 화면(즉시 채점, 해설, 출처, 잠금, 다음/결과 보기) | 7 |
| 3.4 스피드 타이머, 5초 이하 빨간색, 시간 초과 | 11 |
| 3.4 힌트 버튼 | 12 |
| 3.5 결과 화면(점수, 목록, 라벨, 버튼) | 8, 13 |
| 3.5 이름 입력, 기록 저장, 순위표 | 15 |
| 3.6 틀린 문제 다시 풀기 | 9, 13 |
| 4.1 문항 데이터 형식, `module.exports` | 1, 5 |
| 4.2 문항 규칙, 문항 검수표 | 5 |
| 4.3 `validateQuestions`, 오류 표시와 버튼 잠금 | 3, 6 |
| 4.4 localStorage 8키, 상위 5건, 동점, 빈 이름, 저장 불가, 깨진 값 | 14, 15 |
| 5.1 순수 함수 목록 | 2, 3, 4, 9, 14 |
| 5.2 `showScreen`, 상태 객체 하나, 타이머 하나 | 6, 7, 11 |
| 5.3 스크립트 순서, 모듈·fetch 금지 | 1 |
| 6 단계별 완료 기준과 멈춤 | 각 단계 끝 ⏸ |
| 7 `runSelfTests`, Node 한 줄, `?test` | 1, 6, 점검 명령 |
| 8 범위 밖(난이도, 로그인 등) | 만들지 않음 |
