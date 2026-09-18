import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function parseDrink(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const basePriceCents = Number(form.get("basePriceCents"));

  if (!name || !description || !Number.isInteger(basePriceCents) || basePriceCents < 0) return null;
  const hasCustomizationConfig = form.has("seasonal") || form.getAll("addonIds").length > 0 || form.has("customizationsConfigured");
  const hasTemperatureConfig = form.has("supportsHot") || form.has("supportsCold");
  if (hasTemperatureConfig && form.get("supportsHot") !== "true" && form.get("supportsCold") !== "true") return null;
  const addonIds = form.getAll("addonIds").map(String);
  const defaultAddonIds = new Set(form.getAll("defaultAddonIds").map(String));
  return {
    name,
    description,
    basePriceCents,
    hasCustomizationConfig,
    seasonal: form.get("seasonal") === "true",
    addonIds,
    defaultAddonIds,
    hasTemperatureConfig,
    supportsHot: form.get("supportsHot") === "true",
    supportsCold: form.get("supportsCold") === "true",
  };
}

export async function GET() {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const drinks = await prisma.drink.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(drinks);
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseDrink(await request.formData());
  const drink = parsed && {
    name: parsed.name,
    description: parsed.description,
    basePriceCents: parsed.basePriceCents,
    ...(parsed.hasCustomizationConfig ? { seasonal: parsed.seasonal, customizationsConfigured: true } : {}),
    ...(parsed.hasCustomizationConfig ? {
      customizations: {
        create: parsed.addonIds.map((addonId) => ({ addon: { connect: { id: addonId } }, defaultSelected: parsed.defaultAddonIds.has(addonId) })),
      },
    } : {}),
    ...(parsed.hasTemperatureConfig ? { supportsHot: parsed.supportsHot, supportsCold: parsed.supportsCold } : {}),
  };
  if (!drink) return NextResponse.json({ error: "Name, description, and a valid price are required." }, { status: 400 });

  try {
    const created = await prisma.drink.create({ data: drink });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the drink. Make sure the selected customizations still exist." }, { status: 400 });
  }
}
