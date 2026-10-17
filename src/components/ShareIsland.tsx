"use client";
import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/track";
// Copy link + (on mobile, where supported) a single native Share button that falls back to the plain controls.
export default function ShareIsland({ url, text, pageType, slug, children }: { url: string; text: string; pageType: string; slug: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false); const [native, setNative] = useState(false);
  useEffect(() => { setNative(typeof navigator !== "undefined" && "share" in navigator && matchMedia("(max-width: 640px)").matches); }, []);
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} track("share_click", { channel: "copy", page_type: pageType, slug }); };
  const share = async () => { track("share_click", { channel: "native", page_type: pageType, slug }); try { await navigator.share({ url, text }); } catch {} };
  if (native) return <button type="button" onClick={share} className="min-h-11 underline">Share</button>;
  return <>
    <button type="button" onClick={copy} className="min-h-11 underline">Copy link</button>
    <span aria-live="polite" className="text-green">{copied ? "Copied" : ""}</span>
    {children}
  </>;
}
