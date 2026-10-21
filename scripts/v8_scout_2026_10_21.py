"""v8 (21 Oct 2026): weekly new-tool scout. 13 new tools, each with at least 3 real data points.
Sources scouted (past 7 days): Show HN (HN Algolia API), trending GitHub repos (GitHub search API), public X posts
(open-source / cheaper alternative to ...), Product Hunt feed. Reddit JSON endpoints were blocked from our network, so no
Reddit content is used. Every price/free claim is from the vendor's own page (deterministic snapshot taken today,
data/snapshots/{slug}/2026-10-21.txt); stars, licence and last push from the GitHub API (repos/{owner}/{repo}) on
21 Oct 2026 IST; licence evidence from scripts/licenses.ts. Coming-soon / in-development prices are not listed as prices.
New page: /alternatives/capcut (5 alternatives)."""
import json
D = "2026-10-21"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-10-21-github-repos.json"))}

def oss(repo, lic, note=None, diff=None, spdx=None):
    r = R[repo.lower()]
    assert r["spdx"] == (spdx or lic) and not r["archived"], (repo, r)
    o = {"repo": repo, "stars": r["stars"], "license": lic, "licenseType": "open-source", "archived": False, "lastPush": r["pushed"][:10], "setupDifficulty": diff}
    if note: o["licenseNote"] = note
    return o

def free(src):  # free + open source, no amounts
    return {"summary": None, "fromUsdMonthly": None, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": None, "lastChangedAt": D}

def tool(slug, name, url, cat, desc, who, tags, pricing, summary, os_, note=None):
    assert slug not in T, slug
    p = dict(pricing); p["summary"] = summary
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who, "tags": tags, "pricing": p,
         "openSource": os_, "status": "active", "firstPublished": D, "contentUpdatedAt": D, "notes": ({"summary": note} if note else {})}
    db["tools"].append(t); T[slug] = t

F = ["free", "open source"]; FS = F + ["self-hostable"]
tool("voicestudio", "VoiceStudio", "https://voicestudio.sh", "AI voice",
     "Open-source, fully local voice cloning, voice design, video dubbing, dictation, transcription and audiobook creation in 646 languages.",
     "Creators who want ElevenLabs-style cloning and dubbing on their own machine", ["open source", "freemium", "self-hostable"],
     {"fromUsdMonthly": 8.25, "hasFreePlan": True, "verified": True, "sourceUrl": "https://voicestudio.sh/pro", "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": "annual"},
     "Free and open source (AGPL-3.0); Pro $99/user/yr; Lifetime $299 one-time",
     oss("https://github.com/debpalash/VoiceStudio", "AGPL-3.0", "The free app is AGPL-3.0; Pro is a separate closed-source build sold as a commercial licence"),
     "The free app runs locally on Windows, macOS, Linux or Docker. Pro is a closed-source build sold as a commercial licence for paid client work, for one user on up to 3 devices.")
tool("voicebox", "Voicebox", "https://voicebox.sh", "AI voice",
     "Open-source, local-first AI voice studio for voice cloning, text-to-speech and dictation, with MCP support for AI agents.",
     "People who want free voice cloning with no account", F, free("https://voicebox.sh/pricing"),
     "Free and open source (MIT); runs locally, no account needed", oss("https://github.com/jamiepine/voicebox", "MIT"),
     "Optional encrypted cloud backup and sync plans are listed as coming soon, with prices not final, so we don't show them.")
tool("photocraft", "PhotoCraft", "https://getartcraft.com/apps/photocraft", "Image editing",
     "Open-source, native image editor written in Rust with layers, masks, adjustment layers and PSD/PSB support.",
     "Photoshop users who want a familiar editor for free", F, free("https://getartcraft.com/apps/photocraft"),
     "Free and open source", oss("https://github.com/storytold/photocraft", "Apache-2.0 or MIT", "Dual-licensed MIT or Apache-2.0, at your option (README; LICENSE-MIT and LICENSE-APACHE)", spdx="Apache-2.0"),
     "PhotoCraft is labelled early alpha on its own page. It is one of the ArtCraft family of apps for macOS, Windows, Linux and the web.")
tool("compositor", "Compositor", "https://robbietilton.com/compositor", "Image editing",
     "Free, open-source Mac image editor built around Photoshop-style compositing: layers, masks, blend modes, adjustment layers and layer effects.",
     "Mac users who want a Photoshop-like editor for free", F, free("https://robbietilton.com/compositor"),
     "Free and open source (MIT)", oss("https://github.com/robbietilton/Compositor", "MIT"), "Mac only.")
tool("concat", "Concat", "https://concat.standalones.org", "Video editing",
     "Free, open-source video editor pitched as a CapCut replacement: offline auto-captions, text-to-speech, background removal and multi-track editing up to 4K.",
     "Creators who want CapCut-style editing with no watermark, account or subscription", F, free("https://concat.standalones.org"),
     "Free and open source (AGPL-3.0); no subscription", oss("https://github.com/jub0t/Concat", "AGPL-3.0"),
     "Runs on your machine for Windows, macOS, Linux, Android and iOS. It is not affiliated with CapCut.")
tool("filmcraft", "FilmCraft", "https://getartcraft.com/apps/filmcraft", "Video editing",
     "Open-source, native video editor written in Rust, with source and program monitors, a full timeline and trim modes.",
     "Editors who want a free, native nonlinear editor", F, free("https://getartcraft.com/apps/filmcraft"),
     "Free and open source", oss("https://github.com/storytold/filmcraft", "Apache-2.0 or MIT", "Dual-licensed MIT or Apache-2.0, at your option (README; LICENSE-MIT and LICENSE-APACHE)", spdx="Apache-2.0"),
     "FilmCraft is labelled in development on its own page. It is one of the ArtCraft family of apps.")
tool("instatic", "Instatic", "https://instatic.com", "Website builder",
     "Self-hosted visual CMS: design on a canvas, press publish, and plain static HTML lands on your own server.",
     "Teams who want a Webflow or Framer-style editor without hosting lock-in", FS, free("https://instatic.com"),
     "Free and open source (MIT), self-hosted", oss("https://github.com/CoreBunch/Instatic", "MIT"))
tool("mailcheap", "MailCheap", "https://mailcheap.ai", "Newsletter platform",
     "Newsletter platform that charges for the emails you send, not for subscribers; open source and self-hostable.",
     "Newsletter writers with big or partly inactive lists", ["open source", "freemium", "self-hostable"],
     {"fromUsdMonthly": 19, "hasFreePlan": True, "verified": True, "sourceUrl": "https://mailcheap.ai/pricing", "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": "monthly"},
     "Self-host free (AGPL-3.0); Starter $19/mo for 20,000 emails; up to $349/mo for 2M emails",
     oss("https://github.com/marclou/mailcheap", "AGPL-3.0"),
     "Every hosted plan has every feature; plans differ only by emails a month. Yearly billing gives 2 months free.")
tool("edgeever", "EdgeEver", "https://edgeever.org/en", "Notes & knowledge",
     "Open-source, AI-native knowledge base and Evernote/Obsidian alternative with instant sync and native MCP.",
     "Note-takers who want a self-hosted Evernote or Obsidian-style app that works with AI agents", FS, free("https://edgeever.org/en"),
     "Free and open source (AGPL-3.0); free on Cloudflare or self-hosted with Docker", oss("https://github.com/tianma-if/edgeever", "AGPL-3.0"),
     "Clients for macOS, Windows, Linux, iOS and Android, plus a web clipper.")
tool("itsaplan", "It's a Plan", "https://itsaplan.dev", "Project management",
     "Open-source, self-hosted issue tracker where AI agents work alongside people, with board, table, timeline and calendar views, a REST API and an MCP server.",
     "Teams who want a self-hosted Linear, Jira or Plane alternative with no per-seat fees", FS, free("https://itsaplan.dev"),
     "Community edition free and open source (AGPL-3.0), self-hosted, unlimited seats", oss("https://github.com/croffasia/itsaplan", "AGPL-3.0"),
     "A paid Pro edition is listed as in development and not on sale yet, so we don't show its price.")
tool("genoffice", "GenOffice", "https://genoffice.ai", "Documents",
     "Free, open-source AI office suite for macOS, Windows and Linux: Docs, Sheets, Slides, PDF, HTML and Markdown editors with a built-in AI agent.",
     "People who want a free desktop office suite with AI that edits real .docx, .xlsx and .pptx files", F, free("https://genoffice.ai/"),
     "Free and open source; AI features use Genspark credits or your own API key", oss("https://github.com/genspark-ai/genoffice", "Apache-2.0"),
     "Made by Genspark.")
tool("wordcraft", "WordCraft", "https://getartcraft.com/apps/wordcraft", "Documents",
     "Open-source word processor written in Rust that reads and writes .docx, with the ribbon, styles, tables, track changes, references and mail merge.",
     "Word users who want a free, offline, native editor", F, free("https://getartcraft.com/apps/wordcraft"),
     "Free and open source", oss("https://github.com/storytold/wordcraft", "Apache-2.0 or MIT", "Dual-licensed MIT or Apache-2.0, at your option (README; LICENSE-MIT and LICENSE-APACHE)", spdx="Apache-2.0"),
     "One of the ArtCraft family of apps for macOS, Windows, Linux and the web.")
tool("open-codesign", "Open CoDesign", "https://opencoworkai.github.io/open-codesign/", "Design",
     "Open-source desktop AI design tool that turns prompts into prototypes, slide decks and other design artifacts, using the model you already pay for.",
     "Designers and builders who want a Claude Design or v0-style tool on their own machine", F, free("https://opencoworkai.github.io/open-codesign/"),
     "Free and open source (MIT); bring your own model API key", oss("https://github.com/OpenCoworkAI/open-codesign", "MIT"),
     "Works with Anthropic, OpenAI, Gemini, DeepSeek, OpenRouter, local Ollama and other providers; no mandatory account.")

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}; S = {s["slug"]: s for s in db["saas"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"elevenlabs": ["voicestudio", "voicebox"], "murf": ["voicestudio", "voicebox"], "descript": ["concat", "filmcraft"],
             "framer": ["instatic"], "obsidian": ["edgeever"], "notion-ai": ["edgeever"], "figma": ["open-codesign"], "v0": ["open-codesign"]}.items():
    add(A[k], *v)
for k, v in {"photoshop": ["photocraft", "compositor"], "mailchimp": ["mailcheap"], "trello": ["itsaplan"], "word": ["genoffice", "wordcraft"],
             "powerpoint": ["genoffice", "open-codesign"], "excel": ["genoffice"]}.items():
    add(S[k], *v)
# New alternatives page: CapCut (anchor tool already listed) with 5 alternatives.
assert "capcut" in T and "capcut" not in A
db["anchors"].append({"slug": "capcut", "alternatives": ["concat", "filmcraft", "kdenlive", "descript", "veed"], "firstPublished": D, "contentUpdatedAt": D})
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
