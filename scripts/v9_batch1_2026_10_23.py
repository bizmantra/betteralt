"""v9 (23 Oct 2026): first content batch. Adds 4 local / self-hosted AI tools (prices only from vendor pages, snapshots
dated 2026-10-23; stars/licence/last push from the GitHub API on 23 Oct 2026 IST), a runsLocally flag on tools that run
models on your own machine, the /alternatives/base44 anchor, howToChoose copy for claude-code and n8n (huginn added to n8n)."""
import json
D = "2026-10-23"
db = json.load(open("src/data/db.json")); T = {t["slug"]: t for t in db["tools"]}
GH = {"https://github.com/Mintplex-Labs/anything-llm": (67471, "2026-10-23"), "https://github.com/mudler/LocalAI": (49866, "2026-10-23"),
      "https://github.com/ggml-org/llama.cpp": (132097, "2026-10-23")}
def oss(repo, lic, diff):
    s, p = GH[repo]; return {"repo": repo, "stars": s, "license": lic, "licenseType": "open-source", "archived": False, "lastPush": p, "setupDifficulty": diff}
def free(src): return {"summary": None, "fromUsdMonthly": None, "hasFreePlan": True, "verified": True, "sourceUrl": src, "lastChecked": D, "currency": None, "lastChangedAt": D}
def tool(slug, name, url, cat, desc, who, tags, pricing, summary, os_, note=None):
    assert slug not in T, slug
    p = dict(pricing); p["summary"] = summary
    t = {"slug": slug, "name": name, "url": url, "category": cat, "description": desc, "whoFor": who, "tags": tags, "pricing": p,
         "openSource": os_, "status": "active", "runsLocally": True, "firstPublished": D, "contentUpdatedAt": D, "notes": ({"summary": note} if note else {})}
    db["tools"].append(t); T[slug] = t
tool("anythingllm", "AnythingLLM", "https://anythingllm.com", "Local AI",
     "Open-source desktop and Docker app to chat with your documents and run AI agents with local or cloud models; the desktop app needs no account or API key.",
     "People and small teams who want private document chat on their own machine or server", ["open source", "freemium", "self-hostable"],
     {"fromUsdMonthly": 50, "hasFreePlan": True, "verified": True, "sourceUrl": "https://anythingllm.com/pricing", "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": "monthly"},
     "Desktop app and Docker self-host free (MIT); hosted Basic $50/mo; Pro $99/mo; Enterprise custom",
     oss("https://github.com/Mintplex-Labs/anything-llm", "MIT", 1))
tool("localai", "LocalAI", "https://localai.io", "Local AI",
     "Open-source, OpenAI-compatible inference server that runs text, voice, vision and image models on the hardware you already own.",
     "Developers who want a drop-in local replacement for a cloud AI API", ["free", "open source", "self-hostable"], free("https://localai.io"),
     "Free and open source (MIT), self-hosted", oss("https://github.com/mudler/LocalAI", "MIT", 3))
tool("llama-cpp", "llama.cpp", "https://github.com/ggml-org/llama.cpp", "Local AI",
     "Open-source LLM inference in C/C++, with a command-line tool and llama-server for running open models on your own machine.",
     "Technical users who want the lowest-level way to run open models locally", ["free", "open source", "self-hostable"], free("https://github.com/ggml-org/llama.cpp"),
     "Free and open source (MIT)", oss("https://github.com/ggml-org/llama.cpp", "MIT", 3))
tool("msty", "Msty", "https://msty.ai", "Local AI",
     "Desktop AI workspace (Msty Studio) to chat with local and online models side by side, with knowledge stacks and an agent mode.",
     "People who want one app for local and cloud models without the command line", ["freemium", "paid"],
     {"fromUsdMonthly": 12.42, "hasFreePlan": True, "verified": True, "sourceUrl": "https://msty.ai/pricing", "lastChecked": D, "currency": "USD", "lastChangedAt": D, "fromBilling": "annual"},
     "Free $0 forever (Studio Desktop core features); Aurum $149/user/yr; Aurum Lifetime $349/user one-time", None,
     "Msty Studio is not open source. The free plan covers the desktop app; Aurum adds Studio Web and advanced features.")
for s in ["ollama", "lm-studio", "jan", "open-webui", "librechat"]: T[s]["runsLocally"] = True
# anchors
A = {a["slug"]: a for a in db["anchors"]}
assert "base44" not in A
db["anchors"].append({"slug": "base44", "alternatives": ["lovable", "bolt", "v0", "dyad", "bolt-diy", "replit"], "firstPublished": D, "contentUpdatedAt": D,
  "howToChoose": [
    "Want the closest like-for-like swap? Lovable, Bolt and v0 are hosted, prompt-to-app builders with free plans, like Base44.",
    "Want to own the code and skip credits? Dyad runs on your own computer and bolt.diy is the open-source, self-hosted fork of Bolt; you bring your own model API key.",
    "Building more than a front end? Check what each plan includes for databases, auth and hosting on the vendor's pricing page before you commit; we link each source.",
    "Compare like with like: some builders bill per user and others per workspace, so read the plan line under each price."]})
A["n8n"]["alternatives"].append("huginn"); A["n8n"]["contentUpdatedAt"] = D
A["n8n"]["howToChoose"] = [
  "Want n8n's self-hosting without its fair-code licence? Activepieces, Windmill and Huginn are open source and self-hostable.",
  "Want no servers at all? Zapier and Make are hosted, with free plans and a far larger catalogue of ready-made app connectors.",
  "Building AI agents or chatbots rather than app-to-app workflows? Dify and Flowise are built for LLM apps first.",
  "Developers who prefer writing code steps can look at Pipedream and Windmill, which are built around scripts."]
A["claude-code"]["contentUpdatedAt"] = D
A["claude-code"]["howToChoose"] = [
  "Want to stay in the terminal? Codex, Gemini CLI, OpenCode and Aider are terminal coding agents like Claude Code.",
  "Want to pick your own model, including local ones? OpenCode, Aider and Cline let you connect your own provider or API key.",
  "Prefer an editor to a terminal? Cursor, GitHub Copilot and Cline work inside your IDE.",
  "Want an agent that runs in its own sandbox and opens pull requests? OpenHands is open source and can be self-hosted."]
json.dump(db, open("src/data/db.json", "w"), indent=1, ensure_ascii=False)
print("ok", len(db["tools"]))
