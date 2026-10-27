/* Run with: node verification/game.test.cjs
 * Dependency-free integration tests of the actual game script against a small
 * DOM fixture. This checks behavior, not browser layout or rendering.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const source = ["questions.js", "i18n.js", "script.js"].map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
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
  get textContent() { return this._text + this._html.replace(/<[^>]*>/g, "") + this.children.map(child => child.textContent).join(""); }
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
    if (/^\[data-[\w-]+\]$/.test(selector)) return this.getAttribute(selector.slice(1, -1)) !== null;
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
    if (token.startsWith("</")) {
      assert.equal(stack.at(-1).tagName, token.slice(2, -1).toUpperCase(), 'HTML tags must be correctly nested');
      stack.pop(); continue;
    }
    if (token.startsWith("<")) {
      const tag = token.match(/^<([\w-]+)/)[1];
      const element = document.createElement(tag);
      for (const match of token.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)) element.setAttribute(match[1], match[2] ?? "");
      stack.at(-1).append(element);
      if (tag === "body") document.body = element;
      if (tag === "html") document.documentElement = element;
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


// Independent answer positions, checked against the English and Arabic wording.
const REFERENCE = {
  browser: 'a', 'html-role': 'c', 'css-role': 'b', 'variable-purpose': 'd', bug: 'a',
  'se-planning': 'c', 'se-teamwork': 'b', 'java-purpose': 'd', 'java-println': 'a', 'java-int': 'c',
  url: 'b', input: 'd', algorithm: 'a', 'save-file': 'c', comment: 'b', 'triangle-seal': 'd',
  heading: 'b', link: 'd', 'css-color': 'a', 'javascript-role': 'c', 'se-testing': 'b',
  'se-documentation': 'd', 'se-backup': 'a', 'java-string': 'c', 'java-boolean': 'b',
  'java-semicolon': 'd', loop: 'a', condition: 'c', 'sequence-order': 'b', output: 'd', 'css-font': 'a', 'square-seal': 'c',
  'html-image': 'd', 'html-list': 'a', 'css-background': 'c', 'js-console': 'b', 'se-maintenance': 'd',
  'se-feedback': 'a', 'se-accessibility': 'c', 'java-char': 'b', 'java-double': 'd', 'java-method': 'a',
  'js-array': 'c', 'logic-and': 'b', 'logic-compare': 'd', password: 'a', 'circle-seal': 'c', 'final-vault': 'c'
};
function play(game, choose = (_, correct) => correct, count = 24) {
  game.get('start-button').click();
  for (let index = 0; index < count; index++) {
    game.advance(2000);
    game.answer(choose(index, game.run('correctIndex(currentQuestion())')));
    if (index < count - 1) game.get('next-button').click();
  }
}
function changeLanguage(game, language, selector = game.document.querySelectorAll('[data-language-picker]')[0]) {
  selector.value = language;
  selector.events.change.forEach(callback => callback({ target: selector }));
}
function snapshot(game) {
  return game.run('JSON.stringify(state, (_, value) => value instanceof Set ? [...value] : value instanceof Map ? [...value.entries()] : value)');
}

check('48 beginner questions have complete translations, unique IDs/concepts, and shared correct answers', () => {
  const game = boot();
  assert.equal(game.run('state.phase'), 'ready', game.get('feedback').textContent);
  const levels = JSON.parse(game.run('JSON.stringify(LEVELS)'));
  const questions = levels.flatMap(level => level.questions);
  assert.deepEqual(levels.map(level => level.questions.length), [16, 16, 16]);
  for (const field of ['id', 'concept']) assert.equal(new Set(questions.map(q => q[field])).size, 48);
  assert.equal(Object.keys(REFERENCE).length, 48);
  for (const q of questions) {
    assert.equal(q.correctAnswerId, REFERENCE[q.id], q.id);
    assert.equal(q.choices.length, 4);
    for (const lang of ['en', 'ar']) {
      for (const value of [q.prompt[lang], q.hint[lang], q.explanation[lang], ...q.choices.map(c => c.text[lang])]) assert.ok(value.trim(), q.id);
      assert.equal(new Set(q.choices.map(c => c.text[lang])).size, 4);
      assert.ok(q.choices.find(c => c.id === REFERENCE[q.id]).text[lang]);
    }
    assert.ok(q.prompt.en.split(/\s+/).length <= 28, q.id + ': question too long');
    assert.ok(!/for\s*\(|while\s*\(|&&|\bclass\s+\w+\s*\{/.test(q.code ?? ''), q.id);
  }
});

check('Every static interface/ARIA key exists in both languages with matching placeholders', () => {
  const game = boot();
  const dictionary = JSON.parse(game.run('JSON.stringify(UI)'));
  for (const [key, values] of Object.entries(dictionary)) {
    assert.equal(values.length, 2, key);
    assert.ok(values.every(value => typeof value === 'string' && value.trim()), key);
    assert.deepEqual(values[0].match(/\{\w+\}/g)?.sort() ?? [], values[1].match(/\{\w+\}/g)?.sort() ?? [], key);
  }
  for (const match of html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)) assert.ok(dictionary[match[1]], match[1]);
  const pickers = game.document.querySelectorAll('[data-language-picker]');
  assert.equal(pickers.length, 4, 'Header and all three dialogs have a language selector');
  changeLanguage(game, 'ar');
  assert.equal(game.document.documentElement.lang, 'ar');
  assert.equal(game.document.documentElement.dir, 'rtl');
  for (const element of game.document.querySelectorAll('[data-i18n]')) assert.equal(element.innerHTML, dictionary[element.dataset.i18n][1]);
  for (const element of game.document.querySelectorAll('[data-i18n-aria-label]')) assert.equal(element.getAttribute('aria-label'), dictionary[element.dataset.i18nAriaLabel][1]);
  assert.ok(pickers.every(picker => picker.value === 'ar'));
  assert.ok(game.document.title.includes('فاتح الشفرة'));
  game.run('setLanguage("bad")');
  assert.equal(game.run('language'), 'ar');
});

check('500 fresh shuffled plans are unique, immutable, varied, and keep the final vault after three seals', () => {
  const game = boot();
  const before = game.run('JSON.stringify(LEVELS)');
  const signatures = new Set();
  for (let trial = 0; trial < 500; trial++) {
    const plan = JSON.parse(game.run('JSON.stringify(buildSessionPlan())'));
    assert.equal(plan.length, 24);
    assert.equal(new Set(plan.map(q => q.id)).size, 24);
    assert.equal(new Set(plan.map(q => q.concept)).size, 24);
    assert.equal(plan.at(-1).final, true);
    assert.equal(plan.filter(q => q.final).length, 1);
    assert.equal(plan.filter(q => q.clue).length, 3);
    for (let i = 1; i < 24; i++) assert.notEqual(plan[i].category, plan[i - 1].category);
    for (let level = 0; level < 3; level++) {
      const section = plan.slice(level * 8, level * 8 + 8);
      assert.ok(section.every(q => q.difficulty === level + 1));
      for (const category of ['Java', 'Software Engineering']) assert.ok(section.filter(q => q.category === category).length >= 2);
    }
    assert.equal(plan.reduce((sum, q) => sum + q.points, 0), 3700);
    signatures.add(plan.map(q => q.id).join(','));
  }
  assert.ok(signatures.size > 490);
  assert.equal(game.run('JSON.stringify(LEVELS)'), before);
  assert.equal(game.run('JSON.stringify(shuffle([1,2,3,4], () => 0))'), '[2,3,4,1]');
});

check('All 384 question/choice/language outcomes work in real shuffled games', () => {
  const covered = new Set();
  for (let seed = 1; seed <= 100 && covered.size < 384; seed++) {
    for (const language of ['en', 'ar']) for (let option = 0; option < 4; option++) {
      const game = boot({ seed });
      changeLanguage(game, language);
      game.get('start-button').click();
      let earned = 0;
      const seen = new Set();
      for (let index = 0; index < 24; index++) {
        const q = JSON.parse(game.run('JSON.stringify(currentQuestion())'));
        assert.ok(!seen.has(q.id)); seen.add(q.id);
        assert.equal(game.run('state.usedQuestionIds.size'), index + 1);
        assert.equal(game.get('question-title').textContent, q.prompt[language]);
        assert.equal(game.get('feedback').hidden, true);
        const cards = game.get('answer-grid').children;
        assert.equal(cards.length, 4);
        cards.forEach((card, i) => {
          assert.equal(card.querySelector('.answer-text').textContent, q.choices[i].text[language]);
          assert.equal(card.classList.contains('correct'), false);
        });
        game.answer(option);
        covered.add(q.id + ':' + option + ':' + language);
        if (q.choices[option].id === REFERENCE[q.id]) earned += q.points;
        assert.equal(game.run('score()'), earned);
        assert.ok(game.get('feedback').textContent.includes(q.explanation[language]));
        assert.equal(cards.filter(card => card.classList.contains('correct')).length, 1);
        assert.ok(cards.every(card => card.disabled));
        game.run('submitAnswer(); selectAnswer(0); useHint()');
        assert.equal(game.run('score()'), earned);
        assert.equal(game.run('state.responses.length'), index + 1);
        if (index < 23) game.get('next-button').click();
      }
      assert.equal(game.run('state.phase'), option === 2 ? 'won' : 'lost');
    }
  }
  assert.equal(covered.size, 384, 'Every answer for every question is exercised in both languages');
});

check('Language switching preserves ready, selected, hinted, and submitted state exactly', () => {
  const game = boot();
  let before = snapshot(game);
  changeLanguage(game, 'ar'); assert.equal(snapshot(game), before);
  game.get('start-button').click(); game.advance(4300); game.run('tick()');
  game.get('answer-grid').children[2].click();
  game.get('hint-button').click();
  const deadline = game.run('state.deadline');
  before = snapshot(game);
  for (const lang of ['en', 'ar', 'en', 'ar']) {
    changeLanguage(game, lang);
    assert.equal(snapshot(game), before);
    assert.equal(game.get('answer-grid').children[2].getAttribute('aria-pressed'), 'true');
    assert.equal(game.get('hint-panel').hidden, false);
    assert.ok(game.get('hint-text').textContent.startsWith(game.run('localize(currentQuestion().hint)')));
    assert.equal(game.get('hint-button').disabled, true);
    assert.equal(game.get('submit-button').disabled, false);
    assert.equal(game.intervals.size, 1);
  }
  game.get('submit-button').click(); before = snapshot(game);
  changeLanguage(game, 'en'); assert.equal(snapshot(game), before);
  assert.equal(game.get('feedback').hidden, false);
  assert.ok(game.get('feedback').textContent.includes(game.run('currentQuestion().explanation.en')));
  assert.equal(game.get('answer-grid').children.filter(card => card.classList.contains('correct')).length, 1);
  assert.ok(game.get('answer-grid').children.every(card => card.disabled));
  assert.equal(game.get('submit-button').hidden, true);
  assert.equal(game.get('next-button').hidden, false);
  game.advance(10000); game.run('tick()');
  assert.equal(game.run('state.deadline'), deadline);
  assert.equal(game.run('state.remaining'), 1186);
});

check('All 24 transitions, seal digits, hints, score, and victory survive alternating languages', () => {
  const game = boot(); game.get('start-button').click();
  for (let index = 0; index < 24; index++) {
    const lang = index % 2 ? 'ar' : 'en'; changeLanguage(game, lang);
    if (index < 3) game.get('hint-button').click();
    game.advance(1000); game.answer(game.run('correctIndex(currentQuestion())'));
    const before = snapshot(game); changeLanguage(game, lang === 'ar' ? 'en' : 'ar');
    assert.equal(snapshot(game), before);
    assert.equal(game.run('levelIndex()'), Math.floor(index / 8));
    if (index < 23) game.get('next-button').click();
  }
  assert.equal(game.run('state.phase'), 'won');
  assert.equal(game.run('score()'), 3475);
  assert.equal(game.run('state.hintsUsed'), 3);
  assert.equal(game.run('state.usedQuestionIds.size'), 24);
  assert.equal(game.run('state.elapsedMs'), 24000);
  assert.equal(game.get('progress-label').textContent, '24 / 24');
  assert.equal(game.intervals.size, 0);
  assert.equal(game.run('["square","circle","triangle"].map(shape => state.clues.get(shape).digit).join("")'), '548');
  game.get('next-button').click();
  const before = snapshot(game);
  changeLanguage(game, 'ar', game.get('result-dialog').querySelector('[data-language-picker]'));
  assert.equal(snapshot(game), before);
  assert.equal(game.get('result-dialog').open, true);
  assert.equal(game.get('result-description').textContent, game.run('t("reason.won")'));
  assert.match(game.get('vault-explanation-text').textContent, /548/);
  assert.equal(game.get('result-time').textContent, '00:24.000');
  game.get('review-mission').click();
  changeLanguage(game, 'en'); assert.equal(game.get('result-dialog').open, false);
});

check('Wrong answers, final failure, and translated result screen remain usable', () => {
  const game = boot(); changeLanguage(game, 'ar');
  play(game, (_, correct) => (correct + 1) % 4);
  assert.equal(game.run('state.phase'), 'lost'); assert.equal(game.run('score()'), 0);
  assert.equal(game.run('state.clues.size'), 3); assert.equal(game.storage.size, 0);
  game.get('next-button').click();
  assert.equal(game.get('vault-explanation').hidden, false);
  assert.equal(game.get('result-description').textContent, game.run('t("reason.wrong")'));
  changeLanguage(game, 'en');
  assert.equal(game.get('result-description').textContent, game.run('t("reason.wrong")'));
});

check('Language changes inside guide/restart dialogs keep dialogs open and timer running', () => {
  const game = boot(); game.get('start-button').click();
  for (const id of ['guide', 'restart']) {
    game.get(id + '-button').click();
    const dialog = game.get(id + '-dialog');
    const before = snapshot(game);
    changeLanguage(game, game.run('language') === 'en' ? 'ar' : 'en', dialog.querySelector('[data-language-picker]'));
    assert.equal(snapshot(game), before); assert.equal(dialog.open, true);
    game.advance(5000); game.run('tick()');
    assert.equal(game.run('state.phase'), 'playing'); assert.equal(game.intervals.size, 1);
    dialog.close();
  }
  assert.equal(game.run('state.remaining'), 1190);
});

check('Keyboard, native select isolation, dialog isolation, restart, and replay work', () => {
  const game = boot(); game.get('start-button').click();
  for (const [key, index] of [['A',0],['b',1],['C',2],['d',3],['1',0],['2',1],['3',2],['4',3]]) { game.key(key); assert.equal(game.run('state.selected'), index); }
  game.key('ArrowRight'); assert.equal(game.run('state.selected'), 0);
  game.key('ArrowLeft'); assert.equal(game.run('state.selected'), 3);
  const picker = game.document.querySelector('[data-language-picker]'); picker.focus(); game.key('1');
  assert.equal(game.run('state.selected'), 3);
  game.get('guide-button').click(); game.key('a'); assert.equal(game.run('state.selected'), 3);
  game.get('guide-dialog').close();
  game.get('answer-grid').children[game.run('correctIndex(currentQuestion())')].focus();
  game.key(String(game.run('correctIndex(currentQuestion())') + 1)); game.key('Enter');
  assert.equal(game.run('score()'), 100); game.key('Enter'); assert.equal(game.run('state.index'), 1);
  changeLanguage(game, 'ar');
  game.get('restart-button').click(); game.get('confirm-restart').click();
  assert.equal(game.run('state.phase'), 'ready'); assert.equal(game.run('language'), 'ar');
  assert.equal(game.run('state.usedQuestionIds.size'), 1); assert.equal(game.run('state.hintsUsed'), 0); assert.equal(game.intervals.size, 0);
  play(game); game.get('next-button').click(); game.get('play-again').click();
  assert.equal(game.run('state.phase'), 'ready'); assert.equal(game.get('result-dialog').open, false);
});

check('Timer expiry cannot be bypassed by events or a language switch', () => {
  for (const action of ['submitAnswer()', 'useHint()', 'nextQuestion()', 'selectAnswer(0)', 'setLanguage("ar"); tick()']) {
    const game = boot(); game.get('start-button').click(); game.run('selectAnswer(0)');
    if (action === 'nextQuestion()') game.run('submitAnswer()');
    const points = game.run('score()');
    game.advance(1_200_000); game.run(action);
    assert.equal(game.run('state.phase'), 'lost'); assert.equal(game.run('score()'), points);
    assert.equal(game.get('timer').textContent, '00:00'); assert.equal(game.get('result-dialog').open, true);
    assert.equal(game.get('vault-explanation').hidden, true);
    changeLanguage(game, 'ar');
    assert.equal(game.get('result-description').textContent, game.run('t("reason.timeout")'));
  }
  const game = boot(); game.get('start-button').click(); game.get('guide-button').click();
  game.advance(1_200_001); game.event('visibilitychange');
  assert.equal(game.run('state.phase'), 'lost'); assert.equal(game.get('guide-dialog').open, false);
});

check('Exhausted or repeated questions stop safely with bilingual completion and no repeats', () => {
  for (const mutation of ['state.sessionQuestions.length = 1', 'state.sessionQuestions[1] = state.sessionQuestions[0]']) {
    const game = boot(); game.get('start-button').click(); game.answer(game.run('correctIndex(currentQuestion())'));
    game.run(mutation); game.get('next-button').click();
    assert.equal(game.run('state.phase'), 'complete'); assert.equal(game.run('state.usedQuestionIds.size'), 1);
    assert.equal(game.get('answer-grid').children.length, 0); assert.equal(game.intervals.size, 0);
    assert.match(game.get('feedback').textContent, /No unused questions/);
    changeLanguage(game, 'ar'); assert.equal(game.get('feedback').textContent, game.run('t("exhausted")'));
    game.run('startMission(); submitAnswer(); nextQuestion(); useHint()'); assert.equal(game.run('state.responses.length'), 1);
  }
  const game = boot();
  assert.throws(() => game.run('buildSessionPlan(LEVELS, Math.random, new Set(QUESTIONS.map(q => q.id)))'), /unused/);
  assert.equal(game.run('buildSessionPlan(LEVELS, Math.random, new Set(["java-int"])).some(q => q.id === "java-int")'), false);
});

check('Duplicate IDs/concepts, missing translations, malformed options, and bad answer IDs stop safely', () => {
  for (const beforeInit of [
    'LEVELS[0].questions[1].id = LEVELS[0].questions[0].id',
    'LEVELS[0].questions[1].concept = LEVELS[0].questions[0].concept',
    'delete LEVELS[0].questions[0].hint.ar',
    'LEVELS[0].questions[0].choices.pop()',
    'LEVELS[0].questions[0].correctAnswerId = "missing"',
    'LEVELS[0].questions[0].choices[1].text.ar = LEVELS[0].questions[0].choices[0].text.ar'
  ]) {
    const game = boot({ beforeInit }); assert.equal(game.run('state.phase'), 'error');
    assert.equal(game.get('start-button').disabled, true); assert.equal(game.get('feedback').hidden, false);
    assert.equal(game.get('answer-grid').children.length, 0); assert.equal(game.intervals.size, 0);
    changeLanguage(game, 'ar'); assert.equal(game.get('feedback').textContent, game.run('t("bankError")'));
  }
});

check('Personal best, time tie-breaks, full score, and unavailable storage work', () => {
  const game = boot(); play(game);
  assert.deepEqual(JSON.parse(game.storage.get('code-breaker.beginner.best.v2')), { score:3700, elapsedMs:48000 });
  game.advance(200000); game.get('next-button').click(); assert.equal(game.get('result-time').textContent, '00:48.000');
  assert.equal(game.get('best-score').textContent, '3,700 PTS');
  assert.equal(game.run('isBetter({score:100,elapsedMs:999},{score:100,elapsedMs:1000})'), true);
  assert.equal(game.run('isBetter({score:99,elapsedMs:1},{score:100,elapsedMs:1000})'), false);
  const blocked = boot({ noStorage:true }); play(blocked); blocked.get('next-button').click();
  assert.match(blocked.get('record-message').textContent, /Storage is unavailable/);
  changeLanguage(blocked, 'ar'); assert.equal(blocked.get('record-message').textContent, blocked.run('t("record.temporary")'));
  for (const value of ['broken', '{"score":99999,"elapsedMs":1}', '{"score":-1,"elapsedMs":1}']) assert.equal(boot({ storage:new Map([['code-breaker.beginner.best.v2',value]]) }).run('best'), null);
});

check('The simple JavaScript example prints the reviewed answer in both languages', () => {
  const game = boot();
  const snippets = JSON.parse(game.run('JSON.stringify(QUESTIONS.filter(q => q.filename?.endsWith(".js")))'));
  assert.equal(snippets.length, 1);
  for (const q of snippets) {
    const output = [];
    vm.runInNewContext(q.code, { console: { log(value) { output.push(String(value)); } } });
    const answer = q.choices.find(choice => choice.id === REFERENCE[q.id]);
    assert.deepEqual(output, [answer.text.en]);
    assert.deepEqual(output, [answer.text.ar]);
  }
});

check('HTML references, local-only scripts, responsive styles, and reduced motion remain valid', () => {
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of source.matchAll(/\$\(["']([^"']+)["']\)/g)) assert.ok(ids.includes(match[1]), match[1]);
  assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length);
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /max-width: 680px/); assert.match(css, /html\[dir="rtl"\]/);
  assert.ok(!/fetch\(|XMLHttpRequest|https?:\/\//.test(source), 'No external runtime translation or network dependency');
  for (const match of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(root, match[1])));
});

console.log(checks.length + ' checks passed:\n' + checks.map(name => '  ✓ ' + name).join('\n'));
