"""v14 (25 Nov 2026): weekly new-tool scout. 15 new tools, each with at least 3 real data points.
Sources scouted (past 7 days, 18-25 Nov 2026): Show HN (HN Algolia API), trending GitHub repos (GitHub search API, created since
11 Nov, plus lookups of repos named in this week's X posts), public X posts ("open source / free / cheaper alternative to ...",
"just open-sourced"), Product Hunt feed. Reddit JSON (www.reddit.com returned 403, old.reddit redirected) for r/LocalLLaMA and
r/selfhosted could not be read from our network, so no Reddit content is used.
Every price/free claim is from the vendor's own page or repo (deterministic snapshot taken today, data/snapshots/{slug}/2026-11-25.txt);
stars, licence and last push from the GitHub API (repos/{owner}/{repo}) on 25 Nov 2026 IST; licence evidence from scripts/licenses.ts.
Agent Desktop, OpenMotion, Rakazo and Firecrawl are not new launches: they surfaced in public X posts this week and were missing
from the catalogue.
New alternatives page: /alternatives/opus-clip (NeonClipping, PeakCut, VEED, Descript, CapCut: 5 alternatives; VEED's AI Clips,
Descript's Create clips and CapCut's long-video-to-clips tool are documented on each vendor's own site)."""
import json
D = "2026-11-25"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-11-25-github-repos.json"))}

def oss(repo, lic, note=None, diff=None, spdx=None):
    r = R[repo.lower()]
    assert r["spdx"] == (spdx or lic) and not r["archived"], (repo, r)
    o = {"repo": repo, "stars": r["stars"], "license": lic, "licenseType": "open-source", "archived": False, "lastPush": r["pushed"][:10], "setupDifficulty": diff}
    if note: o["licenseNote"] = note
    return o

def free(src):
    return {"summary": None, "fromUsdMonthly": None, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": None, "lastChangedAt": D}

def paid(src, frm, billing, has_free=True):
    return {"summary": None, "fromUsdMonthly": frm, "hasFreePlan": has_free, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": billing}

def tool(slug, name, url, cat, desc, who, tags, pricing, summary, os_, note=None, local=False):
    assert slug not in T, slug
    p = dict(pricing); p["summary"] = summary
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who, "tags": tags, "pricing": p,
         "openSource": os_, "status": "active"}
    if local: t["runsLocally"] = True
    t.update({"firstPublished": D, "contentUpdatedAt": D, "notes": ({"summary": note} if note else {})})
    db["tools"].append(t); T[slug] = t

F = ["free", "open source"]; FS = F + ["self-hostable"]; FM = ["open source", "freemium", "self-hostable"]

tool("opencomputer", "OpenComputer", "https://opencomputer.dev", "AI coding agent",
     "Open-source, self-hostable alternative to Devin: mention @Computer in a Slack thread, it works on its own cloud computer with Claude Code, Codex or OpenCode, and the result lands as a pull request.",
     "Teams who want a Devin-style coding agent in Slack, on their own cloud or a cheap hosted plan, using the Claude or ChatGPT plan they already pay for", FM,
     paid("https://opencomputer.dev", 20, "monthly"),
     "Self-hosted free (Apache-2.0); Cloud: 3-day free trial (600 work minutes, no card), Pro $20/mo (2,000 work minutes), Max $200/mo (25,000 work minutes), Enterprise custom; extra minutes $0.01 each; plans cover the whole Slack workspace",
     oss("https://github.com/diggerhq/opencomputer", "Apache-2.0"),
     "By Digger; on Show HN this week (129 points). You pay for work minutes only: waiting and idle threads are free, and the model runs on your own Claude or ChatGPT subscription or API key at no charge, or on OpenComputer's tokens at API prices with no markup. Each session runs in rootless Podman on one VM; the rest of the stack runs on Cloudflare Workers. The vendor's own benchmark says it opens pull requests 3.3x faster than Devin (56 s vs 185 s for 4 PRs with green CI).")
tool("agent-desktop", "Agent Desktop", "https://agent-browser.dev/desktop", "AI agent",
     "Open-source command-line tool from Vercel Labs that gives AI agents computer use on macOS, Windows and Linux by reading each app's accessibility tree instead of taking screenshots.",
     "Developers building agents that need to click and type in real desktop apps, more reliably and cheaply than screenshot-based computer use", F,
     free("https://github.com/vercel-labs/agent-desktop"),
     "Free and open source (Apache-2.0)",
     oss("https://github.com/vercel-labs/agent-desktop", "Apache-2.0"),
     "Install with npm (npm install -g agent-desktop) or Homebrew on macOS and Linux. Each command prints one JSON result: a snapshot lists an app's interactive elements with a ref, the agent clicks or types on a ref, then reads the UI again to check. Headless by default, so actions don't move your pointer or take focus. The README warns that snapshots and screenshots can contain private desktop content. Surfaced in X posts this week.")
tool("openmotion", "OpenMotion", "https://github.com/nexu-io/openmotion", "AI video",
     "Free, open-source agentic video studio pitched as an alternative to Claude Motion and CapCut: give it a reference video and your coding agent rebuilds it with your own brand kit and copy, then renders an MP4.",
     "Marketers, founders and creators who want on-brand motion videos and remakes of social videos without a design team or a video-editing subscription", FS,
     free("https://github.com/nexu-io/openmotion"),
     "Free and open source (Apache-2.0); bring your own agent and API keys; OpenDesign's hosted plans are billed separately",
     oss("https://github.com/nexu-io/openmotion", "Apache-2.0"),
     "By OpenDesign (nexu-io). Videos are coded in HTML, so you can edit timing in its Studio and re-render. Works with Claude Code, Codex and other local agents (22 listed), and can also be installed from the ChatGPT plugin marketplace. Introduces Motion.md, a Markdown format for shot order, timing and transitions. Can pull in image, video, music and voice models for missing assets, on your own keys.")
tool("rakazo", "Rakazo", "https://rakazo.com", "AI agent",
     "Open-source, self-hosted AI teammates (Bots) with their own memory, routines, apps and computer, that work together in group chats and run on any model you choose.",
     "People and small teams who want always-on AI assistants that browse, use apps and run on a schedule, on their own server and model keys", FM,
     paid("https://rakazo.com/pricing", 15, "monthly"),
     "Self-hosted free (Apache-2.0); hosted Standard $15/mo ($12/mo billed yearly) with your own model, then Pro $49, Max $99 and Ultra $199 per month; Rakazo credits from $20/mo; 7-day free trial; managed dedicated hosting $300/mo",
     oss("https://github.com/elie222/rakazo", "Apache-2.0"),
     "Every Bot gets a browser, terminal, files and a full desktop you can watch and take over. Routines run on a schedule, from an email or a webhook. Connects to Gmail, Slack, GitHub, Notion, Linear and thousands more apps, plus MCP. Web, desktop, iPhone, iPad and Android apps. Self-host with Docker; a VPS with 2 vCPUs and 4 GB RAM keeps Bots on all the time. Surfaced in X posts this week as a free open-source Bot alternative.")
tool("neonclipping", "NeonClipping", "https://iamajmeena.github.io/neonclipping/", "AI video editing",
     "Free, open-source clipping app that runs on your own PC: paste a YouTube, Twitch or Kick link (or an MP4) and get captioned 9:16 clips with a title and hook, with no account or upload.",
     "Streamers, podcasters and creators who want OpusClip-style shorts from long videos without credits or a subscription", F,
     free("https://github.com/iamajmeena/neonclipping"),
     "Free and open source (AGPL-3.0); no account, no subscription, no credits",
     oss("https://github.com/iamajmeena/neonclipping", "AGPL-3.0", "AGPL-3.0 from 24 November 2026 (README)."),
     "Made by Ajay K Meena, a filmmaker and DaVinci Resolve educator in Jaipur. Fast mode downloads only the audio, uses YouTube's own captions (local Whisper otherwise), scores loudness jumps and raised voices, and lets a local Ollama model pick and title the moments; the README reports an 85-minute stream clipped in 97 seconds with zero API cost. 11 gaming layouts with a facecam finder, live-stream clipping, captions in 52 languages including Hinglish. One-click setup on Windows; the Mac/Linux installer is new and not yet tested on a real Mac.",
     local=True)
tool("peakcut", "PeakCut", "https://github.com/haziqahmedqasmi/PeakCut", "AI video editing",
     "Free, open-source AI clipper for long videos and live streams: it finds the moments worth posting, cuts them to 9:16 with word-by-word captions and a hook, and can post to YouTube, Instagram and TikTok.",
     "Creators and clipping agencies who want OpusClip-style shorts on their own computer or server, with their own AI key", FS,
     free("https://github.com/haziqahmedqasmi/PeakCut"),
     "Free and open source (MIT); bring your own AI key, or none (clips are then picked by loudness)",
     oss("https://github.com/haziqahmedqasmi/PeakCut", "MIT"),
     "Takes YouTube, Twitch or Kick links or uploads, and can record a live stream and clip highlights while it is still running, using loudness, chat activity and the transcript. Workspaces per creator with posting rules, spacing and daily caps. Works with Gemini, OpenAI, Grok, Groq, OpenRouter, Claude or a local model through Ollama. Needs Python 3.10+ and ffmpeg; optional accounts with email or Google sign-in on a shared server.")
tool("scarlet", "Scarlet", "https://github.com/Forward-Future/scarlet", "AI video editing",
     "Free, open-source AI video editor for macOS, Windows and Linux: tell Claude Code or Codex what to change by voice, text or drawing on a frame, and hear the edit on your timeline in seconds.",
     "People editing interviews, talking-head videos, podcasts and screen recordings who want an AI to make the cuts while they make the calls", F,
     free("https://github.com/Forward-Future/scarlet"),
     "Free and open source (MIT); uses your existing Claude Code or Codex subscription, with no separate AI billing",
     oss("https://github.com/Forward-Future/scarlet", "MIT"),
     "Early access (Linux is an Ubuntu 24.04 preview). Re-renders only the seconds around each change, with instant before/after playback; your original footage is never changed and every edit is saved as a new timeline version. Built-in editing workflows such as a dialogue pass that cuts false starts, filler words and dead air. Transcribes locally with Whisper large-v3-turbo. Packaged releases send anonymous usage data unless you turn it off in Settings.",
     local=True)
tool("amuse", "Amuse", "https://github.com/replit/amuse", "AI agent",
     "Free, open-source personal AI agent from Replit that runs on your own computer: web research, a live browser you can watch and take over, reminders, goals and small apps, and it asks before it sends, submits or pays.",
     "One person who wants a private, self-hosted assistant with their own OpenAI key instead of a hosted agent subscription", FS,
     free("https://github.com/replit/amuse"),
     "Free and open source (Apache-2.0); needs your own OpenAI API key (billed by OpenAI)",
     oss("https://github.com/replit/amuse", "Apache-2.0"),
     "Released by Replit this week and built with Replit Missions. Runs with Docker Compose and PostgreSQL; no account or hosted service. Approval cards for sends, form submissions, payments and new schedules; an encrypted vault keeps logins and API keys away from the model, which only sees stand-in tokens. Memory is plain workspace files you can read and edit. Voice mode included.")
tool("pibot", "Pi Bot", "https://pibot.space", "AI agent",
     "Free, open-source desktop app where a team of named AI Bots works on your own computer: they plan, run commands, edit files, browse and use your computer, and every risky step waits for your approval.",
     "People who want a local-first AI agent team on Mac, Windows or Linux with their own model keys or a local model", F,
     free("https://github.com/w01fb0ss/PiBot"),
     "Free and open source (Apache-2.0); model costs are with the provider you choose, or free with a local model through Ollama",
     oss("https://github.com/w01fb0ss/PiBot", "Apache-2.0"),
     "Built on the pi agent kernel; first released this week (v0.0.2, the macOS builds are not yet notarized by Apple). Group chats have a coordinator that plans and hands steps to other Bots after you confirm. Commands run in a sandbox and every approval and command is written to an audit log; on macOS, changes can be restored from automatic checkpoints. Works with OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter or Ollama. Android app optional.",
     local=True)
tool("tuff", "Tuff", "https://usetuff.com", "Project management",
     "Open-source, self-hosted alternative to Linear, ClickUp, Asana and Basecamp: tasks, docs and chat in one place, where AI agents connect over MCP and take tasks next to your team.",
     "Small teams tired of per-seat project tools who want tasks, docs and chat in one app, with AI agents as teammates", FM,
     paid("https://usetuff.com/pricing", 25, "monthly"),
     "Self-hosted free (AGPL-3.0), no limit on people or projects; hosted: Duo free (2 people, no AI agents), Team $25/mo (10 people), Company $99/mo (100 people), Unlimited $299/mo; one price per workspace, not per seat; 3-day free trial on paid plans",
     oss("https://github.com/usetuff/tuff", "AGPL-3.0", "AGPL-3.0-only; the Tuff name and logo are not covered by the licence (README)."),
     "Projects have lists, boards, sub-tasks and blockers, plus channels, direct messages, docs and files. Two-way GitHub sync: pull requests that name a task move it along. Claude Code, Codex, Cursor or any MCP client can join; when an agent needs a decision it asks with choices in a Needs you queue. Deploy on Railway in one click or anywhere with Docker.")
tool("diderot", "Diderot", "https://diderot.dev", "AI search",
     "Free, open-source server from Bluesky that answers questions about what your organization has written down, across Slack, coding-agent sessions, docs and tickets, with citations.",
     "Engineering and support teams who want a self-hosted, Glean-style 'ask our company' assistant in Slack and their AI agents", FS,
     free("https://diderot.dev"),
     "Free and open source (MIT or Apache-2.0, your choice); no paid edition; you pay your own model provider",
     oss("https://github.com/bluesky-social/diderot", "Apache-2.0", "Dual-licensed: MIT or Apache-2.0 at your choice (vendor site); GitHub reports Apache-2.0."),
     "From Bluesky Social, released this week. Ingests Slack, Discord, Claude Code and Codex sessions, Notion, Linear, Zendesk and Markdown folders into Postgres and Qdrant, then answers in Slack and as an MCP server for your agents. Every search is filtered to what the person asking can see (private Slack channels stay private). Ships with no model: add OpenAI, Anthropic or a local Ollama or vLLM. Quickstart needs Docker, about 4 GB of memory and 9 GB of disk.")
tool("superbot", "SuperBot", "https://github.com/davidondrej/superbot", "AI agent",
     "Free, open-source team of AI Bots you self-host on your own VPS: each Bot has a name, one job, its own memory and a shared Linux computer, and runs on the coding agent you already use.",
     "Builders who want always-on AI teammates on a cheap VPS, powered by their existing Claude Code, Codex or Pi subscription", FS,
     free("https://github.com/davidondrej/superbot"),
     "Free and open source (MIT); runs on your own VPS and your agent's existing subscription",
     oss("https://github.com/davidondrej/superbot", "MIT"),
     "From David Ondrej (davidondrej on GitHub). You message the main Bot, SuperBot, and it hands work to focused Bots such as Developer, Researcher or Inbox. Memory is saved as plain files; Bots create their own cron jobs for routines and can ask each other for help. Written in Rust. Early: approvals, computer use, skills and Slack are listed as coming soon, and the last commit was on 15 Nov 2026.")
tool("firevoice", "FireVoice", "https://firevoice.fabwaseem.com", "AI voice",
     "Free, open-source voice studio that runs on your own computer: expressive text to speech with 100 voices, voice cloning, dictation in any app, dialogue, dubbing and transcription.",
     "Creators, course makers and writers who want ElevenLabs-style voices and Wispr Flow-style dictation without uploads or a subscription", F,
     free("https://firevoice.fabwaseem.com"),
     "Free and open source (MIT); the site says it is free for everyone right now, with no card",
     oss("https://github.com/fabwaseem/firevoice", "MIT"),
     "New (repo created 10 Nov 2026); on Show HN this week. Windows, Mac with Apple silicon (macOS 11+) and Linux. Everything runs locally and nothing you write or say is uploaded; a recent NVIDIA graphics card makes the voice studio fastest, but it also runs on the processor. Dubbing keeps the original music and effects; projects for audiobooks and courses re-render only what changed. Optional usage statistics can be turned off.",
     local=True)
tool("firecrawl", "Firecrawl", "https://www.firecrawl.dev", "AI agent",
     "Turns websites into clean, LLM-ready markdown for AI agents: scrape, crawl, map and search through one API, now also as Firecrawl Local, a single binary that runs on your own machine.",
     "Developers and AI builders who need reliable web data for agents, RAG and research, from a free local tool up to a hosted API", FM,
     paid("https://www.firecrawl.dev/pricing", 19, "monthly"),
     "Free plan (1,000 credits a month, no card); Hobby $19/mo ($16/mo billed yearly, 5,000 credits); Standard $99/mo, Growth $399/mo, Scale $749/mo; 1 credit = 1 page scraped; self-hosting and Firecrawl Local free",
     oss("https://github.com/firecrawl/firecrawl", "AGPL-3.0", "Primarily AGPL-3.0; the SDKs and some UI components are MIT (README)."),
     "Over 200,000 GitHub stars. Firecrawl Local (cargo install firecrawl-local) scrapes, crawls and maps with no database, queue or container, adds itself as an MCP server to Claude Code, Cursor, Codex and others with one command, and serves the Firecrawl API on localhost; search and its 550+ data providers stay in Firecrawl Cloud. Surfaced on X this week with the Firecrawl Local release.")
tool("foolscap", "Foolscap", "https://foolscap.works", "AI writing",
     "A writing app that reads your book as you write and points out facts that don't agree between chapters, threads you never settle and what's working, without ever writing a word for you.",
     "Novelists and non-fiction authors who want an AI reader for their draft, not an AI that writes it", ["freemium", "paid"],
     {"summary": None, "hasFreePlan": True, "verified": True, "sourceUrl": "https://foolscap.works/", "lastChecked": D, "currency": "EUR", "lastChangedAt": D, "fromBilling": "monthly"},
     "Free to start (a free reading of your draft); Writer €12/mo for one book; Author €29/mo for more than one (prices in euros only)",
     None,
     "On Show HN this week (133 points). Imports Word, Scrivener, Google Docs (as .docx), Markdown or a whole Obsidian vault. Each point is tied to your own words, and you can take it up, set it aside or mark it deliberate. Your writing is encrypted, never used to train AI and not read by staff; a private book sends nothing to any AI. Export or delete everything at any time.")

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}; S = {s["slug"]: s for s in db["saas"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"devin": ["opencomputer"], "capcut": ["openmotion"], "descript": ["scarlet"], "manus": ["rakazo", "pibot", "amuse"],
             "elevenlabs": ["firevoice"]}.items():
    add(A[k], *v)
add(S["trello"], "tuff")
# New page: /alternatives/opus-clip (5 alternatives: NeonClipping and PeakCut new; VEED, Descript, CapCut already on the site).
assert "opus-clip" in T and "opus-clip" not in A
db["anchors"].append({"slug": "opus-clip", "alternatives": ["neonclipping", "peakcut", "veed", "descript", "capcut"], "firstPublished": D, "contentUpdatedAt": D})
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
