"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearEtiqueta(nombre: string, color?: string) {
  const nombreCapitalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  const etiqueta = await prisma.etiqueta.create({
    data: { nombre: nombreCapitalizado, color: color ?? "#6b7280" },
  });
  return { id: etiqueta.id, nombre: etiqueta.nombre, color: etiqueta.color };
}

export async function actualizarEtiquetasProducto(productoId: number, etiquetaIds: number[]) {
  await prisma.productoEtiqueta.deleteMany({ where: { productoId } });
  if (etiquetaIds.length > 0) {
    await prisma.productoEtiqueta.createMany({
      data: etiquetaIds.map((etiquetaId) => ({ productoId, etiquetaId })),
    });
  }
  revalidatePath(`/productos/${productoId}`);
  revalidatePath("/productos");
}
