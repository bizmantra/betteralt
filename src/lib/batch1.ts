// Data selectors for the 23 Oct 2026 batch: /categories/local-ai, /free-ai-tools, /teachers/ai-lesson-plan-generator.
import { tools, anchors, altsOf, isOss, isSelf, MIN, type Tool } from "./data";
import pagesJson from "../data/pages.json";
const maxDate = (...ds: (string | undefined | null)[]) => ds.filter(Boolean).sort().at(-1) ?? "2026-10-23";
const changed = (t: Tool) => maxDate(t.contentUpdatedAt, t.pricing.lastChangedAt);
const active = (t: Tool) => (t.status ?? "active") === "active";
const AI_CAT = (c: string) => /\bAI\b/.test(c) || ["Automation", "Transcription", "Education", "Customer support"].includes(c);
const byStars = (a: Tool, b: Tool) => (b.openSource?.stars ?? 0) - (a.openSource?.stars ?? 0);
export const runsLocally = (t: Tool) => (t as Tool & { runsLocally?: boolean }).runsLocally === true;
export const localTools = () => tools.filter((t) => active(t) && runsLocally(t)).sort((a, b) => (a.openSource?.setupDifficulty ?? 2) - (b.openSource?.setupDifficulty ?? 2) || byStars(a, b));
export const selfHostedTools = () => tools.filter((t) => active(t) && isSelf(t) && !runsLocally(t) && AI_CAT(t.category)).sort((a, b) => a.category.localeCompare(b.category) || byStars(a, b));
export const lastmodLocal = () => maxDate("2026-10-23", ...[...localTools(), ...selfHostedTools()].map(changed));
/** Free list: verified free plan or free version only, never inferred from tags. */
export const freeTools = () => tools.filter((t) => active(t) && t.pricing.verified && t.pricing.hasFreePlan === true && !!t.pricing.summary && AI_CAT(t.category));
export const freeByCategory = () => {
  const m = new Map<string, Tool[]>();
  for (const t of freeTools()) m.set(t.category, [...(m.get(t.category) ?? []), t]);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
};
export const lastmodFree = () => maxDate("2026-10-23", ...freeTools().map(changed));
export const liveAnchor = (slug: string) => anchors.some((a) => a.slug === slug) && altsOf(slug).length >= MIN;
export { isOss };
export type Sourced = { text: string; sourceUrl: string; quote: string; capturedAt: string };
export type TeacherPage = { slug: string; path: string; firstPublished: string; contentUpdatedAt: string; title: string; h1: string; description: string; problem: Sourced; lead: string;
  goodFit: string[]; skipIf: string[]; steps: { n: number; tool: string; action: string; source: Sourced }[]; limits: Sourced[];
  result?: { label: string; claim: Sourced }; tools: { tool: string; role: string }[]; related: { href: string; label: string }[] };
export const teachers = (pagesJson as unknown as { teachers: TeacherPage }).teachers;
export const lastmodTeachers = () => maxDate(teachers.contentUpdatedAt, ...teachers.tools.map((x) => tools.find((t) => t.slug === x.tool)).filter(Boolean).map((t) => changed(t!)));
