# Code Breaker — English / العربية

An offline game for university freshmen with little or no programming experience. Uses HTML, CSS, and Vanilla JavaScript with local assets and translations. Open `index.html` to play; no install, account, translation API, or network connection is needed.

## Files

- `index.html`: existing layout, visible language selectors, and translation keys for static content and accessible labels.
- `style.css`: existing iTeam/cyber vault design, responsive layouts, Arabic reading direction, and language control styles.
- `questions.js`: 48 beginner questions, English/Arabic text, shared answer IDs, and level metadata.
- `i18n.js`: central interface dictionary (`UI`), interpolation, and language switching.
- `script.js`: game state, shuffled question selection, repeat guards, rendering, scoring, hints, countdown, and results.
- `verification/game.test.cjs`: dependency-free integration tests using a DOM fixture.
- `verification/java.test.cjs`: independent checks for introductory Java answers and unchanged programming syntax.

Keep these files and the existing `assets/` folder together. Scripts load in this order: `questions.js`, `i18n.js`, `script.js`. All scripts are deferred.

## Playing and preserved rules

- Choose **English** or **العربية** in the header. Each dialog also has a selector because modal dialogs prevent interaction with the header.
- Switching immediately updates the current question, choices, hints, feedback, logs, accessible labels, levels, statistics, and results. Arabic reads right-to-left; code and time values stay left-to-right.
- Each game selects 24 distinct questions from the 48-question bank: eight per level, including at least two Java and two Software Engineering questions per level.
- All levels remain beginner-friendly. The stage number tracks progress rather than introducing advanced programming.
- Every new game shuffles the pools and selected questions. Adjacent questions use different categories. The final vault question stays last, after its three seal clues.
- The 20-minute countdown starts on **Begin mission**. It continues in dialogs and hidden tabs, using a fixed deadline to resist interval throttling.
- Select one of four choices, then **Lock answer**. One submission per question. Both correct and incorrect answers show a short explanation.
- Correct answers earn 100, 150, or 200 points by level. The final question earns 300. Maximum score: **3,700**. Wrong answers earn zero.
- Three hints per game, at most one per question. Each subtracts 75 points from total earnings, including future earnings. The displayed score cannot go below zero.
- Triangle, square, and circle clues are kept even after incorrect answers. The final code reads square, circle, triangle: **548**.
- A correct final answer before timeout wins. A wrong final answer or timeout ends the game. The existing victory screen, vault animation, restart, and personal best remain.
- Personal bests rank victories by score, then shortest completion time. They use the existing browser storage key. Storage failure does not prevent play.

Keyboard: **A–D** / **1–4** choose; arrows move between focused answer cards; **Enter** submits or continues; **Tab**, **Shift+Tab**, and **Space** provide normal navigation. Language selectors use native keyboard behavior. **Escape** closes dialogs.

## Add a bilingual question

Add a `question(...)` entry to the appropriate level's `questions` array in `questions.js`. Each text pair is `[English, Arabic]`. The helper assigns option IDs `a`, `b`, `c`, `d` in order, and uses the unique question ID as its concept key by default.

```js
question(
  "unique-concept-id",
  "HTML/CSS",
  ["Which HTML tag makes a paragraph?", "أي وسم في HTML ينشئ فقرة؟"],
  [
    ["<img>", "<img>"],
    ["<p>", "<p>"],
    ["<br>", "<br>"],
    ["<h1>", "<h1>"]
  ],
  "b", // One shared correct-answer ID for both languages.
  ["Think of the first letter of paragraph.", "فكّر في أول حرف من كلمة paragraph."],
  ["The <p> tag marks a paragraph.", "يحدّد الوسم <p> فقرة."],
  { code: "<p>Hello</p>", filename: "example.html" } // Optional.
)
```

The resulting record has this structure:

```js
{
  id: "unique-concept-id",
  concept: "unique-concept-id",
  category: "HTML/CSS",
  difficulty: 1,
  points: 100,
  prompt: { en: "...", ar: "..." },
  choices: [
    { id: "a", text: { en: "...", ar: "..." } },
    { id: "b", text: { en: "...", ar: "..." } },
    { id: "c", text: { en: "...", ar: "..." } },
    { id: "d", text: { en: "...", ar: "..." } }
  ],
  correctAnswerId: "b",
  hint: { en: "...", ar: "..." },
  explanation: { en: "...", ar: "..." }
}
```

The final pass in `questions.js` assigns difficulty and points from the containing level. Valid category keys: `Web Fundamentals`, `HTML/CSS`, `JavaScript`, `Java`, `Software Engineering`, `Logic`. Interface category names are translated in `UI`.

Give every question a globally unique ID and a distinct learning objective. Check existing questions first; different wording for the same fact does not make a new concept. Keep questions, choices, hints, and explanations short and natural. Review both languages for matching meaning and one unambiguous correct answer. Keep code, programming keywords, and choice IDs unchanged between languages. Code is displayed as text, never executed by the game.

Clue entries additionally use `clue: { shape: "triangle", digit: "8" }` (or square/circle). Keep exactly one seal per level and one `final: true` question in the last level. Changing a clue digit also requires updating its choices, explanation, and the final question in both languages. Keep enough Java and Software Engineering questions for the two-per-level selection rule.

To add an interface label, add a bilingual `[English, Arabic]` entry to `UI` in `i18n.js`. Static HTML uses `data-i18n="key"`; accessible labels use `data-i18n-aria-label="key"`; dynamic text uses `t("key", { value })`. Both translations must use the same named placeholders. Only trusted static interface entries may contain markup. Questions and feedback use `textContent`.

## State and no repetition

`buildSessionPlan()` uses Fisher–Yates shuffling on copies and reserves IDs across all levels. `showQuestionAt()` records every displayed ID and concept in session-wide sets, including the first question shown before starting. Level transitions never clear those sets.

`setLanguage()` changes the language and renders the current state. It does not call `init()`, `showQuestionAt()`, or `buildSessionPlan()`. Selection, submitted answers, hints, seals, logs, score, timer deadline, level, and question history remain intact. Restart and Play again create fresh state and a fresh shuffle, while retaining the selected language and personal best. Page reload starts a new game.

Insufficient unused questions produce a translated completion message and stop the timer instead of recycling questions. Invalid bilingual records, duplicate IDs/concepts/prompts, and incorrect answer IDs produce a translated bank error. Validation is in `validateQuestionBank()` and `buildSessionPlan()`.

## Verification

Run with Node.js:

```text
node --check questions.js
node --check i18n.js
node --check script.js
node verification/game.test.cjs
node verification/java.test.cjs
```

The integration suite exercises all questions with all four choices in both languages (384 outcomes), 500 shuffled plans, answer IDs, translation completeness, dictionary keys/placeholders, unchanged state on language switching, hints, seals, score, keyboard controls, dialog selectors, victory, wrong final answers, timeout, restart/replay, storage, exhaustion, and malformed records. Answer positions are independently listed for all 48 questions. Translation meaning was reviewed alongside the authored pairs; automated checks validate structure and behavior, not human-language equivalence.

Tests use a DOM fixture rather than a rendering engine. A browser connection was unavailable for visual QA in this session. Before an event, check both languages on a phone-width viewport and the intended projector/browser, including dialogs and mixed Arabic/code text.

As with any local browser quiz, source inspection can reveal answers. This game is designed for a friendly learning event.
