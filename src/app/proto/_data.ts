import db from "@/data/db.json";
type P = { summary: string | null; hasFreePlan: boolean | null; verified: boolean; sourceUrl: string; lastChecked: string; unverifiedNote?: string };
type T = { slug: string; name: string; url: string; description: string; pricing: P };
const all = (db as unknown as { tools: T[] }).tools;
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const fmt = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; };
export const tool = (s: string) => { const t = all.find((x) => x.slug === s); if (!t) throw new Error("missing tool " + s); return t; };

// Free-plan limits for teacher tools. "fromRepo" rows come from src/data/db.json (vendor pricing page, checked date there).
// "fetched" rows were read from the vendor's own pricing page on 23 Oct 2026 for this prototype. "sample" = not verified.
export type Row = { name: string; url: string; free: string; paid: string; source: string; checked: string; status: "verified" | "sample" };
export const limits: Row[] = [
  (() => { const t = tool("magicschool"); return { name: t.name, url: t.url, free: "Free for teachers", paid: "Plus $8.33/mo billed yearly, or $12.99 monthly", source: t.pricing.sourceUrl, checked: fmt(t.pricing.lastChecked), status: "verified" as const }; })(),
  (() => { const t = tool("khanmigo"); return { name: t.name, url: t.url, free: "Free for teachers", paid: "Learners and families $4/mo or $44/yr", source: t.pricing.sourceUrl, checked: fmt(t.pricing.lastChecked), status: "verified" as const }; })(),
  { name: "Eduaide", url: "https://www.eduaide.ai", free: "24 credits a month, up to 8 resources. No card needed.", paid: "Pro $49.99/yr ($4.17/mo)", source: "https://www.eduaide.ai/pricing", checked: "23 Oct 2026", status: "verified" },
  { name: "Diffit", url: "https://web.diffit.me", free: "Basic plan: you can only open what you made in the last 90 days", paid: "School licence priced by enrolment. Teacher price not shown on this page.", source: "https://web.diffit.me/pricing", checked: "23 Oct 2026", status: "verified" },
  (() => { const t = tool("chatgpt"); return { name: t.name, url: t.url, free: "Free plan", paid: "Go $8/mo, Plus $20/mo", source: t.pricing.sourceUrl, checked: fmt(t.pricing.lastChecked), status: "verified" as const }; })(),
  (() => { const t = tool("gemini"); return { name: t.name, url: t.url, free: "Free with a Google account", paid: "Google AI Plus $4.99/mo, AI Pro $19.99/mo", source: t.pricing.sourceUrl, checked: fmt(t.pricing.lastChecked), status: "verified" as const }; })(),
  { name: "Brisk", url: "https://www.briskteaching.com", free: "Teacher plan $0 (reported by third parties)", paid: "Unknown", source: "https://www.briskteaching.com", checked: "—", status: "sample" },
  (() => { const t = tool("quizlet"); return { name: t.name, url: t.url, free: "Unknown", paid: "Unknown", source: t.pricing.sourceUrl, checked: fmt(t.pricing.lastChecked), status: "sample" as const }; })(),
];
