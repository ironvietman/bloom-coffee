export type AddonCategory = "MILK" | "SYRUP" | "EXTRA" | "OTHER";
export type Addon = { id: string; name: string; priceCents: number; category?: AddonCategory };
export type Temperature = "HOT" | "COLD";
export type DrinkCustomization = Addon & { defaultSelected: boolean };
export type Drink = {
  id: string;
  name: string;
  description: string;
  basePriceCents: number;
  seasonal?: boolean;
  customizationsConfigured?: boolean;
  customizations?: DrinkCustomization[];
  supportsHot?: boolean;
  supportsCold?: boolean;
};
export type CartItem = { drink: Drink; addons: Addon[]; quantity: number; temperature?: Temperature };

export function lineTotalCents(item: CartItem): number {
  return (item.drink.basePriceCents + item.addons.reduce((sum, addon) => sum + addon.priceCents, 0)) * item.quantity;
}

export function orderTotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotalCents(item), 0);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
