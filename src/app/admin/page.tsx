import LogoutButton from "./logout-button";
import DrinkManager from "./drinks/drink-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const drinks = await prisma.drink.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">BLOOM COFFEE</p><h1>Admin</h1><p>Manage your menu and keep the customer experience fresh.</p></div><LogoutButton /></header>
    <DrinkManager initialDrinks={drinks} />
  </main>;
}
