import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function parseAddon(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const priceCents = Number(form.get("priceCents"));
  const category = String(form.get("category") || "OTHER");
  if (!name || !Number.isInteger(priceCents) || priceCents < 0 || !["MILK", "SYRUP", "EXTRA", "OTHER"].includes(category)) return null;
  return { name, priceCents, category: category as "MILK" | "SYRUP" | "EXTRA" | "OTHER", hasCategory: form.has("category") };
}

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addon = parseAddon(await request.formData());
  if (!addon) return NextResponse.json({ error: "Name and a valid non-negative price are required." }, { status: 400 });
  try {
    const { id } = await context.params;
    const data = addon.hasCategory ? { name: addon.name, priceCents: addon.priceCents, category: addon.category } : { name: addon.name, priceCents: addon.priceCents };
    return NextResponse.json(await prisma.addon.update({ where: { id }, data }));
  } catch {
    return NextResponse.json({ error: "Add-on not found." }, { status: 404 });
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isAdminRequestAuthorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    return NextResponse.json(await prisma.addon.update({ where: { id }, data: { active: false } }));
  } catch {
    return NextResponse.json({ error: "Add-on not found." }, { status: 404 });
  }
}
