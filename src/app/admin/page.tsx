import LogoutButton from "./logout-button";

export default function AdminPage() {
  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">BLOOM COFFEE</p><h1>Admin</h1><p>Manage your menu and keep the customer experience fresh.</p></div><LogoutButton /></header>
    <section className="admin-placeholder"><h2>Menu management</h2><p>Drink and add-on management will live here next. Your admin session is active.</p></section>
  </main>;
}
