"use strict";

// Question data and interface translations load before the game controller.
const CONFIG = Object.freeze({ durationSeconds: 1200, hintLimit: 3, hintCost: 75, questionsPerLevel: 8, storageKey: "code-breaker.beginner.best.v2" });
const QUESTIONS = LEVELS.flatMap(level => level.questions);
const TOTAL_QUESTIONS = LEVELS.length * CONFIG.questionsPerLevel;
const CATEGORIES = ["Software Engineering", "Java", "HTML/CSS", "JavaScript", "Web Fundamentals", "Logic"];
const LETTERS = ["A", "B", "C", "D"];
const $ = id => document.getElementById(id);
let state;
let timerHandle = null;
let sessionSequence = 0;
let best = loadBest();
let recordMessage = "";

/* Fisher–Yates makes a new shuffled array; the question bank is never mutated. */
function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function validateQuestionBank(levels) {
  const ids = new Set(), concepts = new Set();
  const prompts = { en: new Set(), ar: new Set() };
  levels.forEach((level, index) => level.questions.forEach(question => {
    if (!question.id || ids.has(question.id)) throw new Error('Duplicate or missing question ID.');
    if (!question.concept || concepts.has(question.concept)) throw new Error('Duplicate or missing concept.');
    if (!CATEGORIES.includes(question.category)) throw new Error('Unknown category.');
    if (!Array.isArray(question.choices) || question.choices.length !== 4) throw new Error('Four choices required.');
    const choiceIds = question.choices.map(choice => choice.id);
    if (choiceIds.some(id => typeof id !== 'string' || !id) || new Set(choiceIds).size !== 4 || !choiceIds.includes(question.correctAnswerId)) throw new Error('Invalid shared answer ID.');
    for (const lang of ['en', 'ar']) {
      const texts = [question.prompt?.[lang], question.hint?.[lang], question.explanation?.[lang], ...question.choices.map(choice => choice.text?.[lang])];
      if (!texts.every(value => typeof value === 'string' && value.trim())) throw new Error('Missing bilingual text.');
      const normalized = question.prompt[lang].trim().toLowerCase();
      if (prompts[lang].has(normalized)) throw new Error('Duplicate question wording.');
      if (new Set(question.choices.map(choice => choice.text[lang].trim().toLowerCase())).size !== 4) throw new Error('Distinct choices required.');
      prompts[lang].add(normalized);
    }
    if (question.difficulty !== index + 1 || question.points !== (question.final ? 300 : 100 + index * 50)) throw new Error('Invalid difficulty or points.');
    if (question.final && index !== levels.length - 1) throw new Error('Final vault belongs in the last level.');
    ids.add(question.id); concepts.add(question.concept);
  }));
}

function mixCategories(questions, previousCategory, followingCategory, random) {
  const candidates = shuffle(questions, random);
  function arrange(remaining, previous) {
    if (!remaining.length) return [];
    for (let i = 0; i < remaining.length; i++) {
      const question = remaining[i];
      if (question.category === previous || (remaining.length === 1 && question.category === followingCategory)) continue;
      const rest = arrange(remaining.filter((_, index) => index !== i), question.category);
      if (rest) return [question, ...rest];
    }
    return null;
  }
  return arrange(candidates, previousCategory);
}

function buildSessionPlan(levels = LEVELS, random = Math.random, excludedIds = new Set()) {
  validateQuestionBank(levels);
  const reservedIds = new Set(excludedIds);
  const plan = [];
  const requiredSeals = ["triangle", "square", "circle"];
  levels.forEach((level, index) => {
    const pool = shuffle(level.questions.filter(question => !reservedIds.has(question.id)), random);
    const selected = [];
    const reserve = question => {
      if (!question || reservedIds.has(question.id)) throw new Error(`Level ${index + 1} has too few unused questions. No question will be repeated.`);
      reservedIds.add(question.id);
      selected.push(question);
    };
    const seals = pool.filter(question => question.clue?.shape === requiredSeals[index]);
    const finals = pool.filter(question => question.final);
    if (seals.length !== 1) throw new Error(`Level ${index + 1} needs one unused ${requiredSeals[index]} seal question.`);
    if (index === levels.length - 1 ? finals.length !== 1 : finals.length !== 0) throw new Error("Exactly one unused final vault question is required in the last level.");
    reserve(seals[0]);
    for (const category of ["Software Engineering", "Java"]) {
      const candidates = pool.filter(question => question.category === category && !reservedIds.has(question.id) && !question.final);
      if (candidates.length < 2) throw new Error(`Level ${index + 1} needs 2 unused ${category} questions; only ${candidates.length} available.`);
      candidates.slice(0, 2).forEach(reserve);
    }
    const final = finals[0];
    const regularCount = CONFIG.questionsPerLevel - (final ? 1 : 0);
    // Keep subject variety while allowing every non-reserved bank question to
    // be sampled. Always choosing the rarest subject would starve larger pools.
    while (selected.length < regularCount) {
      const available = pool.filter(question => !question.final && !reservedIds.has(question.id));
      if (!available.length) throw new Error(`Level ${index + 1} needs ${CONFIG.questionsPerLevel} unused questions; the bank is exhausted. No repeats were used.`);
      const count = category => selected.filter(question => question.category === category).length;
      const candidate = available.find(question => count(question.category) < 3);
      if (!candidate) throw new Error(`Level ${index + 1} needs more subject variety among its unused questions.`);
      reserve(candidate);
    }
    const ordered = mixCategories(selected, plan.at(-1)?.category, final?.category, random);
    if (!ordered) throw new Error(`Level ${index + 1} needs more subject variety to mix its unused questions.`);
    plan.push(...ordered);
    if (final) { reservedIds.add(final.id); plan.push(final); }
  });
  if (plan.length !== TOTAL_QUESTIONS || new Set(plan.map(question => question.id)).size !== plan.length) throw new Error("Unable to create a complete unique session. Check the question bank.");
  return plan;
}

function correctIndex(question) { return question.choices.findIndex(choice => choice.id === question.correctAnswerId); }
function currentQuestion() { return state.sessionQuestions[state.index]; }
function levelIndex() { return Math.floor(state.index / CONFIG.questionsPerLevel); }
function score() { return Math.max(0, state.earnedPoints - state.hintsUsed * CONFIG.hintCost); }
function clock(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function completionTime(milliseconds) { return `${clock(Math.floor(milliseconds / 1000))}.${String(Math.floor(milliseconds % 1000)).padStart(3, "0")}`; }
function isBetter(candidate, previous) { return !previous || candidate.score > previous.score || (candidate.score === previous.score && candidate.elapsedMs < previous.elapsedMs); }

function loadBest() {
  try {
    const value = JSON.parse(localStorage.getItem(CONFIG.storageKey));
    const maximumScore = 8 * 100 + 8 * 150 + 7 * 200 + 300;
    if (value && Number.isSafeInteger(value.score) && value.score >= 0 && value.score <= maximumScore && Number.isSafeInteger(value.elapsedMs) && value.elapsedMs >= 0 && value.elapsedMs < CONFIG.durationSeconds * 1000) return value;
  } catch { /* Storage may be disabled, unavailable on file URLs, or contain bad data. */ }
  return null;
}

function init() {
  clearInterval(timerHandle);
  timerHandle = null;
  state = {
    phase: "ready", index: 0, selected: null, responses: [], earnedPoints: 0,
    hintsUsed: 0, hinted: new Set(), clues: new Map(), logs: [],
    sessionId: ++sessionSequence, sessionQuestions: [], usedQuestionIds: new Set(), usedConcepts: new Set(),
    startedAt: null, deadline: null, remaining: CONFIG.durationSeconds, elapsedMs: 0
  };
  recordMessage = "";
  document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
  $("vault-explanation").hidden = true;
  $("vault-explanation-text").textContent = "";
  $("result-description").textContent = "";
  $("record-message").textContent = "";
  document.body.classList.remove("vault-open", "vault-locked");
  $("start-button").disabled = false;
  applyInterfaceLanguage();
  log("log.ready");
  try {
    state.sessionQuestions = buildSessionPlan(LEVELS, Math.random, state.usedQuestionIds);
    showQuestionAt(0);
  } catch (error) { questionManagementError(error.message); }
  updateDashboard();
}

// Every newly shown question passes this single global, session-wide guard.
function showQuestionAt(index, focus = false) {
  const question = state.sessionQuestions[index];
  if (!question || state.usedQuestionIds.has(question.id) || state.usedConcepts.has(question.concept)) {
    questionManagementError("No unused question remains. A repeated question was blocked.");
    return false;
  }
  state.usedQuestionIds.add(question.id);
  state.usedConcepts.add(question.concept);
  state.index = index;
  state.selected = null;
  renderQuestion(focus);
  return true;
}

function questionManagementError(message) {
  clearInterval(timerHandle);
  timerHandle = null;
  state.phase = /unused|exhausted/i.test(message) ? 'complete' : 'error';
  state.bankMessage = state.phase === 'complete' ? 'exhausted' : 'bankError';
  log('log.stopped');
  renderBankMessage();
  updateDashboard();
}

function renderBankMessage() {
  $('question-title').textContent = t(state.bankMessage + 'Title');
  $('question-category').textContent = t('phase.' + state.phase);
  $('question-code').textContent = '';
  $('code-panel').hidden = true;
  $('question-difficulty').textContent = '';
  $('question-points').textContent = '';
  $('answer-grid').replaceChildren();
  $('feedback').className = 'feedback error';
  $('feedback').textContent = t(state.bankMessage);
  $('feedback').hidden = false;
  $('hint-panel').hidden = true;
  $('hint-button').disabled = true;
  $('hint-button').textContent = t('hintButton');
  $('submit-button').disabled = true;
  $('next-button').hidden = true;
  $('start-banner').hidden = true;
  $('start-button').disabled = true;
  renderLevelHeading(); renderRoute(); renderClues();
}

function log(key, values = {}) {
  state.logs.unshift({ at: clock(CONFIG.durationSeconds - state.remaining), key, values });
  state.logs = state.logs.slice(0, 3);
  renderLogs();
}
function renderLogs() {
  $('activity-log').replaceChildren(...state.logs.map(entry => {
    const li = document.createElement('li');
    const time = document.createElement('time');
    time.dir = 'ltr';
    time.textContent = entry.at;
    const values = { ...entry.values };
    if (values.shape) values.seal = t(values.shape);
    if (values.levelIndex !== undefined) values.name = localize(LEVELS[values.levelIndex].name);
    li.append(time, document.createTextNode(t(entry.key, values)));
    return li;
  }));
}

function updateDashboard() {
  $('timer').textContent = clock(state.remaining);
  $('timer').setAttribute('aria-label', t('timerAria', { minutes: Math.floor(state.remaining / 60), seconds: state.remaining % 60 }));
  $('timer').closest('.stat').classList.toggle('urgent', state.remaining <= 120);
  $('timer-state').textContent = t('phase.' + state.phase);
  $('score').textContent = score().toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US');
  $('hints-left').textContent = CONFIG.hintLimit - state.hintsUsed;
  $('best-score').textContent = best ? best.score.toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US') + ' ' + t('pts') : '—';
  $('best-time').textContent = best ? t('bestTime', { time: completionTime(best.elapsedMs) }) : t('bestRule');
  $('progress-label').textContent = state.responses.length + ' / ' + TOTAL_QUESTIONS;
  $('progress-bar').setAttribute('aria-valuenow', state.responses.length);
  $('progress-fill').style.width = (state.responses.length / TOTAL_QUESTIONS * 100) + '%';
  $('vault-status').textContent = t('vault.' + (state.phase === 'playing' && currentQuestion()?.final ? 'final' : state.phase), { level: levelIndex() + 1 });
  $('vault-detail').textContent = t('detail.' + state.phase, { answered: state.responses.length, seals: state.clues.size });
}

function renderRoute() {
  $('level-list').replaceChildren(...LEVELS.map((level, index) => {
    const li = document.createElement('li');
    const complete = state.responses.length >= (index + 1) * CONFIG.questionsPerLevel;
    const active = index === levelIndex() && !complete;
    li.className = 'level-item ' + (complete ? 'completed' : active ? 'active' : 'locked');
    if (active) li.setAttribute('aria-current', 'step');
    const number = document.createElement('span'); number.className = 'level-number';
    number.textContent = complete ? '✓' : '0' + (index + 1);
    const detail = document.createElement('div');
    const name = document.createElement('h3'); name.textContent = localize(level.name);
    const route = document.createElement('p'); route.textContent = localize(level.route);
    const status = document.createElement('span'); status.className = 'level-state';
    status.textContent = t(complete ? 'levelComplete' : active ? state.phase === 'ready' ? 'readyToStart' : 'currentLevel' : 'locked');
    detail.append(name, route, status); li.append(number, detail);
    return li;
  }));
  const offset = levelIndex() * CONFIG.questionsPerLevel;
  $('question-progress').replaceChildren(...state.sessionQuestions.slice(offset, offset + CONFIG.questionsPerLevel).map((question, index) => {
    const li = document.createElement('li');
    const absoluteIndex = offset + index;
    const response = state.responses[absoluteIndex];
    li.className = response ? response.correct ? 'done' : 'missed' : absoluteIndex === state.index ? 'current' : '';
    li.textContent = response ? response.correct ? '✓' : '·' : String(index + 1).padStart(2, '0');
    li.setAttribute('aria-label', t('questionAria', { number: index + 1, status: t(response ? response.correct ? 'correctState' : 'incorrectState' : absoluteIndex === state.index ? 'currentState' : 'locked') }));
    if (absoluteIndex === state.index) li.setAttribute('aria-current', 'step');
    return li;
  }));
}

function renderClues() {
  $('clue-list').replaceChildren(...[['triangle', '△'], ['square', '□'], ['circle', '○']].map(([shape, symbol]) => {
    const li = document.createElement('li');
    const label = document.createElement('span'); label.textContent = symbol + ' ' + t(shape);
    const digit = document.createElement('strong'); digit.textContent = state.clues.get(shape)?.digit ?? '?';
    li.className = state.clues.has(shape) ? 'recovered' : '';
    li.append(label, digit); return li;
  }));
}

function renderLevelHeading() {
  const level = LEVELS[levelIndex()];
  document.body.dataset.level = levelIndex() + 1;
  $('level-kicker').textContent = t('levelKicker', { level: levelIndex() + 1, name: localize(level.name) });
  $('level-title').textContent = localize(level.title);
  $('level-badge').textContent = localize(level.badge);
  $('level-description').textContent = localize(level.description);
}
function renderQuestion(focus = false) {
  const question = currentQuestion();
  renderLevelHeading();
  $('question-category').textContent = t('category.' + question.category);
  $('question-number').textContent = String(state.index + 1).padStart(2, '0') + ' / ' + TOTAL_QUESTIONS;
  $('question-difficulty').textContent = t('difficulty', { level: question.difficulty });
  $('question-points').textContent = t('questionPoints', { points: question.points });
  $('question-title').textContent = localize(question.prompt);
  $('code-panel').hidden = !question.code;
  $('code-filename').textContent = question.filename ?? '';
  $('question-code').textContent = question.code ?? '';
  $('answer-grid').replaceChildren(...question.choices.map((choice, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'answer-card'; button.dataset.choice = index;
    const key = document.createElement('span'); key.className = 'answer-key'; key.textContent = LETTERS[index]; key.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.className = 'answer-text'; text.textContent = localize(choice.text);
    text.dir = choice.text.en === choice.text.ar ? 'ltr' : 'auto';
    const marker = document.createElement('span'); marker.className = 'answer-marker'; marker.setAttribute('aria-hidden', 'true');
    button.append(key, text, marker);
    button.addEventListener('click', () => selectAnswer(index));
    return button;
  }));
  renderAnswerState();
  $('start-banner').hidden = state.phase !== 'ready';
  renderRoute(); renderClues(); syncControls();
  if (focus) $('question-title').focus({ preventScroll: true });
}

// Pure presentation: safe to repeat after a language switch or submission.
function renderAnswerState() {
  const question = currentQuestion();
  const response = state.responses[state.index];
  const correct = correctIndex(question);
  [...$('answer-grid').children].forEach((button, index) => {
    const isCorrect = Boolean(response) && index === correct;
    const isWrong = Boolean(response) && !response.correct && index === response.choice;
    const selected = state.selected === index;
    button.classList.toggle('selected', selected);
    button.classList.toggle('correct', isCorrect);
    button.classList.toggle('incorrect', isWrong);
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.answer-marker').textContent = isCorrect ? '✓' : isWrong ? '×' : '';
    button.setAttribute('aria-label', LETTERS[index] + ': ' + localize(question.choices[index].text) + (isCorrect ? t('correctSuffix') : isWrong ? t('incorrectSuffix') : ''));
  });
  $('feedback').hidden = !response;
  $('feedback').textContent = response ? (response.correct ? t('correctFeedback', { points: question.points }) : t('wrongFeedback', { letter: LETTERS[correct] })) + ' ' + localize(question.explanation) : '';
  $('feedback').className = 'feedback ' + (response?.correct ? 'success' : 'error');
  const hinted = state.hinted.has(question.id);
  $('hint-panel').hidden = !hinted;
  $('hint-text').textContent = hinted ? localize(question.hint) + ' ' + t('hintCost') : '';
  const ended = state.phase === 'won' || state.phase === 'lost';
  $('submit-button').hidden = Boolean(response) || ended;
  $('next-button').hidden = !response && !ended;
  $('next-button').textContent = t(question.final || ended ? 'resultsButton' : (state.index + 1) % CONFIG.questionsPerLevel === 0 ? 'nextLevel' : 'next');
}

function syncControls() {
  const answered = Boolean(state.responses[state.index]);
  const active = state.phase === "playing" && !answered;
  [...$("answer-grid").children].forEach(button => { button.disabled = !active; });
  $("submit-button").disabled = !active || state.selected === null;
  const usedHere = state.hinted.has(currentQuestion().id);
  $("hint-button").disabled = !active || usedHere || state.hintsUsed >= CONFIG.hintLimit;
  $("hint-button").textContent = t(usedHere ? "hintUsed" : state.hintsUsed >= CONFIG.hintLimit ? "noHints" : "hintButton");
  $("next-button").disabled = !answered && state.phase === "playing";
}

function startMission() {
  if (state.phase !== "ready") return;
  state.phase = "playing";
  state.startedAt = Date.now();
  state.deadline = state.startedAt + CONFIG.durationSeconds * 1000;
  timerHandle = setInterval(tick, 200);
  $("start-banner").hidden = true;
  log("log.start");
  renderRoute();
  syncControls();
  updateDashboard();
  $("answer-grid").children[0].focus({ preventScroll: true });
}

// Deadline timing remains accurate when hidden tabs throttle interval callbacks.
function tick() {
  if (state.phase !== "playing") return;
  state.remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
  updateDashboard();
  if (state.remaining === 0) endMission(false, "reason.timeout", true);
}

function selectAnswer(index) {
  if (state.phase !== "playing" || state.responses[state.index] || !Number.isInteger(index) || index < 0 || index > 3) return;
  tick();
  if (state.phase !== "playing") return;
  state.selected = index;
  [...$("answer-grid").children].forEach((button, choiceIndex) => {
    const selected = index === choiceIndex;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  syncControls();
}

function submitAnswer() {
  if (state.phase !== 'playing' || state.responses[state.index] || state.selected === null) return;
  tick();
  if (state.phase !== 'playing') return;
  const question = currentQuestion();
  const correct = question.choices[state.selected].id === question.correctAnswerId;
  state.responses.push({ id: question.id, choice: state.selected, answerId: question.choices[state.selected].id, correct });
  if (correct) state.earnedPoints += question.points;
  if (question.clue) {
    state.clues.set(question.clue.shape, { ...question.clue });
    log('log.seal', { shape: question.clue.shape });
  } else log(correct ? 'log.correct' : 'log.wrong', { number: state.index + 1, points: question.points });
  if (question.final) endMission(correct, correct ? 'reason.won' : 'reason.wrong');
  renderAnswerState(); renderClues(); renderRoute(); syncControls(); updateDashboard();
  $('next-button').focus({ preventScroll: true });
}

function nextQuestion() {
  if (state.phase === "won" || state.phase === "lost") { showResults(); return; }
  if (state.phase !== "playing" || !state.responses[state.index]) return;
  tick();
  if (state.phase !== "playing") return;
  const previousLevel = levelIndex();
  if (!showQuestionAt(state.index + 1, true)) return;
  if (levelIndex() !== previousLevel) log("log.level", { levelIndex: levelIndex() });
  updateDashboard();
}

function useHint() {
  const question = currentQuestion();
  if (state.phase !== "playing" || state.responses[state.index] || state.hinted.has(question.id) || state.hintsUsed >= CONFIG.hintLimit) return;
  tick();
  if (state.phase !== "playing") return;
  state.hinted.add(question.id);
  state.hintsUsed += 1;
  $("hint-text").textContent = localize(question.hint) + " " + t("hintCost");
  $("hint-panel").hidden = false;
  log("log.hint");
  syncControls();
  updateDashboard();
}

function endMission(won, reason, timedOut = false) {
  if (state.phase !== "playing") return;
  state.phase = won ? "won" : "lost";
  state.elapsedMs = Math.max(0, Math.min(Date.now() - state.startedAt, CONFIG.durationSeconds * 1000));
  state.resultReason = reason;
  clearInterval(timerHandle);
  timerHandle = null;
  document.body.classList.toggle("vault-open", won);
  document.body.classList.toggle("vault-locked", !won);
  if (won) {
    const candidate = { score: score(), elapsedMs: state.elapsedMs };
    if (isBetter(candidate, best)) {
      best = candidate;
      try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(best));
        recordMessage = "record.saved";
      } catch { recordMessage = "record.temporary"; }
    } else recordMessage = "record.ranked";
  } else recordMessage = "record.loss";
  log(won ? "log.won" : "log.lost");
  syncControls();
  updateDashboard();
  document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
  if (timedOut) {
    $("next-button").hidden = false;
    $("next-button").textContent = t("resultsButton");
    showResults();
  }
}

function renderResults() {
  const won = state.phase === 'won';
  $('result-symbol').textContent = won ? '↗' : '×';
  $('result-kicker').textContent = t(won ? 'resultWonKicker' : 'resultLostKicker');
  $('result-title').textContent = t(won ? 'resultWonTitle' : 'resultLostTitle');
  $('result-description').textContent = t(state.resultReason);
  $('result-score').textContent = score().toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US');
  $('result-time').textContent = completionTime(state.elapsedMs);
  $('result-breakdown').textContent = t('breakdown', { correct: state.responses.filter(response => response.correct).length, earned: state.earnedPoints, cost: state.hintsUsed * CONFIG.hintCost });
  $('record-message').textContent = recordMessage ? t(recordMessage) : '';
  $('vault-explanation').hidden = !state.responses.some(response => response.id === 'final-vault');
  $('vault-explanation-text').textContent = $('vault-explanation').hidden ? '' : localize(state.sessionQuestions.find(question => question.final).explanation);
}
function showResults() {
  if (state.phase !== 'won' && state.phase !== 'lost') return;
  renderResults();
  if (!$('result-dialog').open) $('result-dialog').showModal();
}

function handleKeyboard(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || document.querySelector("dialog[open]")) return;
  if (state.phase === "ready") return;
  const key = event.key.toLowerCase();
  const target = event.target;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName) || target?.isContentEditable) return;
  if (key === "enter") {
    // Ordinary buttons activate natively; Enter on an answer card locks it in.
    if (target?.tagName === "BUTTON" && !target.classList.contains("answer-card")) return;
    event.preventDefault();
    if (state.responses[state.index] || state.phase !== "playing") nextQuestion();
    else submitAnswer();
    return;
  }
  if (state.phase !== "playing" || state.responses[state.index]) return;
  let index = LETTERS.map(letter => letter.toLowerCase()).indexOf(key);
  if (/^[1-4]$/.test(key)) index = Number(key) - 1;
  if (["arrowright", "arrowdown", "arrowleft", "arrowup"].includes(key) && target?.closest("#answer-grid")) {
    const current = state.selected ?? Number(target.dataset.choice ?? 0);
    index = (current + (["arrowleft", "arrowup"].includes(key) ? 3 : 1)) % 4;
  }
  if (index >= 0) {
    event.preventDefault();
    selectAnswer(index);
    if (state.phase === "playing") $("answer-grid").children[index].focus({ preventScroll: true });
  }
}

// Event wiring is separate from the question catalog and state transitions.
$("start-button").addEventListener("click", startMission);
$("submit-button").addEventListener("click", submitAnswer);
$("next-button").addEventListener("click", nextQuestion);
$("hint-button").addEventListener("click", useHint);
$("guide-button").addEventListener("click", () => $("guide-dialog").showModal());
$("restart-button").addEventListener("click", () => $("restart-dialog").showModal());
$("confirm-restart").addEventListener("click", () => { init(); $("start-button").focus(); });
$("play-again").addEventListener("click", () => { init(); $("start-button").focus(); });
$("review-mission").addEventListener("click", () => $("result-dialog").close());
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => $(button.dataset.close).close()));
document.addEventListener("keydown", handleKeyboard);
document.addEventListener("visibilitychange", tick);
window.addEventListener("pageshow", tick);
document.querySelectorAll("[data-language-picker]").forEach(select => select.addEventListener("change", event => setLanguage(event.target.value)));
init();
