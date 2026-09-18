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

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const drink = parseDrink(await request.formData());
  if (!drink) return NextResponse.json({ error: "Name, description, and a valid price are required." }, { status: 400 });

  const { id } = await context.params;
  try {
    const updated = await prisma.drink.update({ where: { id }, data: drink });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Drink not found." }, { status: 404 });
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  try {
    // Soft-delete keeps existing order relationships and historical menu data intact.
    const deleted = await prisma.drink.update({ where: { id }, data: { active: false } });
    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: "Drink not found." }, { status: 404 });
  }
}
