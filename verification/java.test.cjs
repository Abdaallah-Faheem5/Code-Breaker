/* Run: node verification/java.test.cjs. No JDK required for these introductory facts. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'questions.js'), 'utf8'), context);
const java = JSON.parse(vm.runInContext('JSON.stringify(LEVELS.flatMap(level => level.questions).filter(q => q.category === "Java"))', context));

// Independent subject reference: expected correct text in both languages.
const expected = {
  'java-purpose': ['A programming language', 'لغة برمجة'],
  'java-println': ['System.out.println("Hi");', 'System.out.println("Hi");'],
  'java-int': ['int', 'int'],
  'java-string': ['String', 'String'],
  'java-boolean': ['true', 'true'],
  'java-semicolon': [';', ';'],
  'java-char': ['char', 'char'],
  'java-double': ['double', 'double'],
  'java-method': ['A named block of instructions', 'مجموعة تعليمات لها اسم']
};
assert.equal(java.length, Object.keys(expected).length);
for (const q of java) {
  const answer = q.choices.find(choice => choice.id === q.correctAnswerId);
  assert.deepEqual([answer.text.en, answer.text.ar], expected[q.id], q.id);
  // Syntax alternatives stay byte-for-byte identical in both languages.
  for (const choice of q.choices) {
    if (/^(?:System\.|(?:int|boolean|String)\s+\w+\s*=)|^(?:int|String|boolean|char|double|true|[;:?#])$/.test(choice.text.en)) assert.equal(choice.text.en, choice.text.ar, q.id);
  }
}
assert.equal(java.find(q => q.id === 'java-semicolon').code.replace('___', ';'), 'int age = 18 ;');
console.log('Java checks passed: 9 introductory answers reviewed in both languages; programming syntax stays unchanged.');
