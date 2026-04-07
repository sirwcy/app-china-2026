import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const usuarios = await prisma.usuario.findMany({
      orderBy: { creadoEn: "asc" },
      select: {
        id: true,
        nombreCorto: true,
        nombreCompleto: true,
        empresa: true,
        nroWhatsapp: true,
        nroWechat: true,
        rol: true,
        creadoEn: true,
      },
    });
    return NextResponse.json(usuarios);
  } catch {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { nombreCorto, nombreCompleto, empresa, nroWhatsapp, nroWechat, rol, password } =
      await request.json();

    if (!nombreCorto || !nombreCompleto || !password) {
      return NextResponse.json(
        { error: "nombreCorto, nombreCompleto y password son requeridos" },
        { status: 400 }
      );
    }

    const existe = await prisma.usuario.findUnique({
      where: { nombreCorto: nombreCorto.toLowerCase().trim() },
    });
    if (existe) {
      return NextResponse.json({ error: "Ese nombre de usuario ya existe" }, { status: 400 });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombreCorto: nombreCorto.toLowerCase().trim(),
        nombreCompleto,
        empresa: empresa || null,
        nroWhatsapp: nroWhatsapp || null,
        nroWechat: nroWechat || null,
        passwordHash: await hashPassword(password),
        rol: rol === "ADMIN" ? "ADMIN" : "LECTOR",
      },
      select: {
        id: true,
        nombreCorto: true,
        nombreCompleto: true,
        empresa: true,
        nroWhatsapp: true,
        nroWechat: true,
        rol: true,
        creadoEn: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
