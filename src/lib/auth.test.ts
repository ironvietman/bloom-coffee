import { afterEach, describe, expect, it } from "vitest";
import { credentialsAreValid, createSessionToken, isSessionTokenValid } from "./auth";

const originalEmail = process.env.ADMIN_EMAIL;
const originalPassword = process.env.ADMIN_PASSWORD;

afterEach(() => {
  process.env.ADMIN_EMAIL = originalEmail;
  process.env.ADMIN_PASSWORD = originalPassword;
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
});
