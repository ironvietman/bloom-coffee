import { describe, expect, it } from "vitest";
import { isSubmittedItem, parseOrderRequest } from "./order-request";

describe("order request validation", () => {
  it("accepts a valid order and trims the customer name", () => {
    expect(parseOrderRequest({
      customerName: "  Jordan  ",
      items: [{ drinkId: "latte", addonIds: ["oat"], quantity: 2 }],
    })).toEqual({
      customerName: "Jordan",
      items: [{ drinkId: "latte", addonIds: ["oat"], quantity: 2 }],
    });
  });

  it.each([
    ["missing body", null],
    ["missing name", { items: [{ drinkId: "latte", quantity: 1 }] }],
    ["blank name", { customerName: "   ", items: [{ drinkId: "latte", quantity: 1 }] }],
    ["missing items", { customerName: "Jordan", items: [] }],
    ["missing drink ID", { customerName: "Jordan", items: [{ quantity: 1 }] }],
    ["non-integer quantity", { customerName: "Jordan", items: [{ drinkId: "latte", quantity: 1.5 }] }],
    ["zero quantity", { customerName: "Jordan", items: [{ drinkId: "latte", quantity: 0 }] }],
    ["quantity over limit", { customerName: "Jordan", items: [{ drinkId: "latte", quantity: 100 }] }],
    ["invalid add-on IDs", { customerName: "Jordan", items: [{ drinkId: "latte", addonIds: ["oat", 42], quantity: 1 }] }],
  ])("rejects %s", (_label, payload) => {
    expect(parseOrderRequest(payload)).toBeNull();
  });

  it("accepts the maximum quantity and an omitted add-on list", () => {
    expect(isSubmittedItem({ drinkId: "latte", quantity: 99 })).toBe(true);
  });

  it("rejects an overlong customer name", () => {
    expect(parseOrderRequest({
      customerName: "x".repeat(81),
      items: [{ drinkId: "latte", quantity: 1 }],
    })).toBeNull();
  });
});
