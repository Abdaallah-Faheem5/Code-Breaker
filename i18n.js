"use strict";

// Local, trusted interface strings. Only static UI entries contain markup.
const UI = {
  pageTitle: ["Code Breaker by iTeam | The Beginner's Web Challenge", "فاتح الشفرة من iTeam | تحدّي الويب للمبتدئين"],
  language: ["Language", "اللغة"],
  university: ["Al Zaytoonah University of Jordan", "جامعة الزيتونة الأردنية"],
  faculty: ["Faculty of Science & Technology", "كلية العلوم وتكنولوجيا المعلومات"],
  brandLabel: ["iTeam, Al Zaytoonah University of Jordan, Faculty of Science and Technology", "iTeam، جامعة الزيتونة الأردنية، كلية العلوم وتكنولوجيا المعلومات"],
  connection: ["AN iTEAM CHALLENGE", "تحدّي iTeam"],
  guide: ["How to play <span aria-hidden=\"true\">?</span>", "طريقة اللعب <span aria-hidden=\"true\">?</span>"],
  presents: ["iTEAM PRESENTS / THE BEGINNER'S WEB CHALLENGE", "iTeam يقدّم / تحدّي الويب للمبتدئين"],
  title: ["Code Breaker.<br><span>Think. Solve. Unlock.</span>", "فاتح الشفرة.<br><span>فكّر. حُلّ. افتح.</span>"],
  intro: ["Three levels. Twenty-four questions. One digital vault.<br>No coding experience needed. Just bring your curiosity.", "ثلاثة مستويات. أربعة وعشرون سؤالًا. خزنة رقمية واحدة.<br>لا تحتاج إلى خبرة في البرمجة. يكفي فضولك."],
  encouragement: ["Think, try, and take on the challenge with iTeam.", "فكّر، جرّب، وابدأ التحدّي مع iTeam."],
  breakthrough: ["YOUR NEXT BREAKTHROUGH", "خطوتك القادمة نحو التعلّم"],
  terminal: ["&gt; learn. build. break through.<span class=\"cursor\">_</span>", "&gt; تعلّم. ابنِ. تقدّم.<span class=\"cursor\">_</span>"],
  experience: ["EXPERIENCE: OPTIONAL", "الخبرة: اختيارية"], curiosity: ["CURIOSITY: REQUIRED", "الفضول: مطلوب"],
  stats: ["Mission statistics", "إحصاءات المهمة"], timeLabel: ["TIME REMAINING", "الوقت المتبقّي"],
  scoreLabel: ["YOUR SCORE", "نقاطك"], hintsLabel: ["HINTS REMAINING", "التلميحات المتبقّية"], bestLabel: ["PERSONAL BEST", "أفضل نتيجة لك"],
  pts: ["PTS", "نقطة"], routeLabel: ["Your mission route", "مسار مهمتك"], road: ["THE ROAD TO THE VAULT", "الطريق إلى الخزنة"],
  progress: ["MISSION PROGRESS", "تقدّم المهمة"], answeredLabel: ["Questions answered", "الأسئلة المُجاب عنها"],
  beginnerNote: ["Every expert<br>was once a beginner.", "كل خبير<br>كان مبتدئًا يومًا ما."],
  restart: ["↻ Restart mission", "↻ إعادة المهمة"], levelQuestions: ["Questions in this level", "أسئلة هذا المستوى"],
  ready: ["Ready for your first breakthrough?", "هل أنت مستعد لبدء التحدّي؟"], clockStarts: ["The clock starts only when you begin.", "يبدأ العدّ التنازلي عند بدء المهمة فقط."],
  begin: ["Begin mission ↗", "ابدأ المهمة ↗"], codeLabel: ["Question code or pattern", "كود السؤال أو النمط"],
  selectHelp: ["SELECT ONE ANSWER <span>A–D or 1–4 · Enter to submit</span>", "اختر إجابة واحدة <span>A–D أو 1–4 · Enter للإرسال</span>"],
  optionsLabel: ["Answer options", "خيارات الإجابة"], nudge: ["A LITTLE NUDGE", "تلميح بسيط"],
  lock: ["Lock answer →", "ثبّت الإجابة ←"], next: ["Next question →", "السؤال التالي ←"],
  footnote: ["READ. REASON. BREAK THROUGH. <span>One submission per question.</span>", "اقرأ. فكّر. تقدّم. <span>محاولة واحدة لكل سؤال.</span>"],
  intelLabel: ["Vault status and clues", "حالة الخزنة والأدلة"], vault: ["DIGITAL VAULT", "الخزنة الرقمية"],
  notebook: ["YOUR CLUE NOTEBOOK", "دفتر الأدلة"], notebookIntro: ["Save the seals. You’ll need their digits for the final question.", "احتفظ بالأختام. ستحتاج إلى أرقامها في السؤال الأخير."],
  clueNote: ["Clues appear after feedback, even if your answer was incorrect.", "تظهر الأدلة بعد الإجابة، حتى لو كانت إجابتك خاطئة."],
  missionLog: ["MISSION LOG", "سجلّ المهمة"], footer: ["CODE BREAKER · BY iTEAM", "فاتح الشفرة · من iTeam"],
  closeGuide: ["Close instructions", "إغلاق التعليمات"], handbook: ["PLAYER HANDBOOK", "دليل اللاعب"], guideTitle: ["Your vault protocol.", "خطتك لفتح الخزنة."],
  guideIntro: ["Answer 24 beginner questions across three levels. Question 24 is the final vault challenge. You have 20 minutes.", "أجب عن 24 سؤالًا للمبتدئين موزّعة على ثلاثة مستويات. السؤال 24 هو تحدّي الخزنة الأخير. لديك 20 دقيقة."],
  rulePick: ["<strong>Pick, then lock.</strong> Choose one of four answers, then press Lock answer. One submission per question. Each game uses a fresh shuffle with no repeats.", "<strong>اختر ثم ثبّت.</strong> اختر إجابة من أربع، ثم اضغط ثبّت الإجابة. لكل سؤال محاولة واحدة. تُخلط الأسئلة عند كل لعبة دون تكرار."],
  ruleLearn: ["<strong>Learn and continue.</strong> Correct answers earn the displayed points. Wrong answers earn zero. Both show a short explanation.", "<strong>تعلّم وتابع.</strong> تمنحك الإجابة الصحيحة النقاط المعروضة، والخاطئة صفرًا. يظهر شرح قصير في الحالتين."],
  ruleHints: ["<strong>Three hints total.</strong> Each costs 75 points from your total earnings, including future points. Your displayed score stays at least zero. One hint per question.", "<strong>ثلاثة تلميحات في اللعبة.</strong> يخصم كل تلميح 75 نقطة من مجموع ما تكسبه، بما فيه النقاط القادمة. لا تقل النتيجة المعروضة عن صفر. تلميح واحد لكل سؤال."],
  ruleSeals: ["<strong>Collect three seals.</strong> Their digits appear in your notebook after answering, even if you were wrong. Use them for the final code.", "<strong>اجمع ثلاثة أختام.</strong> تظهر أرقامها في دفترك بعد الإجابة حتى لو أخطأت. استخدمها لحل الرمز الأخير."],
  ruleWin: ["<strong>Open the vault.</strong> A correct final answer before time runs out wins. A wrong final answer or timeout ends the game.", "<strong>افتح الخزنة.</strong> تفوز بإجابة صحيحة عن السؤال الأخير قبل انتهاء الوقت. الإجابة الأخيرة الخاطئة أو انتهاء الوقت ينهيان اللعبة."],
  ruleRank: ["<strong>Your personal best.</strong> Higher scores rank first, then shorter completion times. Only victories qualify. There is no time bonus.", "<strong>أفضل نتيجة لك.</strong> تتقدّم النتيجة الأعلى، ثم الوقت الأقصر عند التعادل. تُحتسب مرات الفوز فقط. لا توجد نقاط إضافية للوقت."],
  keyboard: ["Keyboard: A–D or 1–4 selects, arrow keys move between answers, Enter submits or continues. Tab and Space also work. The timer continues in dialogs and hidden tabs. You can change language at any time.", "لوحة المفاتيح: A–D أو 1–4 للاختيار، والأسهم للتنقّل، وEnter للإرسال أو المتابعة. يعمل Tab وSpace أيضًا. يستمر الوقت في النوافذ وعند إخفاء التبويب. يمكنك تغيير اللغة في أي وقت."],
  letsGo: ["Let’s do this →", "لنبدأ ←"], resetProtocol: ["RESET PROTOCOL", "إعادة البداية"], restartTitle: ["Start a fresh mission?", "هل تريد بدء مهمة جديدة؟"],
  restartWarning: ["Your current score and progress will reset. Your personal best stays saved.", "ستُصفّر نقاطك الحالية وتقدّمك. تبقى أفضل نتيجة لك محفوظة."],
  keepPlaying: ["Keep playing", "متابعة اللعب"], confirmRestart: ["Restart ↻", "إعادة البداية ↻"],
  finalScore: ["FINAL SCORE", "النتيجة النهائية"], completionLabel: ["COMPLETION TIME", "الوقت المستغرق"], decoded: ["The code, decoded.", "شرح رمز الخزنة."],
  playAgain: ["Play again ↻", "العب مجددًا ↻"], review: ["View mission", "عرض المهمة"],
  bestRule: ["Score first. Time breaks ties.", "النقاط أولًا، ثم الوقت عند التعادل."], bestTime: ["in {time}", "خلال {time}"],
  timerAria: ["{minutes} minutes {seconds} seconds remaining", "الوقت المتبقّي: {minutes} دقيقة و{seconds} ثانية"],
  "phase.ready": ["STANDBY", "بانتظار البدء"], "phase.playing": ["LIVE", "جارٍ اللعب"], "phase.won": ["UNLOCKED", "مفتوحة"], "phase.lost": ["OFFLINE", "انتهت اللعبة"], "phase.error": ["BANK ERROR", "خطأ في الأسئلة"], "phase.complete": ["COMPLETE", "اكتملت الأسئلة"],
  "vault.ready": ["AWAITING PLAYER", "بانتظار اللاعب"], "vault.playing": ["LEVEL 0{level} ACTIVE", "المستوى 0{level} جارٍ"], "vault.final": ["FINAL KEY REQUIRED", "أدخل الرمز الأخير"], "vault.won": ["ACCESS GRANTED", "فُتحت الخزنة"], "vault.lost": ["VAULT SEALED", "الخزنة مغلقة"], "vault.error": ["QUESTION BANK ERROR", "خطأ في بنك الأسئلة"], "vault.complete": ["NO UNUSED QUESTIONS", "لا توجد أسئلة غير مستخدمة"],
  "detail.ready": ["Three levels stand between you and the key.", "ثلاثة مستويات تفصلك عن المفتاح."], "detail.won": ["You opened the vault!", "لقد فتحت الخزنة!"], "detail.lost": ["Start a fresh mission to try again.", "ابدأ مهمة جديدة للمحاولة مرة أخرى."], "detail.error": ["Selection stopped. No question was repeated.", "توقّف اختيار الأسئلة. لم يتكرّر أي سؤال."], "detail.complete": ["All available questions are complete. Start a new game to play again.", "انتهت الأسئلة المتاحة. ابدأ لعبة جديدة للعب مجددًا."], "detail.playing": ["{answered} / 24 questions answered · {seals} / 3 seals found", "أُجيب عن {answered} / 24 سؤالًا · جُمعت {seals} / 3 أختام"],
  levelKicker: ["LEVEL 0{level} / {name}", "المستوى 0{level} / {name}"], difficulty: ["BEGINNER · STAGE {level} / 3", "مبتدئ · المرحلة {level} / 3"], questionPoints: ["+{points} PTS", "+{points} نقطة"],
  levelComplete: ["LEVEL COMPLETE", "اكتمل المستوى"], readyToStart: ["READY TO START", "جاهز للبدء"], currentLevel: ["CURRENT LEVEL", "المستوى الحالي"], locked: ["LOCKED", "مغلق"],
  correctState: ["correct", "صحيحة"], incorrectState: ["incorrect", "خاطئة"], currentState: ["current", "حالي"], questionAria: ["Question {number}: {status}", "السؤال {number}: {status}"],
  triangle: ["TRIANGLE", "المثلث"], square: ["SQUARE", "المربع"], circle: ["CIRCLE", "الدائرة"],
  "category.Web Fundamentals": ["Web Basics", "أساسيات الويب"], "category.HTML/CSS": ["HTML / CSS", "HTML / CSS"], "category.JavaScript": ["JavaScript", "JavaScript"], "category.Java": ["Java", "Java"], "category.Logic": ["Simple Logic", "منطق بسيط"], "category.Software Engineering": ["Software Engineering Basics", "أساسيات هندسة البرمجيات"],
  hintUsed: ["◇ Hint used", "◇ استُخدم التلميح"], noHints: ["◇ No hints left", "◇ لا توجد تلميحات متبقّية"], hintButton: ["◇ Use a hint · −75 pts", "◇ استخدم تلميحًا · −75 نقطة"], hintCost: ["(75 points deducted from total earnings, including future points.)", "(تُخصم 75 نقطة من مجموع ما تكسبه، بما فيه النقاط القادمة.)"],
  correctSuffix: [", correct answer", "، الإجابة الصحيحة"], incorrectSuffix: [", your incorrect answer", "، إجابتك الخاطئة"], correctFeedback: ["Correct! +{points} points.", "صحيح! +{points} نقطة."], wrongFeedback: ["Not quite. No points earned. Correct answer: {letter}.", "إجابة غير صحيحة. لم تكسب نقاطًا. الإجابة الصحيحة: {letter}."],
  resultsButton: ["View results →", "عرض النتائج ←"], nextLevel: ["Unlock next level →", "افتح المستوى التالي ←"],
  "log.ready": ["Beginner protocol ready.", "مهمة المبتدئين جاهزة."], "log.start": ["Mission started. Your clock is live.", "بدأت المهمة والعدّ التنازلي."], "log.seal": ["{seal} seal recovered.", "جُمِع ختم {seal}."], "log.correct": ["Question {number} cleared. +{points} points.", "إجابة صحيحة عن السؤال {number}. +{points} نقطة."], "log.wrong": ["Question {number}: lesson learned.", "السؤال {number}: تعلّمت معلومة جديدة."], "log.level": ["{name} level unlocked.", "فُتح مستوى {name}."], "log.hint": ["Hint used. −75 points from total earnings.", "استُخدم تلميح. −75 نقطة من مجموع ما تكسبه."], "log.won": ["Vault unlocked. Mission complete.", "فُتحت الخزنة. اكتملت المهمة."], "log.lost": ["Mission ended. New attempt available.", "انتهت المهمة. يمكنك المحاولة مجددًا."], "log.stopped": ["Question selection stopped safely.", "توقّف اختيار الأسئلة دون تكرار."],
  exhaustedTitle: ["All available questions are complete.", "انتهت جميع الأسئلة المتاحة."], exhausted: ["No unused questions remain for this session. No questions will repeat. Start a new game to play again.", "لم تعد هناك أسئلة غير مستخدمة لهذه الجولة. لن تتكرّر الأسئلة. ابدأ لعبة جديدة للعب مجددًا."],
  bankErrorTitle: ["Question bank needs attention.", "يحتاج بنك الأسئلة إلى مراجعة."], bankError: ["The question bank could not create a valid game. Check the question data, then restart. No question was repeated.", "تعذّر إنشاء لعبة سليمة من بنك الأسئلة. راجع بيانات الأسئلة ثم أعد البداية. لم يتكرّر أي سؤال."],
  "reason.timeout": ["Time ran out. Start a fresh mission and try again.", "انتهى الوقت. ابدأ مهمة جديدة وحاول مجددًا."], "reason.won": ["Twenty-four questions. Three seals. You opened the vault!", "أربعة وعشرون سؤالًا وثلاثة أختام. لقد فتحت الخزنة!"], "reason.wrong": ["That key did not fit. Use what you learned and try again.", "لم يكن الرمز صحيحًا. استفد مما تعلّمته وحاول مجددًا."],
  "record.saved": ["New personal best! Saved to this browser.", "أفضل نتيجة جديدة لك! حُفظت في هذا المتصفح."], "record.temporary": ["New personal best! Storage is unavailable; kept for this visit.", "أفضل نتيجة جديدة لك! التخزين غير متاح؛ ستبقى خلال هذه الزيارة."], "record.ranked": ["Personal best is ranked by score, then faster completion time.", "تُرتّب أفضل النتائج حسب النقاط، ثم الوقت الأقصر."], "record.loss": ["Only an unlocked vault qualifies for the personal best.", "يُحتسب الفوز بفتح الخزنة فقط ضمن أفضل النتائج."],
  resultWonKicker: ["VAULT PROTOCOL COMPLETE", "اكتملت مهمة الخزنة"], resultLostKicker: ["MISSION ENDED", "انتهت المهمة"], resultWonTitle: ["Your breakthrough moment.", "لحظة نجاحك."], resultLostTitle: ["The next try is yours.", "المحاولة القادمة فرصتك."], breakdown: ["{correct}/24 correct · {earned} earned − {cost} hint points · minimum score 0", "{correct}/24 صحيحة · {earned} نقطة مكتسبة − {cost} نقطة للتلميحات · أقل نتيجة 0"]
};

let language = "en";
function localize(text) { return text[language]; }
function t(key, values = {}) {
  const entry = UI[key];
  if (!entry) throw new Error(`Missing UI translation: ${key}`);
  return entry[language === "ar" ? 1 : 0].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

function applyInterfaceLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n); // Only the trusted UI dictionary.
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-language-picker]").forEach(select => { select.value = language; });
}

// Changing language renders the same state; it never selects a new question.
function setLanguage(nextLanguage) {
  if (!["en", "ar"].includes(nextLanguage) || nextLanguage === language) return;
  const focusedChoice = document.activeElement?.closest(".answer-card")?.dataset.choice;
  language = nextLanguage;
  applyInterfaceLanguage();
  if (state.phase === "error" || state.phase === "complete") renderBankMessage();
  else renderQuestion();
  renderLogs();
  updateDashboard();
  if (state.phase === "won" || state.phase === "lost") renderResults();
  if (focusedChoice !== undefined) $("answer-grid").children[Number(focusedChoice)]?.focus({ preventScroll: true });
}
