"""BetterAlt v5 (18 Oct 2026): data for Neville's UX spec P0 + three data QA fixes.
- db.people: only the two people Roshan confirmed (no photos, no employer)
- editorial reviewedBy (Rosh K site-wide); Kavi R credited only on education pages
- pricing.fromBilling: 'annual' where the starting figure is an annual-billed per-month price (from the vendor
  text already stored in pricing.summary), 'monthly' where the summary has no annual/yearly wording; else unset
- QA: Claude / Claude Code monthly price; ChatGPT USD source; LM Studio tags (all re-read on vendor pages 18 Oct 2026)
- src/data/site.json (SiteConfig)"""
import json, re
D = "2026-10-18"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}

db["people"] = [
  {"slug": "rosh-k", "name": "Rosh K", "role": "product manager, AI enthusiast"},
  {"slug": "kavi-r", "name": "Kavi R", "role": "educator", "firstNameOnly": False},
]
EDU_TOOLS = {"khanmigo", "magicschool", "quizlet", "wolfram-alpha"}
for a in db["anchors"]: a["reviewedBy"] = "rosh-k"
for s in db["saas"]: s["reviewedBy"] = "rosh-k"
for k in db["stacks"]:
    k["reviewedBy"] = "rosh-k"
    if k["slug"] == "chemistry-tutor": k["authors"] = ["kavi-r"]  # education page: Kavi R credited
for t in db["tools"]:
    t.setdefault("notes", {})["reviewedBy"] = "rosh-k"
    if t["slug"] in EDU_TOOLS: t["notes"]["authors"] = ["kavi-r"]

# --- QA fixes (vendor pages, 18 Oct 2026) ---
c = T["claude"]["pricing"]  # claude.com/pricing: "$17 Per month with annual subscription discount ($200 billed up front). $20 if billed monthly."
c.update(summary="Free plan; Pro $20/mo billed monthly ($17/mo billed annually, $200 up front); Max from $100/mo", fromUsdMonthly=20, fromBilling="monthly", lastChecked=D, lastChangedAt=D)
cc = T["claude-code"]["pricing"]
cc.update(summary="Included with Claude Pro: $20/mo billed monthly ($17/mo billed annually); Max from $100/mo", fromUsdMonthly=20, fromBilling="monthly", sourceUrl="https://claude.com/pricing", lastChecked=D, lastChangedAt=D)
g = T["chatgpt"]["pricing"]  # US prices from OpenAI's own pages (openai.com/chatgpt/pricing localises and showed no USD to us)
g.update(summary="Free plan; Go $8/mo, Plus $20/mo, Pro $100, $200 or $500/mo (all billed monthly)", fromUsdMonthly=8, fromBilling="monthly",
         sourceUrl="https://openai.com/index/introducing-chatgpt-go/", extraSources=["https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers"], lastChecked=D, lastChangedAt=D)
lm = T["lm-studio"]  # lmstudio.ai/pricing: Free $0 (local models) + Bionic+ $20 USD/month + Pro $100 USD/month
lm["tags"] = ["freemium", "paid"]
lm["pricing"].update(summary="Free plan ($0, run local models); Bionic+ $20/mo; Pro $100/mo", fromBilling="monthly", hasFreePlan=True, lastChecked=D)

ANNUAL = """perplexity grok replit base44 midjourney ideogram obsidian appflowy clickup-brain jasper copy-ai writesonic grammarly hemingway
wordtune d-id elai runway invideo fireflies read-ai beautiful-ai plus-ai udio mubert google-sheets google-docs airtable julius nocodb freshdesk
magicschool wolfram-alpha cap tella trello adobe-photoshop prowritingaid canva visme kling riverside suno nomi pixlr shopify-magic khanmigo miro framer webflow""".split()
for t in db["tools"]:
    p = t["pricing"]
    if p.get("fromUsdMonthly") is None or (p.get("currency") or "USD") != "USD" or "fromBilling" in p: continue
    if t["slug"] in ANNUAL: p["fromBilling"] = "annual"
    elif not re.search(r"annual|yearly|/yr|year", p["summary"] or "", re.I): p["fromBilling"] = "monthly"
json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)

site = {"brand": "BetterAlt", "url": "https://findbetteralt.com", "email": "hello@findbetteralt.com", "priceTrackingStartedAt": "2026-10-17",
  "githubStatsFetchedAt": "2026-10-17", "staleAfterDays": 30, "recheckSchedule": "on a rolling basis, at least once every 30 days",
  "disclosure": {"affiliate": "Some links may be affiliate links. We may earn a commission at no extra cost to you. It never changes our listings, order or prices.",
                 "pricePolicy": "Prices are in US dollars from each vendor's own pricing page and are never converted. India prices appear only where the vendor publishes them."},
  "disclosures": {"sponsored": "Sponsored placements are paid, always labelled, and never change our order or prices.",
                  "aiAssisted": "Research is AI-assisted and reviewed by the team."},
  "statusLabels": {"renamed": "Renamed", "acquired": "Acquired · no longer maintained", "shut-down": "Shut down"}}

json.dump(site, open("src/data/site.json", "w"), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(t["pricing"].get("fromBilling") for t in db["tools"] if t["pricing"].get("fromUsdMonthly") is not None))

# Cursor re-verified on cursor.com/pricing (18 Oct 2026, US locale): Free $0, Plus $8 (only Grok models), Premium $30,
# Super $100, Ultra $200, Teams $30+/user/month. The X-style tier names are Cursor's own; the old summary missed Ultra/Teams.
db = json.load(open("src/data/db.json"))
for t in db["tools"]:
    if t["slug"] == "cursor":
        t["pricing"].update(summary="Free plan; Plus $8/mo (Grok models only); Premium $30/mo; Super $100/mo; Ultra $200/mo; Teams from $30/user/mo", fromUsdMonthly=8, fromBilling="monthly", lastChecked=D, lastChangedAt=D)
json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)

# Change log: stable ids for /changes#id permalinks + RSS guids; region/currency for the one India change
db = json.load(open("src/data/db.json"))
for c in db["changes"]:
    c.setdefault("id", f"{c['date']}-{c['slug']}")
    if c["slug"] == "shopify-magic": c.update(region="IN", currency="INR", plan="Basic")
json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)
