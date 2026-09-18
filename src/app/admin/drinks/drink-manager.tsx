"use client";

import { useEffect, useState } from "react";
import { formatMoney, type Addon, type Drink } from "@/lib/order";

type DrinkForm = { name: string; description: string; price: string; seasonal: boolean; addonIds: string[]; defaultAddonIds: string[] };
const emptyForm: DrinkForm = { name: "", description: "", price: "", seasonal: false, addonIds: [], defaultAddonIds: [] };
const categoryLabels = { MILK: "Milk", SYRUP: "Syrup", EXTRA: "Extra", OTHER: "Other" } as const;

function toForm(drink?: Drink): DrinkForm {
  const defaultCustomizations = (drink?.customizations || []).filter((addon) => addon.defaultSelected);
  const defaultMilk = defaultCustomizations.find((addon) => addon.category === "MILK");
  return drink ? {
    name: drink.name,
    description: drink.description,
    price: (drink.basePriceCents / 100).toFixed(2),
    seasonal: Boolean(drink.seasonal),
    addonIds: (drink.customizations || []).map((addon) => addon.id),
    defaultAddonIds: [...defaultCustomizations.filter((addon) => addon.category !== "MILK").map((addon) => addon.id), ...(defaultMilk ? [defaultMilk.id] : [])],
  } : emptyForm;
}

export default function DrinkManager({ initialDrinks, addons }: { initialDrinks: Drink[]; addons: Addon[] }) {
  const [drinks, setDrinks] = useState(initialDrinks);
  const [availableAddons, setAvailableAddons] = useState(addons);
  const [form, setForm] = useState<DrinkForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function refreshCustomizations() {
      const response = await fetch("/api/admin/addons");
      if (response.ok) setAvailableAddons(await response.json() as Addon[]);
    }
    function handleCustomizationsUpdated() { void refreshCustomizations(); }
    window.addEventListener("customizations-updated", handleCustomizationsUpdated);
    return () => window.removeEventListener("customizations-updated", handleCustomizationsUpdated);
  }, []);

  function updateForm(field: keyof DrinkForm, value: string | boolean | string[]) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const body = new FormData();
    body.set("name", form.name);
    body.set("description", form.description);
    body.set("basePriceCents", String(Math.round(Number(form.price) * 100)));
    body.set("seasonal", String(form.seasonal));
    body.set("customizationsConfigured", "true");
    form.addonIds.forEach((id) => body.append("addonIds", id));
    form.defaultAddonIds.filter((id) => form.addonIds.includes(id)).forEach((id) => body.append("defaultAddonIds", id));
    const response = await fetch(editingId ? `/api/admin/drinks/${editingId}` : "/api/admin/drinks", { method: editingId ? "PATCH" : "POST", body });
    if (!response.ok) {
      const result = await response.json().catch(() => null) as { error?: string } | null;
      setError(result?.error || "We could not save this drink.");
      return;
    }
    const saved = await response.json() as Drink;
    const savedWithCustomizations = { ...saved, customizations: form.addonIds.map((id) => { const addon = availableAddons.find((item) => item.id === id); return addon ? { ...addon, defaultSelected: form.defaultAddonIds.includes(id) } : null; }).filter((addon): addon is Addon & { defaultSelected: boolean } => addon !== null) };
    setDrinks((current) => editingId ? current.map((drink) => drink.id === saved.id ? { ...drink, ...savedWithCustomizations } : drink) : [...current, savedWithCustomizations]);
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
        <label className="checkbox-label"><input type="checkbox" checked={form.seasonal} onChange={(event) => updateForm("seasonal", event.target.checked)} /> Feature in seasonal drinks</label>
        <fieldset className="admin-customization-options"><legend>Available customizations</legend><p className="form-help">Select the options customers can use. Check “default” for options already included with this drink.</p>
          {availableAddons.length === 0 ? <p>No customizations have been created yet.</p> : availableAddons.map((addon) => <label className="customization-admin-row" key={addon.id}><span><input type="checkbox" checked={form.addonIds.includes(addon.id)} onChange={(event) => updateForm("addonIds", event.target.checked ? [...form.addonIds, addon.id] : form.addonIds.filter((id) => id !== addon.id))} /><span className="customization-name">{addon.name}</span><small>{categoryLabels[addon.category || "OTHER"]}</small></span><span><input type={addon.category === "MILK" ? "radio" : "checkbox"} name={addon.category === "MILK" ? "default-milk" : undefined} aria-label={`Default ${addon.name}`} checked={form.defaultAddonIds.includes(addon.id)} disabled={!form.addonIds.includes(addon.id)} onChange={(event) => updateForm("defaultAddonIds", addon.category === "MILK" ? (event.target.checked ? [...form.defaultAddonIds.filter((id) => !availableAddons.some((item) => item.id === id && item.category === "MILK")), addon.id] : form.defaultAddonIds.filter((id) => id !== addon.id)) : (event.target.checked ? [...form.defaultAddonIds, addon.id] : form.defaultAddonIds.filter((id) => id !== addon.id)))} /> default</span></label>)}
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit">{editingId ? "Save changes" : "Add drink"}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
      </form>
    </div>
    <div><h2>Drinks <span className="count">{drinks.length}</span></h2>
      {drinks.length === 0 ? <div className="admin-placeholder"><p>No drinks yet. Add the first one above.</p></div> : <div className="admin-drinks">{drinks.map((drink) => <article className="admin-drink" key={drink.id}><div><h3>{drink.name} {drink.seasonal && <span className="seasonal-badge">Seasonal</span>}</h3><p>{drink.description}</p><strong>Base price: {formatMoney(drink.basePriceCents)}</strong></div><div className="form-actions"><button onClick={() => { setEditingId(drink.id); setForm(toForm(drink)); }}>Edit</button><button className="danger" onClick={() => remove(drink.id)}>Delete</button></div></article>)}</div>}
    </div>
  </section>;
}
