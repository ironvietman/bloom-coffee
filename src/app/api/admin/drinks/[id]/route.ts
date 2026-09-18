import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function parseDrink(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const basePriceCents = Number(form.get("basePriceCents"));
  if (!name || !description || !Number.isInteger(basePriceCents) || basePriceCents < 0) return null;
  const hasCustomizationConfig = form.has("seasonal") || form.getAll("addonIds").length > 0 || form.has("customizationsConfigured");
  return {
    name,
    description,
    basePriceCents,
    hasCustomizationConfig,
    seasonal: form.get("seasonal") === "true",
    addonIds: form.getAll("addonIds").map(String),
    defaultAddonIds: new Set(form.getAll("defaultAddonIds").map(String)),
  };
}

const drinkInclude = { customizations: { include: { addon: true } } } as const;

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseDrink(await request.formData());
  if (!parsed) return NextResponse.json({ error: "Name, description, and a valid price are required." }, { status: 400 });

  const { id } = await context.params;
  try {
    if (!parsed.hasCustomizationConfig) {
      const updated = await prisma.drink.update({ where: { id }, data: { name: parsed.name, description: parsed.description, basePriceCents: parsed.basePriceCents } });
      return NextResponse.json(updated);
    }
    const updated = await prisma.drink.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description,
        basePriceCents: parsed.basePriceCents,
        seasonal: parsed.seasonal,
        customizationsConfigured: true,
        customizations: {
          deleteMany: {},
          create: parsed.addonIds.map((addonId) => ({ addon: { connect: { id: addonId } }, defaultSelected: parsed.defaultAddonIds.has(addonId) })),
        },
      },
      include: drinkInclude,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not save the drink. Make sure the selected customizations still exist." }, { status: 400 });
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
