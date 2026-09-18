import { describe, expect, it } from "vitest";
import { lineTotalCents, orderTotalCents } from "./order";

const latte = { id: "latte", name: "Honey Latte", description: "Espresso, milk, honey", basePriceCents: 400 };
const oatMilk = { id: "oat", name: "Oat milk", priceCents: 50 };
const extraShot = { id: "shot", name: "Extra shot", priceCents: 75 };

describe("order totals", () => {
  it("adds the drink and addon prices for each quantity", () => {
    expect(lineTotalCents({ drink: latte, addons: [oatMilk, extraShot], quantity: 2 })).toBe(1050);
  });

  it("sums all lines", () => {
    expect(orderTotalCents([
      { drink: latte, addons: [], quantity: 1 },
      { drink: latte, addons: [oatMilk], quantity: 2 }
    ])).toBe(1300);
  });
});
