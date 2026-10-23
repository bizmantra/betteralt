"use client";
import Link from "next/link";
import { useState } from "react";
const PROMPT = `You are helping a teacher. Write a 10-question quiz for [year/grade] [subject] on [topic].
Use only these points we covered: [paste your lesson points, no student names].
Mix 6 multiple-choice (3 options), 2 true/false and 2 short-answer questions.
Use simple words for a [age]-year-old. Put the answer key at the end.`;
export default function CopyPrompt() {
  const [ok, setOk] = useState(false);
  return <div className="mt-4 rounded-xl border border-rule bg-white p-5">
    <pre className="whitespace-pre-wrap font-mono text-sm">{PROMPT}</pre>
    <button onClick={async () => { try { await navigator.clipboard.writeText(PROMPT); setOk(true); } catch { setOk(false); } }} className="mt-4 rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">{ok ? "Copied ✓" : "Copy prompt"}</button>
    <Link href="/proto/templates/lesson-plan" className="ml-4 underline">Plan the lesson first →</Link>
  </div>;
}
