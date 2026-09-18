"use client";

import { useMemo, useState } from "react";
import { formatMoney, lineTotalCents, orderTotalCents, type Addon, type CartItem, type Drink } from "@/lib/order";

type Confirmation = {
  orderId: string;
  customerName: string;
  totalCents: number;
  items: Array<{
    drinkName: string;
    quantity: number;
    unitPriceCents: number;
    addons: Array<{ name: string; priceCents: number }>;
  }>;
};

export default function MenuClient({ drinks, addons }: { drinks: Drink[]; addons: Addon[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon[]>>({});
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const total = useMemo(() => orderTotalCents(cart), [cart]);

  function add(drink: Drink) {
    setCart((current) => [...current, { drink, addons: selectedAddons[drink.id] || [], quantity: 1 }]);
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
      return {
        ...item,
        addons: checked
          ? [...item.addons, addon]
          : item.addons.filter((itemAddon) => itemAddon.id !== addon.id),
      };
    }));
  }

  function toggleAddon(drinkId: string, addon: Addon, checked: boolean) {
    setSelectedAddons((current) => ({
      ...current,
      [drinkId]: checked
        ? [...(current[drinkId] || []), addon]
        : (current[drinkId] || []).filter((item) => item.id !== addon.id),
    }));
  }

  async function submitOrder() {
    if (!name.trim() || cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          items: cart.map((item) => ({
            drinkId: item.drink.id,
            addonIds: item.addons.map((addon) => addon.id),
            quantity: item.quantity,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not submit your order.");
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
    setEditingCartIndex(null);
  }

  if (confirmation) {
    return (
      <main className="shell confirmation-shell">
        <section className="confirmation-card" aria-labelledby="confirmation-title">
          <p className="eyebrow">BLOOM COFFEE</p>
          <h1 id="confirmation-title">Order received!</h1>
          <p>We&apos;ll call {confirmation.customerName} when your order is ready.</p>
          <p className="order-number">Order #{confirmation.orderId.slice(-8).toUpperCase()}</p>
          <div className="confirmation-summary">
            <h2>Your order</h2>
            {confirmation.items.map((item, index) => (
              <div className="confirmation-line" key={`${item.drinkName}-${index}`}>
                <span><strong>{item.quantity}× {item.drinkName}</strong><small>{item.addons.map((addon) => addon.name).join(", ") || "No add-ons"}</small></span>
                <strong>{formatMoney(item.unitPriceCents * item.quantity)}</strong>
              </div>
            ))}
            <div className="total"><strong>Total</strong><strong>{formatMoney(confirmation.totalCents)}</strong></div>
          </div>
          <button type="button" onClick={startNewOrder}>Order again</button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header>
        <p className="eyebrow">BLOOM COFFEE</p>
        <h1>Good coffee, made bright.</h1>
        <p>Order ahead for pickup.</p>
      </header>

      <section className="content" aria-label="Menu and order">
        <div>
          <h2>Menu</h2>
          <div className="menu">
            {drinks.map((drink) => {
              const drinkAddons = selectedAddons[drink.id] || [];
              const previewItem = { drink, addons: drinkAddons, quantity: 1 };

              return (
                <article className="card" key={drink.id}>
                  <div className="card-details">
                    <h3>{drink.name}</h3>
                    <p>{drink.description}</p>
                    <strong>{formatMoney(drink.basePriceCents)}</strong>
                    {addons.length > 0 && (
                      <fieldset className="customer-addons">
                        <legend>Add-ons</legend>
                        {addons.map((addon) => (
                          <label key={addon.id}>
                            <input
                              type="checkbox"
                              checked={drinkAddons.some((item) => item.id === addon.id)}
                              onChange={(event) => toggleAddon(drink.id, addon, event.target.checked)}
                            />
                            {addon.name} <span>+{formatMoney(addon.priceCents)}</span>
                          </label>
                        ))}
                      </fieldset>
                    )}
                    {drinkAddons.length > 0 && (
                      <p className="customized-price">This drink: {formatMoney(lineTotalCents(previewItem))}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => add(drink)}>Add to order</button>
                </article>
              );
            })}
          </div>
          {drinks.length === 0 && <p>No drinks are available right now.</p>}
        </div>

        <aside className="cart" aria-label="Your order">
          <h2>Your order</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div className="cart-line" key={`${item.drink.id}-${index}`}>
                    <div>
                      <strong>{item.drink.name}</strong>
                      <small>{item.addons.map((addon) => addon.name).join(", ") || "No add-ons"}</small>
                      {editingCartIndex === index && addons.length > 0 && (
                        <fieldset className="cart-addons">
                          <legend>Edit add-ons</legend>
                          {addons.map((addon) => (
                            <label key={addon.id}>
                              <input
                                type="checkbox"
                                checked={item.addons.some((itemAddon) => itemAddon.id === addon.id)}
                                onChange={(event) => toggleCartAddon(index, addon, event.target.checked)}
                              />
                              {addon.name} <span>+{formatMoney(addon.priceCents)}</span>
                            </label>
                          ))}
                        </fieldset>
                      )}
                      <span className="line-total">{formatMoney(lineTotalCents(item))}</span>
                    </div>
                    <div className="quantity-controls" aria-label={`Quantity for ${item.drink.name}`}>
                      <button type="button" aria-label={`Decrease ${item.drink.name}`} onClick={() => changeQuantity(index, -1)}>−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.drink.name}`} onClick={() => changeQuantity(index, 1)}>+</button>
                      {addons.length > 0 && (
                        <button
                          type="button"
                          className="edit-addons"
                          onClick={() => setEditingCartIndex(editingCartIndex === index ? null : index)}
                        >
                          {editingCartIndex === index ? "Done" : "Edit add-ons"}
                        </button>
                      )}
                      <button type="button" className="remove" onClick={() => removeItem(index)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <hr />
              <div className="total" aria-live="polite">
                <strong>Total</strong>
                <strong>{formatMoney(total)}</strong>
              </div>
              <label className="pickup-name">
                Name for pickup
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jordan" />
              </label>
              {submitError && <p className="form-error" role="alert">{submitError}</p>}
              <button type="button" className="submit" disabled={!name.trim() || isSubmitting} onClick={submitOrder}>
                {isSubmitting ? "Sending order…" : "Place order"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
