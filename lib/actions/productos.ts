"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productoSchema } from "@/lib/validations/producto";
import { z } from "zod";

const productoConEtiquetasSchema = productoSchema.extend({
  etiquetaIds: z.array(z.number().int().positive()).optional().default([]),
});

export async function crearProducto(data: unknown) {
  const { etiquetaIds, ...rest } = productoConEtiquetasSchema.parse(data);
  const producto = await prisma.producto.create({
    data: {
      ...rest,
      etiquetas: etiquetaIds.length
        ? { create: etiquetaIds.map((etiquetaId) => ({ etiquetaId })) }
        : undefined,
    },
  });
  revalidatePath("/productos");
  return producto;
}

export async function actualizarProducto(id: number, data: unknown) {
  const { etiquetaIds, ...rest } = productoConEtiquetasSchema.parse(data);
  await prisma.productoEtiqueta.deleteMany({ where: { productoId: id } });
  const producto = await prisma.producto.update({
    where: { id },
    data: {
      ...rest,
      etiquetas: etiquetaIds.length
        ? { create: etiquetaIds.map((etiquetaId) => ({ etiquetaId })) }
        : undefined,
    },
  });
  revalidatePath("/productos");
  revalidatePath(`/productos/${id}`);
  return producto;
}

export async function eliminarProducto(id: number) {
  await prisma.producto.delete({ where: { id } });
  revalidatePath("/productos");
}
