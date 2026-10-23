import { CategoryPage } from "../_cat";
import { CATS } from "../_money";
export const metadata = { title: `${CATS["running-a-business"].h1} (prototype)`, description: CATS["running-a-business"].intro };
export default function Page() { return <CategoryPage cat="running-a-business"/>; }
