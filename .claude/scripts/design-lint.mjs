#!/usr/bin/env node
// Детерминированный детектор дизайн-анти-паттернов. Без LLM, без внешних зависимостей.
import fs from "node:fs";
import path from "node:path";

const RULES = [
  {
    name: "forbidden-font",
    test: /\b(Inter|Arial)\b/,
    hint: "запрещённый шрифт (AI-slop), см docs/design.md",
    level: "ERROR",
  },
  {
    name: "purple-blue-gradient",
    test: /from-purple-\d.*to-blue-\d|from-blue-\d.*to-purple-\d/,
    hint: "фиолетово-синий градиент — маркер AI-slop",
    level: "ERROR",
  },
  {
    name: "gray-text-on-color-bg",
    test: (line) =>
      /text-gray-\d00/.test(line) &&
      /bg-(red|blue|green|purple|indigo)-[5-9]00/.test(line),
    hint: "серый текст на цветном фоне, контраст < 4.5:1",
    level: "ERROR",
  },
  {
    name: "side-border-decor",
    test: /border-l-4|border-r-4/,
    hint: "боковая полоска-бордюр как декор",
    level: "ERROR",
  },
  {
    name: "bounce-elastic-easing",
    test: /animate-bounce|ease-elastic/,
    hint: "bounce/elastic easing запрещён",
    level: "ERROR",
  },
  {
    name: "small-touch-target",
    test: /\b(h-[1-4])\s+(w-[1-4])\b/,
    hint: "возможный тач-таргет < 44px",
    level: "ERROR",
  },
  {
    name: "too-round-corners",
    // rounded-full исключён: круглые элементы (аватары, иконки-кнопки, pill) — намеренны
    test: /rounded-\[(1[7-9]|[2-9]\d)px\]|rounded-3xl/,
    hint: "радиус > 16px — слишком круглые углы",
    level: "ERROR",
  },
  {
    name: "price-without-division",
    test: (line) =>
      /[Pp]rice\}/.test(line) && !/\/\s*100/.test(line) && !/toFixed/.test(line),
    hint: "цена может выводиться в копейках без /100",
    level: "WARNING",
  },
  {
    name: "transition-all",
    test: /transition:\s*all\b/,
    hint: "transition: all — указывай конкретное свойство (transform/opacity)",
    level: "ERROR",
  },
  {
    name: "ease-in-on-ui",
    test: /\bease-in\b(?!-out)/,
    hint: "ease-in на UI тормозит начало — используй ease-out",
    level: "ERROR",
  },
  {
    name: "animate-layout-prop",
    test: (line) =>
      /transition|animate/.test(line) && /\b(width|height|margin|padding)\b.*\d/.test(line),
    hint: "анимация width/height/margin/padding грузит layout — только transform/opacity",
    level: "WARNING",
  },
  {
    name: "scale-from-zero",
    test: /scale\(0\)|scale-0\b/,
    hint: "не появляться из нуля — scale(0.95)+opacity",
    level: "ERROR",
  },
];

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const findings = [];

  lines.forEach((line, idx) => {
    for (const rule of RULES) {
      const matched = typeof rule.test === "function" ? rule.test(line) : rule.test.test(line);
      if (matched) {
        findings.push({
          file: filePath,
          line: idx + 1,
          rule: rule.name,
          hint: rule.hint,
          level: rule.level,
        });
      }
    }
  });

  return findings;
}

function walkDir(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      results.push(...walkDir(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function collectFiles(args) {
  if (args.length > 0) return args;

  const files = [];
  for (const dir of ["client/src", "admin/src"]) {
    files.push(...walkDir(dir, [".tsx"]));
  }
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const files = collectFiles(args);

  let total = 0;
  const filesWithFindings = new Set();

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const findings = lintFile(file);
    for (const f of findings) {
      console.log(`${f.file}:${f.line} — ${f.hint} [${f.level}]`);
      total += 1;
      filesWithFindings.add(f.file);
    }
  }

  console.log("");
  if (total === 0) {
    console.log("Проблем не обнаружено.");
  } else {
    console.log(`${total} проблем в ${filesWithFindings.size} файлах`);
  }

  process.exit(0);
}

main();
