import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function parseDrink(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const basePriceCents = Number(form.get("basePriceCents"));

  if (!name || !description || !Number.isInteger(basePriceCents) || basePriceCents < 0) return null;
  return { name, description, basePriceCents };
}

export async function GET() {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const drinks = await prisma.drink.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(drinks);
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const drink = parseDrink(await request.formData());
  if (!drink) return NextResponse.json({ error: "Name, description, and a valid price are required." }, { status: 400 });

  const created = await prisma.drink.create({ data: drink });
  return NextResponse.json(created, { status: 201 });
}
