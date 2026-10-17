"""BetterAlt v4 (18 Oct 2026): SEO week-1 data changes (Ron's spec).
- status / formerNames / statusNote + sources for renamed or acquired tools (verified on vendor sites 18 Oct 2026)
- lastChangedAt per tool: date its displayed price last changed (not the check date)
- firstPublished per tool and contentUpdatedAt per anchor/saas/stack
- merge /ai-alternative-to pages whose toolSlug is an anchor into that anchor (they now 308)
Run from repo root: python3 scripts/v4_seo.py /tmp/db_v1.json"""
import json, sys
D = "2026-10-18"
db = json.load(open("src/data/db.json")); v1 = json.load(open(sys.argv[1]))
V1T = {t["slug"]: t for t in v1["tools"]}; V1A = {a["slug"]: a for a in v1["anchors"]}
V1S = {s["slug"]: s for s in v1["saas"]}; V1K = {s["slug"]: s for s in v1["stacks"]}
T = {t["slug"]: t for t in db["tools"]}
touched_anchor = set()

# --- entity fixes ---
w = T["windsurf"]
w.update(name="Devin Desktop (formerly Windsurf)", url="https://devin.ai",
         description="Cognition's agentic AI IDE, formerly Windsurf, with the Devin Local agent and an Agent Command Center for local and cloud agents.",
         status="renamed", formerNames=["Windsurf"],
         statusNote="Windsurf was renamed Devin Desktop on 2 June 2026. Cognition says plans, pricing, extensions and settings stayed the same.",
         statusSources=["https://devin.ai/blog/windsurf-is-now-devin-desktop", "https://docs.devin.ai/desktop/devin-desktop-faq"])
w["pricing"]["sourceUrl"] = "https://devin.ai/pricing"  # windsurf.com/pricing now 308-redirects here
c = T["continue"]
c.update(status="acquired", statusNote="Continue was acquired by Cursor (June 2026). Its final release was 2.0.0 and the continuedev/continue repository is marked as no longer actively maintained and read-only. The Apache-2.0 code is still available to fork.",
         statusSources=["https://continue.dev/", "https://github.com/continuedev/continue"])
c["pricing"].update(summary="Free and open source (no longer maintained)", sourceUrl="https://continue.dev/", lastChecked=D)
if "discontinued" not in c["tags"]: c["tags"] = c["tags"] + ["discontinued"]
for t in db["tools"]: t.setdefault("status", "active")
GONE = {s for s, t in T.items() if t["status"] in ("acquired", "shut-down")}
for a in db["anchors"]:
    n = [x for x in a["alternatives"] if x not in GONE and not (a["slug"] == "devin" and x == "windsurf")]
    if n != a["alternatives"]: a["alternatives"] = n; touched_anchor.add(a["slug"])
for s in db["saas"]: s["alternatives"] = [x for x in s["alternatives"] if x not in GONE]
for k in db["stacks"]: k["items"] = [i for i in k["items"] if i["tool"] not in GONE]

# --- merge saas pages that duplicate an anchor ---
AN = {a["slug"]: a for a in db["anchors"]}
for s in db["saas"]:
    if s["toolSlug"] in AN:
        a = AN[s["toolSlug"]]; extra = [x for x in s["alternatives"] if x not in a["alternatives"] and x != a["slug"]]
        if extra: a["alternatives"] += extra; touched_anchor.add(a["slug"])
        s["redirectTo"] = f"/alternatives/{a['slug']}"
        print("saas merge", s["slug"], "->", a["slug"], "added", extra)

# --- dates ---
for t in db["tools"]:
    o = V1T.get(t["slug"])
    t["firstPublished"] = o["pricing"]["lastChecked"] if o else t["pricing"]["lastChecked"]
    same = o and o["pricing"]["summary"] == t["pricing"]["summary"] and o["name"] == t["name"]
    t["pricing"]["lastChangedAt"] = o["pricing"]["lastChecked"] if same else max(t["pricing"]["lastChecked"], t["firstPublished"])
    t["contentUpdatedAt"] = t["pricing"]["lastChangedAt"] if same and o["description"] == t["description"] else D if o else t["firstPublished"]
for a in db["anchors"]:
    o = V1A.get(a["slug"])
    a["firstPublished"] = "2026-10-17" if o else D
    a["contentUpdatedAt"] = "2026-10-17" if o and o["alternatives"] == a["alternatives"] and a["slug"] not in touched_anchor else D
for s in db["saas"]:
    o = V1S.get(s["slug"]); s["firstPublished"] = "2026-10-17" if o else D
    s["contentUpdatedAt"] = "2026-10-17" if o and o["alternatives"] == s["alternatives"] else D
for k in db["stacks"]:
    o = V1K.get(k["slug"]); k["firstPublished"] = "2026-10-17" if o else D
    k["contentUpdatedAt"] = "2026-10-17" if o and o["items"] == k["items"] else D

json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)
from collections import Counter
print("tool lastChangedAt", Counter(t["pricing"]["lastChangedAt"] for t in db["tools"]))
print("anchor contentUpdatedAt", Counter(a["contentUpdatedAt"] for a in db["anchors"]), "touched", touched_anchor)
