import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/data";
import { JsonLd } from "@/components/ui";
import { orgGraph } from "@/components/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "BetterAlt: find a better or cheaper alternative to any AI tool", template: "%s | BetterAlt" },
  description: "Find a better or cheaper alternative to any AI tool, with today's prices. Free, open-source and self-hosted options, with sources and last-checked dates.",
  openGraph: { siteName: "BetterAlt", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-slate-50 text-slate-900 antialiased"><JsonLd data={orgGraph} />
    <header className="border-b bg-white"><nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
      <Link href="/" className="mr-auto text-xl font-bold tracking-tight">Better<span className="text-indigo-600">Alt</span></Link>
      <Link href="/open-source">Open source</Link><Link href="/stacks">Stacks</Link><Link href="/changes">Price changes</Link>
      <Link href="/submit">Submit</Link><Link href="/sponsor">Sponsor</Link>
    </nav></header>
    <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    <footer className="border-t bg-white"><div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-6 text-sm text-slate-600">
      <span>© 2026 BetterAlt · Prices are checked against vendors&apos; official pricing pages; always confirm before buying.</span>
      <span className="w-full text-xs">Affiliate disclosure: some links on BetterAlt may be affiliate links, which means we may earn a commission if you buy, at no extra cost to you. It never changes our listings or prices.</span>
      <Link href="/about">About</Link><Link href="/sponsor">Sponsor</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/llms.txt">llms.txt</Link><a href="mailto:hello@findbetteralt.com">hello@findbetteralt.com</a>
    </div></footer>
  </body></html>;
}
