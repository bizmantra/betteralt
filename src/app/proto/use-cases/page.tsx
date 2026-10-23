import { Suspense } from "react";
import UseCaseGrid from "../UseCaseGrid";
import { JsonLd } from "@/components/ui";
import { USE_CASES } from "../_usecases";
const B = "https://findbetteralt.com";
export const metadata = { title: "Use cases: get everyday work done with AI (prototype)" };
export default function Page() {
  return <main className="mx-auto max-w-6xl px-5 py-10"><JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Use cases", itemListElement: USE_CASES.filter((u) => u.status === "live").map((u, i) => ({ "@type": "ListItem", position: i + 1, url: `${B}/proto/use-cases/${u.slug}`, name: u.title })) }}/>
    <h1 className="font-serif text-4xl sm:text-5xl">What do you need to get done?</h1>
    <p className="mt-3 max-w-2xl text-lg text-ink-2">Pick a task. Each one shows how to do it with AI, the tool that fits, what it costs, and what to watch out for. Some include a free tool you can use right here.</p>
    <div className="mt-8"><Suspense><UseCaseGrid/></Suspense></div>
  </main>;
}
