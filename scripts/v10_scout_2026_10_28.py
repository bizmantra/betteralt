"""v10 (28 Oct 2026): weekly new-tool scout. 12 new tools, each with at least 3 real data points.
Sources scouted (past 7 days, 21-28 Oct 2026): Show HN (HN Algolia API), trending GitHub repos (GitHub search API),
public X posts (open-source / free / cheaper alternative to ..., launches), Product Hunt feed. Reddit JSON endpoints
redirected/blocked from our network, so no Reddit content is used. Every price/free claim is from the vendor's own page
(deterministic snapshot taken today, data/snapshots/{slug}/2026-10-28.txt); stars, licence and last push from the GitHub
API (repos/{owner}/{repo}) on 28 Oct 2026 IST; licence evidence from scripts/licenses.ts.
No new alternatives page: no anchor reached 5 solid new alternatives that isn't already covered."""
import json
D = "2026-10-28"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
R = {r["repo"].lower(): r for r in json.load(open("data/scout/2026-10-28-github-repos.json"))}

def oss(repo, lic, note=None, diff=None, spdx=None):
    r = R[repo.lower()]
    assert r["spdx"] == (spdx or lic) and not r["archived"], (repo, r)
    o = {"repo": repo, "stars": r["stars"], "license": lic, "licenseType": "open-source", "archived": False, "lastPush": r["pushed"][:10], "setupDifficulty": diff}
    if note: o["licenseNote"] = note
    return o

def free(src):
    return {"summary": None, "fromUsdMonthly": None, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": None, "lastChangedAt": D}

def tool(slug, name, url, cat, desc, who, tags, pricing, summary, os_, note=None, local=False):
    assert slug not in T, slug
    p = dict(pricing); p["summary"] = summary
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who, "tags": tags, "pricing": p,
         "openSource": os_, "status": "active"}
    if local: t["runsLocally"] = True
    t.update({"firstPublished": D, "contentUpdatedAt": D, "notes": ({"summary": note} if note else {})})
    db["tools"].append(t); T[slug] = t

F = ["free", "open source"]; FS = F + ["self-hostable"]
DUAL = "Dual-licensed MIT or Apache-2.0, at your option (README; LICENSE-MIT and LICENSE-APACHE)"

tool("hob", "Hob", "https://hob.chat", "Local AI",
     "Free, open-source desktop app that runs AI on your own computer and works with your files: it reads and edits documents and folders, fills out PDFs, draws charts and runs code in a sandbox.",
     "People who want a private ChatGPT or Claude-style assistant that works offline, with no account", F, free("https://hob.chat"),
     "Free and open source (MIT); no account, no subscription", oss("https://github.com/FrigadeHQ/hob", "MIT"),
     "Runs on Apple silicon Macs, Windows and Linux with at least 8 GB of memory; Hob picks an open-weight model that fits your computer. Web search is the only built-in online feature and can be turned off.", local=True)
tool("openseo", "OpenSEO", "https://openseo.so", "SEO",
     "Open-source SEO platform for keyword research, rank tracking, backlinks, site audits and AI-search visibility, usable from Claude, ChatGPT and other agents over MCP.",
     "Small businesses, freelancers and agencies who find Semrush or Ahrefs too expensive", ["open source", "freemium", "self-hostable"],
     {"fromUsdMonthly": 10, "hasFreePlan": True, "verified": True, "sourceUrl": "https://openseo.so/pricing", "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": "monthly"},
     "Self-host free (MIT); Base $10/mo; Pro $30/mo; Agency $200/mo (hosted plans, each includes monthly usage credit)",
     oss("https://github.com/every-app/open-seo", "MIT"),
     "Hosted plans are usage-based: each plan includes a monthly amount of data usage and extra usage is pay as you go. Self-hosting runs with Docker or on your own Cloudflare account.")
tool("gridcraft", "GridCraft", "https://getartcraft.com/apps/gridcraft", "Spreadsheets",
     "Open-source native spreadsheet app written in Rust that reads and writes .xlsx, with a formula bar, 500+ functions, dynamic arrays, PivotTables and charts.",
     "Excel users who want a free, offline desktop spreadsheet", F, free("https://getartcraft.com/apps/gridcraft"),
     "Free and open source", oss("https://github.com/storytold/gridcraft", "Apache-2.0 or MIT", DUAL, spdx="Apache-2.0"),
     "Labelled in development on its own page. Every command can be driven by AI agents over an MCP server or CLI. One of the ArtCraft family of apps for macOS, Windows, Linux and the web.")
tool("deckcraft", "DeckCraft", "https://getartcraft.com/apps/deckcraft", "Presentations",
     "Open-source native presentation app written in Rust, with slide masters, themes, 150+ shapes, transitions, animations and presenter view.",
     "PowerPoint users who want a free, offline slide editor", F, free("https://getartcraft.com/apps/deckcraft"),
     "Free and open source", oss("https://github.com/storytold/deckcraft", "Apache-2.0 or MIT", DUAL, spdx="Apache-2.0"),
     "Labelled in development on its own page. One of the ArtCraft family of apps for macOS, Windows, Linux and the web.")
tool("figcraft", "FigCraft", "https://getartcraft.com/apps/figcraft", "Design",
     "Open-source interface design app written in Rust with frames, auto layout, components and variants, variables, prototypes and live co-editing.",
     "Designers who want a Figma-style editor that works offline with no account", F, free("https://getartcraft.com/apps/figcraft"),
     "Free and open source", oss("https://github.com/storytold/figcraft", "Apache-2.0 or MIT", DUAL, spdx="Apache-2.0"),
     "Labelled early alpha on its own page. Live sessions can be hosted from the app or your own server. One of the ArtCraft family of apps.")
tool("pdfcraft", "PdfCraft", "https://getartcraft.com/apps/pdfcraft", "Documents",
     "Open-source native PDF workbench written in Rust to read, comment on, organize, combine, split and secure PDFs.",
     "People who want a free desktop PDF editor with no account or cloud", F, free("https://getartcraft.com/apps/pdfcraft"),
     "Free and open source", oss("https://github.com/storytold/pdfcraft", "Apache-2.0 or MIT", DUAL, spdx="Apache-2.0"),
     "Labelled early alpha on its own page. One of the ArtCraft family of apps for macOS, Windows, Linux and the web.")
tool("openfilm", "OpenFilm", "https://openfilm.dev", "AI video",
     "Open-source AI video agent: Claude Code, Codex or another coding agent writes the film as web pages, and a local editor lets you change any shot, word or clip by hand.",
     "Creators and builders who want explainers, product films or edited footage made by an AI agent on their own machine", F, free("https://openfilm.dev"),
     "Free and open source (MIT)", oss("https://github.com/openfilm/openfilm", "MIT"),
     "Needs Node 22.2+ and ffmpeg on macOS, Windows or Linux. Voice, music and images come from services you choose. Renders up to 4K.", local=True)
tool("dossier", "Dossier", "https://dossier.aien.me", "AI writing",
     "Self-hosted job search app that writes a tailored resume and cover letter for each job from the facts in your profile, and tracks every application.",
     "Job seekers who want AI-written applications without handing their career history to a SaaS", FS, free("https://dossier.aien.me"),
     "Free and open source (AGPL-3.0), self-hosted", oss("https://github.com/AienTech/dossier", "AGPL-3.0"),
     "Runs with Docker on Linux, macOS and Windows. Works with the model you choose, including local Ollama or LM Studio and OpenAI-compatible or Anthropic APIs.")
tool("digup", "DigUp", "https://digup.arahim.dev", "Local AI",
     "Free, open-source desktop search that finds files by what is in them (photos, PDF pages, moments in recordings and videos) using an embedding model on your own machine.",
     "People who can never find that one photo, PDF or recording and want private, on-device search", F, free("https://digup.arahim.dev"),
     "Free and open source (MIT)", oss("https://github.com/ARahim3/DigUp", "MIT"),
     "Mac version for Apple silicon (macOS 14 or later); Windows and Linux versions are in beta.", local=True)
tool("learnharness", "LearnHarness", "https://learnharness.ai", "Education",
     "Open-source desktop AI tutor that maps what you already understand, plans a path to your goal and teaches one reasoning step at a time, with adaptive practice.",
     "Students and self-learners who want an AI tutor that teaches rather than just answers", F, free("https://learnharness.ai"),
     "Free and open source (AGPL-3.0); bring your own model API key", oss("https://github.com/amosblomqvist/learnharness", "AGPL-3.0"),
     "For macOS, Windows and Linux. You pay your model provider for usage; chats, the knowledge graph and API keys stay on your machine.")
tool("doory", "Doory", "https://doory.art", "Design",
     "Open-source, browser-based design editor for posters, social posts, slides, invitations, resumes and business cards, with templates, animation and video export.",
     "Small businesses, teachers and creators who want a Canva-style editor they can self-host for free", FS, free("https://doory.art"),
     "Free and open source; no paid plan; self-host with Docker", oss("https://github.com/shaongitbd/doory", "AAL", "Attribution Assurance License (OSI-approved); GitHub reports it as NOASSERTION", spdx="NOASSERTION"),
     "A young project by its own README: the editor is complete but ships with ten starter templates. Exports PNG, JPG, SVG, PDF, MP4 and GIF.")
tool("desigma", "Desigma", "https://github.com/deepfounder-ai/desigma", "Design",
     "Open-source, local-first interface design app written in Rust with frames, auto layout, components, prototyping, live collaboration, decks and .fig file import.",
     "Designers who want a free Figma alternative that opens their existing Figma files", F, free("https://github.com/deepfounder-ai/desigma"),
     "Free and open source (Apache-2.0)", oss("https://github.com/deepfounder-ai/desigma", "Apache-2.0"),
     "Imports from .fig files or the Figma REST API JSON. Dev mode generates CSS, Tailwind, SwiftUI, Jetpack Compose or React code.")

# ---- placements ----------------------------------------------------------------------------------------------
A = {a["slug"]: a for a in db["anchors"]}; S = {s["slug"]: s for s in db["saas"]}
def add(rec, *slugs):
    cur = [x if isinstance(x, str) else x["slug"] for x in rec["alternatives"]]
    for s in slugs:
        assert s in T, s
        if s not in cur: rec["alternatives"].append(s)
    rec["contentUpdatedAt"] = D
for k, v in {"chatgpt": ["hob"], "claude": ["hob"], "figma": ["figcraft", "desigma"], "canva": ["doory"]}.items():
    add(A[k], *v)
for k, v in {"excel": ["gridcraft"], "powerpoint": ["deckcraft"], "canva": ["doory"]}.items():
    add(S[k], *v)
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]), "tools,", len(db["anchors"]), "anchors")
