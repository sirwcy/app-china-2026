import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const tipo = req.nextUrl.searchParams.get("tipo") ?? "productos";

  if (q.length < 2) return NextResponse.json([]);

  if (tipo === "proveedores") {
    const proveedores = await prisma.proveedor.findMany({
      where: {
        OR: [
          { nombreEmpresa: { contains: q } },
          { nombreContacto: { contains: q } },
          { nroLicencia: { contains: q } },
          { nroWechat: { contains: q } },
          { nroWhatsapp: { contains: q } },
          { direccion: { contains: q } },
          {
            productos: {
              some: {
                producto: {
                  OR: [
                    { nombreCorto: { contains: q } },
                    { nombreLargo: { contains: q } },
                  ],
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nombreEmpresa: true,
        nombreContacto: true,
        nroWechat: true,
        nroWhatsapp: true,
        direccion: true,
        _count: { select: { productos: true } },
      },
      take: 30,
    });
    return NextResponse.json(proveedores);
  }

  // tipo === "productos"
  const productos = await prisma.producto.findMany({
    where: {
      OR: [
        { nombreCorto: { contains: q } },
        { nombreLargo: { contains: q } },
        { caracteristicas: { contains: q } },
        { material: { nombre: { contains: q } } },
        { categoria: { nombre: { contains: q } } },
        { subcategoria: { nombre: { contains: q } } },
        { etiquetas: { some: { etiqueta: { nombre: { contains: q } } } } },
        {
          proveedores: {
            some: {
              proveedor: {
                OR: [
                  { nombreEmpresa: { contains: q } },
                  { nombreContacto: { contains: q } },
                ],
              },
            },
          },
        },
      ],
    },
    include: {
      material: true,
      categoria: true,
      subcategoria: true,
      etiquetas: { include: { etiqueta: true } },
      _count: { select: { proveedores: true } },
    },
    take: 30,
  });

  return NextResponse.json(productos);
}
