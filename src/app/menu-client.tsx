"use client";

import { useMemo, useState } from "react";
import { formatMoney, orderTotalCents, type Addon, type CartItem, type Drink } from "@/lib/order";

export default function MenuClient({ drinks }: { drinks: Drink[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const total = useMemo(() => orderTotalCents(cart), [cart]);
  function add(drink: Drink, selectedAddons: Addon[] = []) { setCart((current) => [...current, { drink, addons: selectedAddons, quantity: 1 }]); }
  function changeQuantity(index: number, amount: number) { setCart((current) => current.flatMap((item, itemIndex) => itemIndex !== index ? item : item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : [])); }

  return <main className="shell"><header><p className="eyebrow">BLOOM COFFEE</p><h1>Good coffee, made bright.</h1><p>Order ahead for pickup.</p></header><section className="content"><div><h2>Menu</h2><div className="menu">{drinks.map((drink) => <article className="card" key={drink.id}><div><h3>{drink.name}</h3><p>{drink.description}</p><strong>{formatMoney(drink.basePriceCents)}</strong></div><button onClick={() => add(drink)}>Add</button></article>)}</div>{drinks.length === 0 && <p>No drinks are available right now.</p>}</div><aside className="cart"><h2>Your order</h2>{cart.length === 0 ? <p>Your cart is empty.</p> : <>{cart.map((item, index) => <div className="cart-line" key={`${item.drink.id}-${index}`}><span>{item.drink.name}<small>{item.addons.map((addon) => addon.name).join(", ") || "No add-ons"}</small></span><span><button aria-label="decrease" onClick={() => changeQuantity(index, -1)}>−</button> {item.quantity} <button aria-label="increase" onClick={() => changeQuantity(index, 1)}>+</button></span></div>)}<hr /><div className="total"><strong>Total</strong><strong>{formatMoney(total)}</strong></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name for pickup" /><button className="submit" disabled={!name.trim()} onClick={() => alert("Order received! Your confirmation number is #1001.")}>Place order</button></>}</aside></section></main>;
}
