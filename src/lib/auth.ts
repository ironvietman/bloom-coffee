export const SESSION_COOKIE = "bloom_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SECRET || "bloom-development-secret-change-me";
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export function configuredAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@bloom.coffee",
    password: process.env.ADMIN_PASSWORD || "bloomcoffee",
  };
}

export function credentialsAreValid(email: string, password: string) {
  const configured = configuredAdminCredentials();
  return email.trim().toLowerCase() === configured.email.toLowerCase() && password === configured.password;
}

export async function createSessionToken() {
  const payload = `${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await sign(payload)}`;
}

export async function isSessionTokenValid(token: string | undefined) {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;

  const expected = await sign(expiresAt);
  return signature === expected;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
