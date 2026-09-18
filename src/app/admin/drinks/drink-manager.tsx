"use client";

import { useState } from "react";
import { formatMoney, type Drink } from "@/lib/order";

type DrinkForm = { name: string; description: string; price: string };
const emptyForm: DrinkForm = { name: "", description: "", price: "" };

function toForm(drink?: Drink): DrinkForm {
  return drink ? { name: drink.name, description: drink.description, price: (drink.basePriceCents / 100).toFixed(2) } : emptyForm;
}

export default function DrinkManager({ initialDrinks }: { initialDrinks: Drink[] }) {
  const [drinks, setDrinks] = useState(initialDrinks);
  const [form, setForm] = useState<DrinkForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function updateForm(field: keyof DrinkForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const body = new FormData();
    body.set("name", form.name);
    body.set("description", form.description);
    body.set("basePriceCents", String(Math.round(Number(form.price) * 100)));
    const response = await fetch(editingId ? `/api/admin/drinks/${editingId}` : "/api/admin/drinks", { method: editingId ? "PATCH" : "POST", body });
    if (!response.ok) { setError("Please enter a name, description, and valid non-negative price."); return; }
    const saved = await response.json() as Drink;
    setDrinks((current) => editingId ? current.map((drink) => drink.id === saved.id ? saved : drink) : [...current, saved]);
    setForm(emptyForm); setEditingId(null);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this drink from the menu?")) return;
    const response = await fetch(`/api/admin/drinks/${id}`, { method: "DELETE" });
    if (response.ok) setDrinks((current) => current.filter((drink) => drink.id !== id));
  }

  return <section className="admin-content">
    <div className="admin-form-card"><h2>{editingId ? "Edit drink" : "Add a drink"}</h2>
      <form className="drink-form" onSubmit={save}>
        <label>Name<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} required /></label>
        <label>Short description<textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} required rows={3} /></label>
        <label>Base price (dollars)<input value={form.price} onChange={(event) => updateForm("price", event.target.value)} type="number" min="0" step="0.01" required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit">{editingId ? "Save changes" : "Add drink"}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
      </form>
    </div>
    <div><h2>Drinks <span className="count">{drinks.length}</span></h2>
      {drinks.length === 0 ? <div className="admin-placeholder"><p>No drinks yet. Add the first one above.</p></div> : <div className="admin-drinks">{drinks.map((drink) => <article className="admin-drink" key={drink.id}><div><h3>{drink.name}</h3><p>{drink.description}</p><strong>{formatMoney(drink.basePriceCents)}</strong></div><div className="form-actions"><button onClick={() => { setEditingId(drink.id); setForm(toForm(drink)); }}>Edit</button><button className="danger" onClick={() => remove(drink.id)}>Delete</button></div></article>)}</div>}
    </div>
  </section>;
}
