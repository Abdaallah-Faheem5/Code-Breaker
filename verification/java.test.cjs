/* Optional compiler validation: requires a JDK on PATH.
 * Run: node verification/java.test.cjs
 * Game players do not need Java or any installed dependency.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const context = vm.createContext({});
// Evaluate only the catalog, before UI configuration and startup.
vm.runInContext(source.slice(0, source.indexOf("const CONFIG =")), context);
const bank = JSON.parse(vm.runInContext("JSON.stringify(LEVELS.flatMap(level => level.questions))", context));
const java = bank.filter(question => question.category === "Java");
const expected = {
  "java-println": "Hi\nTeam", "java-int-division": "3", "java-remainder": "3",
  "java-branch-after": "Full\nDone", "java-for-total": "3", "java-while-countdown": "3\n2\n1",
  "java-array-index": "Blue", "java-semicolon": "4", "java-equals": "Match",
  "java-method-return": "7", "java-object-state": "3", "java-filtered-total": "7",
  "java-while-even": "2", "java-value-copy": "2", "java-last-element": "6", "java-array-update": "4"
};
const tempBase = path.resolve(os.tmpdir());
const scratch = fs.mkdtempSync(path.join(tempBase, "code-breaker-java-"));
function javaExecutable(name) {
  const candidate = process.env.JAVA_HOME && path.join(process.env.JAVA_HOME, "bin", name + (process.platform === "win32" ? ".exe" : ""));
  return candidate && fs.existsSync(candidate) ? candidate : name;
}
const compiler = javaExecutable("javac");
const runtime = javaExecutable("java");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 30000, windowsHide: true });
  if (result.error) throw result.error;
  return result;
}
function program(name, code, fullProgram = false) {
  return fullProgram ? code.replace(/\bMain\b/g, name) : `class ${name} {\n  public static void main(String[] args) {\n${code}\n  }\n}\n`;
}

try {
  const programs = [];
  let rejected = 0;
  for (const question of java.filter(question => question.code)) {
    const name = `Check${programs.length}`;
    let code = question.code;
    if (question.syntaxError) {
      const brokenName = `${name}Broken`;
      const brokenPath = path.join(scratch, `${brokenName}.java`);
      fs.writeFileSync(brokenPath, program(brokenName, code), "utf8");
      const result = run(compiler, ["--release", "8", "-encoding", "UTF-8", brokenPath]);
      assert.notEqual(result.status, 0, `${question.id}: intentional error must be rejected`);
      rejected++;
      if (question.id === "java-semicolon") code = code.replace("int score = 4\n", "int score = 4;\n");
      else if (question.id === "java-equals") code = code.replace("if (count = 3)", "if (count == 3)");
      else throw Error(`No reviewed repair for ${question.id}`);
    }
    const file = path.join(scratch, `${name}.java`);
    fs.writeFileSync(file, program(name, code, question.fullProgram), "utf8");
    programs.push({ name, file, id: question.id, output: expected[question.id] });
  }
  for (const id of ["java-int", "java-double", "java-char", "java-boolean", "java-string"]) {
    const question = java.find(question => question.id === id);
    const name = `Check${programs.length}`;
    const file = path.join(scratch, `${name}.java`);
    fs.writeFileSync(file, program(name, question.choices[question.correct]), "utf8");
    programs.push({ name, file, id, output: "" });
  }
  assert.equal(programs.length, 21);
  assert.equal(rejected, 2);
  const compilation = run(compiler, ["--release", "8", "-encoding", "UTF-8", ...programs.map(item => item.file)]);
  assert.equal(compilation.status, 0, compilation.stderr);
  for (const item of programs) {
    assert.notEqual(item.output, undefined, `Missing independent output for ${item.id}`);
    const execution = run(runtime, ["-cp", scratch, item.name]);
    assert.equal(execution.status, 0, `${item.id}: ${execution.stderr}`);
    assert.equal(execution.stdout.replace(/\r\n/g, "\n").trimEnd(), item.output, item.id);
  }
  console.log("Java validation passed: 16 snippet outputs (including 2 repaired errors), 5 type declarations, and 2 intentionally invalid snippets rejected. All compile as Java 8.");
} finally {
  // Delete only this test's verified, newly created temporary directory.
  const resolved = path.resolve(scratch);
  assert.equal(path.dirname(resolved), tempBase);
  assert.ok(path.basename(resolved).startsWith("code-breaker-java-"));
  fs.rmSync(resolved, { recursive: true, force: true });
}
