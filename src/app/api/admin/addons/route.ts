import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function parseAddon(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const priceCents = Number(form.get("priceCents"));
  if (!name || !Number.isInteger(priceCents) || priceCents < 0) return null;
  return { name, priceCents };
}

export async function GET() {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addons = await prisma.addon.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(addons);
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addon = parseAddon(await request.formData());
  if (!addon) return NextResponse.json({ error: "Name and a valid non-negative price are required." }, { status: 400 });
  return NextResponse.json(await prisma.addon.create({ data: addon }), { status: 201 });
}
