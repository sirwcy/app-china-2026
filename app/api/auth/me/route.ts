import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  // Obtener fotoUrl fresca del DB
  const usuario = await prisma.usuario.findUnique({
    where: { id: session.id },
    select: { fotoUrl: true },
  });
  return NextResponse.json({ ...session, fotoUrl: usuario?.fotoUrl ?? null });
}
