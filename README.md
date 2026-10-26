# Code Breaker: The Beginner's Web Challenge

A complete offline multiple-choice vault game for freshmen with little or no programming experience. Built only with HTML, CSS, and Vanilla JavaScript, with no runtime dependencies, API calls, accounts, or installation.

## Run locally

1. Keep `index.html`, `style.css`, `script.js`, and the `assets/` folder together.
2. Open `index.html` in a modern browser such as Edge, Chrome, Firefox, or Safari.
3. Read **How to play**, then select **Begin mission** when ready.

For an event projector, use browser full screen and adjust zoom to suit the audience. Layouts adapt to laptops, tablets, and phones. All fonts and visuals are local; the game works without an internet connection.

Personal bests use `localStorage`. Some browsers restrict storage on local file URLs or in private mode. The game remains playable if storage is unavailable. Serving the folder with your editor's local web server gives consistent browser storage behavior. Active runs are intentionally reset on page reload.

## iTeam visual identity

The interface now follows the supplied iTeam logo and event-post references: a light blue-white canvas, petrol `#07566A`, turquoise `#1C9EAA`, orange `#F58232`, and red `#B40D24`. A local vector interpretation of the reference's four-person motif, university attribution, and a geometric poster-style border appear in the header and page details. `assets/iteam-mark.svg` and `assets/iteam-pattern.svg` are the two local brand assets; no remote requests are required.

Rookie uses a dark turquoise accent, Hacker petrol, and Code Breaker a darker orange suitable for readable text. Code panels stay dark petrol to separate snippets from the white question cards. Key text, buttons, and feedback color pairs were checked for at least 4.5:1 contrast. The redesign changes presentation only; the question bank, randomization, scoring, timer, hints, and session rules remain intact. Direct visual browser QA was unavailable in this session.

## Rules and competition

- 20-minute countdown, starting only when you select **Begin mission**.
- Three sequential levels: **Rookie**, **Hacker**, and **Code Breaker**, with eight questions each.
- Each fresh game selects and shuffles 24 questions from a 72-question bank. Every level contains at least two Software Engineering and two Java questions. Subject mixing prevents adjacent questions from having the same category.
- Exactly four options per question. Select a card, then lock your answer. Each question allows one submission.
- Correct answers earn the stated points. Wrong answers earn zero. Feedback explains the answer either way, then you can continue.
- Rookie questions award 100 points, Hacker questions 150, and Code Breaker questions 200, except the final vault challenge, which awards 300. Maximum score: **3,700**.
- Three hints for the entire run, at most one per question. Each subtracts 75 points from total earnings, including future earnings. The displayed and final score never go below zero; using a hint at zero does not make it free.
- Three earlier questions provide seal clues. A clue is added after submission, even on an incorrect answer, to keep the final challenge solvable. The notebook retains them.
- The eighth question of Level 3 is the final vault challenge, included in the 24-question total. A correct final answer before time expires wins. A wrong final answer or timeout loses.
- **Rank victories by higher score, then shorter completion time.** Time is recorded and displayed to the millisecond. Identical score and time remain tied. No time bonus alters the score.
- The timer keeps running in other tabs and dialogs. It stops at the final submission, so time spent reading final feedback does not affect ranking.
- The personal best stores the best victorious score and time for this browser/origin. There is no shared or online leaderboard. Event organizers can compare the score and completion time displayed on result screens.

## Keyboard controls

- **A–D** or **1–4**: select an answer.
- **Arrow keys** while focused on an answer: move the selection.
- **Enter** on an answer card: submit the selected answer.
- **Enter** after feedback: continue using the focused Next button.
- **Tab**, **Shift+Tab**, and **Space**: standard button navigation/activation.
- **Escape**: close a dialog. The timer still runs while dialogs are open.

## Modify the questions

Edit the `LEVELS` and `EXTRA_QUESTIONS` arrays in `script.js`. Each difficulty has a pool of 24 questions, from which eight are selected per game. `EXTRA_QUESTIONS` entries inherit their difficulty and normal point value from their array position; original `LEVELS` entries specify them directly. Example final bank record:

```js
{
  id: "unique-id",
  concept: "unique-learning-objective",
  category: "Logic",
  difficulty: 1,          // 1, 2, or 3
  points: 100,
  prompt: "What number does this code print?",
  code: "console.log(2 + 3);",  // Optional; displayed as text, never executed
  filename: "example.js",      // Optional label above the snippet
  choices: ["4", "5", "6", "23"],
  correct: 1,             // Zero-based index: A=0, B=1, C=2, D=3
  hint: "Both values are numbers, so work out their sum.",
  explanation: "Adding 2 and 3 gives 5."
}
```

Use four distinct plausible choices, one unambiguous correct answer, and a hint that guides reasoning without stating the answer. Every question must have a unique ID and concept key. Use one of these exact categories: `Software Engineering`, `Java`, `HTML/CSS`, `JavaScript`, `Web Fundamentals`, `Logic`. Balance correct answer positions. Explanations and correct-answer markings appear only after submission.

Clue questions also contain `clue: { shape, label, symbol, digit }`. If you change a seal digit or its source question, update the question's choices, correct index, explanation, and clue metadata together. Also update the final question's choices, correct index, and explanation to match the derived code. Only the last question should have `final: true`.

The UI is deliberately designed around three levels with eight questions each. `CONFIG.questionsPerLevel` controls session selection, while the bank can keep growing. If you change the session length, update the static totals in `index.html`, the maximum-score calculation, and instructions too. Tune duration, hint limit, hint price, and storage key in `CONFIG`. Existing scoring, timer rules, personal-best storage, hints, and victory UI are preserved.

## Question management and no repetition

- `shuffle()` implements Fisher–Yates on a copy of its input. Every new session shuffles each difficulty pool and its selected question order; the bank order stays intact.
- `buildSessionPlan()` reserves IDs across all three levels, chooses at least two Software Engineering and two Java questions per level, and fills the remaining slots from unused questions. It caps subject concentration and arranges the selected questions without adjacent identical categories, including at level boundaries.
- Exactly one required seal question is selected per level. These clues are shuffled within their levels. The final vault challenge is the only pinned question: it stays last so all three clues are available. A random order can naturally coincide with an earlier order; the game always runs the shuffle again.
- `state.usedQuestionIds` and `state.usedConcepts` track questions actually **shown**, not just answered. `showQuestionAt()` checks both sets before rendering any new question. Neither set is reset at a level transition.
- Restart creates a new session ID, new sets, and a fresh plan. The ready screen immediately shows and registers that session’s first question, so the new used-ID set contains one ID after startup.
- Duplicate IDs, duplicate concept keys, duplicate prompts, malformed records, missing clues, insufficient unused questions, or an impossible subject mix produce a clear message inside the existing card. The timer stops, answering is disabled, and no previous question is recycled.
- Concept keys guard against accidentally reintroducing an already cataloged objective. They cannot automatically understand paraphrases: review the substance of a new question before giving it a new concept key.

## Bank totals and editorial review

| Category | Beginner / Rookie | Intermediate Beginner / Hacker | Challenge / Code Breaker | Total |
| --- | ---: | ---: | ---: | ---: |
| Software Engineering | 11 | 8 | 8 | 27 |
| Java | 8 | 8 | 8 | 24 |
| HTML/CSS | 0 | 5 | 1 | 6 |
| JavaScript | 0 | 3 | 4 | 7 |
| Web Fundamentals | 3 | 0 | 0 | 3 |
| Logic | 2 | 0 | 3 | 5 |
| **Total unique questions** | **24** | **24** | **24** | **72** |

All 72 IDs, concept keys, and prompts are distinct. The fixed-step counting question was replaced with an exact-count deduction because the triangle seal already tests a fixed-step pattern. The extra JavaScript addition trace was replaced with boolean negation because the square seal already tests reassignment after addition. The simple JavaScript branch question now tests click-event timing, leaving branch tracing to distinct combined-code challenges.

Related questions target different objectives: identifying a class versus tracking separate object state; reading a zero-based array position versus computing its last index, saving a primitive copy, or updating elements in a loop; discovering a failing test versus locating its cause, checking boundaries, rerunning related tests, or checking connected components. Each record’s `concept` identifies its specific objective. Correct options appear 18 times each at A, B, C, and D across the bank; a random subset need not preserve that exact distribution.

Content was checked against [Java’s official language basics](https://dev.java/learn/language-basics/), the [IEEE Computer Society SWEBOK guide](https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf), and the [Agile Manifesto principles](https://agilemanifesto.org/principles.html). Java snippets show statements that belong inside a method unless explicitly labeled as complete programs. Only the two questions that explicitly ask about syntax errors contain intentionally invalid snippets.

## Verification

With Node.js installed, run:

```text
node --check script.js
node verification/game.test.cjs
```

The dependency-free suite validates all 72 question records, all 288 question/option outcomes through actual shuffled runs, independently reviewed answer positions, actual JavaScript outputs, 500 shuffled game plans, category mixing, cross-level uniqueness, runtime duplicate blocking, excluded IDs, exhaustion errors, fresh sessions on restart, hidden feedback, scoring, hints, transitions, timers, results, storage failures, and time-based tie-breaking.

For optional real Java compiler checks, with a JDK (9 or newer) on PATH, run:

```text
node verification/java.test.cjs
```

This compiles to Java 8 compatibility and runs all 16 Java snippets (repairing the two intentional errors according to the accepted answers), checks their independently specified outputs, compiles the five correct type declarations, and confirms both original erroneous snippets fail compilation. Game players do not need Java installed.

The tests use a small DOM fixture, not a rendering engine. Visual browser QA was unavailable in the build session; responsive styles and reduced-motion rules are included, but projector layout should be checked in the event browser.

As with any browser-only quiz, source inspection can reveal answer data. The game does not place correctness markers or explanations into the visible question UI before submission. It is designed for a friendly event, not a secure examination.
