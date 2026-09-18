import { afterEach, describe, expect, it } from "vitest";
import { credentialsAreValid, createSessionToken, isSessionTokenValid } from "./auth";

const originalEmail = process.env.ADMIN_EMAIL;
const originalPassword = process.env.ADMIN_PASSWORD;
const originalSecret = process.env.AUTH_SECRET;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.ADMIN_EMAIL = originalEmail;
  process.env.ADMIN_PASSWORD = originalPassword;
  process.env.AUTH_SECRET = originalSecret;
  process.env.NODE_ENV = originalNodeEnv;
});

describe("admin authentication", () => {
  it("accepts configured credentials and rejects invalid credentials", () => {
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.ADMIN_PASSWORD = "correct horse battery staple";

    expect(credentialsAreValid("owner@example.com", "correct horse battery staple")).toBe(true);
    expect(credentialsAreValid("owner@example.com", "wrong password")).toBe(false);
    expect(credentialsAreValid("other@example.com", "correct horse battery staple")).toBe(false);
  });

  it("creates a valid session token and rejects tampering", async () => {
    const token = await createSessionToken();
    expect(await isSessionTokenValid(token)).toBe(true);
    expect(await isSessionTokenValid(`${token}tampered`)).toBe(false);
  });

  it("requires explicit strong credentials and a secret in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.AUTH_SECRET;

    expect(() => credentialsAreValid("admin@example.com", "password")).toThrow("ADMIN_EMAIL must be configured");
    await expect(createSessionToken()).rejects.toThrow("AUTH_SECRET must be configured");
  });

  it("rejects weak production credentials", () => {
    process.env.NODE_ENV = "production";
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "short";

    expect(() => credentialsAreValid("admin@example.com", "short")).toThrow("ADMIN_PASSWORD must be at least 12 characters");
  });
});
