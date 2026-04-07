import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME, type SessionPayload } from "./auth";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (session.rol !== "ADMIN") throw new Error("Sin permisos de administrador");
  return session;
}
