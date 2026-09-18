"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") ? "Your session has ended. Please sign in again." : "");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", body: new FormData(event.currentTarget) });
    if (response.ok) {
      window.location.assign("/admin");
    } else {
      setError("Invalid email or password.");
      setSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="auth-form">
    <label>Email<input name="email" type="email" autoComplete="username" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
  </form>;
}
