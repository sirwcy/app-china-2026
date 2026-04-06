"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { relacionSchema } from "@/lib/validations/relacion";

export async function vincularProveedor(productoId: number, data: unknown) {
  const parsed = relacionSchema.parse(data);
  const relacion = await prisma.productoProveedor.create({
    data: { productoId, ...parsed },
    include: { proveedor: true },
  });
  revalidatePath(`/productos/${productoId}`);
  return relacion;
}

export async function actualizarRelacion(id: number, productoId: number, data: unknown) {
  const parsed = relacionSchema.parse(data);
  const relacion = await prisma.productoProveedor.update({
    where: { id },
    data: parsed,
    include: { proveedor: true },
  });
  revalidatePath(`/productos/${productoId}`);
  return relacion;
}

export async function desvincularProveedor(id: number, productoId: number) {
  await prisma.productoProveedor.delete({ where: { id } });
  revalidatePath(`/productos/${productoId}`);
}
