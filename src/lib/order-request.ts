export type SubmittedItem = { drinkId: string; addonIds?: string[]; quantity: number; temperature?: "HOT" | "COLD" };

export type ParsedOrderRequest = {
  customerName: string;
  items: SubmittedItem[];
};

export function isSubmittedItem(value: unknown): value is SubmittedItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.drinkId === "string"
    && typeof item.quantity === "number"
    && Number.isInteger(item.quantity)
    && item.quantity > 0
    && item.quantity <= 99
    && (item.temperature === undefined || item.temperature === "HOT" || item.temperature === "COLD")
    && (item.addonIds === undefined || (Array.isArray(item.addonIds) && item.addonIds.every((id) => typeof id === "string")));
}

export function parseOrderRequest(body: unknown): ParsedOrderRequest | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const customerName = typeof data.customerName === "string" ? data.customerName.trim() : "";
  const items = Array.isArray(data.items) ? data.items : [];

  if (!customerName || customerName.length > 80 || items.length === 0 || !items.every(isSubmittedItem)) {
    return null;
  }

  return { customerName, items: items as SubmittedItem[] };
}
