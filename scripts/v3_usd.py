"""BetterAlt v3 (18 Oct 2026): USD becomes the primary currency.
USD prices below were read from each vendor's own page (US locale / currency switch, US pricing URL,
or the vendor's help/docs page) on 2026-10-18. Nothing is converted. The previous local (India) price
is kept as a secondary 'india' line with its own source and date. Run from repo root."""
import json, re
D = "2026-10-18"
db = json.load(open("src/data/db.json"))
T = {t["slug"]: t for t in db["tools"]}

USD = {  # slug: (summary, fromUsdMonthly, hasFreePlan, sourceUrl)
"chatgpt": ("Free plan; Go $8/mo, Plus $20/mo, Pro from $100/mo", 8, True, "https://developers.openai.com/codex/pricing"),
"gemini": ("Free with a Google Account; Google AI Plus $4.99/mo, AI Pro $19.99/mo, AI Ultra from $99.99/mo", 4.99, True, "https://gemini.google/subscriptions/?hl=en&gl=us"),
"grok": ("Free plan; Plus $8/mo, Premium $30/mo, Super $100/mo, Ultra $200/mo (annual: $7, $25, $84, $167/mo)", 7, True, "https://docs.x.ai/x-subscription/pricing"),
"poe": ("Free plan; paid subscriptions from $4.99/mo", 4.99, True, "https://help.poe.com/hc/en-us/articles/19945140063636-Poe-Purchases-FAQs"),
"adobe-firefly": ("Free to start; Firefly Standard US$9.99/mo, Firefly Pro US$19.99/mo", 9.99, True, "https://www.adobe.com/products/firefly/plans.html?country=US"),
"adobe-express": ("Free plan; Premium US$9.99/mo", 9.99, True, "https://www.adobe.com/express/pricing?country=US"),
"adobe-photoshop": ("Photoshop US$22.99/mo (annual plan, billed monthly); Firefly Pro with Photoshop web & mobile US$19.99/mo", 22.99, False, "https://www.adobe.com/products/photoshop/plans.html?country=US"),
"coda": ("Free plan; Pro $12/mo, Business $33/mo per Doc Maker", 12, True, "https://coda.io/pricing"),
"grammarly": ("Free plan; Pro $12/member/mo billed annually ($144/yr) or $30 monthly", 12, True, "https://support.grammarly.com/hc/en-us/articles/115000090011-How-much-does-Grammarly-Pro-cost"),
"prowritingaid": ("Free plan; Premium $30/mo monthly or $120/yr billed yearly", 10, True, "https://prowritingaid.com/pricing"),
"canva": ("Free plan; Pro US$144/yr, Business US$250/yr per person", 12, True, "https://www.canva.com/en_us/pricing/"),
"pitch": ("Free plan; Plus $10/mo, Team $15/mo, Business $20/mo", 10, True, "https://pitch.com/pricing"),
"microsoft-excel": ("Free Excel on the web; Microsoft 365 Personal $99.99/yr, Family $129.99/yr", None, True, "https://www.microsoft.com/en-us/microsoft-365/excel"),
"microsoft-word": ("Free Word on the web; Microsoft 365 Personal $99.99/yr, Family $129.99/yr", None, True, "https://www.microsoft.com/en-us/microsoft-365/word"),
"microsoft-powerpoint": ("Free PowerPoint on the web; Microsoft 365 Personal $99.99/yr, Family $129.99/yr", None, True, "https://www.microsoft.com/en-us/microsoft-365/powerpoint"),
"google-sheets": ("Free with a Google account; Workspace Business Starter $7/user/mo (annual plan) or $8.40 (flexible)", 7, True, "https://knowledge.workspace.google.com/admin/getting-started/editions/business-editions"),
"google-docs": ("Usable with any Google Account; Workspace Business Starter $7/user/mo (annual plan) or $8.40 (flexible)", 7, True, "https://knowledge.workspace.google.com/admin/getting-started/editions/business-editions"),
"shopify-magic": ("Included free with Shopify plans; Shopify Basic $29/mo billed yearly ($39 monthly)", 29, True, "https://www.shopify.com/pricing"),
"framer": ("Free plan; Basic $10/mo, Pro $30/mo (billed yearly)", 10, True, "https://www.framer.com/pricing"),
"mailchimp": ("Free under 250 contacts; Essentials from $13.24/mo ($6.62/mo for the first 12 months)", 13.24, True, "https://mailchimp.com/pricing/marketing/?currency=USD"),
}
# Non-USD only (vendor page showed no USD price to us)
LOCAL_ONLY = {"tldv": ("EUR", "Free plan; Pro €18/seat/mo billed annually (€29 monthly); Business €29/seat/mo billed annually (€39 monthly)", "https://tldv.io/app/pricing/"),
              "n8n": ("EUR", None, None), "aiva": ("EUR", None, None)}

def cur(s):
    if not s: return None
    if "₹" in s: return "INR"
    if "€" in s: return "EUR"
    if "$" in s: return "USD"
    return None

n_usd_new = n_india = 0
for t in db["tools"]:
    p = t["pricing"]
    p.pop("india", None)
    s = t["slug"]
    if s in USD:
        old = dict(p)
        summ, usd, free, src = USD[s]
        if cur(old.get("summary")) == "INR":
            p["india"] = {"summary": old["summary"], "sourceUrl": old["sourceUrl"], "lastChecked": old["lastChecked"]}
            n_india += 1
        p.update({"summary": summ, "fromUsdMonthly": usd, "hasFreePlan": free, "verified": True, "sourceUrl": src, "lastChecked": D})
        n_usd_new += 1
    elif s in LOCAL_ONLY and LOCAL_ONLY[s][1]:
        old = dict(p)
        c, summ, src = LOCAL_ONLY[s]
        if cur(old.get("summary")) == "INR":
            p["india"] = {"summary": old["summary"], "sourceUrl": old["sourceUrl"], "lastChecked": old["lastChecked"]}
            n_india += 1
        p.update({"summary": summ, "sourceUrl": src, "lastChecked": D, "verified": True})
    p["currency"] = cur(p.get("summary"))
    # fromUsdMonthly is only meaningful for USD summaries
    if p["currency"] not in ("USD", None): p["fromUsdMonthly"] = None

json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)
ts = db["tools"]
priced = [t for t in ts if t["pricing"]["summary"]]
usd = [t for t in priced if t["pricing"]["currency"] == "USD"]
nonusd = [t["slug"] + ":" + t["pricing"]["currency"] for t in priced if t["pricing"]["currency"] not in ("USD", None)]
nocur = [t["slug"] for t in priced if t["pricing"]["currency"] is None]
print("tools", len(ts), "priced", len(priced), "USD-primary", len(usd), "india-secondary", sum(1 for t in ts if t["pricing"].get("india")),
      "\nnon-USD only", nonusd, "\nno currency (free/OSS/no number)", len(nocur), nocur,
      "\nsee pricing", [t["slug"] for t in ts if not t["pricing"]["summary"]])
