"use client";
import { useMemo, useState } from "react";
import { useCopy, G, G2, INP } from "./_copy";
// All tools run in the browser. No AI calls, no network, nothing stored.
const lines = (s: string) => s.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
function shuffle<T>(a: T[], seed: number): T[] { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const Actions = ({ text, file, what }: { text: string; file: string; what: string }) => { const { msg, copy, download } = useCopy();
  return <div className="flex flex-wrap items-center gap-3 print:hidden"><button data-testid="copy" onClick={() => copy(text, what)} className={G}>Copy</button>
    <button onClick={() => download(text, file)} className={G2}>Download .txt</button><button onClick={() => window.print()} className={G2}>Print</button>
    <span role="status" data-testid="msg" className="text-green-dark">{msg}</span></div>; };
const Out = ({ t }: { t: string }) => <pre data-testid="out" className="whitespace-pre-wrap rounded-xl border border-rule bg-white p-5 font-mono text-sm">{t}</pre>;
const Two = ({ a, b }: { a: React.ReactNode; b: React.ReactNode }) => <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]"><div className="space-y-4 print:hidden">{a}</div><div className="space-y-4">{b}</div></div>;
const Safe = ({ t = "Tip: use first names, initials or numbers. Nothing you type leaves this page." }) => <p className="rounded-lg bg-surface-low p-3 text-sm">🔒 {t}</p>;
const SAMPLE = "Student 1\nStudent 2\nStudent 3\nStudent 4\nStudent 5\nStudent 6\nStudent 7\nStudent 8\nStudent 9\nStudent 10\nStudent 11\nStudent 12\nStudent 13\nStudent 14\nStudent 15\nStudent 16\nStudent 17\nStudent 18\nStudent 19\nStudent 20\nStudent 21\nStudent 22\nStudent 23";

export function GroupMaker() {
  const [names, setNames] = useState(SAMPLE), [mode, setMode] = useState<"groups" | "size">("groups"), [n, setN] = useState(5), [seed, setSeed] = useState(7);
  const list = lines(names);
  const groups = useMemo(() => { const s = shuffle(list, seed); const k = mode === "groups" ? Math.max(1, Math.min(n, s.length)) : Math.max(1, Math.ceil(s.length / Math.max(1, n))); const g: string[][] = Array.from({ length: k }, () => []); s.forEach((x, i) => g[i % k].push(x)); return g; }, [names, mode, n, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = groups.map((g, i) => `Group ${i + 1}: ${g.join(", ")}`).join("\n");
  return <Two a={<>
    <label className="block font-medium">Names, one per line (or comma separated)<textarea data-testid="names" rows={8} className={INP} value={names} onChange={(e) => setNames(e.target.value)}/></label>
    <fieldset><legend className="font-medium">Split by</legend><div className="mt-2 flex gap-2">{(["groups", "size"] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`rounded-full border px-4 py-2 ${mode === m ? "border-ink bg-surface-low font-semibold" : "border-rule bg-white"}`}>{m === "groups" ? "Number of groups" : "People per group"}</button>)}</div></fieldset>
    <label className="block font-medium">{mode === "groups" ? "How many groups?" : "How many per group?"}<input data-testid="n" type="number" min={1} max={50} className={INP} value={n} onChange={(e) => setN(Number(e.target.value) || 1)}/></label>
    <button data-testid="shuffle" onClick={() => setSeed(seed + 1)} className={G}>Shuffle again</button><Safe/></>}
    b={<><p className="text-sm text-ink-2" data-testid="summary">{list.length} names → {groups.length} groups</p>
      <div className="grid gap-3 sm:grid-cols-2" data-testid="groups">{groups.map((g, i) => <div key={i} className="rounded-xl border border-rule bg-white p-4"><h3 className="font-semibold">Group {i + 1} <span className="text-sm font-normal text-ink-2">({g.length})</span></h3><p className="text-sm">{g.join(", ")}</p></div>)}</div>
      <Actions text={text} file="groups.txt" what="Groups"/></>}/>;
}

export function SeatingChart() {
  const [names, setNames] = useState(SAMPLE), [cols, setCols] = useState(6), [seed, setSeed] = useState(3), [apart, setApart] = useState("");
  const list = lines(names); const pairs = apart.split("\n").map((l) => l.split(/[,+&]| and /).map((x) => x.trim()).filter(Boolean)).filter((p) => p.length === 2);
  const seats = useMemo(() => { let best = shuffle(list, seed), bad = 1e9; for (let t = 0; t < 200 && bad > 0; t++) { const s = shuffle(list, seed * 1000 + t); const pos = (x: string) => { const i = s.indexOf(x); return [Math.floor(i / cols), i % cols]; }; let b = 0; pairs.forEach(([a, c]) => { if (s.includes(a) && s.includes(c)) { const [r1, c1] = pos(a), [r2, c2] = pos(c); if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) b++; } }); if (b < bad) { bad = b; best = s; } } return { s: best, bad }; }, [names, cols, seed, apart]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows: string[][] = []; for (let i = 0; i < seats.s.length; i += cols) rows.push(seats.s.slice(i, i + cols));
  const text = "FRONT OF ROOM\n" + rows.map((r, i) => `Row ${i + 1}: ${r.join(" | ")}`).join("\n");
  return <Two a={<>
    <label className="block font-medium">Names, one per line<textarea data-testid="names" rows={7} className={INP} value={names} onChange={(e) => setNames(e.target.value)}/></label>
    <label className="block font-medium">Desks per row<input data-testid="cols" type="number" min={1} max={12} className={INP} value={cols} onChange={(e) => setCols(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}/></label>
    <label className="block font-medium">Keep apart (optional, one pair per line, e.g. &quot;Student 1, Student 2&quot;)<textarea data-testid="apart" rows={2} className={INP} value={apart} onChange={(e) => setApart(e.target.value)}/></label>
    <button data-testid="shuffle" onClick={() => setSeed(seed + 1)} className={G}>Shuffle seats</button><Safe/></>}
    b={<><p className="rounded-lg bg-ink py-1 text-center text-sm font-semibold text-white">Front of room</p>
      <div data-testid="chart" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>{seats.s.map((x) => <div key={x} className="truncate rounded-lg border border-rule bg-white p-2 text-center text-xs sm:text-sm">{x}</div>)}</div>
      {pairs.length > 0 && <p data-testid="apart-status" className="text-sm">{seats.bad === 0 ? "✓ Every keep-apart pair is separated." : `${seats.bad} pair(s) still sit next to each other. Try fewer pairs or more desks per row.`}</p>}
      <Actions text={text} file="seating-chart.txt" what="Seating chart"/></>}/>;
}

export function StudyGuide() {
  const [subject, setSubject] = useState("Biology"), [unit, setUnit] = useState("Cells"), [date, setDate] = useState(""),
    [terms, setTerms] = useState("Cell membrane: controls what enters and leaves the cell\nNucleus: holds the cell's DNA\nMitochondria: releases energy from food\nCell wall: gives plant cells their shape");
  const t = lines(terms.replace(/,/g, "‚")).map((l) => { const [a, ...b] = l.split(/[:\-–]/); return [a.trim(), b.join(":").trim()]; });
  const guide = `STUDY GUIDE: ${subject} · ${unit}${date ? `\nTest date: ${date}` : ""}

KEY TERMS
${t.map(([a, b], i) => `${i + 1}. ${a}: ${b || "________"}`).join("\n")}

SELF-TEST (cover the answers)
${t.map(([a], i) => `Q${i + 1}. What is ${a.toLowerCase()}, and why does it matter?`).join("\n")}

MATCH THE TERM
${shuffle(t.map(([, b]) => b || "?"), t.length).map((b, i) => `${String.fromCharCode(65 + i)}. ${b}`).join("\n")}

BIG QUESTIONS
1. How do these ideas connect to each other?
2. What is one example from class for each term?
3. What am I still unsure about? ____________________

PLAN
□ Read the guide once   □ Self-test without notes   □ Re-test the ones I missed`.replace(/‚/g, ",");
  return <Two a={<>
    <label className="block font-medium">Subject<input data-testid="subject" className={INP} value={subject} onChange={(e) => setSubject(e.target.value)}/></label>
    <label className="block font-medium">Unit or chapter<input data-testid="unit" className={INP} value={unit} onChange={(e) => setUnit(e.target.value)}/></label>
    <label className="block font-medium">Test date (optional)<input className={INP} value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. Friday"/></label>
    <label className="block font-medium">Key terms, one per line as &quot;term: meaning&quot;<textarea data-testid="terms" rows={7} className={INP} value={terms} onChange={(e) => setTerms(e.target.value)}/></label></>}
    b={<><Out t={guide}/><Actions text={guide} file="study-guide.txt" what="Study guide"/></>}/>;
}

const PR = { areas: ["Reading", "Writing", "Maths", "Science", "Behaviour", "Homework", "Participation"], levels: { "Strong progress": ["has made strong progress in {a} this term", "has moved forward well in {a} since the last report"], "Steady progress": ["is making steady progress in {a}", "continues to build skills in {a} at a steady pace"], "Needs support": ["is working towards the expected level in {a} and will benefit from extra support", "is still building confidence in {a}"] } as Record<string, [string, string]>,
  next: { "Practise at home": "Ten minutes of practice at home a few times a week will help.", "Ask for help sooner": "The next step is to ask for help as soon as something is unclear.", "Check work": "The next step is to check work carefully before handing it in.", "Keep it up": "Keeping up this effort will help [Name] keep growing." } as Record<string, string> };
export function ProgressReport() {
  const [area, setArea] = useState("Reading"), [level, setLevel] = useState("Steady progress"), [next, setNext] = useState("Practise at home"), [v, setV] = useState(0), [pron, setPron] = useState("they");
  const pp = pron === "he" ? "His" : pron === "she" ? "Her" : "Their";
  const out = [0, 1, 2].map((k) => { const s = PR.levels[level][(k + v) % 2].replace("{a}", area.toLowerCase()); const mids = [`${pp} effort in class has been noticeable.`, `${pp} recent work shows what ${pron} can do.`, `We have seen growth since the start of term.`]; return `[Name] ${s}. ${mids[(k + v) % 3]} ${PR.next[next]}`; });
  const text = out.join("\n\n");
  const Pills = ({ opts, val, set, id }: { opts: string[]; val: string; set: (s: string) => void; id: string }) => <div className="mt-2 flex flex-wrap gap-2" data-testid={id}>{opts.map((o) => <button key={o} type="button" aria-pressed={val === o} onClick={() => set(o)} className={`rounded-full border px-3 py-1.5 text-sm ${val === o ? "border-ink bg-surface-low font-semibold" : "border-rule bg-white"}`}>{o}</button>)}</div>;
  return <Two a={<>
    <fieldset><legend className="font-medium">Area</legend><Pills id="area" opts={PR.areas} val={area} set={setArea}/></fieldset>
    <fieldset><legend className="font-medium">Progress so far</legend><Pills id="level" opts={Object.keys(PR.levels)} val={level} set={setLevel}/></fieldset>
    <fieldset><legend className="font-medium">Next step</legend><Pills id="next" opts={Object.keys(PR.next)} val={next} set={setNext}/></fieldset>
    <fieldset><legend className="font-medium">Pronoun</legend><Pills id="pron" opts={["they", "she", "he"]} val={pron} set={setPron}/></fieldset><Safe t="We use [Name]. Add the real name in your own report system."/></>}
    b={<><div className="space-y-3" data-testid="comments">{out.map((c, i) => <p key={i} className="rounded-xl border border-rule bg-white p-4">{c}</p>)}</div>
      <button data-testid="mix" onClick={() => setV(v + 1)} className={G2}>Mix up the wording</button><Actions text={text} file="progress-comments.txt" what="Comments"/></>}/>;
}

export function SopBuilder() {
  const [title, setTitle] = useState("Opening the shop"), [purpose, setPurpose] = useState("Open on time with the till, floor and stock ready."), [owner, setOwner] = useState("Shift lead"), [freq, setFreq] = useState("Daily, before 9:00"),
    [steps, setSteps] = useState("Unlock and switch off the alarm\nTurn on lights, till and card reader\nCount the till float and note it in the log\nWalk the floor and restock front shelves\nFlip the sign to Open"), [ver, setVer] = useState("1.0");
  const st = steps.split("\n").map((x) => x.trim()).filter(Boolean);
  const doc = `STANDARD OPERATING PROCEDURE
Title: ${title}
Version: ${ver}    Owner: ${owner}    When: ${freq}

1. PURPOSE
${purpose}

2. SCOPE
Who this applies to: ________________   Where: ________________

3. WHAT YOU NEED
- ________________

4. STEPS
${st.map((s, i) => `4.${i + 1}  ${s}\n      Done ☐   Notes: __________`).join("\n")}

5. IF SOMETHING GOES WRONG
Who to call: ________________   What to log: ________________

6. SIGN-OFF
Approved by: ____________   Date: ____________   Next review: ____________`;
  return <Two a={<>
    <label className="block font-medium">Procedure name<input data-testid="title" className={INP} value={title} onChange={(e) => setTitle(e.target.value)}/></label>
    <label className="block font-medium">Purpose (one sentence)<input className={INP} value={purpose} onChange={(e) => setPurpose(e.target.value)}/></label>
    <div className="grid grid-cols-2 gap-3"><label className="block font-medium">Owner<input className={INP} value={owner} onChange={(e) => setOwner(e.target.value)}/></label><label className="block font-medium">Version<input className={INP} value={ver} onChange={(e) => setVer(e.target.value)}/></label></div>
    <label className="block font-medium">When it happens<input className={INP} value={freq} onChange={(e) => setFreq(e.target.value)}/></label>
    <label className="block font-medium">Steps, one per line<textarea data-testid="steps" rows={6} className={INP} value={steps} onChange={(e) => setSteps(e.target.value)}/></label></>}
    b={<><Out t={doc}/><Actions text={doc} file="sop.txt" what="SOP"/></>}/>;
}

export function AgendaBuilder() {
  const [title, setTitle] = useState("Weekly team meeting"), [start, setStart] = useState("10:00"), [goal, setGoal] = useState("Agree this week's priorities"),
    [items, setItems] = useState("Wins from last week | 5 | Everyone\nNumbers check | 10 | Owner\nTop 3 priorities | 20 | Team\nBlockers | 10 | Team\nActions and owners | 5 | Chair");
  const rows = items.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((r) => r[0]);
  const [h0, m0] = start.split(":").map(Number); let t = (h0 || 0) * 60 + (m0 || 0); const f = (x: number) => `${String(Math.floor(x / 60) % 24).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
  const timed = rows.map(([a, m, w]) => { const s = t; t += Number(m) || 0; return { a, m: Number(m) || 0, w: w || "", s: f(s) }; }); const total = timed.reduce((x, y) => x + y.m, 0);
  const doc = `MEETING AGENDA: ${title}
Goal: ${goal}
Time: ${start}–${f(t)} (${total} min)

${timed.map((r, i) => `${r.s}  ${i + 1}. ${r.a} (${r.m} min)${r.w ? ` · Lead: ${r.w}` : ""}`).join("\n")}

DECISIONS
- ________________
ACTIONS (who · what · by when)
- ________________`;
  return <Two a={<>
    <label className="block font-medium">Meeting name<input data-testid="title" className={INP} value={title} onChange={(e) => setTitle(e.target.value)}/></label>
    <div className="grid grid-cols-2 gap-3"><label className="block font-medium">Start time<input data-testid="start" type="time" className={INP} value={start} onChange={(e) => setStart(e.target.value)}/></label><label className="block font-medium">Goal<input className={INP} value={goal} onChange={(e) => setGoal(e.target.value)}/></label></div>
    <label className="block font-medium">Items: topic | minutes | who leads<textarea data-testid="items" rows={7} className={INP} value={items} onChange={(e) => setItems(e.target.value)}/></label></>}
    b={<><p data-testid="total" className="text-sm text-ink-2">Total: {total} min · ends {f(t)}</p><Out t={doc}/><Actions text={doc} file="meeting-agenda.txt" what="Agenda"/></>}/>;
}
