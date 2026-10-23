"use client";
import { useState } from "react";
export function useCopy() {
  const [msg, setMsg] = useState("");
  const copy = async (s: string, what: string) => { try { await navigator.clipboard.writeText(s); setMsg(`${what} copied`); } catch { setMsg("Copy blocked. Select the text and press Ctrl/⌘+C."); } };
  const download = (s: string, name: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([s], { type: "text/plain" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); setMsg(`Downloaded ${name}`); };
  return { msg, copy, download };
}
export const G = "rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark";
export const G2 = "rounded-xl border-2 border-green px-5 py-3 font-semibold text-green";
export const INP = "mt-1 w-full rounded-xl border border-ink bg-white px-4 py-3";
export function CopyBox({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const { msg, copy } = useCopy();
  return <div className="rounded-xl border border-rule bg-white p-5"><pre className="whitespace-pre-wrap font-mono text-sm">{text}</pre>
    <div className="mt-3 flex items-center gap-4"><button onClick={() => copy(text, "Prompt")} className={G}>{label}</button><span role="status" className="text-green-dark">{msg}</span></div></div>;
}
