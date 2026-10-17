/**
 * Deterministic licence evidence: GitHub API licence field + the raw LICENSE file, saved to
 * data/snapshots/{slug}/license-{YYYY-MM-DD}.txt (JSON header line, then the file text). No LLM in this step.
 *   npx tsx scripts/licenses.ts [slug ...]
 */
import fs from "node:fs"; import path from "node:path";
const ROOT = path.resolve(__dirname, ".."), OUT = path.join(ROOT, "data/snapshots");
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
async function main() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/db.json"), "utf8"));
  const only = process.argv.slice(2);
  for (const t of db.tools) {
    const repo: string | undefined = t.openSource?.repo; if (!repo || (only.length && !only.includes(t.slug))) continue;
    const m = repo.match(/github\.com\/([^/]+)\/([^/#?]+)/); if (!m) { console.log("skip (not GitHub)", t.slug, repo); continue; }
    const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}/license`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "betteralt-licence-check" } });
    if (!r.ok) { console.log("FAIL", t.slug, r.status); continue; }
    const j = await r.json();
    const text = Buffer.from(j.content, "base64").toString("utf8");
    const head = { repo, api: `https://api.github.com/repos/${m[1]}/${m[2]}/license`, spdx: j.license?.spdx_id, name: j.license?.name, file: j.html_url, fetchedAt: new Date().toISOString() };
    fs.mkdirSync(path.join(OUT, t.slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, t.slug, `license-${today()}.txt`), `#LICENSE ${JSON.stringify(head)}\n${text}\n`);
    console.log("ok ", t.slug.padEnd(24), String(head.spdx).padEnd(14), head.file);
  }
}
main();
