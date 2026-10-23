import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, Crumbs, webPageLd } from "@/components/seo";
import { JsonLd, itemList, Newsletter, startLine } from "@/components/ui";
import Byline from "@/components/slots/Byline";
import { Faq } from "@/components/slots/Blocks";
import ToolSection from "@/components/ToolSection";
import { fmtDate, fmtStars } from "@/lib/data";
import { groupAlts } from "@/lib/picks";
import { monthYear } from "@/lib/seo";
import { localTools, selfHostedTools, lastmodLocal, isOss } from "@/lib/batch1";

const PATH = "/categories/local-ai";
const title = () => `Local LLM and self-hosted AI tools compared (${monthYear(lastmodLocal())})`;
export function generateMetadata(): Metadata {
  return { ...buildMetadata({ title: title(), description: "Run a local LLM on your own computer or self-host AI on your own server: Ollama, LM Studio, Jan, AnythingLLM, LocalAI, llama.cpp and more, with licences, free tiers and USD prices from vendor pages.", path: PATH }), title: { absolute: title() } };
}
export default function Page() {
  const local = localTools(), self = selfHostedTools();
  const { ranked } = groupAlts(local);
  const free = ranked.filter((t) => t.pricing.hasFreePlan).map((t) => t.name), oss = ranked.filter(isOss).map((t) => t.name);
  const faq = [
    { q: "What is a local LLM?", a: "A large language model that runs on your own computer or server instead of a vendor's cloud, so prompts and documents stay on your hardware. Apps like the ones on this page download open models and run them for you." },
    { q: "Which local LLM apps are free?", a: `On this page: ${free.join(", ")} have a free version or free plan, checked against each vendor's own page.` },
    { q: "Which local AI tools are open source?", a: `${oss.join(", ")}. Licence data comes from each project's GitHub repository.` },
    { q: "What is the easiest way to start?", a: "Install a desktop app (setup difficulty 1 in the table) and download a small model inside it. Server tools such as LocalAI and llama.cpp need the command line." },
    { q: "Can I use a local model for coding?", a: "Several coding agents let you connect your own model provider. See our Claude Code and Cursor alternatives pages for which ones, with prices." },
  ];
  return <div className="space-y-8" data-page-type="category">
    <JsonLd data={webPageLd({ path: PATH, name: title(), published: "2026-10-23", modified: lastmodLocal(), type: "Article" })} />
    <JsonLd data={itemList(title(), ranked)} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    <div>
      <Crumbs items={[{ name: "Categories" }, { name: "Local and self-hosted AI" }]} />
      <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[40px]">Local LLM and self-hosted AI tools, compared with prices</h1>
      <Byline updated={lastmodLocal()} checked={[...local, ...self].map((t) => t.pricing.lastChecked)} />
      <p className="mt-3 max-w-3xl text-[17px]">Want AI that runs on your own computer, or on a server you control? Below are the tools in our database that run models locally, then the self-hostable AI tools for teams. Every price comes from the vendor&apos;s own page with a checked date and source; open-source licences and GitHub stars come from each repository.</p>
    </div>
    <section aria-labelledby="table-h" className="space-y-2">
      <h2 id="table-h" className="border-t-2 border-ink pt-3 font-serif text-2xl font-semibold">At a glance</h2>
      <p className="text-sm text-ink-2">Setup difficulty: 1 = install an app, 5 = needs a GPU server and ops skills. Only verified prices are shown.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead><tr className="border-b-2 border-ink"><th className="py-2 pr-3">Tool</th><th className="pr-3">Price</th><th className="pr-3">Licence</th><th className="pr-3">Setup</th><th className="pr-3">GitHub stars</th><th>Checked</th></tr></thead>
        <tbody>{ranked.map((t) => <tr key={t.slug} className="border-b align-top">
          <td className="py-2 pr-3 font-semibold"><Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link></td>
          <td className="pr-3">{startLine(t)}</td>
          <td className="pr-3">{t.openSource ? t.openSource.license : "Closed source"}</td>
          <td className="pr-3">{t.openSource?.setupDifficulty ?? "–"}</td>
          <td className="pr-3">{t.openSource ? fmtStars(t.openSource.stars) : "–"}</td>
          <td>{fmtDate(t.pricing.lastChecked)} · <a className="underline" href={t.pricing.sourceUrl} target="_blank" rel="nofollow noopener">source</a></td></tr>)}</tbody>
      </table></div>
    </section>
    <ToolSection id="local" anchor="local-ai" title="Run a local LLM on your own computer" items={local}
      intro="Desktop apps and model runners that download open models and run them on your machine. Easiest first." />
    <ToolSection id="self" anchor="local-ai" title="Self-hosted AI tools for your own server" items={self}
      intro="Open-source or source-available AI tools you can run on your own server, grouped by category. Each card shows its licence and price." />
    <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Related pages</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li><Link className="underline" href="/alternatives/claude-code">Claude Code alternatives</Link> and <Link className="underline" href="/alternatives/cursor">Cursor alternatives</Link>, including coding agents that work with your own model</li>
        <li><Link className="underline" href="/alternatives/chatgpt">Free ChatGPT alternatives</Link>, local and cloud</li>
        <li><Link className="underline" href="/alternatives/n8n">n8n alternatives</Link> for self-hosted automation</li>
        <li><Link className="underline" href="/open-source">All open-source AI tools</Link> and <Link className="underline" href="/free-ai-tools">free AI tools that are still free</Link></li>
      </ul></section>
    <Faq items={faq} />
    <Newsletter source="categories/local-ai" placement="end" />
  </div>;
}
