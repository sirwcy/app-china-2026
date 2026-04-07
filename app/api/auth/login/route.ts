import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { nombreCorto, password } = await request.json();

    if (!nombreCorto || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    // Si no hay ningún usuario, crear Williams/123 automáticamente
    const total = await prisma.usuario.count();
    if (total === 0) {
      await prisma.usuario.create({
        data: {
          nombreCorto: "williams",
          nombreCompleto: "Williams",
          passwordHash: await hashPassword("123"),
          rol: "ADMIN",
        },
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { nombreCorto: nombreCorto.toLowerCase().trim() },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const valid = await verifyPassword(password, usuario.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const token = await createToken({
      id: usuario.id,
      nombreCorto: usuario.nombreCorto,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.rol,
    });

    const response = NextResponse.json({ ok: true, rol: usuario.rol });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
