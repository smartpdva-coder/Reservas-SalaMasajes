import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "masajes_admin_session";

const ADMIN_USER = process.env.MASAJES_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.MASAJES_ADMIN_PASS || "BPO2026";
const ADMIN_TOKEN =
  process.env.MASAJES_ADMIN_TOKEN || "BPO_CENTER_MASAJES_TOKEN_2026";

export function validateAdminCredentials(username, password) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === ADMIN_TOKEN;
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: ADMIN_TOKEN,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}