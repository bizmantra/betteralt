"""v11 (4 Nov 2026): weekly new-tool scout. 15 new tools, each with at least 3 real data points.
Sources scouted (past 7 days, 28 Oct-4 Nov 2026): Show HN (HN Algolia API), trending GitHub repos (GitHub search API,
created since 20 Oct), public X posts (open-source / free / cheaper alternative to ..., launches, "now open source"),
Product Hunt feed. Reddit JSON endpoints (www and old.reddit) returned 403 from our network, so no Reddit content is used.
Every price/free claim is from the vendor's own page (deterministic snapshot taken today, data/snapshots/{slug}/2026-11-04.txt);
stars, licence and last push from the GitHub API (repos/{owner}/{repo}) on 4 Nov 2026 IST; licence evidence from
scripts/licenses.ts. No new alternatives page: no new anchor reached 5 solid alternatives."""
import json
D = "2026-11-04"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-11-04-github-repos.json"))}

def oss(repo, lic, note=None, diff=None, spdx=None):
    r = R[repo.lower()]
    assert r["spdx"] == (spdx or lic) and not r["archived"], (repo, r)
    o = {"repo": repo, "stars": r["stars"], "license": lic, "licenseType": "open-source", "archived": False, "lastPush": r["pushed"][:10], "setupDifficulty": diff}
    if note: o["licenseNote"] = note
    return o

def free(src):
    return {"summary": None, "fromUsdMonthly": None, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": None, "lastChangedAt": D}

def paid(src, frm, billing):
    return {"summary": None, "fromUsdMonthly": frm, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": billing}

def tool(slug, name, url, cat, desc, who, tags, pricing, summary, os_, note=None, local=False):
    assert slug not in T, slug
    p = dict(pricing); p["summary"] = summary
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who, "tags": tags, "pricing": p,
         "openSource": os_, "status": "active"}
    if local: t["runsLocally"] = True
    t.update({"firstPublished": D, "contentUpdatedAt": D, "notes": ({"summary": note} if note else {})})
    db["tools"].append(t); T[slug] = t

F = ["free", "open source"]; FS = F + ["self-hostable"]

tool("mausbot", "MausBot", "https://mausbot.com", "AI agent",
     "Open-source app that runs a team of AI bots on your own computer, each able to use its own computer, apps and voice to get tasks done, with phone apps to check in.",
     "Solo founders and small teams who want always-on AI assistants on the Claude or ChatGPT plan they already pay for", ["open source", "freemium"],
     paid("https://mausbot.com/pricing", 15, "monthly"),
     "Free app (Apache-2.0, bring your own model account or API key); Starter $15/mo, Pro $49/mo, Max $99/mo (always-on cloud workspace)",
     oss("https://github.com/milind-soni/OpenMausBot", "Apache-2.0"),
     "Formerly OpenMausBot. On the free plan bots work while your computer is on; the paid plans add a cloud machine so bots keep working with the laptop closed. Model usage is billed by your provider; Pro includes $10 and Max $20 of Claude credit a month.")
tool("mika", "Mika", "https://github.com/wangzan101/Mika", "AI agent",
     "Open-source AI assistant for Android phones: say what you need and it operates your apps and the web on a hidden background screen until the task is done.",
     "Android users who want an AI agent that can work any app on their phone, without a vendor server", F, free("https://github.com/wangzan101/Mika"),
     "Free and open source (Apache-2.0); bring your own model API key or account", oss("https://github.com/wangzan101/Mika", "Apache-2.0"),
     "Install the APK from GitHub releases. Chat, web and files need Android 11+, operating apps needs Android 12+ (14+ recommended) and a one-time wireless debugging pairing. It asks before spending money by default. There is no Mika server.")
tool("freefield", "Freefield", "https://github.com/neuregex/freefield", "AI image generation",
     "Open-source studio of 120 image, video, VFX and audio apps laid out like Higgsfield's, each one a ComfyUI workflow on open-weight models.",
     "Creators who want Higgsfield-style effects on their own GPU or Modal instead of a subscription", F, free("https://github.com/neuregex/freefield"),
     "Free and open source (MIT); you pay for your own GPU or Modal", oss("https://github.com/neuregex/freefield", "MIT"),
     "Runs on Modal or on your own ComfyUI. No API or partner nodes: every model is a file you download, with its own licence listed per app. Many apps fit a 24 GB graphics card.")
tool("openjutsu", "Openjutsu", "https://github.com/D3voz/openjutsu", "AI video",
     "Open-source, local character and object swap for video: drop in a clip and a character photo and the main person is replaced, keeping the camera, cuts, motion and sound.",
     "Video creators with an NVIDIA GPU who want Higgsfield Genjutsu-style swaps without a subscription", F, free("https://github.com/D3voz/openjutsu"),
     "Free and open source (MIT); runs on your own GPU", oss("https://github.com/D3voz/openjutsu", "MIT"),
     "Needs an NVIDIA GPU (tested on an RTX 4060 Ti 16 GB with 64 GB RAM), ComfyUI 0.41.2+ with several custom node packs, and Node.js 22.6+. Built on MiniMax H3; model files keep their own licences.", local=True)
tool("sheet", "Sheet", "https://sheet.dipxsy.app", "Design",
     "Open-source, local-first infinite canvas for UI design that AI agents can edit over MCP, with history, drafts and export to HTML, React, JSON or PNG.",
     "Designers and builders who want a free Paper-style design canvas that Claude, Codex or Cursor can work on", F, free("https://github.com/DeepanshuMishraa/sheet"),
     "Free and open source (AGPL-3.0); no account", oss("https://github.com/DeepanshuMishraa/sheet", "AGPL-3.0"),
     "Desktop app for macOS, Linux and Windows. One SQLite file and a local server; 35 MCP tools share the editor's engine. Began as a fork of loora.", local=True)
tool("opentempl", "OpenTempl", "https://opentempl.org", "Design",
     "Free, open-source design app for posters, social posts, slides and menus with 337 templates, that works offline and needs no account.",
     "Small businesses, teachers and creators who want a Canva-style editor with no paywall or watermark", F, free("https://opentempl.org"),
     "Free and open source (MIT); no paid plan, trial or watermark", oss("https://github.com/noah-thing/opentempl", "MIT"),
     "By its own page: version 0.1 with one maintainer, no team workspaces, phone app or CMYK output yet. Opens PowerPoint and PDF; exports PNG, SVG, PDF with bleed, PowerPoint, MP4 and GIF. Optional AI images use your own OpenAI key.")
tool("folio", "Folio", "https://foliowiki.online", "Notes & knowledge",
     "Open-source, self-hosted team wiki where every page is a file in Git, with real-time editing, data tables, whiteboards and AI agents that read and write the same pages.",
     "Teams who want a Notion or Confluence alternative they host themselves and keep as plain files", FS, free("https://foliowiki.online"),
     "Free and open source (MIT), self-hosted", oss("https://github.com/evergreen-it-dev/folio", "MIT"),
     "Self-hosts with Docker and Git. Pages and whiteboards you have opened stay editable offline. Written by AI coding agents with a human product owner, by its own page.")
tool("warmbly", "Warmbly", "https://warmbly.com", "Email marketing",
     "Open-source cold outreach platform with email warmup, sequences, a unified inbox, analytics and a CRM, hosted or self-hosted.",
     "Founders, agencies and sales teams who find Instantly or Apollo too expensive", ["open source", "freemium", "self-hostable"],
     paid("https://warmbly.com/pricing", 23, "annual"),
     "Free plan (warm up to 10 mailboxes); Starter $23/mo, Grow $71/mo, Business $263/mo (billed annually); Enterprise custom; self-host free (Apache-2.0)",
     oss("https://github.com/warmbly/warmbly", "Apache-2.0"),
     "Paid plans differ by cold emails a day (150, 3,000 and 15,000) and all include unlimited mailboxes and warmup. Sending, the inbox and the CRM unlock on a paid plan.")
tool("37studio", "37Studio", "https://studio.shaitrish.com", "AI video",
     "Open-source AI social media studio: Claude makes on-brand videos and posts from a short brief, publishes them to 9 platforms and drafts replies to messages.",
     "Small businesses and creators who want a Buffer or Opus Clip alternative with no monthly bill", FS, free("https://studio.shaitrish.com"),
     "Free and open source (MIT); AI billed at cost to your own Claude plan or API keys", oss("https://github.com/Shaitrish/37studio", "MIT"),
     "Runs on Windows, Mac or Linux (Docker, or a preview desktop app for Windows and Linux). Posts to Facebook, Instagram, YouTube, TikTok, LinkedIn, X, Pinterest, Bluesky and Mastodon.")
tool("wavefunction", "Wavefunction", "https://www.wavefunction.si", "AI coding agent",
     "Open-source desktop coding agent for macOS that splits work across parallel subagents, with any model: local via Ollama, your own API keys or a ChatGPT sign-in.",
     "Developers who want a desktop coding agent that isn't tied to one provider's plans or limits", F, free("https://www.wavefunction.si"),
     "Free and open source (MIT); model usage billed by your provider", oss("https://github.com/stoyan-stoyanov/wavefunction", "MIT"),
     "macOS only. A young project: first commit 27 Oct 2026.")
tool("kensaku", "Kensaku", "https://github.com/yjid/kensaku", "Local AI",
     "Free, open-source file launcher that searches names, text inside documents and code, screenshots (OCR) and meaning, entirely on your own computer.",
     "People who remember what was in a file but not its name, on Windows, macOS or Linux", F, free("https://github.com/yjid/kensaku"),
     "Free and open source (MIT)", oss("https://github.com/yjid/kensaku", "MIT"),
     "Claims it searches 100,000 file names in about a millisecond using roughly 12 MB of memory. Claude or Cursor can search the same index over a read-only local MCP server.", local=True)
tool("geoinflow", "GEOInflow", "https://github.com/yaojingang/GEOInflow", "SEO",
     "Open-source, self-hosted analytics for Generative Engine Optimization: which AI crawlers visit your site, which pages they request, AI search referrals and conversions.",
     "Site owners and SEO teams who want to see AI-search traffic and crawler coverage without a paid GEO tool", FS, free("https://github.com/yaojingang/GEOInflow"),
     "Free and open source (MIT), self-hosted", oss("https://github.com/yaojingang/GEOInflow", "MIT"),
     "Runs with Docker Compose; source builds need at least 6 GiB of Docker memory. Crawler catalogue covers OpenAI, Anthropic, Perplexity, Google, Microsoft and others. Some reference docs are in Simplified Chinese only.")
tool("kanzo", "Kanzo", "https://github.com/emanuele-em/kanzo", "Project management",
     "Open-source kanban board and MCP server in one 4.5 MB program, so you and your coding agents work on the same tasks, on one computer or a shared board.",
     "Developers who want a Trello-style board their AI coding agents can pick tasks from, with no account or server", FS, free("https://github.com/emanuele-em/kanzo"),
     "Free and open source (AGPL-3.0); no account", oss("https://github.com/emanuele-em/kanzo", "AGPL-3.0"),
     "For macOS, Linux (including Raspberry Pi) and Windows. Works with Claude Code, Codex and other MCP clients; boards can be shared live on your network or synced between machines.", local=True)
tool("mintype", "Mintype", "https://mintype.app", "Notes",
     "Free, zero-knowledge notes app with documents and whiteboards: everything is encrypted on your device, works offline in the browser and syncs through your own Google Drive.",
     "People who want a private Notion-style notes app where even the sync copy is unreadable to anyone else", F, free("https://github.com/project59/mintype"),
     "Free and open source (AGPL-3.0), including Google Drive sync", oss("https://github.com/project59/mintype", "AGPL-3.0"),
     "Version 2.0 added an infinite-canvas whiteboard, a Markdown-based editor and end-to-end encrypted share links. Notes are encrypted with AES-GCM before they are stored.")
tool("survival-llm", "Survival LLM", "https://brangus.io/survival-llm", "Local AI",
     "Free AI assistant and emergency library that runs entirely on your own computer with no internet, answering from about 1.5 million offline articles and showing the source of every answer.",
     "Preppers, travellers and families who want offline first-aid, emergency and how-to answers they can check", F, free("https://brangus.io/survival-llm"),
     "Free and open source (MIT code; library content keeps its own licences)",
     oss("https://github.com/anonnerdfrenzy/survival-llm", "MIT", "MIT for the code (LICENSE file); library content keeps the licence of its source. GitHub reports NOASSERTION because of the added note", spdx="NOASSERTION"),
     "Mac (Apple silicon, macOS 14+) and Windows 10 or 11. Set up while online: 20 minutes to about 2.5 hours depending on model size (the biggest is 80 GB). Library includes Wikipedia, WikiMed, MedlinePlus, CDC, Ready.gov and FEMA manuals.", local=True)

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}; S = {s["slug"]: s for s in db["saas"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"canva": ["opentempl"], "figma": ["sheet"], "notion-ai": ["folio", "mintype"], "obsidian": ["mintype"],
             "cursor": ["wavefunction"], "claude-code": ["wavefunction"], "manus": ["mausbot"], "runway": ["freefield"]}.items():
    add(A[k], *v)
for k, v in {"canva": ["opentempl"], "trello": ["kanzo"]}.items():
    add(S[k], *v)
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
