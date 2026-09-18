import LogoutButton from "./logout-button";
import DrinkManager from "./drinks/drink-manager";
import { prisma } from "@/lib/prisma";
import AddonManager from "./addons/addon-manager";
import { formatMoney } from "@/lib/order";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const drinkRows = await prisma.drink.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    include: { customizations: { include: { addon: true } } },
  });
  const addons = await prisma.addon.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  const drinks = drinkRows.map(({ customizations, ...drink }) => ({
    ...drink,
    customizations: customizations.map(({ addon, defaultSelected }) => ({ ...addon, defaultSelected })),
  }));
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: { include: { addons: true } } },
  });
  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">SWEET LAVENDAR CAFE</p><h1>Admin</h1><p>Manage your menu and keep the customer experience fresh.</p></div><LogoutButton /></header>
    <nav className="admin-nav" aria-label="Admin sections"><a href="#menu-management">Menu management</a><a href="#past-orders">Past orders</a></nav>
    <div className="admin-management-grid" id="menu-management">
      <DrinkManager initialDrinks={drinks} addons={addons} />
      <AddonManager initialAddons={addons} />
    </div>
    <section className="admin-content admin-orders" id="past-orders">
      <div><h2>Past orders <span className="count">{orders.length}{orders.length === 50 ? "+" : ""}</span></h2>
        {orders.length === 0 ? <div className="admin-placeholder"><p>No orders have been placed yet.</p></div> : <div className="order-list">
          {orders.map((order) => <article className="order-card" key={order.id}>
            <div className="order-card-header"><div><h3>Order #{order.id.slice(-8).toUpperCase()}</h3><p>{order.customerName} · {order.createdAt.toLocaleString()}</p></div><strong>{formatMoney(order.totalCents)}</strong></div>
            <ul className="order-items">{order.items.map((item) => <li key={item.id}><span>{item.quantity}× {item.drinkName}<small>{item.addons.map((addon) => addon.addonName).join(", ") || "No customizations"}</small></span><strong>{formatMoney(item.unitPriceCents * item.quantity)}</strong></li>)}</ul>
          </article>)}
        </div>}
      </div>
    </section>
  </main>;
}
