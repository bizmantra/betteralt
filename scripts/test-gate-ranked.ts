// Integration test for the stacks/compare ranking gate (scripts/validate-data.ts). Run: npx tsx scripts/test-gate-ranked.ts
// Copies the repo to a temp dir, mutates it, runs the gate offline and checks the exit code.
import assert from "node:assert/strict";
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { spawnSync } from "node:child_process";
const ROOT = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git", ".vercel"]);
function copy(mut: (dir: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gate-ranked-"));
  fs.cpSync(ROOT, dir, { recursive: true, filter: (src) => !SKIP.has(path.basename(src)) || src === ROOT });
  fs.symlinkSync(fs.realpathSync(path.join(ROOT, "node_modules")), path.join(dir, "node_modules"));
  mut(dir); return dir;
}
function gate(dir: string) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "node_modules/tsx/dist/cli.mjs"), "scripts/validate-data.ts"], { cwd: dir, env: { ...process.env, GATE_OFFLINE: "1" }, encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr };
}
const PAGE = "src/app/stacks/[stack]/page.tsx";
// 1) current repo passes
let r = gate(copy(() => {})); assert.equal(r.code, 0, r.out);
// 2) an unverified tool added to a stack still passes: it is listed unranked, not ranked
r = gate(copy((d) => { const f = path.join(d, "src/data/db.json"), db = JSON.parse(fs.readFileSync(f, "utf8")); db.stacks[0].items.splice(1, 0, { tool: "replit", role: "test" }); fs.writeFileSync(f, JSON.stringify(db)); }));
assert.equal(r.code, 0, r.out);
// 3) a stack template that ranks raw items (the pre-fix page) fails the build
r = gate(copy((d) => { const f = path.join(d, PAGE); fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/groupItems\(s\.items, getTool\)/, "{ ranked: s.items.map((it) => ({ it, t: getTool(it.tool)! })), unverified: [], gone: [] }").replace(/import \{ groupItems \} from "@\/lib\/picks";\n/, "")); }));
assert.equal(r.code, 1, r.out); assert.match(r.out, /ranked-list-ungated/);
// 4) a new compare page that numbers raw items fails the build
r = gate(copy((d) => { fs.mkdirSync(path.join(d, "src/app/compare/[pair]"), { recursive: true }); fs.writeFileSync(path.join(d, "src/app/compare/[pair]/page.tsx"), "export default function P({ items }: { items: string[] }) { return <ol>{items.map((x, i) => <li key={x}>{i + 1} {x}</li>)}</ol>; }\n"); }));
assert.equal(r.code, 1, r.out); assert.match(r.out, /ranked-list-ungated/);
console.log("gate-ranked: all tests passed");
