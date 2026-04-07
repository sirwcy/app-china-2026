import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id);

    const { nombreCompleto, empresa, nroWhatsapp, nroWechat, rol, password } =
      await request.json();

    // No se puede cambiar el propio rol
    const data: Record<string, unknown> = {
      nombreCompleto,
      empresa: empresa || null,
      nroWhatsapp: nroWhatsapp || null,
      nroWechat: nroWechat || null,
    };

    // Solo cambiar rol si no es el propio usuario
    if (session.id !== userId) {
      data.rol = rol === "ADMIN" ? "ADMIN" : "LECTOR";
    }

    if (password && password.trim() !== "") {
      data.passwordHash = await hashPassword(password);
    }

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data,
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

    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id);

    // No puede eliminarse a sí mismo
    if (session.id === userId) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
    }

    // No eliminar si es el único admin
    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (usuario?.rol === "ADMIN") {
      const adminCount = await prisma.usuario.count({ where: { rol: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "No se puede eliminar el único administrador" },
          { status: 400 }
        );
      }
    }

    await prisma.usuario.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
