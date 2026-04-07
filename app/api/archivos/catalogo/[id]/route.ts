import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile, detectTipo, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

const TIPOS_PERMITIDOS = ["imagen", "pdf", "excel"];

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const catalogos = await prisma.catalogoProveedor.findMany({
    where: { proveedorId: parseInt(id) },
    orderBy: { creadoEn: "asc" },
  });
  return NextResponse.json(catalogos);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const proveedorId = parseInt(id);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

  const tipo = detectTipo(file.type, file.name);
  if (!TIPOS_PERMITIDOS.includes(tipo)) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes, PDF y Excel" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `catalogos/${proveedorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const url = await uploadFile(file, path, file.type);

  const catalogo = await prisma.catalogoProveedor.create({
    data: { proveedorId, nombre: file.name, url, tipo, tamano: file.size },
  });

  return NextResponse.json(catalogo, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await params;
  const { catalogoId } = await req.json();

  const catalogo = await prisma.catalogoProveedor.findUnique({ where: { id: catalogoId } });
  if (!catalogo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const path = catalogo.url.split(`${BUCKET}/`)[1];
  if (path) await deleteFile(path).catch(() => {});

  await prisma.catalogoProveedor.delete({ where: { id: catalogoId } });
  return NextResponse.json({ ok: true });
}
