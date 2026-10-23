import type { Metadata } from "next";
import Link from "next/link";
import Nav from "./Nav";
import { ROLES } from "./_usecases";
export const metadata: Metadata = { title: "Prototype: FindBetterAlt use cases", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export default function ProtoLayout({ children }: { children: React.ReactNode }) {
  return <div className="proto text-[17px] leading-relaxed">
    {/* Prototype only: hide the live site's header/footer and main padding so the new design shows on its own. */}
    <style>{`body:has(.proto)>header,body:has(.proto)>footer{display:none}body:has(.proto)>main{max-width:none;padding:0}`}</style>
    <div className="bg-ink px-4 py-2 text-center text-sm text-white">Prototype for review. Not the live site. Nothing you type is saved or sent.</div>
    <header className="border-b border-rule bg-paper"><Nav/></header>
    {children}
    <footer className="mt-16 border-t border-rule bg-paper"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-ink-2 sm:grid-cols-3">
      <div><b className="text-ink">Get things done</b><br/><Link href="/proto/use-cases">All use cases</Link>{ROLES.filter((r) => r.inMenu).map((r) => <span key={r.slug}><br/><Link href={`/proto/roles/${r.slug}`}>{r.plural}</Link></span>)}</div>
      <div><b className="text-ink">Free tools</b><br/><Link href="/proto/use-cases/plan-a-lesson">Lesson plan builder</Link><br/><Link href="/proto/use-cases/write-report-card-comments">Report card comments</Link><br/><Link href="/proto/use-cases/write-a-professional-email">Email builder</Link></div>
      <div><b className="text-ink">How we check</b><br/>Prices come from each company&apos;s own pricing page, with the date we checked. No company pays for our picks.</div>
    </div></footer>
  </div>;
}
