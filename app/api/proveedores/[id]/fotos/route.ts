import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const fotos = await prisma.fotoProveedor.findMany({
    where: { proveedorId: parseInt(id) },
    orderBy: { creadoEn: "asc" },
  });
  return NextResponse.json(fotos);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const proveedorId = parseInt(id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const descripcion = formData.get("descripcion") as string | null;
    if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `proveedores/${proveedorId}/fotos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const url = await uploadFile(file, path, file.type);

    const foto = await prisma.fotoProveedor.create({
      data: { proveedorId, url, descripcion: descripcion || null },
    });

    return NextResponse.json(foto, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al subir foto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id: _id } = await params;
    const { fotoId } = await req.json();

    const foto = await prisma.fotoProveedor.findUnique({ where: { id: fotoId } });
    if (!foto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const path = foto.url.split(`${BUCKET}/`)[1];
    if (path) await deleteFile(path).catch(() => {});

    await prisma.fotoProveedor.delete({ where: { id: fotoId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar foto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
