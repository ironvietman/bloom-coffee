import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.drink.findMany({
    where: { active: true },
    orderBy: [{ seasonal: "desc" }, { createdAt: "asc" }],
    include: { customizations: { include: { addon: true, } } },
  });
  const addons = await prisma.addon.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  const drinks = rows.map(({ customizations, ...drink }) => ({
    ...drink,
    customizations: customizations.map(({ addon, defaultSelected }) => ({ ...addon, defaultSelected })),
  }));
  return <MenuClient drinks={drinks} addons={addons} />;
}
