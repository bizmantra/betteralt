// Tests for the retired-brand / Dell checks (scripts/lib/text-checks.ts). Run: npx tsx scripts/test-text-checks.ts
import assert from "node:assert/strict";
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { brandHits, dellHits, foldText, scanText, BUILD_PATH_SEGMENT } from "./lib/text-checks";
import { safeJson } from "../src/lib/json";
const hasBrand = (s: string) => brandHits(s).length > 0, hasDell = (s: string) => dellHits(s).length > 0;
// retired brand: case, spacing, tags, entities, lookalikes, zero-width
for (const s of ["BetterAlt", "betteralt", "BETTERALT", "Better Alt", "Better-Alt", "better_alt", "Visit betteralts.ai", "Thanks for subscribing to Better<span style=\"color:#4f46e5\">Alt</span>.",
  "Better<span className=\"x\">Alt</span>", "Bеtter Alt" /* Cyrillic е */, "Better\u200bAlt", "Better&#8203;Alt", "Better&nbsp;Alt", "Better\\u200bAlt", "ＢｅｔｔｅｒＡｌｔ", "<b>Better</b> <b>Alt</b>", "Βetter Αlt" /* Greek */])
  assert.ok(hasBrand(s), `should flag: ${JSON.stringify(s)}`);
for (const s of ["FindBetterAlt", "findbetteralt.com", "https://findbetteralt.com/about", "hello@findbetteralt.com", "Find<span>Better</span>Alt", "FindBetter<span class=\"bg-hl\">Alt</span>",
  "a better alternative to Excel", "Better alternatives, honestly compared", "better altitude", "betterment", "FINDBETTERALT"])
  assert.ok(!hasBrand(s), `should not flag: ${JSON.stringify(s)}`);
// Dell
for (const s of ["Dell", "dell", "DELL", "De\u200bll", "Dеll" /* Cyrillic е */, "De&#x200b;ll", "D<i>ell</i>", "De\\u200bll", "Works at Dell Technologies", "ＤＥＬＬ", "Dell's laptops"])
  assert.ok(hasDell(s), `should flag: ${JSON.stringify(s)}`);
for (const s of ["modelling", "Odell", "dellingr", "spindle", "model", "Della", "handelled"]) assert.ok(!hasDell(s), `should not flag: ${JSON.stringify(s)}`);
assert.equal(foldText("A&amp;B <x y=\"1\">c</x>"), "a&b c");
assert.ok(hasBrand('<a href="https://betteralt.com/x">x</a>') && hasDell('<img alt="Dell logo" src="a.png">'), "attribute values are checked too");
// scanText walks text files, skips dirs/files/binaries, and reports relative paths
const d = fs.mkdtempSync(path.join(os.tmpdir(), "textchk-"));
fs.mkdirSync(path.join(d, "src/app/api"), { recursive: true }); fs.mkdirSync(path.join(d, "data/snapshots/x"), { recursive: true }); fs.mkdirSync(path.join(d, "public"));
fs.writeFileSync(path.join(d, "src/app/api/route.ts"), "const html = `<p>Better<span>Alt</span></p>`;");
fs.writeFileSync(path.join(d, "data/notes.json"), JSON.stringify({ x: "De\u200bll" }));
fs.writeFileSync(path.join(d, "data/snapshots/x/2026-10-18.txt"), "Dell BetterAlt (vendor page, excluded)");
fs.writeFileSync(path.join(d, "public/logo.svg"), "<svg><text>betteralt</text></svg>");
fs.writeFileSync(path.join(d, "public/img.png"), "Dell");
fs.writeFileSync(path.join(d, "src/ok.tsx"), "export const x = <a href=\"https://findbetteralt.com\">FindBetterAlt</a>;");
const hits = scanText([path.join(d, "src"), path.join(d, "public"), path.join(d, "data")], d, { skipDirs: ["snapshots"] });
assert.deepEqual(hits.map((h) => `${h.rule}:${h.file}`).sort(), ["no-dell:data/notes.json", "retired-brand:public/logo.svg", "retired-brand:src/app/api/route.ts"]);
fs.rmSync(d, { recursive: true, force: true });
// built-output scan ignores build-machine path segments only
const ig = (t: string) => Math.min(1, brandHits(t.replace(BUILD_PATH_SEGMENT, " ")).length);
assert.equal(ig('"/workspace/betteralt/node_modules/next/dist/x.js"'), 0); assert.equal(ig('"/workspace/betteralt-ro/src/a.ts"'), 0);
assert.equal(ig('<a href="https://betteralt.com/x">'), 1); assert.equal(ig("Welcome to BetterAlt/"), 1);
// JSON-LD escaping
const evil = { name: "</script><script>alert(1)</script>", d: "<!-- x -->", amp: "a&b", ls: "\u2028" };
const out = safeJson(evil);
assert.ok(!/[<>&\u2028\u2029]/.test(out), out); assert.deepEqual(JSON.parse(out), evil, "still valid JSON, same value");
assert.match(out, /\\u003c\/script\\u003e/);
console.log("text-checks: all tests passed");
