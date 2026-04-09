import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
    }

    // Verificar la contraseña del admin que ejecuta la acción
    const usuario = await prisma.usuario.findUnique({ where: { id: session.id } });
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const ok = await verifyPassword(password, usuario.passwordHash);
    if (!ok) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 403 });

    // Borrar en orden para respetar FK
    await prisma.fotoRelacion.deleteMany();
    await prisma.archivoRelacion.deleteMany();
    await prisma.precioProveedor.deleteMany();
    await prisma.productoProveedor.deleteMany();
    await prisma.archivoProducto.deleteMany();
    await prisma.catalogoProveedor.deleteMany();
    await prisma.fotoProveedor.deleteMany();
    await prisma.productoEtiqueta.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.proveedor.deleteMany();
    await prisma.etiqueta.deleteMany();
    await prisma.subcategoria.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.material.deleteMany();

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Sin permisos de administrador") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
