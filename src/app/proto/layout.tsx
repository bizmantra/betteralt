import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Prototype: FindBetterAlt for teachers", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export default function ProtoLayout({ children }: { children: React.ReactNode }) {
  return <div className="proto text-[17px] leading-relaxed">
    {/* Prototype only: hide the live site's header/footer and main padding so the new design shows on its own. */}
    <style>{`body:has(.proto)>header,body:has(.proto)>footer{display:none}body:has(.proto)>main{max-width:none;padding:0}`}</style>
    <div className="bg-ink px-4 py-2 text-center text-sm text-white">Prototype for review. Not the live site. Nothing you type is saved or sent.</div>
    <header className="border-b border-rule bg-paper"><nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
      <Link href="/proto" className="mr-auto font-serif text-2xl font-bold">FindBetter<span className="bg-hl px-1">Alt</span></Link>
      <Link href="/proto/for/teachers" className="font-medium">For teachers</Link>
      <span className="text-ink-2" title="Coming later">For small business</span>
      <span className="text-ink-2" title="Coming later">For students</span>
      <Link href="/proto/templates/lesson-plan">Templates</Link>
      <Link href="/alternatives/base44" className="text-sm text-ink-2">For builders ▾</Link>
    </nav></header>
    {children}
    <footer className="mt-16 border-t border-rule bg-paper"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-ink-2 sm:grid-cols-3">
      <div><b className="text-ink">By job</b><br/><Link href="/proto/for/teachers">For teachers</Link></div>
      <div><b className="text-ink">Make things</b><br/><Link href="/proto/templates/lesson-plan">Lesson plan template</Link></div>
      <div><b className="text-ink">How we check</b><br/>Prices come from each company&apos;s own pricing page, with the date we checked. No company pays for our picks.</div>
    </div></footer>
  </div>;
}
