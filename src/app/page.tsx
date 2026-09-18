import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const drinks = await prisma.drink.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  const addons = await prisma.addon.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return <MenuClient drinks={drinks} addons={addons} />;
}
