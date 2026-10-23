import UseCaseGrid from "../UseCaseGrid";
export const metadata = { title: "Use cases: get everyday work done with AI (prototype)" };
export default function Page() {
  return <main className="mx-auto max-w-6xl px-5 py-10">
    <h1 className="font-serif text-4xl sm:text-5xl">What do you need to get done?</h1>
    <p className="mt-3 max-w-2xl text-lg text-ink-2">Pick a task. Each one shows how to do it with AI, the tool that fits, what it costs, and what to watch out for. Some include a free tool you can use right here.</p>
    <div className="mt-8"><UseCaseGrid/></div>
  </main>;
}
