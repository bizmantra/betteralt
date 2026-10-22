# Plan: Agents & Automations vertical for FindBetterAlt

Draft, 22 Oct 2026. Written for a product manager, not an engineer.

## 1. Why this fits the site

- FindBetterAlt's edge is **verified, dated, non-converted pricing** plus a publishing gate that blocks unverified tools from rankings. Agent and automation buyers care most about unpredictable costs (per-task, per-run and per-seat pricing), so this edge matters more here than anywhere else.
- Starting point today: 181 tools, of which only about 15 are agents or automation (Zapier, n8n, Make, Activepieces, Pipedream, Windmill, Huginn, Dify, Flowise, Devin, OpenHands, Manus, Claude Code, Codex, Gemini CLI, OpenCode, Cline, Aider).
- We reuse what exists: tool pages, alternatives pages, stacks, open-source page, price-change log, newsletter, sponsor and submit pages, twice-weekly price re-check.

## 2. Positioning

**"Agents and automations, with the real cost of running them."**

Not a link list. For every listing a buyer can see:
- What it does and who it's for, in plain language.
- Price per month **and** what a typical run or task costs, with the source and date.
- Setup effort: no-code, low-code or developer.
- Hosting: cloud, self-hosted or both. Open source or not (we already have a licence taxonomy).
- What it connects to.

## 3. Categories (hub pages)

| Hub | Examples already in the DB | Add first |
|---|---|---|
| Workflow automation | Zapier, Make, n8n, Activepieces, Pipedream, Windmill, Huginn | Lindy, Gumloop, Relay.app, Trigger.dev |
| Agent builders | Dify, Flowise | Langflow, CrewAI, Voiceflow, Relevance AI, Botpress |
| Coding agents | Devin, OpenHands, Claude Code, Codex, Gemini CLI, Cline, Aider, OpenCode | Jules, Amp, Factory |
| General / browser agents | Manus | Genspark, Browserbase, browser-use |
| Customer-support agents | Intercom Fin, Zendesk, Chatwoot | Sierra, Decagon, Lindy support |
| MCP servers & connectors | none yet | Start with 20 widely used ones (GitHub, Slack, Notion, Postgres, Stripe) |

Every "Add first" name must be checked against its own pricing page before it goes live. The gate already enforces this; none of these are verified yet.

## 4. Data changes (small)

Reuse the existing tool record. Add optional fields only, and render them only when present:

- `agentKind`: workflow | builder | coding | browser | support | mcp
- `autonomy`: assistive | semi-autonomous | fully autonomous
- `setup`: no-code | low-code | developer
- `hosting`: cloud | self-hosted | both
- `integrations`: list, plus a count
- `usagePricing`: unit (task, run, credit, seat), included amount, overage price, source URL, last checked
- `exampleCost`: one worked example (e.g. "1,000 tasks/month ≈ $X on this plan")

New pages (all generated from data, no hand-written pages):
- `/agents` hub plus one hub per category above
- `/agents/[category]` with "best for" picks and filters
- Alternatives pages for the big names: "Zapier alternatives", "Make alternatives", "n8n alternatives", "Devin alternatives"
- 3 new stacks: "Automate a small agency", "Solo founder agent stack", "Support desk on a budget"

## 5. Trust rules (what makes it better than a link list)

1. No tool is ranked unless its price is verified and under 14 days old (existing gate).
2. Usage-based prices must show the unit, the included amount and a worked example, or the tool is labelled "usage-based, estimate".
3. Agent capability claims ("fully autonomous") come from the vendor's own docs and are linked. We don't claim benchmark results we haven't checked.
4. Sponsored slots are labelled and never change order (existing policy).
5. We log every pricing change on `/changes`. Agent vendors change pricing often, so this becomes a recurring reason to visit.

## 6. Money

- Affiliate links: most workflow tools run partner programs. Apply for Zapier, Make, n8n, Pipedream and Relevance AI, and disclose on every page.
- Featured and sponsored listings: sell on the new hubs. The Sponsor page is ready but nothing has been sold yet.
- Newsletter: a weekly "agent pricing moves" issue for the new audience.
- Later, once there is traffic: a "hire a vetted automation builder" lead form, taking a referral fee. This is the cheapest first step toward a marketplace.

## 7. Rollout

| Phase | When | Deliverable | Done when |
|---|---|---|---|
| 0 | Week 1 | Confirm audience and top 25 search topics (keyword research) | Priority list agreed |
| 1 | Weeks 1–2 | Schema additions, `/agents` hub, 4 category hubs, 25 verified tools | Gate passes with 0 hard violations |
| 2 | Weeks 3–4 | 10 alternatives pages, 3 stacks, MCP hub (20 servers) | Pages indexed in sitemap |
| 3 | Month 2 | Affiliate applications, first sponsor outreach, newsletter issue | First affiliate or sponsor revenue |
| 4 | Month 3 | Review traffic. Decide on the builder-referral form | Go or no-go on marketplace layer |

## 8. Risks

- **Fast-moving market:** tools rename, get acquired or shut down. The existing status labels (renamed, acquired, shut down) handle this. Keep the twice-weekly re-check.
- **Usage-based pricing is hard to compare:** this is also the opportunity. Keep worked examples simple and dated.
- **Dilution:** agents could drown the "cheaper alternative" focus. Keep one shared brand, but give agents their own hub and nav entry.
- **Competition:** broad directories exist. We win on price verification and cost transparency, not on listing count.
- **Claims and trademarks:** only state facts from vendor pages. Link the source.

## 9. Decisions needed from you

1. Who is the main reader: non-technical business owners, or developers? This sets tone, setup labels and which hubs lead.
2. Start with all 6 hubs, or launch with workflow automation, agent builders and coding agents only (my recommendation)?
3. OK to apply for affiliate programs under the FindBetterAlt name?
4. Should MCP servers be in scope for launch, or wait until phase 2?

## 10. Success measures (first 90 days)

- 60+ verified agent and automation tools listed, with 0 gate violations.
- 10+ alternatives pages and 6 stacks live and indexed.
- Organic visits to `/agents` pages, newsletter signups from those pages, and affiliate clicks per page.
- First revenue: one affiliate payout or one sponsor.
