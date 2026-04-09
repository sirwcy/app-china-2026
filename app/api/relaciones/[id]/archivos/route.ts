import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile, detectTipo, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const archivos = await prisma.archivoRelacion.findMany({
    where: { productoProveedorId: parseInt(id) },
    orderBy: { creadoEn: "asc" },
  });
  return NextResponse.json(archivos);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const relacionId = parseInt(id);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

  const tipo = detectTipo(file.type, file.name);
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `relaciones/${relacionId}/archivos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const url = await uploadFile(file, path, file.type);

  const archivo = await prisma.archivoRelacion.create({
    data: { productoProveedorId: relacionId, nombre: file.name, url, tipo, tamano: file.size },
  });

  return NextResponse.json(archivo, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id: _id } = await params;
  const { archivoId } = await req.json();

  const archivo = await prisma.archivoRelacion.findUnique({ where: { id: archivoId } });
  if (!archivo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const path = archivo.url.split(`${BUCKET}/`)[1];
  if (path) await deleteFile(path).catch(() => {});

  await prisma.archivoRelacion.delete({ where: { id: archivoId } });
  return NextResponse.json({ ok: true });
}
