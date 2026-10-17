import { SITE } from "@/lib/data";
import ShareIsland from "./ShareIsland";
// Plain share controls, no third-party scripts, no counts, never sticky. Fires share_click {channel, page_type, slug}.
export default function ShareRow({ path, text, pageType, slug, className = "" }: { path: string; text: string; pageType: string; slug: string; className?: string }) {
  const url = SITE + path;
  const x = `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const common = { "data-page-type": pageType, "data-slug": slug };
  return <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-ink-2 ${className}`} aria-label="Share">
    <ShareIsland url={url} text={text} pageType={pageType} slug={slug}>
      <a href={x} target="_blank" rel="noopener" className="underline" data-track="share_click" data-channel="x" {...common}>Share on X<span className="sr-only"> (opens in a new tab)</span></a>
      <a href={li} target="_blank" rel="noopener" className="underline" data-track="share_click" data-channel="linkedin" {...common}>Share on LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
    </ShareIsland>
  </div>;
}
