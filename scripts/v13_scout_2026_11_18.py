"""v13 (18 Nov 2026): weekly new-tool scout. 12 new tools, each with at least 3 real data points.
Sources scouted (past 7 days, 11-18 Nov 2026): Show HN (HN Algolia API), trending GitHub repos (GitHub search API, created since
4 Nov, plus lookups of repos named in this week's X posts), public X posts ("open source / free / cheaper alternative to ...",
"just open-sourced"), Product Hunt feed. Reddit JSON endpoints (www and old.reddit, r/LocalLLaMA and r/selfhosted) returned 403
from our network, so no Reddit content is used.
Every price/free claim is from the vendor's own page or repo (deterministic snapshot taken today, data/snapshots/{slug}/2026-11-18.txt);
stars, licence and last push from the GitHub API (repos/{owner}/{repo}) on 18 Nov 2026 IST; licence evidence from scripts/licenses.ts.
Handy, Open Code Review, Freebuff, Edge0 and Kitesurf are not new launches: they surfaced in public X posts or on Product Hunt
this week and were missing from the catalogue.
New alternatives page: /alternatives/granola (Yogurt, Cicada, Otter, Fireflies, Fathom, Read AI, tl;dv: 7 alternatives)."""
import json
D = "2026-11-18"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-11-18-github-repos.json"))}

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

tool("yogurt", "Yogurt", "https://yogurt.so", "AI meeting notes",
     "Free, open-source AI meeting notes that stay on your computer: live transcripts, summaries and answers across meetings, with no bot joining the call.",
     "People who want Granola-style meeting notes without sending their calls to the cloud or paying per seat", F,
     free("https://github.com/FrigadeHQ/yogurt"),
     "Free and open source (MIT); no account needed",
     oss("https://github.com/FrigadeHQ/yogurt", "MIT"),
     "By Frigade, launched on Show HN this week as a Granola alternative. Records your microphone and system audio, so it works with any call app; call detection and speaker names cover Zoom, Teams and Meet. Transcribes with Whisper (whisper.cpp) and summarises with a local open-weight model (Gemma 4, gpt-oss or Qwen3 families) through llama.cpp; 99 languages in multi-language mode. Works offline after a one-time model download. Mac (Apple silicon, macOS 14.4+), Windows 10+ and Ubuntu 22.04+, 8 GB memory. Optional read-only local MCP server, off by default.",
     local=True)
tool("handy", "Handy", "https://handy.computer", "AI voice",
     "Free, open-source speech-to-text app that works offline: press a shortcut, speak, and your words are typed into whatever app you are using.",
     "People who want Wispr Flow-style dictation on Windows, Mac or Linux without a subscription or sending their voice to the cloud", F,
     free("https://handy.computer/"),
     "Free and open source (MIT); supported by sponsors and donations",
     oss("https://github.com/cjpais/Handy", "MIT"),
     "Runs Whisper models (Small to Large, GPU-accelerated when available) or Parakeet V3 on the CPU, with Silero voice-activity detection to skip silence. Windows, macOS and Linux; also on Homebrew and winget (community-maintained packages). An established project that surfaced in X posts this week as a free Wispr Flow alternative.",
     local=True)
tool("open-code-review", "Open Code Review", "https://open-codereview.ai", "AI coding assistant",
     "Open-source AI code review CLI from Alibaba: it reads your Git diff and posts line-level review comments, mixing fixed engineering steps with an AI agent.",
     "Developers and teams who want automated pull-request reviews on the model of their choice instead of a per-review or per-seat service", F,
     free("https://github.com/alibaba/open-code-review"),
     "Free and open source (Apache-2.0); you pay your own model provider, or run it through your coding agent's existing subscription",
     oss("https://github.com/alibaba/open-code-review", "Apache-2.0"),
     "Alibaba Group's internal AI code review assistant, now open source. Install with npm (@alibaba-group/open-code-review); runs as the ocr command or as skills in Claude Code, Codex, Cursor and other agents. Alibaba's own benchmark (200 real pull requests from 50 open-source repos) reports higher precision than Claude Code on the same model using about 1/9 of the tokens, with lower recall by design. Needs Git 2.41+.")
tool("freebuff", "Freebuff", "https://freebuff.com", "AI coding agent",
     "Free AI coding agent for the terminal, desktop, web and GitHub, with no subscription, credits or API key needed; text ads pay for the included models.",
     "Builders who want a Claude Code or Cursor-style coding agent without paying for a plan or bringing their own API key", ["open source", "freemium"],
     paid("https://freebuff.com/plans", 8, "monthly"),
     "Free plan $0 (30 hours a day, refilled daily, no card); Starter $8/mo, Plus $25/mo, Pro $60/mo (more daily hours and extra models); yearly billing saves 22%",
     oss("https://github.com/CodebuffAI/freebuff", "Apache-2.0"),
     "From the Codebuff team; launched on Product Hunt this week. Five products: Desktop (parallel local agents), CLI (npm install -g freebuff), Web (full-stack apps), Cloud (agents on a GitHub repo) and Chat. Usage is metered in hours, not tokens; the free plan's default model is DeepSeek V4.1 Flash, and paid plans unlock GPT-6 Luna, Claude Haiku 5.5 and others. In beta: the plans page says allowances and model costs may change.")
tool("edge0", "Edge0", "https://edge0.ai", "Local AI",
     "Open-source engine and models for running very large AI models on your own computer: a 145B model on one NVIDIA GPU or an Apple silicon Mac, and a 35B model on a phone.",
     "People who want a big local AI model for chat and agents with no API bill and their data kept on their own device", F,
     free("https://github.com/Edge0-AI/Edge0"),
     "Free and open source (Apache-2.0 engine); models are free downloads on Hugging Face under their own model cards",
     oss("https://github.com/Edge0-AI/Edge0", "Apache-2.0", "Apache-2.0 covers the Edge0 inference code; check each model card on Hugging Face for the model weights' terms."),
     "Mixture-of-experts models that stream expert weights from the SSD so they fit in little memory. edge0-145b and edge0-120b (released 13 Nov 2026, derived from Qwen3.8-Flash-Next, trained at 4 bits) run on Linux or Windows with an NVIDIA GPU (CUDA 13) or on Apple silicon; the 35B model also runs on iOS and Android. Vendor benchmark: 121 tokens/s agent decode for 145B on a 24 GB RTX 5090 D. Command line, an OpenAI-compatible local server and a chat app.",
     local=True)
tool("agentes-chat", "agentes.chat", "https://agentes.chat", "Collaboration",
     "Open-source, self-hosted Slack alternative where your team and AI agents work together in channels and DMs, with approvals for anything sensitive.",
     "Small teams who want AI agents as workspace members, on their own AI plan or keys, instead of bots bolted onto team chat", ["open source", "freemium", "self-hostable"],
     paid("https://agentes.chat/pricing", 29, "monthly"),
     "Self-hosted free (AGPL-3.0); Cloud Personal $29/mo, Team $49/mo (up to 10 people), Business $99/mo (up to 25 people), or about 17% less billed yearly; AI usage is on your own plan or keys",
     oss("https://github.com/agentes-chat/agentes-chat", "AGPL-3.0", "AGPL-3.0, no licence key; a separate commercial licence is offered for closed changes or white-labelling (README)."),
     "Agents get a role, an owner and a monthly budget checked before every model call, plus their own computer and browser; they can run Claude Code and Codex. Models: Claude, OpenAI, Gemini, DeepSeek, Kimi, Z.ai, MiniMax or any OpenRouter model, plus MCP tools. Self-hosting is one command on a Linux server, with Postgres as the only dependency. Cloud plans charge per workspace, not per AI use, with a 7-day money-back guarantee.")
tool("agentrun", "AgentRun", "https://agentrun.ai", "AI agent",
     "Open-source platform that makes your coding-agent harness learn from each run, survive crashes and stay under approvals and spend caps, so repeat jobs use fewer tokens.",
     "Teams running repeat agent jobs (code review, classification, ops) who want them cheaper and more reliable over time", FS,
     free("https://agentrun.ai/"),
     "Free and open source (Apache-2.0), self-hosted with your own model keys; AgentRun Cloud is an optional hosted version (no public price; see the vendor)",
     oss("https://github.com/Parcha-ai/agentrun", "Apache-2.0"),
     "By Parcha; on Show HN this week. Works on top of Claude Code, Codex, OpenCode or pi. After each run the agent keeps a note, skill or workflow for next time. Start with npx @parcha/agentrun; self-host on Railway, Render or Docker. The vendor's own case study says its tuned code reviewer costs 18 cents a review after a hosted review service took their bill from $180 to $6,451 a month.")
tool("hikaku", "Hikaku", "https://hikaku.io", "AI image detection",
     "Free, open-source browser extension that flags AI-generated images and video as you browse and shows why, running entirely on your device.",
     "People who want a quick, private check on whether a photo or video in their feed was made with AI", F,
     free("https://hikaku.io/"),
     "Free and open source (Apache-2.0)",
     oss("https://github.com/hikaku-io/hikaku-extension", "Apache-2.0"),
     "Chrome, Edge and Firefox. Reads Content Credentials (C2PA) and AI tags in image metadata, then runs an on-device SwinV2 detector (one-time model download of about 200 to 400 MB). The vendor's published test flagged 65% of AI-labelled and 6.3% of real-labelled Reddit images; it warns a flag is an estimate, not proof, and that face swaps and small edits are not reliably detected.",
     local=True)
tool("lastbook", "Lastbook", "https://lastbook.org", "Local AI",
     "Free offline survival library for your computer: manuals, videos, encyclopedias and an offline map, with an optional local AI that answers questions and cites the pages.",
     "Preppers, families and anyone who wants practical know-how and an AI assistant that still work with no internet", F,
     free("https://lastbook.org/"),
     "Free and open source (MIT); the site earns from optional affiliate links",
     oss("https://github.com/Immortal-Protocols/lastbook", "MIT", "MIT covers Lastbook's own code and documentation; the bundled library content keeps its own terms."),
     "Mac (Apple silicon, macOS 14+), Windows 10+ and Ubuntu 24.04/26.04. Library sizes: Small 7.7 GB, Medium 67.5 GB or All about 388 GB; the local AI adds about 17 GB. Offline maps cover the world and the US, with a detailed map for one US state. Works offline after setup.",
     local=True)
tool("phone-use", "Phone Use", "https://phoneuse.tech", "AI agent",
     "Free, open-source app that shows your iPhone's screen on your computer and lets you, Claude Code, Codex or another agent tap and type on it, with no jailbreak or cable.",
     "People who want an AI agent to work in iPhone apps from a Linux PC or Mac, asking permission before it takes control", F,
     free("https://github.com/lxe/phoneuse"),
     "Free and open source (MIT); optional bridge board (LilyGO T-Display) bought separately",
     oss("https://github.com/lxe/phoneuse", "MIT"),
     "Alpha. Linux (Flatpak) and Mac (macOS 15+, needs a small bridge board acting as the iPhone's keyboard and mouse); Windows from source. Uses AirPlay screen mirroring plus a companion iPhone app from the App Store; phone and computer must be on the same Wi-Fi.")
tool("boring-marketing-skills", "Boring Marketing Skills", "https://github.com/boringmarketer/boring-marketing-skills", "AI writing",
     "32 free, open-source marketing skills for Claude Code, Codex, Cursor and other AI agents: research, positioning, copy, pages, SEO, AI search, ads, email and content.",
     "Small businesses, freelancers and marketers who want an AI agent to do real marketing work without a paid copywriting tool", F,
     free("https://github.com/boringmarketer/boring-marketing-skills"),
     "Free and open source (MIT); runs in your own AI agent, billed by its provider",
     oss("https://github.com/boringmarketer/boring-marketing-skills", "MIT"),
     "By James Dickerson (@boringmarketer). Install with npx skills add or as a Claude Code plugin, then run /start-here: it reads the business's site and reviews and writes brand files the other skills reuse (about 3 minutes). Includes a deep pack for local businesses, such as Google Business Profile posts and local SEO plans. Every skill works without a paid tool.")
tool("kitesurf", "Kitesurf", "https://kitesurf.dev", "AI agent",
     "Cloudflare's open-source, experimental browser engine for AI agents that runs on Cloudflare Workers: it loads pages, runs their JavaScript and takes screenshots without Chrome.",
     "Developers building AI agents that browse the web who want a light, serverless browser that works with Puppeteer", F,
     free("https://github.com/cloudflare/kitesurf"),
     "Free and open source (Apache-2.0); running it on Cloudflare needs a Cloudflare Workers Paid plan, billed by Cloudflare",
     oss("https://github.com/cloudflare/kitesurf", "Apache-2.0"),
     "Experimental. Speaks the Chrome DevTools Protocol, so CDP clients such as Puppeteer work. Needs Cloudflare Dynamic Workers (part of Workers Paid) on Cloudflare; local development uses wrangler dev, and the README warns not to open untrusted sites with a local copy.")

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"otter": ["yogurt"], "fireflies": ["yogurt"], "fathom": ["yogurt"], "tldv": ["yogurt"],
             "cursor": ["freebuff"], "claude-code": ["freebuff"], "manus": ["agentes-chat"]}.items():
    add(A[k], *v)
# New page: /alternatives/granola (7 alternatives, all already verified except the new Yogurt).
assert "granola" in T and "granola" not in A
db["anchors"].append({"slug": "granola", "alternatives": ["yogurt", "cicada", "otter", "fireflies", "fathom", "read-ai", "tldv"], "firstPublished": D, "contentUpdatedAt": D})
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
