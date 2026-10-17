"""v7 (18 Oct 2026): fixes found by the publishing gate, Draco and Hermione (data-issues.md).
Every price below was re-read from the stored deterministic snapshot data/snapshots/{slug}/2026-10-18*.txt;
every licence from data/snapshots/{slug}/license-2026-10-18.txt (GitHub API licence field + LICENSE file)."""
import json, sys
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
def tags(slug, add=(), drop=()):
    t = T[slug]; t["tags"] = [x for x in t["tags"] if x not in drop] + [x for x in add if x not in t["tags"]]

# ---- licence taxonomy ---------------------------------------------------------------------------------------
OSI = {  # slug: (SPDX, note)
  "ollama": ("MIT", None), "librechat": ("MIT", None), "cline": ("Apache-2.0", None), "continue": ("Apache-2.0", None),
  "aider": ("Apache-2.0", None), "bolt-diy": ("MIT", None), "stable-diffusion-webui": ("AGPL-3.0", None), "comfyui": ("GPL-3.0", None),
  "coqui-tts": ("MPL-2.0", None), "piper": ("MIT", None), "appflowy": ("AGPL-3.0", None), "languagetool": ("LGPL-2.1", None),
  "huginn": ("MIT", None), "penpot": ("MPL-2.0", None), "whisper": ("MIT", None), "kdenlive": ("GPL-3.0", None),
  "presenton": ("Apache-2.0", None), "audiocraft": ("MIT", None), "sillytavern": ("AGPL-3.0", None), "gemini-cli": ("Apache-2.0", None),
  "opencode": ("MIT", None), "openhands": ("MIT", None), "logseq": ("AGPL-3.0", None), "listmonk": ("AGPL-3.0", None), "plane": ("AGPL-3.0", None),
  "jan": ("Apache-2.0", "Apache-2.0; attribution is requested, not required"),
  "zed": ("GPL-3.0-or-later", "Editor GPL-3.0-or-later; collaboration server AGPL-3.0; GPUI framework Apache-2.0"),
  "dyad": ("Apache-2.0", "Apache-2.0 except src/pro/, which has its own licence"),
  "activepieces": ("MIT", "MIT core; packages/ee and the server's ee folder are under a commercial licence"),
  "windmill": ("AGPL-3.0", "AGPLv3 core, Apache-2.0 clients; some enterprise features are proprietary"),
  "flowise": ("Apache-2.0", "Apache-2.0 except packages/server/src/enterprise"),
  "chatwoot": ("MIT", "MIT except the enterprise/ folder"),
  "cap": ("AGPL-3.0", "AGPLv3; the cap-camera and scap crates are MIT"),
  "mautic": ("GPL-3.0", None),
  "gimp": ("GPL-3.0-or-later", "GPLv3 or later (COPYING in the official GNOME mirror)"),
  "krita": ("GPL-3.0", None),
}
NON = {  # slug: (type, licence name, note)
  "n8n": ("fair-code", "Sustainable Use License", "Fair-code: free to self-host for internal use; .ee files need an n8n Enterprise License. Not OSI-approved."),
  "nocodb": ("fair-code", "Sustainable Use License", "Sustainable Use License (licence file dated 29 January 2026). Not OSI-approved."),
  "open-webui": ("source-available", "Open WebUI License", "BSD-3-Clause terms plus a clause that forbids removing Open WebUI branding. Not OSI-approved."),
  "dify": ("source-available", "Dify Open Source License (modified Apache-2.0)", "Apache-2.0 plus limits on multi-tenant use and on removing the logo. Not OSI-approved."),
  "affine": ("source-available", "MIT (client) + AFFiNE EE License (server)", "Client code is MIT, but packages/backend (the server you self-host) is under the AFFiNE Enterprise Edition licence."),
}
MIRRORS = {"gimp": ("https://github.com/GNOME/gimp", 6521, "2026-10-17"), "krita": ("https://github.com/KDE/krita", 10572, "2026-10-17")}
for s, (repo, stars, push) in MIRRORS.items():
    T[s]["openSource"] = {"repo": repo, "stars": stars, "license": "", "licenseType": "open-source", "archived": False, "lastPush": push, "setupDifficulty": None}
for s, (lic, note) in OSI.items():
    o = T[s]["openSource"]; o["license"] = lic; o["licenseType"] = "open-source"
    if note: o["licenseNote"] = note
    tags(s, add=["open source"], drop=["source-available", "fair-code"])
for s, (typ, lic, note) in NON.items():
    o = T[s]["openSource"]; o["license"] = lic; o["licenseType"] = typ; o["licenseNote"] = note
    tags(s, add=[typ], drop=["open source"])
# DeepSeek: the listing is the hosted chat app + API; the open part is the model weights.
tags("deepseek", drop=["open source"])
T["deepseek"]["notes"]["summary"] = "This listing covers DeepSeek's hosted chat app and API. DeepSeek also publishes open-weight models, which are a separate thing you run yourself."
left = [t["slug"] for t in db["tools"] if t["openSource"] and "licenseType" not in t["openSource"]]
assert not left, left
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False); print("licences ok")

# ---- prices, plans, billing basis and tags (each re-read from the 18 Oct 2026 snapshot) -------------------------
def P(slug, **kw):
    p = T[slug]["pricing"]
    for k, v in kw.items():
        if v is None: p.pop(k, None)
        else: p[k] = v
def unverify(slug, why):
    p = T[slug]["pricing"]
    for k in ("summary", "fromUsdMonthly", "hasFreePlan", "currency", "fromBilling", "india", "extraSources"): p.pop(k, None) if k in ("india", "extraSources", "fromBilling") else p.__setitem__(k, None)
    p["verified"] = False; p["unverifiedNote"] = why
# no deterministic snapshot can confirm these from the vendor page today
unverify("replit", "replit.com/pricing returns HTTP 403 to our checker, so the price and the free-plan question can't be confirmed")
unverify("make", "make.com/en/pricing shows a Cloudflare bot check instead of prices")
unverify("tabnine", "tabnine.com/pricing now redirects to a Tricentis contact form; no public price list")
unverify("capcut", "capcut.com is not reachable from our checker (HTTP 451)")
unverify("quizlet", "quizlet.com/upgrade returns HTTP 403 to our checker")
for s in ("kindroid", "replika", "talkie"): unverify(s, "the vendor site publishes no price list outside the app")
unverify("gorgias", "gorgias.com/pricing no longer shows prices in the page text")
unverify("manus", "manus.im/pricing renders prices as animated digits our checker can't read")
unverify("mailchimp", "mailchimp.com/pricing shows promotional amounts only, split across elements; the regular price isn't readable")
unverify("dify", "dify.ai/pricing renders prices as animated digits our checker can't read")

P("ollama", summary="Free (run models locally); Pro $20/mo or $200/yr ($16.67/mo billed annually); Max $100/mo; Team $500/mo (early access)", fromUsdMonthly=20, fromBilling="monthly")
tags("ollama", add=["freemium"], drop=["free"])
P("chatgpt", summary="Free plan; Go $8/mo, Plus $20/mo; Pro 100 $100/mo, Pro 200 $200/mo, Pro 500 $500/mo (all billed monthly)")
P("cursor", summary="Free plan; Plus $8/mo (Grok models only); Premium $30/mo; Super $100/mo; Ultra $200/mo; Teams from $30/user/mo")
T["cursor"]["notes"]["summary"] = ("Cursor's pricing page says subscriptions are sold only through X Subscription Corp (the site footer reads Anysphere, Inc.). "
    "Plus includes Grok models only; Premium and above include Grok usage, and third-party models are billed at API list price.")
P("windsurf", summary="Free plan; Pro $20/mo; Max $200/mo; Teams $80/mo plus $40/mo per full user", fromUsdMonthly=20, fromBilling="monthly")
P("v0", summary="Free plan; Plus $30 or $90/user/mo; Business $100/user/mo", fromUsdMonthly=30, fromBilling="monthly")
P("zapier", fromBilling="unknown")  # page shows "Starting from $19.99/month" without saying which billing period
P("pipedream", summary="Free plan (development only); Startup $99/mo billed annually or $150/mo billed monthly", fromUsdMonthly=99, fromBilling="annual", currency="USD", hasFreePlan=True)
T["pipedream"]["description"] = "Platform for building integrations into your product: free while you build, paid when integrations run in production."
tags("pipedream", add=["freemium"])
P("mistral-le-chat", summary="Free plan; Pro $14.99/mo excl. taxes (includes Vibe for coding); Team $24.99/user/mo excl. taxes")
P("base44", summary="Free plan; Starter $16/mo, Builder $40/mo, Pro $80/mo, Elite $160/mo (billed annually)", fromUsdMonthly=16, fromBilling="annual")
P("murf", summary="Falcon API $0.01 per 1,000 characters; $10 free credit for API calls", fromUsdMonthly=None, fromBilling="unknown", hasFreePlan=False)
T["murf"]["pricing"]["fromUsdMonthly"] = None
tags("murf", add=["paid"], drop=["freemium", "free"])
P("d-id", summary="Free trial; Lite $4.70/mo billed annually ($56/yr); Pro $16/mo billed annually ($191/yr); Advanced $108/mo billed annually", fromUsdMonthly=4.7, fromBilling="annual")
P("kling", summary="Daily free credits; Standard $6.99 first month, then $8.80/mo; Pro $25.99 first month, then $32.56/mo", fromUsdMonthly=8.8, fromBilling="monthly")
P("otter", summary="Free Basic plan; Pro $16.99/user/mo billed monthly or $8.33/user/mo billed annually; Business $30/user/mo monthly or $19.99/user/mo annually", fromUsdMonthly=8.33, fromBilling="annual")
P("julius", summary="Free plan; Plus $20/mo; Pro $45/mo; Business $450/mo", fromUsdMonthly=20, fromBilling="monthly")
P("pixlr", summary="Free; Plus $2.49/mo; Premium $9.99/mo; Team from $24.99/mo", fromUsdMonthly=2.49, fromBilling="unknown")
P("wolfram-alpha", summary="Free; Pro $5/mo billed annually ($60/yr); Pro Premium $8.25/mo billed annually ($99/yr)", fromUsdMonthly=5, fromBilling="annual")
P("riverside", summary="Free plan; Pro $24/mo billed annually ($288/yr) or $29 monthly; Grow $34/mo billed annually ($408/yr) or $39 monthly", fromUsdMonthly=24, fromBilling="annual")
P("penpot", summary="Free (cloud or self-host); Unlimited $7/editor/mo (capped at $175/mo); Enterprise $25/member/mo", fromBilling="monthly")
tags("penpot", add=["freemium"], drop=["free"])
P("beehiiv", summary="Free plan; Lite $49/mo", fromUsdMonthly=49, fromBilling="unknown")
P("intercom-fin", summary="Fin AI Agent $0.99 per outcome; helpdesk seats from $29/seat/mo", fromUsdMonthly=29, fromBilling="unknown")
P("canva", fromBilling="annual")
P("nomi", fromBilling="annual"); P("khanmigo", fromBilling="annual")
# INR-primary: the vendor serves only INR prices to our checker, so the India price is the verified one (labelled as INR)
def inr_primary(slug, summary, has_free):
    P(slug, summary=summary, currency="INR", fromUsdMonthly=None, india=None, hasFreePlan=has_free, fromBilling="annual" if "billed annually" in summary or "billed yearly" in summary else "monthly")
inr_primary("coda", "Free plan; Pro ₹983/Doc Maker/mo billed annually (₹1,250 billed monthly); Business ₹2,700/Doc Maker/mo billed annually (₹3,299 billed monthly)", True)
inr_primary("prowritingaid", "Premium ₹550/mo billed yearly (₹6,600/yr) or ₹1,650/mo billed monthly; Premium Pro ₹660/mo billed yearly (₹7,920/yr) or ₹1,980/mo billed monthly", False)
tags("prowritingaid", add=["paid"], drop=["freemium", "free"])
inr_primary("shopify-magic", "Included with Shopify plans; Shopify Basic ₹1,800/mo billed yearly (₹1,994/mo billed monthly)", False)
tags("shopify-magic", add=["paid"], drop=["free", "freemium"])
inr_primary("tldv", "Free plan; Pro ₹1,715/seat/mo, Business ₹2,499/seat/mo (billed annually)", True)
P("microsoft-excel", india=None)
# billing basis where the summary has amounts but none was set (from the summary's own wording)
for s, b in {"flux": "unknown", "resemble": "monthly", "languagetool": "monthly", "quillbot": "annual", "n8n": "annual", "windmill": "unknown",
             "kittl": "annual", "luma": "monthly", "veed": "annual", "gamma": "annual", "aiva": "annual", "character-ai": "annual",
             "microsoft-excel": "annual", "zendesk": "annual", "microsoft-word": "annual", "microsoft-powerpoint": "annual", "brevo": "monthly"}.items():
    T[s]["pricing"]["fromBilling"] = b
P("veed", summary="Free plan; Creator ₹490/user/mo billed yearly (₹5,874/yr); Pro ₹1,068/user/mo billed yearly (₹12,818/yr)", hasFreePlan=True)
tags("veed", add=["freemium"])
# tags must agree with plans
for s in ("dyad", "obsidian", "flowise"): tags(s, add=["freemium"], drop=["free"])
for s in ("openrouter", "resemble", "notion-ai", "clickup-brain", "colossyan", "microsoft-excel"): tags(s, add=["freemium"])
tags("n8n", add=["freemium"], drop=["paid"])
for s in ("ideogram", "copy-ai", "hemingway", "luma", "productboard"): tags(s, add=["paid"], drop=["freemium"])

# ---- /changes: the only entry was our own correction, not a vendor move -----------------------------------------
c = next(x for x in db["changes"] if x["id"] == "2026-10-18-shopify-magic")
c.update(type="correction", kind="correction", old="Shopify Basic ₹1,499/mo", new="Shopify Basic ₹1,800/mo billed yearly",
         evidence={"before": None, "after": "data/snapshots/shopify-magic/2026-10-18.txt",
                   "note": "Our first entry (commit 3af2b84, 18 Oct 2026) stored ₹1,499 with no snapshot. Today shopify.com/pricing still shows ₹1,499 in its static HTML (data/snapshots/shopify-magic/2026-10-18.static-html.txt) but ₹1,800 billed yearly on the rendered page people see (2026-10-18.txt). There's no evidence Shopify changed the price, so this is a correction to our data, not a vendor price change."})
for x in db["changes"]: assert x.get("type") in ("vendor_change", "correction")
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False); print("prices ok")
