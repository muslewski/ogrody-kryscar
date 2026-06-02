#!/usr/bin/env node
// SessionStart status line. Pure file reads — never spawns the generator.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const INDEX = join(ROOT, "kryscar-mind", "map", "index.md");
const DEBT = join(ROOT, "kryscar-mind", "tech-debt");

let zones = 0;
if (existsSync(INDEX)) {
  const m = readFileSync(INDEX, "utf8").match(/_(\d+) zones/);
  if (m) zones = Number(m[1]);
}
let openDebt = 0;
if (existsSync(DEBT)) {
  for (const f of readdirSync(DEBT)) {
    if (!f.endsWith(".md")) continue;
    if (/^status:\s*open\b/m.test(readFileSync(join(DEBT, f), "utf8"))) openDebt++;
  }
}
console.log(
  `🧠 Mind: ${zones} zones · ${openDebt} open tech-debt — orient via kryscar-mind/map/index.md before coding.`
);
