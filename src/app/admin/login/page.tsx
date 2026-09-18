import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionTokenValid, SESSION_COOKIE } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await isSessionTokenValid(token)) redirect("/admin");

  return <main className="auth-shell"><div className="auth-card">
    <p className="eyebrow">BLOOM COFFEE</p>
    <h1>Admin sign in</h1>
    <p>Sign in to manage the Bloom Coffee menu.</p>
    <LoginForm />
  </div></main>;
}
