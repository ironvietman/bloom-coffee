import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseOrderRequest, type SubmittedItem } from "@/lib/order-request";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }

  const parsed = parseOrderRequest(body);
  if (!parsed) {
    return NextResponse.json({ error: "A name and at least one valid item are required." }, { status: 400 });
  }

  const { customerName, items: submittedItems } = parsed;
  const drinkIds = [...new Set(submittedItems.map((item) => item.drinkId))];
  const addonIds = [...new Set(submittedItems.flatMap((item) => item.addonIds || []))];
  const [drinks, addons] = await Promise.all([
    prisma.drink.findMany({ where: { id: { in: drinkIds }, active: true } }),
    addonIds.length > 0 ? prisma.addon.findMany({ where: { id: { in: addonIds }, active: true } }) : [],
  ]);

  const drinkById = new Map(drinks.map((drink) => [drink.id, drink]));
  const addonById = new Map(addons.map((addon) => [addon.id, addon]));
  const orderItems = [];
  let totalCents = 0;

  for (const item of submittedItems) {
    const drink = drinkById.get(item.drinkId);
    const selectedAddons = [...new Set(item.addonIds || [])].map((id) => addonById.get(id));
    if (!drink || selectedAddons.some((addon) => !addon)) {
      return NextResponse.json({ error: "One or more menu items are no longer available." }, { status: 409 });
    }

    const validAddons = selectedAddons.filter((addon) => addon !== undefined);
    const unitPriceCents = drink.basePriceCents + validAddons.reduce((sum, addon) => sum + addon.priceCents, 0);
    totalCents += unitPriceCents * item.quantity;
    orderItems.push({ drink, validAddons, unitPriceCents, quantity: item.quantity });
  }

  const order = await prisma.order.create({
    data: {
      customerName,
      totalCents,
      items: {
        create: orderItems.map(({ drink, validAddons, unitPriceCents, quantity }) => ({
          drinkId: drink.id,
          drinkName: drink.name,
          unitPriceCents,
          quantity,
          addons: {
            create: validAddons.map((addon) => ({
              addonId: addon.id,
              addonName: addon.name,
              priceCents: addon.priceCents,
            })),
          },
        })),
      },
    },
    include: { items: { include: { addons: true } } },
  });

  return NextResponse.json({
    orderId: order.id,
    customerName: order.customerName,
    totalCents: order.totalCents,
    items: order.items.map((item) => ({
      drinkName: item.drinkName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      addons: item.addons.map((addon) => ({ name: addon.addonName, priceCents: addon.priceCents })),
    })),
  }, { status: 201 });
}
