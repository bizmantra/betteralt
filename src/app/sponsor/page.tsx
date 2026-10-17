import type { Metadata } from "next";
export const metadata: Metadata = { title: "Sponsor BetterAlt", description: "Reach people actively switching AI tools. Sponsorship and featured listings on BetterAlt.", alternates: { canonical: "/sponsor" } };
export default function Page() {
  return <div className="max-w-3xl space-y-6"><h1 className="text-3xl font-bold">Sponsor BetterAlt</h1>
    <p className="text-slate-600">People on BetterAlt are comparing tools because they&apos;re ready to switch. Sponsored placements are always labelled &quot;Sponsored&quot; and never change our prices or rankings.</p>
    <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-white p-6 text-center"><p className="text-xs uppercase tracking-wide text-indigo-600">Sponsored · example slot</p><p className="mt-2 text-xl font-semibold">Your tool here</p><p className="text-sm text-slate-500">Featured spot on relevant alternatives pages and in the weekly newsletter.</p></div>
    <p>No sponsorships have been sold yet. Founding sponsor slots are opening soon. <a className="text-indigo-600 underline" href="mailto:hello@findbetteralt.com?subject=Sponsorship">Contact us</a>.</p></div>;
}
