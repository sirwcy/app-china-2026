import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const fotos = await prisma.fotoRelacion.findMany({
    where: { productoProveedorId: parseInt(id) },
    orderBy: { creadoEn: "asc" },
  });
  return NextResponse.json(fotos);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const relacionId = parseInt(id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const descripcion = formData.get("descripcion") as string | null;
    if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `relaciones/${relacionId}/fotos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const url = await uploadFile(file, path, file.type);

    const foto = await prisma.fotoRelacion.create({
      data: { productoProveedorId: relacionId, url, descripcion: descripcion || null },
    });

    return NextResponse.json(foto, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error interno al subir foto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id: _id } = await params;
  const { fotoId } = await req.json();

  const foto = await prisma.fotoRelacion.findUnique({ where: { id: fotoId } });
  if (!foto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const path = foto.url.split(`${BUCKET}/`)[1];
  if (path) await deleteFile(path).catch(() => {});

  await prisma.fotoRelacion.delete({ where: { id: fotoId } });
  return NextResponse.json({ ok: true });
}
