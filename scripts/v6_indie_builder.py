"""v6 (18 Oct 2026): /stacks/indie-builder. Only tools with verified, USD, active pricing checked 18 Oct 2026.
Roles restate each tool's stored description; no new claims."""
import json
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
items = [
  ("lovable", "Chat-to-app builder for full-stack web apps"),
  ("bolt", "In-browser AI app builder (StackBlitz)"),
  ("v0", "Generate React/Next.js UIs and apps (Vercel)"),
  ("replit", "Browser IDE with an AI agent that builds and deploys"),
  ("cursor", "AI code editor for when you take over the code"),
  ("claude-code", "Agentic coding in the terminal"),
]
for s, _ in items:
    p = T[s]["pricing"]
    assert T[s].get("status", "active") == "active" and p["verified"] and p["currency"] == "USD" and p.get("fromUsdMonthly"), s
db["stacks"] = [k for k in db["stacks"] if k["slug"] != "indie-builder"] + [{
  "slug": "indie-builder",
  "title": "AI stack for an indie builder (vibe coding)",
  "intro": "Tools to go from an idea to a working app by describing it, then keep building in real code.",
  "items": [{"tool": s, "role": r} for s, r in items],
  "firstPublished": "2026-10-18", "contentUpdatedAt": "2026-10-18", "reviewedBy": "rosh-k",
}]
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok")
