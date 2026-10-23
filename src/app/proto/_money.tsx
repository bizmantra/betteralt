import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, Btn } from "./_ui";
import { tool, fmt } from "./_data";
import { ROLES, type RoleSlug } from "./_usecases";
import { JsonLd } from "@/components/ui";
import { CopyBox } from "./_copy";
import Signup from "./Signup";
import LessonPlan from "./LessonPlan";
import ReportCard from "./ReportCard";
import { GroupMaker, SeatingChart, StudyGuide, ProgressReport, SopBuilder, AgendaBuilder } from "./Tools8";

// Money pages: one search intent each. Keywords from /workspace/corpus/inventory.csv (DataForSEO US, 23 Oct 2026); kept server-side, never rendered.
export type CatSlug = "classroom" | "running-a-business";
export type Task = "Grouping & seating" | "Planning" | "Feedback" | "Studying" | "Processes" | "Meetings";
type Pick = { name: string; url: string; why: string; cost: string; price: string; src: string; date: string; verified: boolean };
const P = (slug: string, why: string, cost: string): Pick => { const t = tool(slug); const v = t.pricing.verified && !!t.pricing.summary;
  return { name: t.name, url: t.url, why, cost: v ? cost : "See pricing", price: v ? t.pricing.summary! : "See pricing", src: t.pricing.sourceUrl, date: fmt(t.pricing.lastChecked), verified: v }; };
type Quote = { quote: string; title: string; permalink: string; sub: string };
export type Money = { slug: string; cat: CatSlug; task: Task; intent: "Free tool" | "Template"; title: string; h1: string; lede: string; card: string; keyword: string; roles: RoleSlug[];
  toolName: string; tool: ReactNode; steps: string[]; prompts: { label: string; text: string }[]; picks: Pick[]; watch: ReactNode[]; faq: [string, string][]; quotes?: Quote[]; read?: { n: number; links: string[] }; pair?: { label: string; href: string; note: string }; related: string[] };
const NAMES = <><b>Leave out real names.</b> Don&apos;t paste student, staff or customer names into an AI chat. Use placeholders like [Name] and fill them in yourself.</>;
const WRONG = <><b>AI can be wrong.</b> It can make up facts. Read every line before you use it. You are responsible for what you hand out or send.</>;
const FREE: [string, string] = ["Is this free? Do I need an account?", "Yes, it's free, and no account is needed. It runs in your browser and we don't save or send what you type."];
const R = (quote: string, title: string, permalink: string) => ({ quote, title, permalink, sub: permalink.split("/")[4] });

export const MONEY: Money[] = [
  { slug: "random-group-generator", cat: "classroom", task: "Grouping & seating", intent: "Free tool", keyword: "random group generator", roles: ["teacher", "tutor"],
    title: "Random group generator: split a class into groups free", h1: "Random group generator", card: "Paste names, pick a group count or size, get fair random groups.",
    lede: "Paste a list of names and split it into random groups in one click. Choose how many groups or how many people per group, then shuffle until you're happy.",
    toolName: "Random group generator", tool: <GroupMaker/>,
    steps: ["Paste names, one per line. First names, initials or numbers work fine.", "Choose 'Number of groups' or 'People per group' and set the number.", "Press 'Shuffle again' until the mix looks right.", "Copy, print or download the groups to show on the board."],
    prompts: [{ label: "Give each group a task", text: "I have [N] groups of [age] students studying [topic]. Suggest one 15-minute task per group, each a different angle on the topic, with a 1-line instruction card for each." }],
    picks: [P("google-sheets", "Keep a reusable class list and paste it here each time.", "Free with a Google account.")],
    watch: [<><b>Random isn&apos;t always fair.</b> Check that no group ends up with all your strongest or all your quietest students, and swap by hand if needed.</>, NAMES],
    faq: [FREE, ["How are uneven numbers handled?", "Extra people are spread one per group, so group sizes never differ by more than one."], ["Can I keep two people apart?", "Use the seating chart maker, which has a keep-apart option, or swap them by hand after shuffling."]],
    related: ["seating-chart-generator", "lesson-plan-template", "meeting-agenda-template"] },
  { slug: "lesson-plan-template", cat: "classroom", task: "Planning", intent: "Template", keyword: "lesson plan template", roles: ["teacher", "tutor"],
    title: "Lesson plan template: free, printable, timed", h1: "Lesson plan template", card: "A timed, printable lesson plan: objective, warm-up, teach, check, close.",
    lede: "A simple lesson plan template with timings already worked out. Fill in the grade, subject and topic, then print it or copy it into your own doc.",
    toolName: "Lesson plan template", tool: <LessonPlan/>,
    steps: ["Pick grade, subject, topic and lesson length.", "Print the template or copy it into Google Docs or Word.", "Fill in the objective first, then the check for understanding, then the activities.", "Want help with the content? Copy the prompt into a free AI chat and check the result."],
    prompts: [{ label: "Add support and stretch", text: "Rewrite this lesson plan with one extra-help activity and one challenge for early finishers. Keep the same timings.\n\n[paste your lesson plan]" }],
    picks: [P("magicschool", "Made for teachers; generates plans without writing a prompt.", "Free for teachers."), P("chatgpt", "Works well with the prompt from the template.", "Free plan works for this."), P("gemini", "Handy if you plan in Google Docs.", "Free plan works for this.")],
    watch: [NAMES, WRONG, <><b>Check your school&apos;s rules.</b> Some schools only allow approved AI tools.</>],
    quotes: [R("I take 4 hours to do it even using AI", "Even using ChatGPT I take way too long to do lesson planning.", "https://www.reddit.com/r/Teachers/comments/1spnyis/even_using_chatgpt_i_take_way_too_long_to_do/"), R("The trouble is that whenever I sit down and try to lesson plan, I hit a wall.", "Completely overwhelmed by lesson planning. Help!", "https://www.reddit.com/r/Teachers/comments/15c5nft/completely_overwhelmed_by_lesson_planning_help/")],
    pair: { label: "Want AI to write the whole plan?", href: "/teachers/ai-lesson-plan-generator", note: "That's a different job. See our AI lesson plan generator comparison." },
    faq: [FREE, ["Can I edit it?", "Yes. Download it as text, or copy it into any doc and change anything."], ["Does it work for a 30-minute or 90-minute lesson?", "Yes. Pick the length and the timings adjust."]],
    related: ["study-guide-maker", "random-group-generator", "report-card-comments"] },
  { slug: "seating-chart-generator", cat: "classroom", task: "Grouping & seating", intent: "Free tool", keyword: "seating chart generator", roles: ["teacher"],
    title: "Seating chart generator: free classroom seating plan", h1: "Seating chart generator", card: "Rows of desks, random seats, and pairs kept apart.",
    lede: "Make a classroom seating chart in seconds. Set desks per row, shuffle the seats, and list any pairs who shouldn't sit together.",
    toolName: "Seating chart generator", tool: <SeatingChart/>,
    steps: ["Paste your class list, one name per line.", "Set how many desks are in each row.", "Add any pairs to keep apart, one pair per line.", "Shuffle until it looks right, then print it for your desk or the sub folder."],
    prompts: [{ label: "Plan seating for group work", text: "I teach [N] students in rows of [K]. Suggest three seating layouts (rows, pairs, groups of four) and when each works best for [subject]. No student names." }],
    picks: [P("google-sheets", "Keep a seating grid you can recolour and reuse each term.", "Free with a Google account.")],
    watch: [<><b>Think about needs first.</b> Seat students with sight, hearing or support plans before you shuffle everyone else.</>, NAMES],
    faq: [FREE, ["How does keep-apart work?", "The tool tries up to 200 layouts and picks one where no listed pair sits side by side, in front or behind, or diagonally. It tells you if it can't separate everyone."], ["Can I print it?", "Yes. Press Print; the form is hidden and only the chart prints."]],
    related: ["random-group-generator", "lesson-plan-template", "progress-report-comments"] },
  { slug: "study-guide-maker", cat: "classroom", task: "Studying", intent: "Free tool", keyword: "study guide maker", roles: ["student", "teacher", "tutor"],
    title: "Study guide maker: turn key terms into a study guide", h1: "Study guide maker", card: "Key terms in, a one-page guide with a self-test out.",
    lede: "Type the key terms for a unit and get a one-page study guide with definitions, self-test questions, a matching exercise and a revision checklist.",
    toolName: "Study guide maker", tool: <StudyGuide/>,
    steps: ["Enter the subject and unit.", "Add key terms as 'term: meaning', one per line.", "Print the guide and cover the answers to self-test.", "Re-test only the terms you missed."],
    prompts: [{ label: "Make practice questions", text: "Here are my key terms for [unit]. Write 10 practice questions of mixed difficulty with an answer key. Don't add facts that aren't in my notes.\n\n[paste terms]" }],
    picks: [P("quizlet", "Turns terms into flashcards and games.", "See pricing"), P("chatgpt", "Writes practice questions from your notes with our prompt.", "Free plan works for this."), P("notion-ai", "Good if your notes already live in Notion.", "AI is on the Business plan.")],
    watch: [WRONG, <><b>Use your own notes.</b> Build the guide from what your teacher covered, not from a general AI answer, so it matches the test.</>],
    faq: [FREE, ["Can a teacher make one for the class?", "Yes. Fill in the terms, print it, and hand it out."], ["Does it make flashcards?", "It makes a matching exercise and self-test. For flashcards, paste the same terms into a flashcard app."]],
    related: ["lesson-plan-template", "report-card-comments", "random-group-generator"] },
  { slug: "report-card-comments", cat: "classroom", task: "Feedback", intent: "Free tool", keyword: "report card comments", roles: ["teacher", "tutor"],
    title: "Report card comments: free builder with editable examples", h1: "Report card comments", card: "Pick strengths and next steps; get three kind, specific comments.",
    lede: "Pick a student's strengths and one or two things to work on, and get three ready-to-edit report card comments in the tone you want.",
    toolName: "Report card comment builder", tool: <ReportCard/>,
    steps: ["Pick strengths and one or two things to work on.", "Choose a tone.", "Copy the comment you like, or mix up the wording.", "Paste it into your report system, replace [Name], and add one detail only you know."],
    prompts: [{ label: "Turn notes into a comment", text: "Turn these notes into a 3-sentence report card comment. Use [Name]. Be warm and specific and end with one next step.\nNotes: [your short notes]" }, { label: "Soften the wording", text: "Rewrite this comment so it's honest but constructive, with one clear next step a parent can support at home:\n[paste comment]" }],
    picks: [P("magicschool", "Has report card tools made for this job.", "Free for teachers."), P("chatgpt", "Extra variety with our prompt.", "Free plan works for this."), P("claude", "Calm, natural wording.", "Free plan works for this.")],
    watch: [NAMES, WRONG, <><b>Words get read closely.</b> Parents can read a lot into one phrase. Describe behaviour and next steps, not the child&apos;s character.</>],
    quotes: [R("Parent immediately contacted my admin and had him change the comment to a more positive wording", "Parent claims my report card comment is ruining her daughter's future.", "https://www.reddit.com/r/Teachers/comments/1k4x682/parent_claims_my_report_card_comment_is_ruining/")],
    pair: { label: "Writing mid-term progress notes instead?", href: "/proto/classroom/progress-report-comments", note: "Progress report comments focus on movement since last term." },
    faq: [FREE, ["Does this use AI?", "No. It puts together sentences we wrote, in your browser."], ["Why [Name]?", "So no student details go into a website or AI tool."]],
    related: ["progress-report-comments", "lesson-plan-template", "study-guide-maker"] },
  { slug: "progress-report-comments", cat: "classroom", task: "Feedback", intent: "Free tool", keyword: "progress report comments", roles: ["teacher", "tutor"],
    title: "Progress report comments: free mid-term comment builder", h1: "Progress report comments", card: "Area, progress level and next step in; short progress notes out.",
    lede: "Mid-term progress notes are about direction, not a final grade. Pick the area, how it's going and a next step, and get three short comments.",
    toolName: "Progress report comment builder", tool: <ProgressReport/>,
    steps: ["Pick the area: reading, maths, behaviour and so on.", "Choose how progress is going.", "Pick one next step a family can help with.", "Copy a comment, replace [Name], and add one specific example."],
    prompts: [{ label: "From notes to progress note", text: "Write a 2-sentence progress report comment for [area]. Progress: [strong/steady/needs support]. Next step: [step]. Use [Name]. Keep it plain and kind." }],
    picks: [P("magicschool", "Teacher-specific comment tools.", "Free for teachers."), P("chatgpt", "Works with our prompt.", "Free plan works for this."), P("claude", "Natural, gentle wording.", "Free plan works for this.")],
    watch: [NAMES, WRONG, <><b>Be specific.</b> One real example from class matters more than a polished sentence.</>],
    pair: { label: "Writing end-of-term report cards?", href: "/proto/classroom/report-card-comments", note: "Use the report card comment builder for final reports." },
    faq: [FREE, ["How is this different from report card comments?", "Progress reports go out mid-term and focus on movement and next steps; report cards summarise the term."], ["Can I pick he, she or they?", "Yes, choose a pronoun in the builder."]],
    related: ["report-card-comments", "seating-chart-generator", "lesson-plan-template"] },
  { slug: "sop-template", cat: "running-a-business", task: "Processes", intent: "Template", keyword: "sop template", roles: ["small-business", "healthcare-office"],
    title: "SOP template: free standard operating procedure builder", h1: "SOP template", card: "Purpose, owner, numbered steps with checkboxes, sign-off.",
    lede: "A standard operating procedure template you fill in on the page: purpose, owner, numbered steps with checkboxes, what to do when things go wrong, and sign-off.",
    toolName: "SOP template", tool: <SopBuilder/>,
    steps: ["Name the procedure and write its purpose in one sentence.", "List the steps in the order someone new would do them.", "Print it and have someone new follow it while you watch.", "Fix the steps they got stuck on, bump the version, and sign it off."],
    prompts: [{ label: "Turn a messy description into steps", text: "Turn this description into a numbered SOP with no more than 10 steps, written so a new hire could follow it on day one. Flag anything unclear as a question.\n\n[describe how you do the task]" }],
    picks: [P("google-docs", "Simple place to keep and share SOPs.", "Free with a Google account."), P("notion-ai", "Good for a searchable SOP library.", "AI is on the Business plan."), P("chatgpt", "Turns rough notes into steps with our prompt.", "Free plan works for this.")],
    watch: [WRONG, <><b>Don&apos;t paste secrets.</b> Leave alarm codes, passwords and customer data out of AI chats and out of shared SOPs.</>, <><b>Don&apos;t document everything.</b> Start with the tasks new people get wrong most often.</>],
    quotes: [R("I tried writing some out but it was honestly really tedious and time consuming", "How are you guys writing SOPs?", "https://www.reddit.com/r/smallbusiness/comments/1ks4cib/how_are_you_guys_writing_sops/"), R("companies start with no SOPS, find they are needed, go overboard and document every action", "SOP's for Absolutely Everything?", "https://www.reddit.com/r/smallbusiness/comments/1q04ekb/sops_for_absolutely_everything/")],
    faq: [FREE, ["What should an SOP include?", "Purpose, who it's for, what you need, numbered steps, what to do when it goes wrong, and who approved it."], ["Can I use it in Word or Google Docs?", "Yes. Copy or download it and paste it in."]],
    related: ["meeting-agenda-template"] },
  { slug: "meeting-agenda-template", cat: "running-a-business", task: "Meetings", intent: "Template", keyword: "meeting agenda template", roles: ["small-business", "freelancer"],
    title: "Meeting agenda template: free timed agenda builder", h1: "Meeting agenda template", card: "Topics, minutes and leads in; a timed agenda with start times out.",
    lede: "Fill in the topics, minutes and who leads each one, and get a timed meeting agenda with start times, a goal, and space for decisions and actions.",
    toolName: "Meeting agenda template", tool: <AgendaBuilder/>,
    steps: ["Write the one goal of the meeting.", "List topics as 'topic | minutes | who leads'.", "Check the end time and cut items if it runs long.", "Send it before the meeting and fill in decisions and actions during it."],
    prompts: [{ label: "Tighten an agenda", text: "Here is my meeting agenda. Cut it to fit [N] minutes, keep the items that serve the goal '[goal]', and suggest which items could be an email instead.\n\n[paste agenda]" }],
    picks: [P("google-docs", "Share the agenda and take notes in one doc.", "Free with a Google account."), P("notion-ai", "Templates for recurring meetings.", "AI is on the Business plan."), P("chatgpt", "Tightens agendas with our prompt.", "Free plan works for this.")],
    watch: [WRONG, <><b>Keep it short.</b> If an item has no decision or owner, it may be better as an email.</>],
    faq: [FREE, ["How long should a meeting agenda be?", "Most weekly meetings work with 3 to 6 items. The builder shows the total time so you can cut."], ["Can I reuse it every week?", "Yes. Download it, then paste last week's items back in."]],
    related: ["sop-template"] },
];
export const CATS: Record<CatSlug, { name: string; h1: string; intro: string; icon: string; other: CatSlug; audience: RoleSlug[] }> = {
  classroom: { name: "Classroom", h1: "Free classroom tools", icon: "school", other: "running-a-business", audience: ["teacher", "tutor", "student"], intro: "Free tools for running a class: grouping, seating, planning, studying and feedback. Each one works in your browser with no sign-up." },
  "running-a-business": { name: "Running a business", h1: "Free tools for running a business", icon: "shop", other: "classroom", audience: ["small-business", "freelancer"], intro: "Free templates for the paperwork of running a small team: procedures and meetings. Fill them in on the page, then copy, print or download." },
};
export const inCat = (c: CatSlug) => MONEY.filter((m) => m.cat === c);
export const href = (m: Money) => `/proto/${m.cat}/${m.slug}`;
const BASE = "https://findbetteralt.com";
const aud = (r: RoleSlug[]) => r.map((s) => { const x = ROLES.find((y) => y.slug === s)!; return { "@type": x.audience.type, audienceType: x.audience.name }; });
const H2 = ({ id, children }: { id: string; children: ReactNode }) => <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">{children}</h2>;

export function MoneyPage({ m }: { m: Money }) {
  const c = CATS[m.cat], url = BASE + href(m), audience = aud(m.roles);
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${url}#app`, name: m.toolName, url, applicationCategory: "UtilitiesApplication", operatingSystem: "Any (runs in the browser)", isAccessibleForFree: true, offers: { "@type": "Offer", price: 0, priceCurrency: "USD" }, audience },
    { "@type": "HowTo", "@id": `${url}#howto`, name: m.h1, audience, tool: [{ "@type": "HowToTool", name: m.toolName }], step: m.steps.map((t, i) => ({ "@type": "HowToStep", position: i + 1, text: t })) },
    { "@type": "BreadcrumbList", itemListElement: [["Home", "/proto"], [c.name, `/proto/${m.cat}`], [m.h1, href(m)]].map(([n, h], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: BASE + h })) },
    { "@type": "FAQPage", mainEntity: m.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } ] };
  const rel = m.related.map((s) => MONEY.find((x) => x.slug === s)!);
  return <main data-testid="money"><JsonLd data={ld}/>
    <section className="border-b border-rule bg-white"><div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2"><Link href="/proto">Home</Link> › <Link href={`/proto/${m.cat}`}>{c.name}</Link> › <span>{m.h1}</span></nav>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-green">{m.intent} · {m.task}</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{m.h1}</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-2">{m.lede}</p>
      <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 text-sm font-medium text-green-dark"><Icon n="check" c="h-4 w-4"/>Free · no sign-up · runs in your browser</p>
    </div></section>
    <div className="mx-auto max-w-6xl space-y-14 px-5 pt-8">
      <section aria-labelledby="tool" className="rounded-2xl border border-rule bg-white p-5 shadow-sm sm:p-6"><H2 id="tool">{m.toolName}</H2><div className="mt-5">{m.tool}</div></section>
      {m.pair && <p className="rounded-xl border border-rule bg-surface-low p-4" data-testid="pair"><b>{m.pair.label}</b> {m.pair.note} <Link className="font-semibold text-green underline" href={m.pair.href}>Go there →</Link></p>}
      <div className="grid gap-14 lg:grid-cols-[2fr_1fr]"><div className="space-y-14">
        <section aria-labelledby="how"><H2 id="how">How to do it</H2><ol className="mt-4 space-y-3">{m.steps.map((s, i) => <li key={s} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-low font-semibold">{i + 1}</span><span className="pt-1">{s}</span></li>)}</ol></section>
        {m.quotes && <section aria-labelledby="heard"><H2 id="heard">What people say about this job</H2><div className="mt-4 space-y-3">{m.quotes.map((q) => <figure key={q.permalink} className="rounded-xl border border-rule bg-white p-5"><blockquote className="text-lg">&ldquo;{q.quote}&rdquo;</blockquote><figcaption className="mt-2 text-sm text-ink-2">From the Reddit post <a className="underline" href={q.permalink} target="_blank" rel="noopener nofollow">&ldquo;{q.title}&rdquo;</a> in r/{q.sub}</figcaption></figure>)}</div></section>}
        <section aria-labelledby="pr"><H2 id="pr">Prompts you can copy</H2><p className="mt-1 text-ink-2">Optional. The tool above needs no AI.</p><div className="mt-4 space-y-5">{m.prompts.map((p) => <div key={p.label}><h3 className="mb-2 font-semibold">{p.label}</h3><CopyBox text={p.text}/></div>)}</div></section>
        <section aria-labelledby="cost"><H2 id="cost">AI and paid tools for this job, and what they cost</H2>
          <p className="mt-1 text-ink-2">Prices in USD from each company&apos;s own pricing page, with the date we checked. No company pays for placement. Our picks are not yet backed by a hands-on test.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{m.picks.map((p) => <div key={p.name} data-testid="pick" className="flex flex-col rounded-xl border border-rule bg-white p-5"><h3 className="text-xl font-semibold">{p.name}</h3><p className="text-ink-2">{p.why}</p>
            <p className="mt-2 font-semibold text-green-dark">{p.cost}</p><p className="text-sm" data-testid="price">{p.verified ? p.price : <a className="underline" href={p.src} target="_blank" rel="noopener nofollow">See pricing</a>}</p>
            {p.verified && <p className="text-sm text-ink-2">Checked <span className="font-mono">{p.date}</span> · <a className="underline" href={p.src} target="_blank" rel="noopener nofollow">source</a></p>}
            <div className="mt-auto pt-3"><Btn href={p.url} ext>Open {p.name} ↗</Btn></div></div>)}</div></section>
        <section aria-labelledby="watch" className="rounded-xl border border-rule bg-surface-low p-6"><H2 id="watch">Watch out for</H2><ul className="mt-4 space-y-4">{m.watch.map((w, i) => <li key={i} className="flex gap-3"><Icon n="warn" c="h-6 w-6 shrink-0"/><span>{w}</span></li>)}</ul></section>
        <section aria-labelledby="faq"><H2 id="faq">Questions people ask</H2><div className="mt-4 divide-y divide-rule rounded-xl border border-rule bg-white">{m.faq.map(([q, a]) => <details key={q} className="p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-ink-2">{a}</p></details>)}</div></section>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><h2 className="text-xl font-semibold">More in {c.name}</h2>
        {rel.map((x) => <Link key={x.slug} href={href(x)} className="block rounded-xl border border-rule bg-white p-4 hover:border-green"><p className="text-xs text-ink-2">{x.intent}</p><p className="font-semibold">{x.h1}</p><p className="text-sm text-ink-2">{x.card}</p></Link>)}
        <Link href={`/proto/${m.cat}`} className="block font-semibold text-green underline">All {c.name.toLowerCase()} tools →</Link><Signup compact/></aside></div>
      <section className="text-sm text-ink-2" aria-labelledby="src"><h2 id="src" className="text-xl font-semibold text-ink">Sources</h2><ul className="mt-2 list-disc space-y-1 pl-5">
        {m.picks.map((p) => <li key={p.name}>{p.name} pricing: <a className="underline" href={p.src} target="_blank" rel="noopener nofollow">{p.src}</a>{p.verified ? `, checked ${p.date}` : ", not yet verified by us"}</li>)}
        {m.quotes?.map((q) => <li key={q.permalink}>Reddit: <a className="underline" href={q.permalink} target="_blank" rel="noopener nofollow">{q.permalink}</a></li>)}</ul></section>
    </div></main>;
}
export const moneyMeta = (m: Money) => ({ title: `${m.title} (prototype)`, description: m.lede });
