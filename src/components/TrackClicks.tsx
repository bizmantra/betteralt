"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";
const snake = (k: string) => k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
// One delegated listener: any element with data-track fires track(event, data-*). Plus scroll depth and engaged time.
export default function TrackClicks() {
  useEffect(() => {
    const pageType = () => (document.querySelector("[data-page-type]") as HTMLElement | null)?.dataset.pageType ?? "other";
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      if (el.dataset.trackOpenOnly !== undefined && el.closest("details")?.open) return; // only on open
      const props: Record<string, string> = {};
      for (const [k, v] of Object.entries(el.dataset)) if (k !== "track" && k !== "trackOpenOnly" && v != null) props[snake(k)] = v;
      if (!props.page_type) props.page_type = pageType();
      track(el.dataset.track!, props);
    };
    document.addEventListener("click", onClick);
    const fired = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement; const pct = ((h.scrollTop + innerHeight) / h.scrollHeight) * 100;
      for (const p of [25, 50, 75, 100]) if (pct >= p - 0.5 && !fired.has(p)) { fired.add(p); track("scroll_depth", { percent: p, page_type: pageType() }); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    let visible = 0; const marks = [30, 90]; const sent = new Set<number>();
    const timer = setInterval(() => { if (document.hidden) return; visible++; for (const m of marks) if (visible >= m && !sent.has(m)) { sent.add(m); track("engaged_time", { seconds: m, page_type: pageType() }); } }, 1000);
    return () => { document.removeEventListener("click", onClick); removeEventListener("scroll", onScroll); clearInterval(timer); };
  }, []);
  return null;
}
