"""v12 (11 Nov 2026): weekly new-tool scout. 12 new tools, each with at least 3 real data points.
Sources scouted (past 7 days, 4-11 Nov 2026): Show HN (HN Algolia API), trending GitHub repos (GitHub search API, created since
28 Oct), public X posts ("open source / free / cheaper alternative to ..."), Product Hunt feed. Reddit JSON endpoints (www and
old.reddit, r/LocalLLaMA and r/selfhosted) returned 403 from our network, so no Reddit content is used.
Every price/free claim is from the vendor's own page or repo (deterministic snapshot taken today, data/snapshots/{slug}/2026-11-11.txt);
stars, licence and last push from the GitHub API (repos/{owner}/{repo}) on 11 Nov 2026 IST; licence evidence from scripts/licenses.ts.
OpenCut and Open Notebook are established projects (not launches) that surfaced in public X alternative posts this week and were
missing from the catalogue. No new alternatives page: no new anchor reached 5 solid alternatives."""
import json
D = "2026-11-11"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-11-11-github-repos.json"))}

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

tool("craft-anything", "Craft Anything", "https://getartcraft.com/apps/craft-anything", "AI app builder",
     "Open-source desktop app that studies how a website, app or game works, then has a coding agent build your own version and checks it against the original until it is close.",
     "Builders who want to recreate a site, app or game they admire, with evidence for every finding and approval before anything outside the rules", F,
     free("https://getartcraft.com/apps/craft-anything"),
     "Free and open source (MIT or Apache-2.0); the coding agent you connect is billed by its own provider",
     oss("https://github.com/storytold/craft-anything", "Apache-2.0 or MIT", "Dual-licensed MIT or Apache-2.0, at your option (README; LICENSE-MIT and LICENSE-APACHE)", spdx="Apache-2.0"),
     "Early alpha, from the ArtCraft family of apps. Clean-room mode (the default) works only from what a visitor can see; Deep mode reads code and files for your private use. 320 tools, each a CLI command and an MCP tool. For macOS, Windows, Linux and web.")
tool("rea-video", "rea-video", "https://www.reavideo.ai", "AI video",
     "Open-source video breakdown tool: give it any video and it reports, shot by shot, whether it was filmed, AI-generated or coded, with prompts and a remake plan.",
     "Creators and marketers who want to know how a reference ad or short was made and how to remake it", F, free("https://www.reavideo.ai/"),
     "Free and open source (Apache-2.0); runs inside your AI coding agent", oss("https://github.com/JuneYaooo/rea-video", "Apache-2.0"),
     "Runs inside Claude Code, Codex or another agent that can run commands; needs ffmpeg and Python 3.10+. Output is a summary, a remake plan split into what to film, generate and code, and an HTML report. An optional video-capable model (Gemini or Doubao) makes the calls more accurate.")
tool("cicada", "Cicada", "https://cicada.indaloop.app/en/", "AI meeting notes",
     "Free, open-source app for live bilingual subtitles, structured meeting notes and two-way voice interpreting in any call or stream, without a bot joining the meeting.",
     "People in cross-language calls, livestreams and meetings who want Otter-style notes plus live translation", F, free("https://cicada.indaloop.app/en/"),
     "Free and open source (Apache-2.0); on Windows, Linux, Android and Intel Macs you bring an AI service key, billed by that provider",
     oss("https://github.com/wquguru/cicada", "Apache-2.0"),
     "Listens to system audio, so it works with Zoom, Teams, Google Meet, Discord, YouTube and more. On Apple silicon Macs speech recognition runs on device. Mac (macOS 14.4+), Windows 10+, Ubuntu 22.04/24.04 and Android 10+.")
tool("rerun", "Rerun", "https://rerun.build", "AI agent",
     "Open-source app for AI coworkers: describe the work and it builds a team of agents, each with its own computer, memory and skills, that ask before they send, pay or delete anything.",
     "Small teams who want an always-on AI assistant team they can self-host on their own models or subscriptions", ["open source", "freemium", "self-hostable"],
     paid("https://rerun.build/pricing", 29, "monthly"),
     "Self-hosted free (AGPL-3.0); Rerun Cloud: one plan, $29/mo (unlimited coworkers and seats, 500 credits a month) after a 5-day free trial (card required); Enterprise custom",
     oss("https://github.com/rerun-build/rerun", "AGPL-3.0"),
     "Self-hosting needs Docker, Node.js 22 and a Supabase project. Models: an API key, a Claude or ChatGPT subscription, or a local model via Ollama or LM Studio. The Cloud version adds templates, a hosted computer per workspace and premium integrations such as LinkedIn and WhatsApp.")
tool("pinky", "Pinky", "https://github.com/DIYgod/pinky", "AI agent",
     "Free, open-source desktop app that lets Claude Code, Codex, Cursor or any MCP agent operate your real iPhone or Android phone while you watch, approve risky steps and take over.",
     "People who want an AI agent to do tasks in phone apps, with payments and messages held for their approval", F, free("https://github.com/DIYgod/pinky"),
     "Free and open source (Apache-2.0); no account", oss("https://github.com/DIYgod/pinky", "Apache-2.0"),
     "Pre-alpha. For macOS, Windows and Linux; drives Android 10 to 17 and iPhones on iOS 17.4+. Banking, wallet and password apps are hidden from agents by default, and approvals are enforced by Pinky, not by the agent. A 16 to 22 MB download.", local=True)
tool("poki", "Poki", "https://poki.bot", "AI agent",
     "Open-source agent and MCP server that operates a real iPhone like a person does, run from Claude Code, Codex, iMessage, Telegram or the terminal.",
     "iPhone users and developers who want an AI agent to do tasks across iPhone apps without a jailbreak", F, free("https://github.com/JosssphZhou/poki"),
     "Free and open source (AGPL-3.0); you bring your own model account or use your agent's subscription", oss("https://github.com/JosssphZhou/poki", "AGPL-3.0"),
     "Needs a Mac (macOS 14+), Node.js 24+, an iPhone on iOS 18+, a USB cable and a free Apple Account (signing lasts 7 days and needs renewal). Windows and Linux ports are community-maintained.")
tool("ember", "Ember", "https://github.com/NYLLON-SOFTWARE/ember-cloudflare", "Collaboration",
     "Free, open-source team chat with rooms, threads, DMs, files, search and bots that runs on your own Cloudflare account, deployed in one click.",
     "Small teams who want a Slack-style chat without per-person pricing or a 90-day history limit", FS, free("https://github.com/NYLLON-SOFTWARE/ember-cloudflare"),
     "Free and open source (MIT); runs on your own Cloudflare account, billed at Cloudflare's prices",
     oss("https://github.com/NYLLON-SOFTWARE/ember-cloudflare", "MIT"),
     "By its README, Cloudflare hosting is free for a small team, or $5 a month for the whole account on Workers Paid as you grow (not per person). Keeps every message and file (up to 250 MB each). Bots get Slack-compatible incoming webhooks. Optional @ember AI uses Workers AI's free models or Claude, GPT or Gemini through Cloudflare AI Gateway.")
tool("phonon", "Phonon", "https://phonon.sh", "AI voice",
     "Open-source voice typing for Mac that runs fully on your computer: Parakeet transcribes and a small fine-tuned model cleans up what you meant to say.",
     "Mac users who want a local Wispr Flow-style dictation app with no cloud step", F, free("https://github.com/Infatoshi/phonon"),
     "Free and open source (GPL-3.0)", oss("https://github.com/Infatoshi/phonon", "GPL-3.0"),
     "Apple silicon, macOS 14+. First launch downloads about 4.9 GB of models; after that it works offline. Claims about 65 ms from key-up to pasted text on an M4 Max. Windows is in beta and Linux a preview.", local=True)
tool("gputaskman", "gputaskman", "https://github.com/shanselman/gputaskman", "Local AI",
     "Free, open-source terminal task manager for your GPU that shows which process uses GPU memory and breaks down a local LLM's weights, KV cache and buffers.",
     "People running local AI models who want to know what is filling their graphics card's memory", F, free("https://github.com/shanselman/gputaskman"),
     "Free and open source (MIT)", oss("https://github.com/shanselman/gputaskman", "MIT"),
     "By Scott Hanselman. Windows with NVIDIA or AMD, Linux and WSL, and macOS on Apple silicon; install from PyPI or a portable Windows ZIP. Early and experimental: model breakdowns are estimates.", local=True)
tool("cinecode", "cinecode", "https://github.com/sarpstar/cinecode", "AI video",
     "Free, open-source skill that has Claude Code or Cursor write, build in code and score short films, YouTube videos, ads, explainers and music videos, ending in a finished MP4.",
     "Creators who want animated videos made by an AI coding agent on their own computer, with no paid video service", F, free("https://github.com/sarpstar/cinecode"),
     "Free and open source (MIT); an optional narrator uses your own Gemini or ElevenLabs key", oss("https://github.com/sarpstar/cinecode", "MIT"),
     "Every frame is rendered from code in headless Chrome. You approve the first two scenes before the whole film is built. README in Turkish with English, Chinese and Japanese versions.")
tool("opencut", "OpenCut", "https://opencut.app", "Video editing",
     "Free, open-source video editor for the web, desktop and mobile, built as an open alternative to CapCut.",
     "Creators who want a free CapCut-style editor with no watermark or subscription", F, free("https://github.com/OpenCut-app/OpenCut"),
     "Free and open source (MIT)", oss("https://github.com/OpenCut-app/OpenCut", "MIT"),
     "Being rewritten from the ground up (Rust core, plugins, an MCP server for AI agents, headless rendering); opencut.app still runs the classic version, and the rewrite lives at new.opencut.app.")
tool("open-notebook", "Open Notebook", "https://www.open-notebook.ai", "Notes & knowledge",
     "Open-source, self-hosted alternative to Google NotebookLM: add PDFs, videos, audio and web pages, chat with them, search them and turn them into multi-speaker podcasts.",
     "Researchers, students and professionals who want NotebookLM-style research notes on the AI model of their choice, kept private", FS,
     free("https://github.com/lfnovo/open-notebook"),
     "Free and open source (MIT), self-hosted; model usage billed by your provider", oss("https://github.com/lfnovo/open-notebook", "MIT"),
     "Works with 20+ model providers, including OpenAI, Anthropic, Google, Mistral, Ollama and LM Studio. Podcasts take 1 to 4 speakers. Has a full REST API.")

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}; S = {s["slug"]: s for s in db["saas"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"capcut": ["opencut"], "otter": ["cicada"], "fireflies": ["cicada"], "manus": ["rerun"]}.items():
    add(A[k], *v)
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
