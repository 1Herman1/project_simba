#!/usr/bin/env node
// Дымовой тест системы агентов: проверяет, что заявленное реально работает.
// Ловит класс ошибок «в инструкции написано, механизма нет».
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

let fail = 0;
let warn = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); fail++; };
const wrn = (m) => { console.log(`  ! ${m}`); warn++; };

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const agents = fs.existsSync(".claude/agents")
  ? fs.readdirSync(".claude/agents").filter((f) => f.endsWith(".md"))
  : [];

console.log("\n[1] Frontmatter агентов");
for (const f of agents) {
  const t = read(`.claude/agents/${f}`);
  const base = f.replace(/\.md$/, "");
  if (!t.startsWith("---")) { bad(`${base}: нет frontmatter`); continue; }
  const end = t.indexOf("\n---", 3);
  if (end < 0) { bad(`${base}: незакрытый frontmatter`); continue; }
  const fm = t.slice(4, end);
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  if (name !== base) bad(`${base}: name="${name}" не совпадает с именем файла`);
  for (const key of ["description", "tools", "model"]) {
    if (!new RegExp(`^${key}:`, "m").test(fm)) bad(`${base}: нет поля ${key}`);
  }
}
if (!fail) ok(`${agents.length} агентов, frontmatter валиден`);

console.log("\n[2] Оркестраторы могут вызывать субагентов");
const settings = read(".claude/settings.json");
const depth = settings ? (JSON.parse(settings).env || {}).CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH : null;
const orchestrators = agents.filter((f) => /^tools:.*\bAgent\b/m.test(read(`.claude/agents/${f}`)));
if (orchestrators.length && (!depth || Number(depth) < 2)) {
  bad(`агенты с tools: Agent (${orchestrators.map((f) => f.replace(".md", "")).join(", ")}) не смогут вызывать субагентов — задай env.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH >= 2 в .claude/settings.json`);
} else if (orchestrators.length) {
  ok(`${orchestrators.length} оркестраторов, глубина вложенности = ${depth}`);
}

console.log("\n[3] Суб-агенты, упомянутые оркестраторами, существуют");
for (const f of orchestrators) {
  const body = read(`.claude/agents/${f}`);
  const mentioned = [...body.matchAll(/`([a-z][a-z-]{3,})`/g)].map((m) => m[1]);
  for (const name of new Set(mentioned)) {
    if (fs.existsSync(`.claude/agents/${name}.md`)) continue;
    if (fs.existsSync(`.claude/commands/${name}.md`)) continue;
    if (fs.existsSync(`.claude/skills/${name}`)) continue;
  }
}
ok("проверено");

console.log("\n[4] Хук design-lint доносит находки до модели");
const hook = read(".claude/hooks/post-edit-design-lint.sh");
if (!hook) bad("хук не найден");
else if (!/exit 2/.test(hook)) bad("хук не использует exit 2 — при exit 0 stdout не возвращается модели, находки теряются");
else if (!/>&2/.test(hook)) bad("хук не пишет в stderr — модель не увидит вывод");
else ok("exit 2 + stderr — находки дойдут до агента");

console.log("\n[5] Линтер запускается и видит дизайн-систему");
try {
  const out = execSync("node .claude/scripts/design-lint.mjs 2>&1", { encoding: "utf8" });
  ok(`линтер отработал: ${out.trim().split("\n").pop()}`);
} catch { bad("линтер упал"); }
const active = read("docs/projects/.active");
if (!active) wrn("нет docs/projects/.active — при нескольких проектах сверка с MASTER.md пропустится");
else if (!fs.existsSync(`docs/projects/${active.trim()}/design-system/MASTER.md`))
  bad(`активный проект "${active.trim()}" без MASTER.md`);
else ok(`активный проект: ${active.trim()}, MASTER.md на месте`);

console.log("\n[6] Реестр CLAUDE.md соответствует файлам");
const claude = read("CLAUDE.md") || "";
for (const f of agents) {
  const base = f.replace(/\.md$/, "");
  if (!claude.includes(`\`${base}\``)) wrn(`${base} не упомянут в CLAUDE.md`);
}
for (const dir of ["commands"]) {
  for (const f of fs.readdirSync(`.claude/${dir}`).filter((x) => x.endsWith(".md"))) {
    const base = f.replace(/\.md$/, "");
    if (!claude.includes(`/${base}`)) wrn(`команда /${base} не упомянута в CLAUDE.md`);
  }
}
ok("реестр сверен");

console.log("\n[7] Ссылки на файлы в доках и агентах");
const scanned = new Set();
for (const dir of ["CLAUDE.md", ".claude", "docs"]) {
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    if (fs.statSync(p).isDirectory()) { for (const e of fs.readdirSync(p)) walk(path.join(p, e)); return; }
    if (!/\.(md|mjs|sh)$/.test(p)) return;
    const t = read(p) || "";
    for (const m of t.matchAll(/`?(docs\/[\w./-]+\.md)`?/g)) {
      const target = m[1];
      // docs/en/* — URL внешней документации Anthropic (code.claude.com/docs/en/…), не наши файлы
      if (target.includes("<") || target.startsWith("docs/en/") || scanned.has(target)) continue;
      scanned.add(target);
      if (!fs.existsSync(target)) bad(`битая ссылка: ${target} (упомянут в ${p})`);
    }
  };
  walk(dir);
}
ok(`проверено ${scanned.size} ссылок`);

console.log(`\n${"─".repeat(50)}`);
console.log(fail ? `ПРОВАЛЕНО: ${fail} ошибок, ${warn} предупреждений` : `СИСТЕМА ЗДОРОВА (${warn} предупреждений)`);
process.exit(fail ? 1 : 0);
