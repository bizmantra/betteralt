import { notFound } from "next/navigation";
import { MONEY, MoneyPage, moneyMeta } from "../../_money";
const list = MONEY.filter((m) => m.cat === "running-a-business");
export const dynamicParams = false;
export function generateStaticParams() { return list.map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const m = list.find((x) => x.slug === slug); return m ? moneyMeta(m) : {}; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const m = list.find((x) => x.slug === slug); if (!m) notFound(); return <MoneyPage m={m}/>; }
