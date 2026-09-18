"use client";

import { useMemo, useState } from "react";
import { formatMoney, lineTotalCents, orderTotalCents, type Addon, type CartItem, type Drink } from "@/lib/order";

export default function MenuClient({ drinks, addons }: { drinks: Drink[]; addons: Addon[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon[]>>({});
  const total = useMemo(() => orderTotalCents(cart), [cart]);

  function add(drink: Drink) {
    setCart((current) => [...current, { drink, addons: selectedAddons[drink.id] || [], quantity: 1 }]);
  }

  function changeQuantity(index: number, amount: number) {
    setCart((current) => current.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const quantity = item.quantity + amount;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  function removeItem(index: number) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function toggleAddon(drinkId: string, addon: Addon, checked: boolean) {
    setSelectedAddons((current) => ({
      ...current,
      [drinkId]: checked
        ? [...(current[drinkId] || []), addon]
        : (current[drinkId] || []).filter((item) => item.id !== addon.id),
    }));
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
                      <span className="line-total">{formatMoney(lineTotalCents(item))}</span>
                    </div>
                    <div className="quantity-controls" aria-label={`Quantity for ${item.drink.name}`}>
                      <button type="button" aria-label={`Decrease ${item.drink.name}`} onClick={() => changeQuantity(index, -1)}>−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.drink.name}`} onClick={() => changeQuantity(index, 1)}>+</button>
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
              <button type="button" className="submit" disabled={!name.trim()} onClick={() => alert("Order received! Your confirmation number is #1001.")}>Place order</button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
