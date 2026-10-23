import { CategoryPage } from "../_cat";
import { CATS } from "../_money";
export const metadata = { title: `${CATS["classroom"].h1} (prototype)`, description: CATS["classroom"].intro };
export default function Page() { return <CategoryPage cat="classroom"/>; }
