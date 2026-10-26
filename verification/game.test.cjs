/* Run with: node verification/game.test.cjs
 * Dependency-free integration tests of the actual game script against a small
 * DOM fixture. This checks behavior, not browser layout or rendering.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");

class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase();
    this.document = document;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this.events = {};
    this.className = "";
    this.disabled = false;
    this.hidden = false;
    this.open = false;
    this._text = "";
    this._html = "";
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(" "); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(" "); },
      toggle: (name, force) => {
        const add = force === undefined ? !this.classList.contains(name) : force;
        if (add) this.classList.add(name); else this.classList.remove(name);
        return add;
      }
    };
  }
  set textContent(text) { this._text = String(text); this.children = []; this._html = ""; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
  set innerHTML(value) { this._html = String(value); this._text = ""; this.children = []; }
  get innerHTML() { return this._html; }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "id") this.id = value;
    if (name === "class") this.className = value;
    if (name === "hidden") this.hidden = true;
    if (name === "disabled") this.disabled = true;
    if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(type, listener) { (this.events[type] ??= []).push(listener); }
  append(...children) {
    children.forEach(child => { child.parent = this; });
    this.children.push(...children);
  }
  replaceChildren(...children) { this._text = ""; this._html = ""; this.children = []; this.append(...children); }
  matches(selector) {
    if (selector.startsWith("#")) return this.id === selector.slice(1);
    if (selector.startsWith(".")) return this.classList.contains(selector.slice(1));
    if (selector === "[data-close]") return this.dataset.close !== undefined;
    if (selector === "dialog[open]") return this.tagName === "DIALOG" && this.open;
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => child instanceof Element ? [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)] : []);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) ?? null; }
  focus() { this.document.activeElement = this; }
  click() {
    if (this.disabled) return;
    this.focus();
    (this.events.click ?? []).forEach(callback => callback({ target: this, preventDefault() {} }));
  }
  showModal() { this.open = true; }
  close() { this.open = false; }
}

function fixture() {
  const document = new Element("document", null);
  document.document = document;
  document.createElement = tag => new Element(tag, document);
  document.createTextNode = value => ({ textContent: String(value) });
  document.getElementById = id => document.querySelector(`#${id}`);
  const stack = [document];
  const voidTags = new Set(["META", "LINK", "INPUT", "BR", "HR", "IMG"]);
  for (const token of html.match(/<![^>]*>|<\/?[\w-]+\b[^>]*>|[^<]+/g)) {
    if (token.startsWith("<!")) continue;
    if (token.startsWith("</")) { stack.pop(); continue; }
    if (token.startsWith("<")) {
      const tag = token.match(/^<([\w-]+)/)[1];
      const element = document.createElement(tag);
      for (const match of token.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)) element.setAttribute(match[1], match[2] ?? "");
      stack.at(-1).append(element);
      if (tag === "body") document.body = element;
      if (!voidTags.has(element.tagName) && !token.endsWith("/>")) stack.push(element);
    } else stack.at(-1).append(document.createTextNode(token));
  }
  document.activeElement = document.body;
  return document;
}

function seededRandom(seed = 17) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function boot(options = {}) {
  const document = fixture();
  let now = 1_000_000;
  let intervalCount = 0;
  const intervals = new Map();
  const storage = options.storage ?? new Map();
  const windowEvents = {};
  const context = vm.createContext({
    console,
    Math: Object.assign(Object.create(Math), { random: options.random ?? seededRandom(options.seed ?? 17) }),
    Date: class extends Date { static now() { return now; } },
    setInterval: callback => { intervals.set(++intervalCount, callback); return intervalCount; },
    clearInterval: id => intervals.delete(id),
    document,
    window: { addEventListener(type, callback) { windowEvents[type] = callback; } },
    localStorage: {
      getItem(key) { if (options.noStorage) throw Error("Storage blocked"); return storage.get(key) ?? null; },
      setItem(key, value) { if (options.noStorage) throw Error("Storage blocked"); storage.set(key, value); }
    }
  });
  const program = source.replace(/\ninit\(\);\s*$/, `\n${options.beforeInit ?? ""}\ninit();`);
  vm.runInContext(program, context, { filename: "script.js" });
  const run = text => vm.runInContext(text, context);
  const get = id => { const element = document.getElementById(id); assert.ok(element, `Missing element ${id}`); return element; };
  const key = (value, options = {}) => {
    let prevented = false;
    const event = { key: value, target: document.activeElement, preventDefault() { prevented = true; }, ...options };
    (document.events.keydown ?? []).forEach(callback => callback(event));
    if (!prevented && !options.repeat && ["Enter", " "].includes(value) && event.target.tagName === "BUTTON") event.target.click();
  };
  const answer = index => { get("answer-grid").children[index].click(); get("submit-button").click(); };
  return {
    run, get, key, answer, storage, document, intervals,
    advance: milliseconds => { now += milliseconds; },
    event: type => (document.events[type] ?? []).forEach(callback => callback({})),
    windowEvent: type => windowEvents[type]?.()
  };
}

const checks = [];
function check(name, callback) {
  try { callback(); checks.push(name); }
  catch (error) { console.error(`FAILED: ${name}`); throw error; }
}

// Independent answer-position reference, reviewed alongside each explanation.
const REFERENCE = {
  browser: 0, "html-role": 3, "badge-deduction": 1, algorithm: 2, bug: 3, url: 0, "debug-first": 1, "triangle-seal": 2,
  heading: 2, link: 0, button: 3, "css-color": 1, "css-font": 1, "boolean-not": 3, "click-event": 2, "square-seal": 0,
  "grouped-math": 0, "class-style": 3, "robot-trace": 2, "circle-seal": 1, "both-conditions": 1, "text-number": 3, "double-plus-one": 0, "final-vault": 2,
  "se-meaning": 0, "se-requirement-feature": 2, "se-sdlc": 3, "se-planning": 1, "se-teamwork": 2, "se-documentation": 0, "se-version-history": 3, "se-flowchart": 1,
  "java-purpose": 2, "java-int": 3, "java-double": 0, "java-char": 1, "java-boolean": 2, "java-string": 1, "java-method-purpose": 0, "java-class-object": 3,
  "se-requirement-types": 1, "se-analysis": 2, "se-design": 0, "se-implementation": 3, "se-testing-purpose": 1, "se-maintenance": 2, "se-waterfall": 0, "se-boundary-testing": 3,
  "java-println": 1, "java-int-division": 3, "java-remainder": 0, "java-branch-after": 2, "java-for-total": 3, "java-while-countdown": 0, "java-array-index": 1, "java-semicolon": 2,
  "se-agile-feedback": 3, "se-regression": 0, "se-debug-vs-test": 1, "se-merge-conflict": 2, "se-measurable-requirement": 0, "se-accessibility-scenario": 3, "se-integration": 1, "se-priority": 2,
  "java-equals": 3, "java-method-return": 0, "java-object-state": 1, "java-filtered-total": 2, "java-while-even": 3, "java-value-copy": 0, "java-last-element": 1, "java-array-update": 2
};

function play(game, choose = (_, correct) => correct, count = 24) {
  game.get("start-button").click();
  for (let index = 0; index < count; index++) {
    game.advance(2000);
    game.answer(choose(index, game.run("currentQuestion().correct")));
    if (index < count - 1) game.get("next-button").click();
  }
}

check("72 unique bank questions, concept keys, metadata, categories, and reviewed answers", () => {
  const game = boot();
  assert.equal(game.run("state.phase"), "ready", game.get("feedback").textContent);
  const levels = JSON.parse(game.run("JSON.stringify(LEVELS)"));
  const questions = levels.flatMap(level => level.questions);
  assert.deepEqual(levels.map(level => level.questions.length), [24, 24, 24]);
  for (const field of ["id", "concept", "prompt"]) assert.equal(new Set(questions.map(question => question[field])).size, 72);
  const counts = {};
  const positions = [0, 0, 0, 0];
  questions.forEach(question => {
    assert.equal(question.choices.length, 4, question.id);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.correct, REFERENCE[question.id], question.id);
    for (const field of ["prompt", "category", "hint", "explanation", "concept"]) assert.ok(question[field]?.trim(), `${question.id}: ${field}`);
    assert.ok(!question.hint.toLowerCase().includes(question.choices[question.correct].toLowerCase()), `${question.id}: hint states answer`);
    counts[question.category] = (counts[question.category] ?? 0) + 1;
    positions[question.correct]++;
  });
  assert.deepEqual(counts, { "Web Fundamentals": 3, Logic: 5, "Software Engineering": 27, "HTML/CSS": 6, JavaScript: 7, Java: 24 });
  assert.deepEqual(positions, [18, 18, 18, 18]);
  assert.equal(Object.keys(REFERENCE).length, 72);
});

check("Fisher–Yates uses shrinking bounds and never mutates its input", () => {
  const game = boot();
  assert.equal(game.run('JSON.stringify(shuffle([1,2,3,4], () => 0))'), "[2,3,4,1]");
  assert.equal(game.run('JSON.stringify(shuffle([1,2,3,4], () => 0.999999))'), "[1,2,3,4]");
  assert.equal(game.run('(() => { const a=[1,2,3,4]; let calls=0; shuffle(a, () => { calls++; return 0; }); return JSON.stringify({a,calls}); })()'), '{"a":[1,2,3,4],"calls":3}');
});

check("500 shuffled plans have unique IDs/concepts, enough questions, balanced subjects, and all clues", () => {
  const game = boot();
  const bankBefore = game.run("JSON.stringify(LEVELS)");
  const signatures = new Set();
  for (let trial = 0; trial < 500; trial++) {
    const plan = JSON.parse(game.run("JSON.stringify(buildSessionPlan())"));
    assert.equal(plan.length, 24);
    assert.equal(new Set(plan.map(question => question.id)).size, 24);
    assert.equal(new Set(plan.map(question => question.concept)).size, 24);
    assert.equal(plan.at(-1).final, true);
    assert.equal(plan.filter(question => question.final).length, 1);
    assert.equal(plan.filter(question => question.clue).length, 3);
    for (let index = 1; index < plan.length; index++) assert.notEqual(plan[index].category, plan[index - 1].category);
    for (let level = 0; level < 3; level++) {
      const section = plan.slice(level * 8, level * 8 + 8);
      assert.ok(section.every(question => question.difficulty === level + 1));
      assert.ok(section.filter(question => question.category === "Software Engineering").length >= 2);
      assert.ok(section.filter(question => question.category === "Java").length >= 2);
    }
    assert.equal(plan.reduce((sum, question) => sum + question.points, 0), 3700);
    signatures.add(plan.map(question => question.id).join(","));
  }
  assert.ok(signatures.size > 490);
  assert.equal(game.run("JSON.stringify(LEVELS)"), bankBefore);
});

check("All 288 bank question/option outcomes are exercised in real shuffled runs", () => {
  const covered = new Set();
  for (let seed = 1; seed <= 120 && covered.size < 288; seed++) {
    for (let option = 0; option < 4; option++) {
      const game = boot({ seed });
      game.get("start-button").click();
      let earned = 0;
      const seen = new Set();
      for (let index = 0; index < 24; index++) {
        const id = game.run("currentQuestion().id");
        assert.ok(!seen.has(id));
        seen.add(id);
        assert.equal(game.run("state.usedQuestionIds.size"), index + 1);
        assert.equal(game.run("state.usedQuestionIds.has(currentQuestion().id)"), true);
        const cards = game.get("answer-grid").children;
        assert.equal(cards.length, 4);
        assert.equal(game.get("feedback").hidden, true);
        assert.equal(game.get("hint-text").textContent, "");
        assert.ok(cards.every(card => !card.classList.contains("correct") && !card.getAttribute("aria-label").includes("correct answer")));
        const correct = game.run("currentQuestion().correct");
        const points = game.run("currentQuestion().points");
        game.answer(option);
        covered.add(`${id}:${option}`);
        earned += option === correct ? points : 0;
        assert.equal(game.run("score()"), earned);
        assert.ok(game.get("feedback").textContent.includes(game.run("currentQuestion().explanation")));
        assert.equal(cards.filter(card => card.classList.contains("correct")).length, 1);
        assert.ok(cards.every(card => card.disabled));
        game.run("submitAnswer(); selectAnswer(0); useHint()");
        assert.equal(game.run("score()"), earned);
        assert.equal(game.run("state.responses.length"), index + 1);
        if (index < 23) game.get("next-button").click();
      }
      assert.equal(game.run("state.usedQuestionIds.size"), 24);
      assert.equal(game.run("state.phase"), option === 2 ? "won" : "lost");
    }
  }
  assert.equal(covered.size, 288, "Every bank question must be reached with all four options");
});

check("Used IDs survive levels; restart creates fresh tracking and a new shuffle", () => {
  const game = boot();
  const firstPlan = game.run('state.sessionQuestions.map(question => question.id).join(",")');
  const sessionId = game.run("state.sessionId");
  game.run("globalThis.originalSet = state.usedQuestionIds");
  play(game, (_, correct) => correct, 8);
  assert.equal(game.run("state.usedQuestionIds.size"), 8);
  game.get("next-button").click();
  assert.equal(game.run("levelIndex()"), 1);
  assert.equal(game.run("state.usedQuestionIds === originalSet"), true);
  assert.equal(game.run("state.usedQuestionIds.size"), 9);
  game.get("restart-button").click();
  game.get("confirm-restart").click();
  assert.ok(game.run("state.sessionId") > sessionId);
  assert.equal(game.run("state.usedQuestionIds === originalSet"), false);
  assert.equal(game.run("state.usedQuestionIds.size"), 1, "The ready screen already shows the new first question");
  assert.equal(game.run("state.responses.length"), 0);
  assert.equal(game.run("state.hintsUsed"), 0);
  assert.notEqual(game.run('state.sessionQuestions.map(question => question.id).join(",")'), firstPlan);
});

check("Exhaustion, excluded IDs, duplicate IDs/concepts, and malformed choices stop safely", () => {
  for (const beforeInit of [
    'LEVELS[1].questions = LEVELS[1].questions.filter(q => q.category !== "Java")',
    'LEVELS[0].questions = LEVELS[0].questions.filter(q => q.clue || q.final || q.id === "java-int" || q.id === "java-char" || q.id === "se-meaning" || q.id === "se-planning")',
    'LEVELS[2].questions.push({...LEVELS[0].questions[0], difficulty:3, points:200})',
    'LEVELS[0].questions[1].concept = LEVELS[0].questions[0].concept',
    'LEVELS[0].questions[0].choices = ["Same","Same","Same","Same"]'
  ]) {
    const game = boot({ beforeInit });
    assert.equal(game.run("state.phase"), "error");
    assert.equal(game.get("start-button").disabled, true);
    assert.equal(game.get("feedback").hidden, false);
    assert.ok(game.get("feedback").textContent.length > 20);
    assert.equal(game.get("answer-grid").children.length, 0);
    assert.equal(game.intervals.size, 0);
  }
  const game = boot();
  const excluded = "java-int";
  assert.equal(game.run(`buildSessionPlan(LEVELS, Math.random, new Set(["${excluded}"])).some(q => q.id === "${excluded}")`), false);
  assert.throws(() => game.run('buildSessionPlan(LEVELS, Math.random, new Set(QUESTIONS.map(q => q.id)))'), /unused/);
});

check("Last-minute repeated ID or concept is blocked before it reaches the page", () => {
  for (const mode of ["id", "concept"]) {
    const game = boot();
    game.get("start-button").click();
    game.answer(game.run("currentQuestion().correct"));
    if (mode === "id") game.run("state.sessionQuestions[1] = state.sessionQuestions[0]");
    else game.run('state.sessionQuestions[1] = {...state.sessionQuestions[1], concept: currentQuestion().concept}');
    game.get("next-button").click();
    assert.equal(game.run("state.phase"), "error");
    assert.equal(game.run("state.usedQuestionIds.size"), 1);
    assert.equal(game.run("state.responses.length"), 1);
    assert.equal(game.get("answer-grid").children.length, 0);
    assert.match(game.get("feedback").textContent, /repeated question was blocked/);
    assert.equal(game.intervals.size, 0);
  }
});

check("JavaScript outputs and click-event behavior match the reviewed answers", () => {
  const game = boot();
  const snippets = JSON.parse(game.run('JSON.stringify(QUESTIONS.filter(q => q.filename?.endsWith(".js")))'));
  assert.equal(snippets.length, 7);
  for (const question of snippets) {
    const output = [];
    let listener;
    vm.runInNewContext(question.code, {
      console: { log: value => output.push(String(value)) },
      button: { addEventListener(type, callback) { assert.equal(type, "click"); listener = callback; } }
    });
    if (question.id === "click-event") {
      assert.deepEqual(output, []);
      listener(); listener();
      assert.deepEqual(output, ["Hello", "Hello"]);
    } else assert.deepEqual(output, [question.choices[question.correct]], question.id);
  }
});

check("Scoring, hints, full-score victory, clue order, and the final explanation are intact", () => {
  const game = boot();
  game.get("start-button").click();
  for (let index = 0; index < 24; index++) {
    assert.equal(game.run("levelIndex()"), Math.floor(index / 8));
    if (index === 23) assert.equal(game.run("state.clues.size"), 3);
    game.advance(1000);
    game.answer(game.run("currentQuestion().correct"));
    if (index < 23) game.get("next-button").click();
  }
  assert.equal(game.run("state.phase"), "won");
  assert.equal(game.run("score()"), 3700);
  assert.equal(game.run("state.elapsedMs"), 24000);
  assert.equal(game.get("progress-label").textContent, "24 / 24");
  assert.equal(game.intervals.size, 0);
  game.get("next-button").click();
  assert.equal(game.get("result-dialog").open, true);
  assert.match(game.get("vault-explanation-text").textContent, /548/);
  assert.equal(game.get("result-time").textContent, "00:24.000");
  assert.equal(game.run('["square","circle","triangle"].map(shape => state.clues.get(shape).digit).join("")'), "548");
  const hints = boot();
  hints.get("start-button").click();
  for (let i = 0; i < 3; i++) {
    hints.get("hint-button").click();
    hints.run("useHint()");
    assert.equal(hints.run("state.hintsUsed"), i + 1);
    hints.answer(hints.run("currentQuestion().correct"));
    assert.equal(hints.run("score()"), (i + 1) * 25);
    hints.get("next-button").click();
  }
  hints.run("useHint()");
  assert.equal(hints.run("state.hintsUsed"), 3);
  assert.equal(hints.get("hint-button").disabled, true);
});

check("Wrong answers progress, clues remain recoverable, and a wrong final key loses", () => {
  const game = boot();
  play(game, (_, correct) => (correct + 1) % 4);
  assert.equal(game.run("state.phase"), "lost");
  assert.equal(game.run("score()"), 0);
  assert.equal(game.run("state.clues.size"), 3);
  assert.equal(game.storage.size, 0);
  game.get("next-button").click();
  assert.equal(game.get("vault-explanation").hidden, false);
});

check("Keyboard selection, submission, dialog isolation, and restart still work", () => {
  const game = boot();
  game.get("start-button").click();
  for (const [key, index] of [["A",0],["b",1],["C",2],["d",3],["1",0],["2",1],["3",2],["4",3]]) {
    game.key(key);
    assert.equal(game.run("state.selected"), index);
  }
  game.key("ArrowRight");
  assert.equal(game.run("state.selected"), 0);
  game.key("ArrowLeft");
  assert.equal(game.run("state.selected"), 3);
  game.key("a", { repeat: true });
  assert.equal(game.run("state.selected"), 3);
  game.get("guide-button").click();
  game.key("a");
  assert.equal(game.run("state.selected"), 3);
  game.document.querySelectorAll("[data-close]").find(button => button.dataset.close === "guide-dialog").click();
  const correct = game.run("currentQuestion().correct");
  game.key(String(correct + 1)); game.key("Enter");
  assert.equal(game.run("score()"), 100);
  game.key("Enter");
  assert.equal(game.run("state.index"), 1);
  game.key("Enter");
  assert.equal(game.run("state.responses.length"), 1);
  game.get("restart-button").click(); game.get("confirm-restart").click();
  assert.equal(game.run("state.phase"), "ready");
  assert.equal(game.intervals.size, 0);
});

check("Timer expiry cannot be bypassed by answer, hint, selection, or transition events", () => {
  for (const action of ["submitAnswer()", "useHint()", "nextQuestion()", "selectAnswer(0)"]) {
    const game = boot();
    game.get("start-button").click();
    game.run("selectAnswer(0)");
    if (action === "nextQuestion()") game.run("submitAnswer()");
    const points = game.run("score()");
    game.advance(1_200_000); game.run(action);
    assert.equal(game.run("state.phase"), "lost");
    assert.equal(game.run("score()"), points);
    assert.equal(game.get("timer").textContent, "00:00");
    assert.equal(game.get("result-dialog").open, true);
    assert.equal(game.get("vault-explanation").hidden, true);
  }
  const game = boot();
  game.get("start-button").click(); game.get("guide-button").click();
  game.advance(1_200_001); game.event("visibilitychange");
  assert.equal(game.run("state.phase"), "lost");
  assert.equal(game.get("guide-dialog").open, false);
});

check("Personal best, completion-time ties, replay, and storage failures are intact", () => {
  const game = boot();
  play(game);
  assert.deepEqual(JSON.parse(game.storage.get("code-breaker.beginner.best.v2")), { score:3700, elapsedMs:48000 });
  game.advance(200000); game.get("next-button").click();
  assert.equal(game.get("result-time").textContent, "00:48.000");
  game.get("review-mission").click(); game.get("next-button").click(); game.get("play-again").click();
  assert.equal(game.run("state.phase"), "ready");
  assert.equal(game.get("vault-explanation-text").textContent, "");
  assert.equal(game.get("best-score").textContent, "3,700 PTS");
  assert.equal(game.run("isBetter({score:100,elapsedMs:999},{score:100,elapsedMs:1000})"), true);
  assert.equal(game.run("isBetter({score:99,elapsedMs:1},{score:100,elapsedMs:1000})"), false);
  const blocked = boot({ noStorage:true });
  play(blocked); blocked.get("next-button").click();
  assert.match(blocked.get("record-message").textContent, /Storage is unavailable/);
  for (const value of ["broken", '{"score":99999,"elapsedMs":1}', '{"score":-1,"elapsedMs":1}']) {
    assert.equal(boot({ storage:new Map([["code-breaker.beginner.best.v2",value]]) }).run("best"), null);
  }
});

check("HTML references and the original responsive/reduced-motion design remain valid", () => {
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of source.matchAll(/\$\("([^"]+)"\)/g)) assert.ok(ids.includes(match[1]), match[1]);
  assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width: 680px/);
});

console.log(`${checks.length} checks passed:\n${checks.map(name => `  ✓ ${name}`).join("\n")}`);
