"""BetterAlt v2 data update (18 Oct 2026).
Every price below was read from the vendor's own page (sourceUrl) on 2026-10-18 using a headless
Chrome render (or the vendor's docs/help page). Tools whose price could not be verified keep summary=None
("See pricing"). Run from repo root: python3 scripts/v2_update.py"""
import json
D = "2026-10-18"
db = json.load(open("src/data/db.json"))
tools = {t["slug"]: t for t in db["tools"]}

def pr(summary, usd, free, src):
    return {"summary": summary, "fromUsdMonthly": usd, "hasFreePlan": free, "verified": summary is not None, "sourceUrl": src, "lastChecked": D}

# ---- 1. Retried prices (previously 'See pricing') + ChatGPT/Lovable numbers ----
UPD = {
"chatgpt": ("Free plan; Go ₹399/mo, Plus ₹1,999/mo, Pro from ₹10,699/mo (India pricing)", None, True, "https://openai.com/chatgpt/pricing/"),
"perplexity": ("Free plan; Pro $17/mo, Max $167/mo (billed annually)", 17, True, "https://www.perplexity.ai/pro"),
"grok": ("Free to try; Plus ₹759/mo, Premium ₹3,399/mo, Super ₹11,299/mo (India pricing, excl. intro offers)", None, True, "https://grok.com/plans"),
"lm-studio": ("Free for local models; Bionic+ $20/mo; Pro $100/mo", 20, True, "https://lmstudio.ai/pricing"),
"poe": ("Free plan; paid from ₹4,900/yr (10K points/day); ₹19,900/yr for 660K points/month (India pricing, billed yearly)", None, True, "https://poe.com/subscription_plans"),
"openrouter": ("Free plan with 25+ free models; pay-as-you-go model prices + 5.5% platform fee (Standard)", None, True, "https://openrouter.ai/pricing"),
"replit": ("Core $20/mo ($18/mo billed annually); Pro $100/mo ($90/mo billed annually)", 18, None, "https://replit.com/pricing"),
"lovable": ("Free plan; Pro $25/mo; Business $50/mo (billed monthly)", 25, True, "https://lovable.dev/pricing"),
"midjourney": ("Basic $10/mo ($8/mo billed annually); Standard $30/mo; Pro $60/mo; Mega $120/mo", 8, False, "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans"),
"leonardo": ("Free plan; Essential $12/mo, Premium $30/mo, Ultimate $60/mo (ex. tax)", 12, True, "https://leonardo.ai/pricing"),
"ideogram": ("Pay as you go 1¢/credit; Plus $20/mo ($15/mo billed annually); Pro $60/mo ($42/mo billed annually)", 15, None, "https://ideogram.ai/pricing"),
"adobe-firefly": ("Free to start; Firefly Standard ₹797.68/mo, Firefly Pro ₹1,596.54/mo (incl. GST, India pricing)", None, True, "https://www.adobe.com/products/firefly/plans.html"),
"murf": ("Studio Creator from $19/mo, Business from $66/mo; API pay-as-you-go from $0.01 per 1,000 characters", 19, None, "https://murf.ai/pricing"),
"coda": ("Free plan; Pro ₹983/Doc Maker/mo billed annually (₹1,250 monthly); Team ₹2,700/mo billed annually (India pricing)", None, True, "https://coda.io/pricing"),
"writer": ("Starter plan with a 14-day free trial; price not published (Enterprise: contact sales)", None, False, "https://writer.com/plans/"),
"languagetool": ("Free plan; Premium ₹999/mo monthly or ₹3,499/yr (India pricing)", None, True, "https://languagetool.org/premium"),
"quillbot": ("Free plan; Premium ₹334/mo billed annually (India pricing)", None, True, "https://quillbot.com/premium"),
"prowritingaid": ("Free plan; Premium ₹1,650/mo monthly or ₹550/mo billed yearly (₹6,600/yr, India pricing)", None, True, "https://prowritingaid.com/pricing"),
"hemingway": ("Editor Plus Individual $8.33/mo ($100 billed annually); Individual 10K $12.50/mo ($150 billed annually)", 8.33, None, "https://hemingwayapp.com/hemingway-editor-plus"),
"canva": ("Free plan; Pro Lite ₹1,590/yr, Pro ₹4,000/yr per person (India pricing)", None, True, "https://www.canva.com/pricing/"),
"adobe-express": ("Free plan; Premium ₹797.68/mo incl. GST (India pricing)", None, True, "https://www.adobe.com/express/pricing"),
"microsoft-designer": ("Free with a Microsoft account (personal, non-commercial use); a subscription may be needed for heavier use", None, True, "https://support.microsoft.com/en-us/designer/frequently-asked-questions-about-microsoft-designer"),
"kittl": ("Free plan; Pro ₹800/mo billed annually (₹1,000 monthly), India pricing", None, True, "https://www.kittl.com/pricing"),
"d-id": ("14-day free trial; Lite $5.90/mo ($4.70/mo billed annually); Pro $29/mo ($16/mo billed annually)", 4.7, None, "https://www.d-id.com/pricing/"),
"kling": ("Daily free uses; Standard $8.80/mo (monthly, after first-month offer) or $79.20/yr", 6.6, True, "https://app.klingai.com/global/membership/membership-plan"),
"tldv": ("Free plan; Pro ₹1,715/seat/mo, Business ₹2,499/seat/mo (billed annually, India pricing)", None, True, "https://tldv.io/app/pricing/"),
"veed": ("Creator ₹490/user/mo billed yearly (₹5,874/yr); Pro ₹1,068/user/mo billed yearly (India pricing)", None, True, "https://www.veed.io/pricing"),
"gamma": ("Free plan; Plus ₹400/seat/mo, Pro ₹950/seat/mo (billed annually, India pricing)", None, True, "https://gamma.app/pricing"),
"udio": ("Free plan; Standard $10/mo ($8/mo billed annually); Pro $30/mo ($24/mo billed annually)", 8, True, "https://www.udio.com/pricing"),
"character-ai": ("Free with unlimited messaging; c.ai+ $94.99/yr", None, True, "https://character.ai/subscribe"),
"nomi": ("Free account; paid plan $15.99/mo, $39.99/quarter or $99.99/yr", 8.33, True, "https://nomi.ai/ai-today/replika-vs-nomi-2026-finding-enduring-ai-companionship/"),
"microsoft-excel": ("Free Excel on the web; Microsoft 365 Personal ₹6,899/yr, Family ₹8,199/yr (India pricing)", None, True, "https://www.microsoft.com/en-in/microsoft-365/excel"),
"adobe-photoshop": ("Photoshop ₹733.96/mo incl. GST (annual plan, billed monthly); ₹599/mo first-year offer for new subscribers", None, False, "https://www.adobe.com/products/photoshop/plans.html"),
"photopea": ("Free (ad-supported); Premium removes ads, price shown in the in-app Account window", None, True, "https://www.photopea.com/api/accounts"),
"khanmigo": ("Free for teachers; learners and families $4/mo or $44/yr (+ sales tax)", 3.67, True, "https://www.khanmigo.ai/pricing"),
"productboard": ("No public price: Business via demo request; Enterprise via sales", None, None, "https://www.productboard.com/pricing/"),
# Real price change vs v1 (see CHANGES)
"shopify-magic": ("Included free with Shopify plans; Shopify Basic ₹1,800/mo billed yearly (₹1,994 monthly), India pricing", None, True, "https://www.shopify.com/pricing"),
# Correction: v1 summary did not match the vendor page
"otter": ("Free Basic plan; Pro $8.33/user/mo (currently promoted at $4.17); Business $19.99/user/mo", 8.33, True, "https://otter.ai/pricing"),
}
for s, (summ, usd, free, src) in UPD.items():
    tools[s]["pricing"] = pr(summ, usd, free, src)
# Fixed URLs for still-unverified tools
tools["lm-studio"]["pricing"]["sourceUrl"] = "https://lmstudio.ai/pricing"
for s in ["make", "tabnine", "capcut", "replika", "kindroid", "talkie", "quizlet"]:
    tools[s]["pricing"]["lastChecked"] = D

# Play.ht: vendor site no longer responds (service shut down); remove from the catalogue
REMOVED = ["playht"]

# ---- 2. New tools ----
def T(slug, name, url, cat, desc, who, tags, price, repo=None, diff=None):
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who,
         "tags": tags.split(","), "pricing": pr(*price), "openSource": None}
    if repo:
        g = GH[repo]
        t["openSource"] = {"repo": "https://github.com/" + repo, "stars": g[0], "license": g[1] if g[1] != "NOASSERTION" else "Custom / see repo",
                           "archived": False, "lastPush": g[2], "setupDifficulty": diff}
    return t
# GitHub API, 2026-10-18
GH = {"anomalyco/opencode": (215016, "MIT", "2026-10-17"), "OpenHands/OpenHands": (91131, "MIT", "2026-10-17"),
      "google-gemini/gemini-cli": (107421, "Apache-2.0", "2026-10-17"), "CapSoftware/Cap": (23383, "NOASSERTION", "2026-10-17"),
      "logseq/logseq": (45268, "AGPL-3.0", "2026-10-17"), "knadh/listmonk": (23819, "AGPL-3.0", "2026-10-17"),
      "mautic/mautic": (10787, "NOASSERTION", "2026-10-16"), "makeplane/plane": (61006, "AGPL-3.0", "2026-10-17")}
NEW = [
T("codex","OpenAI Codex","https://developers.openai.com/codex","AI coding assistant","OpenAI's coding agent for the terminal, IDE, desktop app and cloud, included with ChatGPT plans.","Developers already paying for ChatGPT","freemium,paid",
  ("Free plan; Go $8/mo; Plus $20/mo; Pro from $100/mo",8,True,"https://developers.openai.com/codex/pricing")),
T("gemini-cli","Gemini CLI","https://github.com/google-gemini/gemini-cli","AI coding assistant","Google's open-source AI agent for the terminal, powered by Gemini.","Developers who want a free terminal agent from Google","free,open source",
  ("Free and open source (Apache-2.0); sign in with a Google account or use a Gemini API key (usage-based)",None,True,"https://github.com/google-gemini/gemini-cli"),"google-gemini/gemini-cli",2),
T("opencode","OpenCode","https://opencode.ai","AI coding assistant","Open-source AI coding agent for the terminal, IDE and desktop that works with any model provider.","Developers who want a model-agnostic terminal agent","free,open source",
  ("Free and open source; free models included, or connect any provider",None,True,"https://opencode.ai"),"anomalyco/opencode",2),
T("openhands","OpenHands","https://www.all-hands.dev","AI coding agent","Open-source autonomous software-engineering agent you can run locally, self-host or use in the cloud.","Teams wanting an open-source Devin-style agent","free,open source,self-hostable",
  ("Free open-source local version; cloud Individual plan free with your own API key or at-cost models",None,True,"https://www.all-hands.dev/pricing"),"OpenHands/OpenHands",3),
T("devin","Devin","https://devin.ai","AI coding agent","Cognition's autonomous AI software engineer, with desktop, CLI and cloud agents.","Teams delegating whole engineering tasks","freemium,paid",
  ("Free plan; Pro $20/mo; Max $200/mo; Teams $80/mo + $40/mo per dev seat",20,True,"https://devin.ai/pricing")),
T("manus","Manus","https://manus.im","AI agent","General-purpose AI agent that researches, builds websites and slides, and runs multi-step tasks.","Knowledge workers delegating multi-step tasks","paid",
  ("$20/mo (4,000 credits), $40/mo (8,000 credits), $200/mo (40,000 credits), billed monthly",20,None,"https://manus.im/pricing")),
T("loom","Loom","https://www.loom.com","Screen recording","Async video messaging and screen recording, with Loom AI for titles, summaries and edits.","Remote teams replacing meetings with video","freemium,paid",
  ("Free Starter plan (25 videos); Business $18/user/mo; Business + AI $24/user/mo",18,True,"https://www.loom.com/pricing")),
T("cap","Cap","https://cap.so","Screen recording","Open-source Loom alternative for recording and sharing your screen.","Makers who want a free, open-source Loom","freemium,open source",
  ("Free for personal use; Desktop License $29/yr or $58 lifetime; Cap Pro $12/user/mo ($8.16 billed annually)",8.16,True,"https://cap.so/pricing"),"CapSoftware/Cap",1),
T("tella","Tella","https://www.tella.tv","Screen recording","Screen recorder for polished product demos, tutorials and course videos.","Creators and SaaS teams making demo videos","paid",
  ("Pro $13/user/mo, Premium $19/user/mo (billed annually)",13,None,"https://www.tella.tv/pricing")),
T("krea","Krea","https://www.krea.ai","AI image generation","Real-time AI image and video generation, upscaling and editing across many models.","Designers who want many models in one tool","freemium,paid",
  ("Free plan; Pro $21/mo; Max $63/mo; Business $160/mo",21,True,"https://www.krea.ai/pricing")),
T("logseq","Logseq","https://logseq.com","Notes & knowledge","Open-source, privacy-first outliner for notes and knowledge graphs, stored as local Markdown files.","Obsidian users who prefer outlining","free,open source",
  ("Free forever for personal use (open source)",None,True,"https://logseq.com"),"logseq/logseq",1),
T("framer","Framer","https://www.framer.com","AI website builder","Design-first website builder with AI page generation, CMS and hosting.","Designers and startups shipping marketing sites","freemium,paid",
  ("Free plan; Basic ₹361/mo, Pro ₹1,084/mo (billed yearly, India pricing)",None,True,"https://www.framer.com/pricing")),
T("webflow","Webflow","https://webflow.com","AI website builder","Visual website builder with CMS, hosting and Webflow AI.","Marketing teams and agencies building custom sites","freemium,paid",
  ("Free Starter plan; Basic $15/mo, Premium $25/mo (billed yearly)",15,True,"https://webflow.com/pricing")),
T("microsoft-word","Microsoft Word","https://www.microsoft.com/microsoft-365/word","Documents","Microsoft's word processor, with Copilot in Microsoft 365 plans.","Everyone","freemium,paid",
  ("Free Word on the web; Microsoft 365 Personal ₹6,899/yr, Family ₹8,199/yr (India pricing)",None,True,"https://www.microsoft.com/en-in/microsoft-365/word")),
T("microsoft-powerpoint","Microsoft PowerPoint","https://www.microsoft.com/microsoft-365/powerpoint","Presentations","Microsoft's presentation app, with Copilot and Designer in Microsoft 365 plans.","Everyone","freemium,paid",
  ("Free PowerPoint on the web; Microsoft 365 Personal ₹6,899/yr, Family ₹8,199/yr (India pricing)",None,True,"https://www.microsoft.com/en-in/microsoft-365/powerpoint")),
T("google-docs","Google Docs","https://docs.google.com","Documents","Online documents anyone with a Google Account can use, with Gemini in Workspace plans.","Collaborative teams","freemium,paid",
  ("Usable with any Google Account; Workspace Base ₹99/user/mo, Starter ₹270/user/mo (annual, India pricing)",None,True,"https://workspace.google.com/intl/en_in/pricing")),
T("mailchimp","Mailchimp","https://mailchimp.com","Email marketing","Email marketing platform with AI content and send-time tools.","Small businesses sending newsletters","freemium,paid",
  ("Free under 250 contacts; Essentials from ₹1,265/mo (₹632.50/mo for the first 12 months), India pricing",None,True,"https://mailchimp.com/pricing/marketing/")),
T("trello","Trello","https://trello.com","Project management","Kanban boards for tasks and projects, with Atlassian AI features.","Small teams tracking work visually","freemium,paid",
  ("Free for up to 10 collaborators; Standard $5/user/mo billed annually ($6 monthly); Premium $10/user/mo billed annually ($12.50 monthly)",5,True,"https://trello.com/pricing")),
T("brevo","Brevo","https://www.brevo.com","Email marketing","Email, SMS and WhatsApp marketing plus CRM, with AI writing tools.","Budget-conscious small businesses","freemium,paid",
  ("Free forever plan; Starter ₹625/mo (₹562.50/mo billed yearly), India pricing",None,True,"https://www.brevo.com/pricing/")),
T("beehiiv","beehiiv","https://www.beehiiv.com","Newsletter platform","Newsletter platform with growth, monetisation and AI writing tools.","Creators building a sponsored or paid newsletter","freemium,paid",
  ("Free plan (unlimited email sends); paid plans listed from $49/mo",None,True,"https://www.beehiiv.com/pricing")),
T("listmonk","listmonk","https://listmonk.app","Email marketing","Self-hosted, open-source newsletter and mailing-list manager.","Developers who want to self-host newsletters cheaply","free,open source,self-hostable",
  ("Free and open source (AGPLv3), self-hosted",None,True,"https://listmonk.app"),"knadh/listmonk",3),
T("mautic","Mautic","https://mautic.org","Marketing automation","Open-source marketing automation: email, segments, campaigns and landing pages.","Teams wanting a self-hosted marketing automation suite","free,open source,self-hostable",
  ("Free and open source (self-host)",None,True,"https://mautic.org"),"mautic/mautic",4),
T("plane","Plane","https://plane.so","Project management","Open-source project tracker (a Jira/Linear alternative) with AI, in the cloud or self-hosted.","Teams wanting a self-hostable Trello or Jira","freemium,open source,self-hostable",
  ("Free plan; Pro $6/seat/mo; Business $13/seat/mo",6,True,"https://plane.so/pricing"),"makeplane/plane",3),
]
for t in NEW: tools[t["slug"]] = t
for s in REMOVED: tools.pop(s, None)

# ---- 3. Anchors ----
A = {a["slug"]: a["alternatives"] for a in db["anchors"]}
A["elevenlabs"] = [x for x in A["elevenlabs"] if x not in REMOVED]
A["cursor"] += ["codex", "opencode"]
A["notion-ai"] += ["logseq"]
A["github-copilot"] += ["codex"]
NEWA = {
"claude-code":["codex","gemini-cli","opencode","aider","cline","openhands","cursor","github-copilot","continue"],
"devin":["openhands","claude-code","codex","cursor","windsurf","github-copilot","replit","cline"],
"manus":["chatgpt","claude","perplexity","gemini","grok","deepseek"],
"writesonic":["jasper","copy-ai","rytr","writer","chatgpt","claude"],
"fathom":["otter","fireflies","tldv","granola","read-ai"],
"tldv":["fathom","otter","fireflies","granola","read-ai"],
"loom":["cap","tella","descript","veed","riverside"],
"krea":["midjourney","leonardo","ideogram","adobe-firefly","flux","comfyui"],
"pika":["runway","luma","kling","invideo","comfyui"],
"luma":["runway","pika","kling","invideo","comfyui"],
"kling":["runway","pika","luma","invideo","comfyui"],
"murf":["elevenlabs","speechify","resemble","coqui-tts","piper"],
"speechify":["elevenlabs","murf","resemble","coqui-tts","piper"],
"obsidian":["logseq","notion-ai","appflowy","affine","mem","coda"],
"figma":["penpot","framer","canva","v0","adobe-express"],
"framer":["webflow","lovable","v0","bolt","base44","figma"],
"gemini":["chatgpt","claude","perplexity","grok","deepseek","mistral-le-chat","poe"],
"deepseek":["chatgpt","claude","gemini","mistral-le-chat","ollama","lm-studio","jan"],
"leonardo":["midjourney","ideogram","krea","adobe-firefly","flux","comfyui"],
"quillbot":["grammarly","languagetool","wordtune","prowritingaid","hemingway"],
"airtable":["nocodb","rows","google-sheets","notion-ai","coda"],
}
for k, v in NEWA.items():
    assert k not in A, k
    A[k] = v
for k, v in A.items():
    assert k in tools, k
    for x in v: assert x in tools, (k, x)
db["anchors"] = [{"slug": k, "alternatives": v} for k, v in A.items()]

SAAS = {
"word":("Microsoft Word","microsoft-word",["google-docs","notion-ai","coda","quillbot","jasper","writer"]),
"powerpoint":("Microsoft PowerPoint","microsoft-powerpoint",["gamma","beautiful-ai","pitch","plus-ai","canva","presenton"]),
"google-docs":("Google Docs","google-docs",["notion-ai","coda","microsoft-word","affine","appflowy"]),
"mailchimp":("Mailchimp","mailchimp",["klaviyo","brevo","beehiiv","listmonk","mautic"]),
"trello":("Trello","trello",["linear","plane","notion-ai","clickup-brain","airtable"]),
}
for k, (n, ts, alts) in SAAS.items():
    for x in alts + [ts]: assert x in tools, (k, x)
    db["saas"].append({"slug": k, "name": n, "toolSlug": ts, "alternatives": alts})

STACKS = {
"content-creator":("AI stack for a content creator","Tools a solo YouTuber, podcaster or newsletter writer can use to script, record, edit, clip and grow.",
  [("claude","Scripts, outlines and titles"),("descript","Edit video and podcasts by editing text"),("opus-clip","Turn long videos into short clips"),("elevenlabs","Voiceovers and dubbing"),("canva","Thumbnails and social graphics"),("suno","Background music"),("beehiiv","Newsletter to own your audience")]),
"small-agency":("AI stack for a small agency","Tools a 2–10 person design, marketing or dev agency can use to pitch, deliver and run client work.",
  [("claude","Proposals, briefs and copy"),("gamma","Pitch decks and reports"),("figma","Design and client reviews"),("framer","Client marketing sites"),("fathom","Client call notes without manual typing"),("notion-ai","Client wiki and project docs"),("n8n","Automate onboarding and reporting")]),
}
for k, (title, intro, items) in STACKS.items():
    for x, _ in items: assert x in tools, (k, x)
    db["stacks"].append({"slug": k, "title": title, "intro": intro, "items": [{"tool": x, "role": r} for x, r in items]})
for st in db["stacks"]:
    st["items"] = [i for i in st["items"] if i["tool"] in tools]

# ---- 4. Price-change log ----
db["changes"] = [
 {"date": D, "slug": "shopify-magic", "kind": "price change", "old": "Shopify Basic ₹1,499/mo billed yearly", "new": "Shopify Basic ₹1,800/mo billed yearly (monthly still ₹1,994)", "sourceUrl": "https://www.shopify.com/pricing"},
]
db["tools"] = list(tools.values())
json.dump(db, open("src/data/db.json", "w"), ensure_ascii=False, indent=1)
v = sum(1 for t in db["tools"] if t["pricing"]["summary"])
print("tools", len(db["tools"]), "anchors", len(db["anchors"]), "saas", len(db["saas"]), "stacks", len(db["stacks"]), "priced", v,
      "see-pricing", [t["slug"] for t in db["tools"] if not t["pricing"]["summary"]])
