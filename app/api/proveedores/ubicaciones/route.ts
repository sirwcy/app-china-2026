import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const proveedores = await prisma.proveedor.findMany({
    where: {
      lat: { not: null },
      lng: { not: null },
    },
    select: {
      id: true,
      nombreEmpresa: true,
      nombreContacto: true,
      lat: true,
      lng: true,
    },
  });

  const marcadores = proveedores
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      nombreEmpresa: p.nombreEmpresa,
      nombreContacto: p.nombreContacto,
      lat: p.lat as number,
      lng: p.lng as number,
    }));

  return NextResponse.json(marcadores);
}
