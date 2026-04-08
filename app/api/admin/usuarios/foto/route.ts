import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `usuarios/${session.id}/foto.${ext}`;

  const url = await uploadFile(file, path, file.type);

  await prisma.usuario.update({
    where: { id: session.id },
    data: { fotoUrl: url },
  });

  return NextResponse.json({ fotoUrl: url });
}

export async function DELETE(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await prisma.usuario.update({
    where: { id: session.id },
    data: { fotoUrl: null },
  });

  return NextResponse.json({ ok: true });
}
