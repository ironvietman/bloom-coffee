"use client";

import { useState } from "react";
import { formatMoney, type Addon } from "@/lib/order";

type AddonForm = { name: string; price: string; category: NonNullable<Addon["category"]> };
const emptyForm: AddonForm = { name: "", price: "", category: "OTHER" };

const categoryLabels = { MILK: "Milk", SYRUP: "Syrup", EXTRA: "Extra", OTHER: "Other" } as const;

export default function AddonManager({ initialAddons }: { initialAddons: Addon[] }) {
  const [addons, setAddons] = useState(initialAddons);
  const [form, setForm] = useState<AddonForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const update = (field: keyof AddonForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const body = new FormData(); body.set("name", form.name); body.set("priceCents", String(Math.round(Number(form.price) * 100))); body.set("category", form.category);
    const response = await fetch(editingId ? `/api/admin/addons/${editingId}` : "/api/admin/addons", { method: editingId ? "PATCH" : "POST", body });
    if (!response.ok) { setError("Please enter a name and valid non-negative price."); return; }
    const saved = await response.json() as Addon;
    setAddons((current) => editingId ? current.map((addon) => addon.id === saved.id ? saved : addon) : [...current, saved]);
    window.dispatchEvent(new Event("customizations-updated"));
    setForm(emptyForm); setEditingId(null);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this customization from the menu?")) return;
    const response = await fetch(`/api/admin/addons/${id}`, { method: "DELETE" });
    if (response.ok) {
      setAddons((current) => current.filter((addon) => addon.id !== id));
      window.dispatchEvent(new Event("customizations-updated"));
    }
  }

  return <section className="admin-content"><div className="admin-form-card"><h2>{editingId ? "Edit customization" : "Add a customization"}</h2><form className="drink-form" onSubmit={save}>
    <label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Oat milk" required /></label>
    <label>Price (dollars)<input value={form.price} onChange={(event) => update("price", event.target.value)} type="number" min="0" step="0.01" required /></label>
    <label>Customization type<select value={form.category} onChange={(event) => update("category", event.target.value as AddonForm["category"])}><option value="MILK">Milk — choose one</option><option value="SYRUP">Syrup — up to five total</option><option value="EXTRA">Extra — up to five total</option><option value="OTHER">Other — up to five total</option></select></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="submit">{editingId ? "Save changes" : "Add customization"}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
  </form></div><div><h2>Customizations <span className="count">{addons.length}</span></h2>{addons.length === 0 ? <div className="admin-placeholder"><p>No customizations yet. Add the first one above.</p></div> : <div className="admin-drinks">{addons.map((addon) => <article className="admin-drink" key={addon.id}><div><h3>{addon.name}</h3><p>{categoryLabels[addon.category || "OTHER"]}</p><strong>+{formatMoney(addon.priceCents)}</strong></div><div className="form-actions"><button onClick={() => { setEditingId(addon.id); setForm({ name: addon.name, price: (addon.priceCents / 100).toFixed(2), category: addon.category || "OTHER" }); }}>Edit</button><button className="danger" onClick={() => remove(addon.id)}>Delete</button></div></article>)}</div>}</div></section>;
}
