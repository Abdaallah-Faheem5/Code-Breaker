"use strict";

/* Correct choices are zero-based: A=0, B=1, C=2, D=3.
 * Only the current question and choices are rendered before submission.
 * Browser-only answer data is inspectable in source; this is an event game.
 */
const LEVELS = [
  {
    name: "Rookie", title: "Start with curiosity.", badge: "FIRST STEPS",
    description: "Meet the web, Java, and software engineering. Spot a pattern and think through a problem.",
    questions: [
      {
        id: "browser", concept: "web-browser-purpose", category: "Web Fundamentals", difficulty: 1, points: 100,
        prompt: "Which kind of app opens websites and lets you follow links?",
        choices: ["A web browser", "A code editor", "A file manager", "A presentation app"], correct: 0,
        hint: "Think of the type of app you are using to play this game.",
        explanation: "A web browser, such as Firefox or Edge, loads webpages and lets you interact with them."
      },
      {
        id: "html-role", concept: "html-content-role", category: "Web Fundamentals", difficulty: 1, points: 100,
        prompt: "A webpage has headings, paragraphs, and links. What is HTML mainly used for?",
        choices: ["Choosing colors and fonts", "Reacting to clicks", "Finding spelling mistakes", "Describing the page’s structure and content"], correct: 3,
        hint: "Imagine a webpage as a house: first you need its rooms and walls before decorating it.",
        explanation: "HTML describes structure and content. CSS adds style, while JavaScript can add interactive behavior."
      },
      {
        id: "badge-deduction", concept: "logic-exact-count-deduction", category: "Logic", difficulty: 1, points: 100,
        prompt: "Exactly two of three badges are lit. Green is lit and red is not. What must be true about blue?",
        choices: ["Blue is not lit", "Blue is lit", "All three badges are lit", "Blue cannot be determined"], correct: 1,
        hint: "Count the lit badges already known, then compare that count with the required total.",
        explanation: "Green contributes one lit badge and red contributes none. Blue must supply the second lit badge."
      },
      {
        id: "algorithm", concept: "algorithm-precise-instructions", category: "Software Engineering", difficulty: 1, points: 100,
        prompt: "A robot must draw a square. Which instruction is the clearest algorithm: a set of steps it can follow?",
        choices: ["Draw something nice", "Make four lines somehow", "Repeat 4 times: move forward 10 steps, then turn right 90°", "Keep moving until it looks finished"], correct: 2,
        hint: "A useful set of instructions tells the robot exactly what to do and when to stop.",
        explanation: "An algorithm is a clear sequence of steps. Four equal moves with four right-angle turns draw a square."
      },
      {
        id: "bug", concept: "bug-unexpected-behavior", category: "Software Engineering", difficulty: 1, points: 100,
        prompt: "An addition program should show 2 + 3 = 5, but it shows 6. What does this suggest?",
        choices: ["The screen needs a larger font", "The program has finished correctly", "The result depends on the browser color", "There may be a bug in the program’s instructions"], correct: 3,
        hint: "Compare what the program should do with what it actually does.",
        explanation: "A bug is an error causing unintended behavior. A feature is an intended capability; showing a wrong sum is not an intended feature."
      },
      {
        id: "url", concept: "url-resource-address", category: "Web Fundamentals", difficulty: 1, points: 100,
        prompt: "You type https://example.com/club into a browser. What does this URL tell the browser?",
        choices: ["Which web resource or page to find", "Which font size to use", "How many tabs it may open", "Which keyboard layout to use"], correct: 0,
        hint: "Think about what a street address does when you want to visit a place.",
        explanation: "A URL is a web address. It identifies a resource, such as a page, that a browser can request."
      },
      {
        id: "debug-first", concept: "debug-reproduce-before-changing", category: "Software Engineering", difficulty: 1, points: 100,
        prompt: "A webpage button does nothing when clicked. What is the best first step in debugging it?",
        choices: ["Replace every file immediately", "Repeat the click and note what happens versus what should happen", "Change all the page’s colors", "Assume every other button is broken too"], correct: 1,
        hint: "Understand a problem before changing things. Start with a small, repeatable observation.",
        explanation: "Debugging starts by reproducing the problem and comparing actual behavior with the expected behavior."
      },
      {
        id: "triangle-seal", concept: "constant-step-seal", category: "Logic", difficulty: 1, points: 100,
        prompt: "The TRIANGLE seal counts upward by twos. Which digit fills the gap? Save it for the vault.",
        code: "TRIANGLE: 2 → 4 → 6 → ?", filename: "triangle.seal",
        choices: ["7", "9", "8", "6"], correct: 2,
        hint: "Compare the first three terms. Use the same increase to find the next one.",
        explanation: "The pattern adds 2 each time, so the missing digit is 8. The TRIANGLE seal stores 8.",
        clue: { shape: "triangle", label: "TRIANGLE", symbol: "△", digit: "8" }
      }
    ]
  },
  {
    name: "Hacker", title: "A little code. A lot of possibility.", badge: "BUILDING BLOCKS",
    description: "Read tiny code snippets, explore requirements, and choose useful tests. One step at a time.",
    questions: [
      {
        id: "heading", concept: "html-top-heading", category: "HTML/CSS", difficulty: 2, points: 150,
        prompt: "Which HTML element describes the page’s main heading?",
        choices: ["<p>Welcome</p>", "<a>Welcome</a>", "<h1>Welcome</h1>", "<button>Welcome</button>"], correct: 2,
        hint: "HTML heading names start with a letter meaning ‘heading’, followed by a level number.",
        explanation: "<h1> represents a top-level heading. <p> is a paragraph, <a> is an anchor, and <button> is a button."
      },
      {
        id: "link", concept: "html-link-destination", category: "HTML/CSS", difficulty: 2, points: 150,
        prompt: "An <a> element makes a link. Which attribute belongs in the blank to set where the link goes?",
        code: '<a _____="https://example.com">Visit the club</a>', filename: "index.html",
        choices: ["href", "color", "size", "title"], correct: 0,
        hint: "A link needs a reference to its destination. The attribute name is short for ‘hypertext reference’.",
        explanation: "href sets a link’s destination. Here it points to https://example.com."
      },
      {
        id: "button", concept: "html-native-action-control", category: "HTML/CSS", difficulty: 2, points: 150,
        prompt: "Which snippet creates a standard button that someone can click or activate with a keyboard?",
        choices: ["<p>Start</p>", "<h2>Start</h2>", "<span>Start</span>", "<button>Start</button>"], correct: 3,
        hint: "Choose the element that describes an action control, rather than ordinary page text.",
        explanation: "<button> creates a native button, with built-in keyboard support. JavaScript can respond when it is activated."
      },
      {
        id: "css-color", concept: "css-foreground-background", category: "HTML/CSS", difficulty: 2, points: 150,
        prompt: "In this CSS, what color is the paragraph’s TEXT? Assume no other styles apply.",
        code: "p {\n  color: blue;\n  background-color: white;\n}", filename: "style.css",
        choices: ["White", "Blue", "Black", "Green"], correct: 1,
        hint: "There are separate properties for the letters and the area behind them. Read their names carefully.",
        explanation: "color sets text color, so the letters are blue. background-color makes the area behind them white."
      },
      {
        id: "css-font", concept: "css-text-size", category: "HTML/CSS", difficulty: 2, points: 150,
        prompt: "You want the letters in a paragraph to look larger. Which CSS property should you change?",
        choices: ["font-family", "font-size", "background-color", "text-align"], correct: 1,
        hint: "The property name should describe the size of the letters, rather than their typeface or position.",
        explanation: "font-size controls how large text is. font-family chooses the typeface, and text-align changes alignment."
      },
      {
        id: "boolean-not", concept: "javascript-boolean-negation", category: "JavaScript", difficulty: 2, points: 150,
        prompt: "In JavaScript, ! reverses a true/false value. What does this code print?",
        code: "let isLocked = true;\nconsole.log(!isLocked);", filename: "lock.js",
        choices: ["true", "1", "Nothing", "false"], correct: 3,
        hint: "Apply the reversal to the stored value. The original variable itself is not reassigned.",
        explanation: "The ! operator turns true into false, so console.log prints false."
      },
      {
        id: "click-event", concept: "javascript-event-trigger", category: "JavaScript", difficulty: 2, points: 150,
        prompt: "This JavaScript registers a click listener once. When does its message print?",
        code: 'button.addEventListener("click", () => {\n  console.log("Hello");\n});', filename: "button.js",
        choices: ["Only when the page first loads", "Continuously every second", "Each time that button is clicked", "Only when the mouse leaves the button"], correct: 2,
        hint: "The event name tells you what user action the listener is waiting for.",
        explanation: "Registering a listener waits for an event. Its function runs when a click occurs on that button."
      },
      {
        id: "square-seal", concept: "javascript-reassignment-seal", category: "JavaScript", difficulty: 2, points: 150,
        prompt: "The SQUARE seal stores the number this code prints. Which digit should go in your notebook?",
        code: "let coins = 3;\ncoins = coins + 2;\nconsole.log(coins);", filename: "square-seal.js",
        choices: ["5", "3", "2", "6"], correct: 0,
        hint: "Start with the stored amount, then add the newly collected coins before reading it.",
        explanation: "3 + 2 = 5. The SQUARE seal stores 5.",
        clue: { shape: "square", label: "SQUARE", symbol: "□", digit: "5" }
      }
    ]
  },
  {
    name: "Code Breaker", title: "Connect the dots. Crack the vault.", badge: "THE FINAL STRETCH",
    description: "Combine code and practical software reasoning. Recover the last seal, then connect the clues.",
    questions: [
      {
        id: "grouped-math", concept: "javascript-parenthesized-arithmetic", category: "JavaScript", difficulty: 3, points: 200,
        prompt: "Parentheses are calculated first. A team has 2 starter keys and finds 3 more, then doubles the total. What is printed?",
        code: "let keys = (2 + 3) * 2;\nconsole.log(keys);", filename: "keys.js",
        choices: ["10", "8", "7", "12"], correct: 0,
        hint: "Work inside the parentheses first. Multiply the result, not just the last number.",
        explanation: "The sum inside parentheses is 5. Multiplying that whole result by 2 gives 10."
      },
      {
        id: "class-style", concept: "css-class-selector-matching", category: "HTML/CSS", difficulty: 3, points: 200,
        prompt: "In CSS, a dot selects an HTML class. Which paragraph becomes green under this rule? Assume no other styles.",
        code: ".notice { color: green; }", filename: "style.css",
        choices: ['<p id="notice">Hi</p>', '<p class="other">Hi</p>', '<p>notice</p>', '<p class="notice">Hi</p>'], correct: 3,
        hint: "Match the selector’s name to a class attribute. Text content and IDs are different things.",
        explanation: 'The dot in .notice matches class="notice". The paragraph with that class receives green text.'
      },
      {
        id: "robot-trace", concept: "logic-signed-movement", category: "Logic", difficulty: 3, points: 200,
        prompt: "A robot starts at position 0. Right adds 1; left subtracts 1. It moves right, right, then left. Where does it finish?",
        code: "START: 0\nMOVES: right → right → left", filename: "robot.route",
        choices: ["0", "2", "1", "−1"], correct: 2,
        hint: "Track the position after each move, rather than counting only the number of moves.",
        explanation: "The positions are 0 → 1 → 2 → 1. The final position is 1."
      },
      {
        id: "circle-seal", concept: "javascript-updated-branch-seal", category: "JavaScript", difficulty: 3, points: 200,
        prompt: "The CIRCLE seal combines arithmetic with a condition. Which digit does this code print? The > sign means ‘greater than’.",
        code: "let power = 3;\npower = power * 2;\nif (power > 5) {\n  console.log(power - 2);\n} else {\n  console.log(0);\n}", filename: "circle-seal.js",
        choices: ["0", "4", "6", "3"], correct: 1,
        hint: "Update power first. Use its new value for the comparison, then calculate only the chosen branch.",
        explanation: "power becomes 6. Since 6 > 5, the first block prints 6 − 2 = 4. The CIRCLE seal stores 4.",
        clue: { shape: "circle", label: "CIRCLE", symbol: "○", digit: "4" }
      },
      {
        id: "both-conditions", concept: "javascript-conjunction", category: "JavaScript", difficulty: 3, points: 200,
        prompt: "The && symbol means BOTH conditions must be true. What does this gate print? >= means ‘at least’.",
        code: 'let age = 18;\nlet hasPass = false;\nif (age >= 18 && hasPass) {\n  console.log("OPEN");\n} else {\n  console.log("WAIT");\n}', filename: "gate.js",
        choices: ["OPEN", "WAIT", "Both words", "Nothing"], correct: 1,
        hint: "Check each condition separately. Passing one test is not enough when both are required.",
        explanation: "The age test is true, but hasPass is false. Both are required, so the else block prints WAIT."
      },
      {
        id: "text-number", concept: "javascript-concatenation-after-calculation", category: "JavaScript", difficulty: 3, points: 200,
        prompt: "Adding two numbers does arithmetic. Adding text to a number joins them. What does this code print?",
        code: 'let label = "Gate ";\nlet number = 2 + 1;\nconsole.log(label + number);', filename: "label.js",
        choices: ["Gate 21", "Gate 2 + 1", "3", "Gate 3"], correct: 3,
        hint: "Calculate and store number before joining it to the label. The label already ends with a space.",
        explanation: "number is calculated as 3 first. Joining it to the text Gate followed by a space produces Gate 3."
      },
      {
        id: "double-plus-one", concept: "logic-two-operation-recurrence", category: "Logic", difficulty: 3, points: 200,
        prompt: "Each next number is made by doubling the previous number, then adding 1. Which number comes next?",
        code: "1 → 3 → 7 → 15 → ?", filename: "core.pattern",
        choices: ["31", "30", "16", "32"], correct: 0,
        hint: "Use the two actions in the stated order on the last number. Check the same rule on an earlier pair.",
        explanation: "15 × 2 = 30, then 30 + 1 = 31. The same rule gives 3 from 1, 7 from 3, and 15 from 7."
      },
      {
        id: "final-vault", concept: "vault-shape-order-assembly", category: "Logic", difficulty: 3, points: 300,
        prompt: "Use your clue notebook. Read the seals in this order: SQUARE, CIRCLE, TRIANGLE. Join their digits without adding them. Which three-digit code opens the vault?",
        code: "VAULT ORDER\n\n  □ SQUARE → ○ CIRCLE → △ TRIANGLE\n\nOne digit per seal. Keep this exact order.", filename: "vault.protocol",
        choices: ["854", "485", "548", "584"], correct: 2, final: true,
        hint: "The recovery order is not the vault order. Match the first shape to its notebook entry, then repeat for the remaining shapes.",
        explanation: "TRIANGLE: the pattern 2, 4, 6 continues to 8. SQUARE: 3 + 2 gives 5. CIRCLE: 3 × 2 gives 6; since 6 > 5, subtracting 2 gives 4. The vault requests SQUARE, CIRCLE, TRIANGLE. Joining 5, 4, and 8 gives the only valid code: 548."
      }
    ]
  }
];

/* Expanded pools: eight Software Engineering and eight Java questions per
 * difficulty, in addition to the eight original, reviewed web/logic questions.
 * Concepts are editorial identifiers: review a new question against these keys
 * to avoid testing the same fact under a different question ID.
 */
const EXTRA_QUESTIONS = [
  [
    {
      id: "se-meaning", concept: "systematic-software-engineering", category: "Software Engineering",
      prompt: "What does software engineering involve?",
      choices: ["Systematically planning, building, testing, and maintaining software", "Only typing code as fast as possible", "Only repairing computer hardware", "Only choosing an app’s name"], correct: 0,
      hint: "Think about the whole journey of creating dependable software, rather than a single activity.",
      explanation: "Software engineering uses a systematic approach across development and maintenance, including understanding needs and checking quality."
    },
    {
      id: "se-requirement-feature", concept: "need-versus-proposed-capability", category: "Software Engineering",
      prompt: "Students need to show their ticket without internet access. A team proposes a ‘Save ticket offline’ button. Which description fits?",
      choices: ["The need is a feature; the button is a bug", "Both describe hardware", "The need is a requirement; the button is a proposed feature that meets it", "The need is source code; the button is a deadline"], correct: 2,
      hint: "Separate what users must be able to achieve from a specific product capability proposed to help them.",
      explanation: "A requirement expresses a need or constraint. A feature is an intended product capability; this button is one way to meet the offline-ticket need."
    },
    {
      id: "se-sdlc", concept: "sdlc-whole-lifecycle", category: "Software Engineering",
      prompt: "What does the Software Development Life Cycle (SDLC) describe?",
      choices: ["The time until a laptop battery runs out", "Only the steps for installing a browser", "Only the moment code is released", "Activities from understanding an idea through development and ongoing maintenance"], correct: 3,
      hint: "A life cycle includes what happens both before and after the first release.",
      explanation: "The SDLC covers software’s life, including planning, analysis, design, implementation, testing, and maintenance. Different processes arrange these activities differently."
    },
    {
      id: "se-planning", concept: "planning-scope-time-resources", category: "Software Engineering",
      prompt: "Before building an event app, a team estimates the available time, people, and project scope. Which activity is this?",
      choices: ["Debugging", "Planning", "Running a test", "Changing a released app"], correct: 1,
      hint: "They are deciding how to organize the work before committing to its details.",
      explanation: "Planning considers scope, resources, feasibility, and timing so the team can organize realistic work."
    },
    {
      id: "se-teamwork", concept: "team-task-ownership-communication", category: "Software Engineering",
      prompt: "Two teammates unknowingly build the same screen while another screen is missing. What would best prevent this?",
      choices: ["Keep everyone’s progress private", "Have everyone edit every file at once", "Agree on task ownership and share progress", "Avoid discussing the project"], correct: 2,
      hint: "The problem is coordination, not typing speed.",
      explanation: "Clear responsibilities and regular communication help teams notice missing work and avoid duplicating effort."
    },
    {
      id: "se-documentation", concept: "documentation-setup-and-decisions", category: "Software Engineering",
      prompt: "A new teammate cannot run the project. Which document would help most?",
      choices: ["A short setup guide with steps and required tools", "An unrelated event poster", "A list of everyone’s favorite colors", "A screenshot with no instructions"], correct: 0,
      hint: "Choose information that another person can follow without guessing.",
      explanation: "Useful documentation explains setup, use, or important decisions. A setup guide lets teammates get started consistently."
    },
    {
      id: "se-version-history", concept: "version-control-history-recovery", category: "Software Engineering",
      prompt: "A change breaks a working page. What is a basic benefit of version control?",
      choices: ["It guarantees code has no bugs", "It replaces all testing", "It prevents anyone from changing code", "It records changes so earlier versions can be compared or restored"], correct: 3,
      hint: "Think of a project history that remembers more than the latest saved file.",
      explanation: "Version control keeps a history of changes. Teams can inspect differences and recover earlier work, but still need testing."
    },
    {
      id: "se-flowchart", concept: "flowchart-decision-branches", category: "Software Engineering",
      prompt: "A flowchart has a diamond labeled ‘Ticket valid?’ with Yes and No arrows. What does this diamond represent?",
      choices: ["A stored image", "A decision that chooses a path", "The end of every possible path", "An instruction to repeat forever"], correct: 1,
      hint: "Notice why two differently labeled arrows leave the same shape.",
      explanation: "A decision checks a condition. Its result determines which outgoing branch to follow."
    },
    {
      id: "java-purpose", concept: "java-language-and-uses", category: "Java",
      prompt: "Which description of Java is accurate?",
      choices: ["A CSS property for text color", "A file format used only for photographs", "A programming language used for many kinds of applications", "Another name for HTML"], correct: 2,
      hint: "Java can express instructions and build programs; it is not a webpage styling rule.",
      explanation: "Java is a programming language used for applications such as desktop tools, services, and mobile software. Java and JavaScript are different languages."
    },
    {
      id: "java-int", concept: "java-int-whole-number", category: "Java",
      prompt: "Which Java declaration naturally stores a whole-number count of 12 students?",
      choices: ["boolean students = 12;", "char students = 12.5;", 'String students = 12;', "int students = 12;"], correct: 3,
      hint: "Choose the type intended for an integer count, with a value that matches that type.",
      explanation: "int stores whole numbers within its range. int students = 12; is a valid declaration for this count."
    },
    {
      id: "java-double", concept: "java-double-fractional-value", category: "Java",
      prompt: "Which Java declaration is suitable for storing a measured distance of 2.5 meters?",
      choices: ["double distance = 2.5;", "int distance = 2.5;", "boolean distance = 2.5;", "char distance = 2.5;"], correct: 0,
      hint: "The measurement includes a fractional part, so it needs a numeric type that can represent one.",
      explanation: "double represents floating-point numbers and can store this fractional value. int cannot directly store 2.5."
    },
    {
      id: "java-char", concept: "java-char-single-quoted-character", category: "Java",
      prompt: "Which Java declaration correctly stores a single letter as a char?",
      choices: ['char grade = "A";', "char grade = 'A';", "char grade = 'AB';", "char grade = true;"], correct: 1,
      hint: "Use the quotation marks for one ordinary character, rather than a whole word or a truth value.",
      explanation: "char grade = 'A'; stores one letter. Double quotes make a String literal, and 'AB' is not a valid char literal."
    },
    {
      id: "java-boolean", concept: "java-boolean-truth-type", category: "Java",
      prompt: "Which Java declaration stores whether a door is open as a true/false value?",
      choices: ['boolean open = "yes";', "boolean open = 1;", "boolean open = true;", "boolean open = 'T';"], correct: 2,
      hint: "Use a truth value, rather than a number or a piece of text.",
      explanation: "A Java boolean stores true or false. The number 1 and the text yes are not boolean literals."
    },
    {
      id: "java-string", concept: "java-string-text-literal", category: "Java",
      prompt: "Which Java declaration correctly stores the text Hello in a String?",
      choices: ["String message = 'Hello';", 'String message = "Hello";', 'int message = "Hello";', 'String message = Hello;'], correct: 1,
      hint: "Text literals use double quotation marks, and Java type names are case-sensitive.",
      explanation: 'String message = "Hello"; uses the String type and a double-quoted text literal. Single quotes are for char literals.'
    },
    {
      id: "java-method-purpose", concept: "java-method-reusable-operation", category: "Java",
      prompt: "An app needs the same greeting in several places. What is a basic reason to put the greeting instructions in a method?",
      choices: ["To reuse a named operation without copying its instructions everywhere", "To turn every number into text", "To remove the need for variables", "To make the greeting run without ever being called"], correct: 0,
      hint: "Think about keeping repeated work in one place that can be called again.",
      explanation: "A method groups an operation under a name so it can be called and reused. Merely defining it does not call it."
    },
    {
      id: "java-class-object", concept: "java-class-blueprint-object-instance", category: "Java",
      prompt: "A Java class describes a Student. What is an object created from that class?",
      choices: ["The spelling of the class name", "A comment about all students", "A replacement for the Java language", "A particular Student instance with its own state"], correct: 3,
      hint: "Separate the general description from a particular thing made from it.",
      explanation: "A class defines a type’s structure and behavior. An object is an instance, such as one student with that student’s data."
    }
  ],
  [
    {
      id: "se-requirement-types", concept: "functional-versus-quality-requirement", category: "Software Engineering",
      prompt: "A ticket app must (1) let users download a ticket and (2) load its ticket page within two seconds under a stated test load. Which classification fits?",
      choices: ["Both describe code syntax", "1 is functional behavior; 2 is a non-functional performance requirement", "1 is performance; 2 is functional behavior", "Neither can be checked"], correct: 1,
      hint: "One states what the app must do; the other sets a measurable quality constraint on how it performs.",
      explanation: "Downloading is an observable function. A response-time target is a non-functional performance requirement, measured under specified conditions."
    },
    {
      id: "se-analysis", concept: "analysis-clarify-stakeholder-needs", category: "Software Engineering",
      prompt: "An organizer asks for ‘easy registration.’ Before choosing screens, the team interviews students to learn what information and steps they need. Which phase is this?",
      choices: ["Implementation", "Maintenance", "Analysis of requirements", "Final release"], correct: 2,
      hint: "The team is clarifying the problem and users’ needs, not yet deciding the solution’s structure.",
      explanation: "Requirements analysis clarifies needs, constraints, and ambiguities with stakeholders before committing to a design."
    },
    {
      id: "se-design", concept: "design-solution-structure-before-code", category: "Software Engineering",
      prompt: "Requirements are agreed. The team sketches screens and decides how the parts of the app will connect before writing code. Which activity is this?",
      choices: ["Design", "Reproducing a bug", "Monitoring a released app", "Deleting old test results"], correct: 0,
      hint: "They are turning known needs into a plan for the solution’s structure.",
      explanation: "Design describes how a solution will be organized, including interfaces and components. Implementation then turns that design into code."
    },
    {
      id: "se-implementation", concept: "implementation-turn-design-into-code", category: "Software Engineering",
      prompt: "A developer turns an agreed registration-screen design into working program instructions. Which development activity is this?",
      choices: ["Planning the budget", "Gathering initial needs", "Archiving the project", "Implementation"], correct: 3,
      hint: "The design is now being built rather than merely discussed or checked.",
      explanation: "Implementation creates the software, typically by writing and integrating code according to the design."
    },
    {
      id: "se-testing-purpose", concept: "testing-find-mismatches-not-proof", category: "Software Engineering",
      prompt: "Why should a team test its app before releasing it?",
      choices: ["Passing a few tests proves no bugs exist", "To check expected behavior and find problems", "Testing makes requirements unnecessary", "Testing automatically fixes every error"], correct: 1,
      hint: "Checking behavior can reveal a problem, but a check does not repair it or prove that every possible case works.",
      explanation: "Testing evaluates behavior against expectations and can expose defects. Passing tests does not prove that software has no bugs."
    },
    {
      id: "se-maintenance", concept: "maintenance-post-release-adaptation", category: "Software Engineering",
      prompt: "A released campus app must adapt because the university changes its registration rules next semester. What is this work called?",
      choices: ["Only initial planning", "Only drawing a flowchart", "Maintenance", "Abandoning requirements"], correct: 2,
      hint: "Software can need changes after people have started using it, even when the original version worked as intended.",
      explanation: "Maintenance includes adapting released software to changed needs or environments, as well as fixing defects and improving it."
    },
    {
      id: "se-waterfall", concept: "waterfall-sequential-phase-model", category: "Software Engineering",
      prompt: "Which plan most closely describes a basic Waterfall approach?",
      choices: ["Move through planned phases such as requirements, design, implementation, and testing in sequence", "Write random features without requirements", "Release after every keystroke", "Skip design and testing entirely"], correct: 0,
      hint: "Its name suggests a flow through stages. Focus on how the work is organized, not whether it is good or bad.",
      explanation: "A basic Waterfall model organizes development into sequential phases. Real projects may still revisit earlier work when problems arise."
    },
    {
      id: "se-boundary-testing", concept: "test-boundary-around-threshold", category: "Software Engineering",
      prompt: "A signup rule accepts ages 18 and above. Which small set best checks mistakes at the acceptance boundary?",
      choices: ["30, 40, 50", "1, 2, 3", "18, 18, 18", "17, 18, 19"], correct: 3,
      hint: "Check values immediately below, at, and above the point where the result should change.",
      explanation: "17 should fail, while 18 and 19 should pass. Values around the threshold expose common boundary mistakes."
    },
    {
      id: "java-println", concept: "java-println-line-breaks", category: "Java",
      prompt: "System.out.println prints its value and ends the line. What is the output of these two statements?",
      code: 'System.out.println("Hi");\nSystem.out.println("Team");', filename: "Greeting.java",
      choices: ["HiTeam on one line", "Hi on one line, then Team on the next", "Team only", "No output"], correct: 1,
      hint: "Follow the statements in order and account for what each call does after printing its text.",
      explanation: "The first println prints Hi and ends its line. The second prints Team on a new line."
    },
    {
      id: "java-int-division", concept: "java-integer-division-truncation", category: "Java",
      prompt: "Both values are Java ints. Integer division discards the fractional part. What number is printed?",
      code: "int pieces = 7;\nSystem.out.println(pieces / 2);", filename: "Share.java",
      choices: ["3.5", "4", "14", "3"], correct: 3,
      hint: "Work out the division, then use the stated rule for a result whose operands are both integers.",
      explanation: "7 divided by 2 is 3 with a remainder. With int operands, Java’s integer division gives 3."
    },
    {
      id: "java-remainder", concept: "java-remainder-operator", category: "Java",
      prompt: "The % operator gives the remainder after division. What does this Java code print?",
      code: "System.out.println(11 % 4);", filename: "Remainder.java",
      choices: ["3", "2", "4", "2.75"], correct: 0,
      hint: "Remove as many complete groups of the divisor as you can. Count what remains.",
      explanation: "Two complete groups of 4 use 8 of the 11 items. The remainder is 11 − 8 = 3."
    },
    {
      id: "java-branch-after", concept: "java-branch-versus-following-statement", category: "Java",
      prompt: "Only one if/else branch runs. A statement after the whole if/else still runs. Which two words are printed, in order?",
      code: 'int seats = 0;\nif (seats > 0) {\n  System.out.println("Book");\n} else {\n  System.out.println("Full");\n}\nSystem.out.println("Done");', filename: "Booking.java",
      choices: ["Book, Done", "Full only", "Full, Done", "Book, Full"], correct: 2,
      hint: "Choose the branch using the stored value, then look for instructions outside both branch blocks.",
      explanation: "0 > 0 is false, so the else branch prints Full. The statement after the if/else then prints Done."
    },
    {
      id: "java-for-total", concept: "java-for-counted-accumulation", category: "Java",
      prompt: "i++ increases i by 1. What total is printed after this Java for loop?",
      code: "int total = 0;\nfor (int i = 0; i < 3; i++) {\n  total = total + i;\n}\nSystem.out.println(total);", filename: "Total.java",
      choices: ["6", "0", "2", "3"], correct: 3,
      hint: "List the values of i that satisfy the condition. Add only those values to the running total.",
      explanation: "The loop visits i = 0, 1, 2. Adding those values gives 3; i = 3 does not enter the loop."
    },
    {
      id: "java-while-countdown", concept: "java-while-stop-and-update", category: "Java",
      prompt: "A while loop checks its condition before each repetition. Which numbers does this code print?",
      code: "int n = 3;\nwhile (n > 0) {\n  System.out.println(n);\n  n = n - 1;\n}", filename: "Countdown.java",
      choices: ["3, 2, 1 on separate lines", "3, 2, 1, 0 on separate lines", "3 forever", "2, 1 on separate lines"], correct: 0,
      hint: "Notice whether the print comes before the update, and whether zero passes the loop condition.",
      explanation: "The loop prints 3, then 2, then 1. After the next decrement n is 0, which fails n > 0."
    },
    {
      id: "java-array-index", concept: "java-zero-based-array-element", category: "Java",
      prompt: "Java array indices start at zero. Which word is printed?",
      code: 'String[] colors = {"Red", "Blue", "Gold"};\nSystem.out.println(colors[1]);', filename: "Colors.java",
      choices: ["Red", "Blue", "Gold", "1"], correct: 1,
      hint: "Count positions beginning with zero rather than one.",
      explanation: "Red has index 0, Blue has index 1, and Gold has index 2. The expression colors[1] reads Blue."
    },
    {
      id: "java-semicolon", concept: "java-missing-statement-terminator", category: "Java", syntaxError: true,
      prompt: "This Java snippet intentionally contains a syntax error. What must be added at the end of its first line?",
      code: "int score = 4\nSystem.out.println(score);", filename: "Broken.java",
      choices: ["A colon :", "A comma ,", "A semicolon ;", "A second equals sign ="], correct: 2,
      hint: "Java declarations are statements. They need a punctuation mark that terminates the statement.",
      explanation: "The first line must be int score = 4; with a semicolon. Without it, this snippet does not compile."
    }
  ],
  [
    {
      id: "se-agile-feedback", concept: "agile-iterative-feedback-adaptation", category: "Software Engineering",
      prompt: "Students’ needs are likely to change after they try an app. Which plan best fits an introductory Agile approach?",
      choices: ["Reject all feedback after the first meeting", "Finish every planned feature before showing any working software", "Avoid agreeing on any goal", "Deliver small working improvements, collect feedback, and adapt"], correct: 3,
      hint: "Choose a process with short learning cycles and room to respond to new information.",
      explanation: "Agile favors frequent working software and collaboration to adapt to change. It still benefits from planning, design, testing, and documentation."
    },
    {
      id: "se-regression", concept: "regression-check-after-fix", category: "Software Engineering",
      prompt: "A team fixes coupon handling. What is the best next check before release?",
      choices: ["Check the coupon case and rerun related checks for ordinary checkout", "Test only a different app", "Assume any fix improves every feature", "Delete the test that found the problem"], correct: 0,
      hint: "A change can fix one case while accidentally affecting behavior that worked before.",
      explanation: "Confirm the original defect is fixed, then run relevant regression checks to detect unwanted effects on existing behavior."
    },
    {
      id: "se-debug-vs-test", concept: "debug-locate-cause-after-test-failure", category: "Software Engineering",
      prompt: "A repeatable test shows that a basket with two items is counted as three. Which action is debugging rather than merely reporting the failed test?",
      choices: ["Record that the result was three", "Locate the faulty counting instruction and correct it", "Repeat the expected answer in a report", "List the test’s input values"], correct: 1,
      hint: "Finding a mismatch and finding its cause are different tasks.",
      explanation: "The test exposes incorrect behavior. Debugging investigates its cause and changes the faulty instructions. The fix should then be tested."
    },
    {
      id: "se-merge-conflict", concept: "version-control-reconcile-concurrent-edits", category: "Software Engineering",
      prompt: "Two teammates change the same line differently. Version control asks them to resolve the conflict. What should they do?",
      choices: ["Always discard the older teammate’s work", "Delete both versions without reading them", "Compare both intended changes, agree on the combined result, and test it", "Keep whichever line is longer"], correct: 2,
      hint: "A tool cannot always infer what two people meant. Understanding both changes matters.",
      explanation: "Conflict resolution requires reviewing the competing changes and preserving the intended behavior. The resolved version needs checking."
    },
    {
      id: "se-measurable-requirement", concept: "requirements-verifiable-acceptance-target", category: "Software Engineering",
      prompt: "An organizer says the app must be ‘fast.’ Which clarification produces the most testable requirement?",
      choices: ["Open the schedule within two seconds with 100 simulated users on the agreed test setup", "Make it feel wonderful", "Use the team’s favorite color", "Say it is fast in the app’s title"], correct: 0,
      hint: "A good check needs an observable result, a measurable limit, and stated conditions.",
      explanation: "A time limit and a defined load/setup give a repeatable acceptance target. The vague word fast alone does not specify a pass/fail criterion."
    },
    {
      id: "se-accessibility-scenario", concept: "requirements-test-keyboard-access", category: "Software Engineering",
      prompt: "A requirement says registration must work using only a keyboard. Mouse clicks work, but Tab never reaches Submit. Which conclusion is justified?",
      choices: ["The requirement is met because the mouse works", "Keyboard access is a feature that must be removed", "There is no way to test this", "There is a defect against the keyboard-access requirement"], correct: 3,
      hint: "Compare the observed behavior with the stated user requirement, not only the path that succeeds.",
      explanation: "A successful mouse path does not satisfy a keyboard-access requirement. The missing keyboard route is a defect that should be corrected and retested."
    },
    {
      id: "se-integration", concept: "test-component-interaction", category: "Software Engineering",
      prompt: "A ticket generator works alone and an email sender works alone, but users receive an empty attachment when they are connected. Which test targets the problem best?",
      choices: ["Check only the logo’s color", "Generate a ticket and pass its actual result through the email sender", "Test the generator alone again with no sender", "Count the number of source files"], correct: 1,
      hint: "The failure appears where two parts exchange information.",
      explanation: "Testing the parts together checks their interaction, often called integration testing. Separate checks can miss a mismatch at the connection."
    },
    {
      id: "se-priority", concept: "defect-priority-by-user-impact", category: "Software Engineering",
      prompt: "Before an event, the team can fix one issue: signup always loses submitted data, or a decorative icon is slightly off-center. Both take the same time. What is the stronger priority?",
      choices: ["The icon, because all defects have equal impact", "Neither, because the app opens", "The lost signup data, because it prevents the core task", "Choose without considering user impact"], correct: 2,
      hint: "Consider which issue stops users achieving the purpose of the app.",
      explanation: "Losing every signup breaks the core task and has greater user impact than this purely decorative alignment issue."
    },
    {
      id: "java-equals", concept: "java-assignment-versus-numeric-comparison", category: "Java", syntaxError: true,
      prompt: "This Java snippet intentionally misuses assignment in an if condition. Which operator should replace the single = to compare two ints?",
      code: 'int count = 3;\nif (count = 3) {\n  System.out.println("Match");\n}', filename: "Compare.java",
      choices: ["+", "!=", "=", "=="], correct: 3,
      hint: "Storing a value and asking whether two numeric values are equal use different operators.",
      explanation: "= assigns a value. == compares numeric values and yields a boolean. Here count = 3 yields an int, which is not a valid if condition."
    },
    {
      id: "java-method-return", concept: "java-method-argument-return-composition", category: "Java", fullProgram: true,
      prompt: "A method returns a result to its caller. What number does this complete Java program print?",
      code: "class Main {\n  static int twice(int n) {\n    return n * 2;\n  }\n  public static void main(String[] args) {\n    System.out.println(twice(3) + 1);\n  }\n}", filename: "Main.java",
      choices: ["7", "6", "8", "3"], correct: 0,
      hint: "Evaluate the method using its argument, return that value, then finish the caller’s expression.",
      explanation: "The argument makes n equal to 3, so twice returns 6. The caller then adds 1 and prints 7."
    },
    {
      id: "java-object-state", concept: "java-independent-instance-fields", category: "Java", fullProgram: true,
      prompt: "These are ordinary instance fields, not shared static fields. What does this complete Java program print?",
      code: "class Main {\n  int points;\n  public static void main(String[] args) {\n    Main a = new Main();\n    Main b = new Main();\n    a.points = 3;\n    b.points = 7;\n    System.out.println(a.points);\n  }\n}", filename: "Main.java",
      choices: ["7", "3", "10", "0"], correct: 1,
      hint: "Two new expressions create two separate objects. Track which object owns each field assignment.",
      explanation: "Each object has its own points field. Updating b.points does not change a.points, so the output is 3."
    },
    {
      id: "java-filtered-total", concept: "java-array-loop-conditional-sum", category: "Java",
      prompt: "The loop visits each array value once. Only values greater than 2 are added. What is printed?",
      code: "int[] values = {1, 3, 4};\nint total = 0;\nfor (int value : values) {\n  if (value > 2) {\n    total = total + value;\n  }\n}\nSystem.out.println(total);", filename: "SelectedTotal.java",
      choices: ["8", "3", "7", "4"], correct: 2,
      hint: "Evaluate the condition for each element before adding it. A skipped value contributes nothing.",
      explanation: "1 fails the condition; 3 and 4 pass. The total is 3 + 4 = 7."
    },
    {
      id: "java-while-even", concept: "java-while-remainder-count", category: "Java",
      prompt: "% gives a remainder, so n % 2 == 0 detects an even number. How many even numbers does this loop count?",
      code: "int n = 1;\nint count = 0;\nwhile (n <= 4) {\n  if (n % 2 == 0) {\n    count++;\n  }\n  n++;\n}\nSystem.out.println(count);", filename: "EvenCount.java",
      choices: ["4", "1", "3", "2"], correct: 3,
      hint: "List the visited numbers, then count the ones passing the remainder test. count++ adds one.",
      explanation: "The visited values are 1, 2, 3, and 4. Only 2 and 4 are even, so count becomes 2."
    },
    {
      id: "java-value-copy", concept: "java-primitive-copy-before-array-change", category: "Java",
      prompt: "An int variable stores a copy of a number. What is printed after the array is changed?",
      code: "int[] numbers = {2, 5};\nint saved = numbers[0];\nnumbers[0] = 8;\nSystem.out.println(saved);", filename: "SavedValue.java",
      choices: ["2", "8", "5", "0"], correct: 0,
      hint: "The saved variable holds the earlier numeric value, not a live link to an array position.",
      explanation: "saved receives the int value 2 before the update. Changing numbers[0] later does not change that stored copy."
    },
    {
      id: "java-last-element", concept: "java-array-length-last-index", category: "Java",
      prompt: "An array’s length is its element count. Which number does this code print using its last valid index?",
      code: "int[] keys = {2, 4, 6};\nint last = keys.length - 1;\nSystem.out.println(keys[last]);", filename: "LastKey.java",
      choices: ["3", "6", "4", "2"], correct: 1,
      hint: "Find the element count, subtract one to get an index, then read the value at that position.",
      explanation: "The length is 3, so last is index 2. keys[2] is the last value, 6."
    },
    {
      id: "java-array-update", concept: "java-loop-mutates-array-elements", category: "Java",
      prompt: "This loop stores an updated value back into each array position. What number is printed after the loop?",
      code: "int[] marks = {1, 2, 3};\nfor (int i = 0; i < marks.length; i++) {\n  marks[i] = marks[i] * 2;\n}\nSystem.out.println(marks[1]);", filename: "DoubleMarks.java",
      choices: ["2", "6", "4", "8"], correct: 2,
      hint: "Track the array’s contents as the loop updates each position, then use the requested zero-based index.",
      explanation: "The array becomes {2, 4, 6}. Its element at index 1 is 4."
    }
  ]
];

LEVELS.forEach((level, index) => {
  level.questions.push(...EXTRA_QUESTIONS[index].map(question => ({ ...question, difficulty: index + 1, points: 100 + index * 50 })));
});

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
  const ids = new Set();
  const concepts = new Set();
  const prompts = new Set();
  levels.forEach((level, index) => level.questions.forEach(question => {
    if (!question.id || ids.has(question.id)) throw new Error(`Duplicate or missing question ID: ${question.id || "(empty)"}.`);
    if (!question.concept || concepts.has(question.concept)) throw new Error(`Duplicate or missing concept: ${question.concept || question.id}.`);
    if (!CATEGORIES.includes(question.category)) throw new Error(`Unknown category for ${question.id}.`);
    if (![question.prompt, question.hint, question.explanation].every(text => typeof text === "string" && text.trim())) throw new Error(`Missing question text for ${question.id}.`);
    const prompt = question.prompt.trim().toLowerCase();
    if (prompts.has(prompt)) throw new Error(`Duplicate question wording: ${question.id}.`);
    if (!Array.isArray(question.choices) || question.choices.length !== 4 || !question.choices.every(choice => typeof choice === "string" && choice.trim()) || new Set(question.choices.map(choice => choice.trim().toLowerCase())).size !== 4) throw new Error(`Question ${question.id} needs four distinct choices.`);
    if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) throw new Error(`Invalid correct choice for ${question.id}.`);
    const expectedPoints = question.final ? 300 : 100 + index * 50;
    if (question.difficulty !== index + 1 || question.points !== expectedPoints) throw new Error(`Invalid difficulty or points for ${question.id}.`);
    if (question.final && index !== levels.length - 1) throw new Error("The final vault must belong to the last level.");
    ids.add(question.id);
    concepts.add(question.concept);
    prompts.add(prompt);
  }));
}

/* A shuffled backtracking pass avoids adjacent identical subjects, including
 * level boundaries. The final vault is intentionally pinned after its clues.
 */
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
  log("Beginner protocol ready.");
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
    questionManagementError("No unused question is available for this slot. A repeated question was blocked. Restart after checking the bank.");
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
  state.phase = "error";
  $("question-title").textContent = "Question bank needs attention.";
  $("question-category").textContent = "SESSION STOPPED";
  $("question-code").textContent = "";
  $("code-panel").hidden = true;
  $("answer-grid").replaceChildren();
  $("feedback").className = "feedback error";
  $("feedback").textContent = message;
  $("feedback").hidden = false;
  $("hint-panel").hidden = true;
  $("hint-button").disabled = true;
  $("submit-button").disabled = true;
  $("next-button").hidden = true;
  $("start-banner").hidden = true;
  $("start-button").disabled = true;
  log("Question selection stopped safely.");
  renderRoute();
  renderClues();
  updateDashboard();
}

function log(message) {
  state.logs.unshift({ at: clock(CONFIG.durationSeconds - state.remaining), message });
  state.logs = state.logs.slice(0, 3);
  $("activity-log").replaceChildren(...state.logs.map(entry => {
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.textContent = entry.at;
    li.append(time, document.createTextNode(entry.message));
    return li;
  }));
}

function updateDashboard() {
  $("timer").textContent = clock(state.remaining);
  $("timer").setAttribute("aria-label", `${Math.floor(state.remaining / 60)} minutes ${state.remaining % 60} seconds remaining`);
  $("timer").closest(".stat").classList.toggle("urgent", state.remaining <= 120);
  $("timer-state").textContent = { ready: "STANDBY", playing: "LIVE", won: "UNLOCKED", lost: "OFFLINE", error: "BANK ERROR" }[state.phase];
  $("score").textContent = score().toLocaleString();
  $("hints-left").textContent = CONFIG.hintLimit - state.hintsUsed;
  $("best-score").textContent = best ? `${best.score.toLocaleString()} PTS` : "—";
  $("best-time").textContent = best ? `in ${completionTime(best.elapsedMs)}` : "Score first. Time breaks ties.";
  $("progress-label").textContent = `${state.responses.length} / ${TOTAL_QUESTIONS}`;
  $("progress-bar").setAttribute("aria-valuenow", state.responses.length);
  $("progress-fill").style.width = `${state.responses.length / TOTAL_QUESTIONS * 100}%`;
  $("vault-status").textContent = { ready: "AWAITING PLAYER", playing: currentQuestion()?.final ? "FINAL KEY REQUIRED" : `LEVEL 0${levelIndex() + 1} ACTIVE`, won: "ACCESS GRANTED", lost: "VAULT SEALED", error: "QUESTION BANK ERROR" }[state.phase];
  $("vault-detail").textContent = state.phase === "ready" ? "Three levels stand between you and the key." : state.phase === "won" ? "You found your breakthrough." : state.phase === "error" ? "Selection stopped. No question was repeated." : state.phase === "lost" ? "A fresh mission is one restart away." : `${state.responses.length} / ${TOTAL_QUESTIONS} questions answered · ${state.clues.size} / 3 seals found`;
}

function renderRoute() {
  $("level-list").replaceChildren(...LEVELS.map((level, index) => {
    const li = document.createElement("li");
    const complete = state.responses.length >= (index + 1) * CONFIG.questionsPerLevel;
    const active = index === levelIndex() && !complete;
    li.className = `level-item ${complete ? "completed" : active ? "active" : "locked"}`;
    if (active) li.setAttribute("aria-current", "step");
    // Fixed, trusted level data; player answers are always rendered with textContent.
    li.innerHTML = `<span class="level-number">${complete ? "✓" : `0${index + 1}`}</span><div><h3>${level.name}</h3><p>${index === 0 ? "Logic & web basics" : index === 1 ? "Your first code snippets" : "Connect the clues"}</p><span class="level-state">${complete ? "LEVEL COMPLETE" : active ? state.phase === "ready" ? "READY TO START" : "CURRENT LEVEL" : "LOCKED"}</span></div>`;
    return li;
  }));
  const offset = levelIndex() * CONFIG.questionsPerLevel;
  $("question-progress").replaceChildren(...state.sessionQuestions.slice(offset, offset + CONFIG.questionsPerLevel).map((question, index) => {
    const li = document.createElement("li");
    const absoluteIndex = offset + index;
    const response = state.responses[absoluteIndex];
    li.className = response ? response.correct ? "done" : "missed" : absoluteIndex === state.index ? "current" : "";
    li.textContent = response ? response.correct ? "✓" : "·" : String(index + 1).padStart(2, "0");
    li.setAttribute("aria-label", `Question ${index + 1}: ${response ? response.correct ? "correct" : "incorrect" : absoluteIndex === state.index ? "current" : "locked"}`);
    if (absoluteIndex === state.index) li.setAttribute("aria-current", "step");
    return li;
  }));
}

function renderClues() {
  $("clue-list").replaceChildren(...[
    { shape: "triangle", label: "TRIANGLE", symbol: "△" },
    { shape: "square", label: "SQUARE", symbol: "□" },
    { shape: "circle", label: "CIRCLE", symbol: "○" }
  ].map(seal => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    const digit = document.createElement("strong");
    label.textContent = `${seal.symbol} ${seal.label}`;
    digit.textContent = state.clues.get(seal.shape)?.digit ?? "?";
    li.className = state.clues.has(seal.shape) ? "recovered" : "";
    li.append(label, digit);
    return li;
  }));
}

function renderQuestion(focus = false) {
  const question = currentQuestion();
  const level = LEVELS[levelIndex()];
  document.body.dataset.level = levelIndex() + 1;
  $("level-kicker").textContent = `LEVEL 0${levelIndex() + 1} / ${level.name.toUpperCase()}`;
  $("level-title").textContent = level.title;
  $("level-badge").textContent = level.badge;
  $("level-description").textContent = level.description;
  $("question-category").textContent = question.category;
  $("question-number").textContent = `${String(state.index + 1).padStart(2, "0")} / ${TOTAL_QUESTIONS}`;
  $("question-difficulty").textContent = `DIFFICULTY ${question.difficulty} / 3`;
  $("question-points").textContent = `+${question.points} PTS`;
  $("question-title").textContent = question.prompt;
  $("code-panel").hidden = !question.code;
  $("code-filename").textContent = question.filename ?? "";
  $("question-code").textContent = question.code ?? "";
  $("answer-grid").replaceChildren(...question.choices.map((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-card";
    button.dataset.choice = index;
    button.setAttribute("aria-pressed", "false");
    const key = document.createElement("span");
    key.className = "answer-key";
    key.textContent = LETTERS[index];
    key.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "answer-text";
    text.textContent = choice; // HTML choices stay literal text, never markup.
    const marker = document.createElement("span");
    marker.className = "answer-marker";
    marker.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-label", `${LETTERS[index]}: ${choice}`);
    button.append(key, text, marker);
    button.addEventListener("click", () => selectAnswer(index));
    return button;
  }));
  $("feedback").hidden = true;
  $("feedback").textContent = "";
  $("hint-panel").hidden = true;
  $("hint-text").textContent = "";
  $("next-button").hidden = true;
  $("submit-button").hidden = false;
  $("start-banner").hidden = state.phase !== "ready";
  renderRoute();
  renderClues();
  syncControls();
  if (focus) $("question-title").focus({ preventScroll: true });
}

function syncControls() {
  const answered = Boolean(state.responses[state.index]);
  const active = state.phase === "playing" && !answered;
  [...$("answer-grid").children].forEach(button => { button.disabled = !active; });
  $("submit-button").disabled = !active || state.selected === null;
  const usedHere = state.hinted.has(currentQuestion().id);
  $("hint-button").disabled = !active || usedHere || state.hintsUsed >= CONFIG.hintLimit;
  $("hint-button").textContent = usedHere ? "◇ Hint used" : state.hintsUsed >= CONFIG.hintLimit ? "◇ No hints left" : `◇ Use a hint · −${CONFIG.hintCost} pts`;
  $("next-button").disabled = !answered && state.phase === "playing";
}

function startMission() {
  if (state.phase !== "ready") return;
  state.phase = "playing";
  state.startedAt = Date.now();
  state.deadline = state.startedAt + CONFIG.durationSeconds * 1000;
  timerHandle = setInterval(tick, 200);
  $("start-banner").hidden = true;
  log("Mission started. Your clock is live.");
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
  if (state.remaining === 0) endMission(false, "Time ran out. Your discoveries still count as practice. Start a fresh mission and try again.", true);
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
  if (state.phase !== "playing" || state.responses[state.index] || state.selected === null) return;
  tick();
  if (state.phase !== "playing") return;
  const question = currentQuestion();
  const correct = state.selected === question.correct;
  // Lock the response before awarding points: repeated submissions cannot score.
  state.responses.push({ id: question.id, choice: state.selected, correct });
  if (correct) state.earnedPoints += question.points;
  if (question.clue) {
    state.clues.set(question.clue.shape, { ...question.clue });
    log(`${question.clue.label} seal recovered.`);
  } else log(correct ? `Question ${state.index + 1} cleared. +${question.points} points.` : `Question ${state.index + 1}: lesson learned.`);
  [...$("answer-grid").children].forEach((button, index) => {
    const isCorrect = index === question.correct;
    button.classList.toggle("correct", isCorrect);
    button.classList.toggle("incorrect", !correct && index === state.selected);
    button.querySelector(".answer-marker").textContent = isCorrect ? "✓" : !correct && index === state.selected ? "×" : "";
    button.setAttribute("aria-label", `${LETTERS[index]}: ${question.choices[index]}${isCorrect ? ", correct answer" : index === state.selected ? ", your incorrect answer" : ""}`);
  });
  const feedback = $("feedback");
  feedback.className = `feedback ${correct ? "success" : "error"}`;
  feedback.textContent = `${correct ? `Correct! +${question.points} points.` : `Not quite. No points earned. Correct answer: ${LETTERS[question.correct]}.`} ${question.explanation}`;
  feedback.hidden = false;
  $("submit-button").hidden = true;
  $("next-button").hidden = false;
  $("next-button").textContent = question.final ? "View results →" : (state.index + 1) % CONFIG.questionsPerLevel === 0 ? "Unlock next level →" : "Next question →";
  renderClues();
  renderRoute();
  if (question.final) endMission(correct, correct ? "Twenty-four questions. Three recovered seals. One vault, unlocked by you." : "That key didn’t fit. You reached the vault; take what you’ve learned into your next mission.");
  syncControls();
  updateDashboard();
  $("next-button").focus({ preventScroll: true });
}

function nextQuestion() {
  if (state.phase === "won" || state.phase === "lost") { showResults(); return; }
  if (state.phase !== "playing" || !state.responses[state.index]) return;
  tick();
  if (state.phase !== "playing") return;
  const previousLevel = levelIndex();
  if (!showQuestionAt(state.index + 1, true)) return;
  if (levelIndex() !== previousLevel) log(`${LEVELS[levelIndex()].name} level unlocked.`);
  updateDashboard();
}

function useHint() {
  const question = currentQuestion();
  if (state.phase !== "playing" || state.responses[state.index] || state.hinted.has(question.id) || state.hintsUsed >= CONFIG.hintLimit) return;
  tick();
  if (state.phase !== "playing") return;
  state.hinted.add(question.id);
  state.hintsUsed += 1;
  $("hint-text").textContent = `${question.hint} (75-point score adjustment, including future earnings.)`;
  $("hint-panel").hidden = false;
  log("Hint used. −75 points from total earnings.");
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
        recordMessage = "New personal best! Saved to this browser.";
      } catch { recordMessage = "New personal best! Storage is unavailable; kept for this visit."; }
    } else recordMessage = "Personal best is ranked by score, then by faster completion time.";
  } else recordMessage = "Only an unlocked vault qualifies for the personal best.";
  log(won ? "Vault unlocked. Mission complete." : "Mission ended. New attempt available.");
  syncControls();
  updateDashboard();
  document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
  if (timedOut) {
    $("next-button").hidden = false;
    $("next-button").textContent = "View results →";
    showResults();
  }
}

function showResults() {
  if (state.phase !== "won" && state.phase !== "lost") return;
  const won = state.phase === "won";
  $("result-symbol").textContent = won ? "↗" : "×";
  $("result-kicker").textContent = won ? "VAULT PROTOCOL COMPLETE" : "MISSION ENDED";
  $("result-title").textContent = won ? "Your breakthrough moment." : "The next try is yours.";
  $("result-description").textContent = state.resultReason;
  $("result-score").textContent = score().toLocaleString();
  $("result-time").textContent = completionTime(state.elapsedMs);
  const correctCount = state.responses.filter(response => response.correct).length;
  $("result-breakdown").textContent = `${correctCount}/${TOTAL_QUESTIONS} correct · ${state.earnedPoints} earned − ${state.hintsUsed * CONFIG.hintCost} hint points · minimum score 0`;
  $("record-message").textContent = recordMessage;
  $("vault-explanation").hidden = !state.responses.some(response => response.id === "final-vault");
  $("vault-explanation-text").textContent = $("vault-explanation").hidden ? "" : state.sessionQuestions.find(question => question.final).explanation;
  if (!$("result-dialog").open) $("result-dialog").showModal();
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
init();
