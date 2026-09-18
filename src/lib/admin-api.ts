import { cookies } from "next/headers";
import { isSessionTokenValid, SESSION_COOKIE } from "@/lib/auth";

export async function isAdminRequestAuthorized() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return isSessionTokenValid(token);
}
