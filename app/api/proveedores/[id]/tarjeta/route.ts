import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** POST — sube una foto y la guarda como tarjetaUrl del proveedor */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const proveedorId = parseInt(id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

    // Borrar tarjeta anterior si existe
    const actual = await prisma.proveedor.findUnique({
      where: { id: proveedorId },
      select: { tarjetaUrl: true },
    });
    if (actual?.tarjetaUrl) {
      const oldPath = actual.tarjetaUrl.split(`${BUCKET}/`)[1];
      if (oldPath) await deleteFile(oldPath).catch(() => {});
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `proveedores/${proveedorId}/tarjeta/${Date.now()}.${ext}`;
    const url = await uploadFile(file, path, file.type);

    await prisma.proveedor.update({
      where: { id: proveedorId },
      data: { tarjetaUrl: url },
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al subir tarjeta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** DELETE — elimina la tarjeta del proveedor */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const proveedorId = parseInt(id);

    const actual = await prisma.proveedor.findUnique({
      where: { id: proveedorId },
      select: { tarjetaUrl: true },
    });
    if (actual?.tarjetaUrl) {
      const path = actual.tarjetaUrl.split(`${BUCKET}/`)[1];
      if (path) await deleteFile(path).catch(() => {});
    }

    await prisma.proveedor.update({
      where: { id: proveedorId },
      data: { tarjetaUrl: null },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar tarjeta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
