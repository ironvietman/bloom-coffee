"use client";

import { useMemo, useState } from "react";
import { formatMoney, lineTotalCents, orderTotalCents, type Addon, type AddonCategory, type CartItem, type Drink, type Temperature } from "@/lib/order";

type Confirmation = {
  orderId: string;
  customerName: string;
  totalCents: number;
  items: Array<{ drinkName: string; quantity: number; unitPriceCents: number; temperature: Temperature; addons: Array<{ name: string; priceCents: number }> }>;
};

const customizationGroups: Array<{ category: AddonCategory; label: string; instruction: string }> = [
  { category: "MILK", label: "Milk", instruction: "Choose up to one" },
  { category: "SYRUP", label: "Syrups", instruction: "Choose up to five total" },
  { category: "EXTRA", label: "Extras", instruction: "Choose up to five total" },
  { category: "OTHER", label: "Other", instruction: "Choose up to five total" },
];

function availableAddons(drink: Drink, allAddons: Addon[]): Addon[] {
  return drink.customizationsConfigured ? (drink.customizations || []) : allAddons;
}

function defaultAddons(drink: Drink): Addon[] {
  return (drink.customizations || []).filter((addon) => addon.defaultSelected);
}

function defaultTemperature(drink: Drink): Temperature { return drink.supportsHot !== false ? "HOT" : "COLD"; }
function temperatureLabel(temperature: Temperature): string { return temperature === "HOT" ? "Hot" : "Cold"; }

function CustomizationOptions({ drink, allAddons, selected, onToggle, idPrefix }: { drink: Drink; allAddons: Addon[]; selected: Addon[]; onToggle: (addon: Addon, checked: boolean) => void; idPrefix: string }) {
  const options = availableAddons(drink, allAddons);
  const nonMilkCount = selected.filter((addon) => addon.category !== "MILK").length;
  return <div className="customization-groups">
    {customizationGroups.map((group) => {
      const groupAddons = options.filter((addon) => (addon.category || "OTHER") === group.category);
      if (groupAddons.length === 0) return null;
      return <fieldset className="customization-group" key={group.category}>
        <legend>{group.label} <small>{group.instruction}</small></legend>
        {groupAddons.map((addon) => {
          const checked = selected.some((selectedAddon) => selectedAddon.id === addon.id);
          const inputId = `${idPrefix}-${addon.id}`;
          return <label className="customization-option" key={addon.id} htmlFor={inputId}>
            <input id={inputId} type={group.category === "MILK" ? "radio" : "checkbox"} name={group.category === "MILK" ? `${idPrefix}-milk` : undefined} checked={checked} disabled={!checked && group.category !== "MILK" && nonMilkCount >= 5} onChange={(event) => onToggle(addon, event.target.checked)} />
            <span>{addon.name}</span><span>+{formatMoney(addon.priceCents)}</span>
          </label>;
        })}
      </fieldset>;
    })}
    {options.length === 0 && <p className="form-help">No customizations are available for this drink.</p>}
  </div>;
}

export default function MenuClient({ drinks, addons }: { drinks: Drink[]; addons: Addon[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon[]>>({});
  const [selectedTemperatures, setSelectedTemperatures] = useState<Record<string, Temperature>>({});
  const [customizingDrinkId, setCustomizingDrinkId] = useState<string | null>(null);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const total = useMemo(() => orderTotalCents(cart), [cart]);

  function openCustomizer(drink: Drink) {
    setCustomizingDrinkId(drink.id);
    setSelectedAddons((current) => current[drink.id] ? current : { ...current, [drink.id]: defaultAddons(drink) });
    setSelectedTemperatures((current) => current[drink.id] ? current : { ...current, [drink.id]: defaultTemperature(drink) });
  }

  function add(drink: Drink) {
    setCart((current) => [...current, { drink, addons: selectedAddons[drink.id] || [], quantity: 1, temperature: selectedTemperatures[drink.id] || defaultTemperature(drink) }]);
    setCustomizingDrinkId(null);
    setSelectedAddons((current) => { const next = { ...current }; delete next[drink.id]; return next; });
  }

  function cancelCustomization(drinkId: string) {
    setCustomizingDrinkId(null);
    setSelectedAddons((current) => { const next = { ...current }; delete next[drinkId]; return next; });
    setSelectedTemperatures((current) => { const next = { ...current }; delete next[drinkId]; return next; });
  }

  function changeQuantity(index: number, amount: number) {
    if (amount < 0 && cart[index]?.quantity + amount <= 0) setEditingCartIndex(null);
    setCart((current) => current.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const quantity = item.quantity + amount;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  function removeItem(index: number) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setEditingCartIndex(null);
  }

  function toggleCartAddon(index: number, addon: Addon, checked: boolean) {
    setCart((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (checked && addon.category !== "MILK" && !item.addons.some((itemAddon) => itemAddon.id === addon.id) && item.addons.filter((itemAddon) => itemAddon.category !== "MILK").length >= 5) return item;
      const nextAddons = addon.category === "MILK" && checked
        ? [...item.addons.filter((itemAddon) => itemAddon.category !== "MILK"), addon]
        : checked
          ? [...item.addons, addon]
          : item.addons.filter((itemAddon) => itemAddon.id !== addon.id);
      return { ...item, addons: nextAddons };
    }));
  }

  function toggleDrinkAddon(drinkId: string, addon: Addon, checked: boolean) {
    setSelectedAddons((current) => {
      const existing = current[drinkId] || [];
      if (checked && addon.category !== "MILK" && !existing.some((itemAddon) => itemAddon.id === addon.id) && existing.filter((itemAddon) => itemAddon.category !== "MILK").length >= 5) return current;
      const next = addon.category === "MILK" && checked
        ? [...existing.filter((itemAddon) => itemAddon.category !== "MILK"), addon]
        : checked
          ? [...existing, addon]
          : existing.filter((itemAddon) => itemAddon.id !== addon.id);
      return { ...current, [drinkId]: next };
    });
  }

  async function submitOrder() {
    if (!name.trim() || cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name.trim(), items: cart.map((item) => ({ drinkId: item.drink.id, addonIds: item.addons.map((addon) => addon.id), quantity: item.quantity, temperature: item.temperature })) }),
      });
      const body = await response.text();
      let result: { error?: string; orderId?: string; customerName?: string; totalCents?: number; items?: Confirmation["items"] } | null = null;
      try { result = body.trim() ? JSON.parse(body) : null; } catch { result = null; }
      if (!response.ok) throw new Error(result?.error || "We could not submit your order. Please try again.");
      if (!result) throw new Error("The order service returned an empty response. Please try again.");
      setConfirmation(result as Confirmation);
      setCart([]);
      setEditingCartIndex(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startNewOrder() {
    setConfirmation(null);
    setName("");
    setSubmitError("");
    setSelectedAddons({});
    setSelectedTemperatures({});
    setCustomizingDrinkId(null);
    setEditingCartIndex(null);
  }

  if (confirmation) return <main className="shell confirmation-shell"><section className="confirmation-card" aria-labelledby="confirmation-title">
    <p className="eyebrow">SWEET LAVENDAR CAFE</p><h1 id="confirmation-title">Order received!</h1>
    <p>We&apos;ll call {confirmation.customerName} when your order is ready.</p><p className="order-number">Order #{confirmation.orderId.slice(-8).toUpperCase()}</p>
    <div className="confirmation-summary"><h2>Your order</h2>{confirmation.items.map((item, index) => <div className="confirmation-line" key={`${item.drinkName}-${index}`}><span><strong>{item.quantity}× {item.drinkName}</strong><small>{temperatureLabel(item.temperature)}</small><small>{item.addons.map((addon) => addon.name).join(", ") || "No customizations"}</small></span><strong>{formatMoney(item.unitPriceCents * item.quantity)}</strong></div>)}<div className="total"><strong>Total</strong><strong>{formatMoney(confirmation.totalCents)}</strong></div></div>
    <button type="button" onClick={startNewOrder}>Order again</button>
  </section></main>;

  const seasonalDrinks = drinks.filter((drink) => drink.seasonal);
  const standardDrinks = drinks.filter((drink) => !drink.seasonal);
  const renderDrink = (drink: Drink) => {
    const drinkSelectedAddons = selectedAddons[drink.id] || defaultAddons(drink);
    const selectedTemperature = selectedTemperatures[drink.id] || defaultTemperature(drink);
    const previewItem = { drink, addons: drinkSelectedAddons, quantity: 1, temperature: selectedTemperature };
    const isCustomizing = customizingDrinkId === drink.id;
    return <article className="card" key={drink.id}><div className="card-details"><h3>{drink.name}</h3><p>{drink.description}</p><strong>{formatMoney(lineTotalCents(previewItem))}</strong>{isCustomizing && <div className="customization-panel"><h4>Customization</h4><p className="form-help">Choose the options you want. Defaults are already selected.</p><fieldset className="customization-group"><legend>Temperature</legend>{drink.supportsHot !== false && <label className="customization-option"><input type="radio" name={`drink-${drink.id}-temperature`} checked={selectedTemperature === "HOT"} onChange={() => setSelectedTemperatures((current) => ({ ...current, [drink.id]: "HOT" }))} /><span>Hot</span></label>}{drink.supportsCold !== false && <label className="customization-option"><input type="radio" name={`drink-${drink.id}-temperature`} checked={selectedTemperature === "COLD"} onChange={() => setSelectedTemperatures((current) => ({ ...current, [drink.id]: "COLD" }))} /><span>Cold</span></label>}</fieldset><CustomizationOptions drink={drink} allAddons={addons} selected={drinkSelectedAddons} onToggle={(addon, checked) => toggleDrinkAddon(drink.id, addon, checked)} idPrefix={`drink-${drink.id}`} />{drinkSelectedAddons.length > 0 && <p className="customized-price">This drink: {formatMoney(lineTotalCents(previewItem))}</p>}</div>}</div><div className="card-actions">{isCustomizing ? <><button type="button" onClick={() => add(drink)}>Add to order</button><button type="button" className="secondary" onClick={() => cancelCustomization(drink.id)}>Cancel</button></> : <button type="button" onClick={() => openCustomizer(drink)}>Customize</button>}</div></article>;
  };

  return <main className="shell"><header><h1 className="eyebrow">Sweet Lavendar cafe</h1><p>Order ahead for pickup. Choose the temperature available for each drink.</p></header>
    <section className="content" aria-label="Menu and order"><div>
      {seasonalDrinks.length > 0 && <section className="menu-section"><h2>Seasonal drinks</h2><div className="menu">{seasonalDrinks.map(renderDrink)}</div></section>}
      {standardDrinks.length > 0 && <section className="menu-section"><h2>Standard menu</h2><div className="menu">{standardDrinks.map(renderDrink)}</div></section>}
      {drinks.length === 0 && <p>No drinks are available right now.</p>}
    </div>
    <aside className="cart" aria-label="Your order"><h2>Your order</h2>{cart.length === 0 ? <p>Your cart is empty.</p> : <><div className="cart-items">{cart.map((item, index) => { const itemAddons = availableAddons(item.drink, addons); return <div className="cart-line" key={`${item.drink.id}-${index}`}><div><strong>{item.drink.name}</strong><small className="temperature-label">{temperatureLabel(item.temperature || defaultTemperature(item.drink))}</small><small>{item.addons.map((addon) => addon.name).join(", ") || "No customizations"}</small>{editingCartIndex === index && itemAddons.length > 0 && <fieldset className="cart-addons"><legend>Edit customization</legend><CustomizationOptions drink={item.drink} allAddons={addons} selected={item.addons} onToggle={(addon, checked) => toggleCartAddon(index, addon, checked)} idPrefix={`cart-${index}`} /></fieldset>}<span className="line-total">{formatMoney(lineTotalCents(item))}</span></div><div className="quantity-controls" aria-label={`Quantity for ${item.drink.name}`}><button type="button" aria-label={`Decrease ${item.drink.name}`} onClick={() => changeQuantity(index, -1)}>−</button><span aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Increase ${item.drink.name}`} onClick={() => changeQuantity(index, 1)}>+</button>{itemAddons.length > 0 && <button type="button" className="edit-addons" onClick={() => setEditingCartIndex(editingCartIndex === index ? null : index)}>{editingCartIndex === index ? "Done" : "Edit customization"}</button>}<button type="button" className="remove" onClick={() => removeItem(index)}>Remove</button></div></div>; })}</div><hr /><div className="total" aria-live="polite"><strong>Total</strong><strong>{formatMoney(total)}</strong></div><label className="pickup-name">Name for pickup<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jordan" /></label>{submitError && <p className="form-error" role="alert">{submitError}</p>}<button type="button" className="submit" disabled={!name.trim() || isSubmitting} onClick={submitOrder}>{isSubmitting ? "Sending order…" : "Place order"}</button></>}</aside>
    </section>
  </main>;
}
