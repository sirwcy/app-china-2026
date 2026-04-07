"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { relacionSchema } from "@/lib/validations/relacion";

export async function vincularProveedor(productoId: number, data: unknown) {
  const parsed = relacionSchema.parse(data);
  const { precios, ...relData } = parsed;

  const relacion = await prisma.productoProveedor.create({
    data: {
      productoId,
      proveedorId: relData.proveedorId,
      moneda: relData.moneda,
      notas: relData.notas,
      caracteristicas: relData.caracteristicas,
      precios: {
        create: precios.map((p) => ({ precio: p.precio, moq: p.moq })),
      },
    },
    include: { proveedor: true, precios: true },
  });
  revalidatePath(`/productos/${productoId}`);
  return relacion;
}

export async function actualizarRelacion(id: number, productoId: number, data: unknown) {
  const parsed = relacionSchema.parse(data);
  const { precios, ...relData } = parsed;

  // Actualizar relación base
  await prisma.productoProveedor.update({
    where: { id },
    data: {
      moneda: relData.moneda,
      notas: relData.notas,
      caracteristicas: relData.caracteristicas,
    },
  });

  // Obtener precios existentes
  const preciosExistentes = await prisma.precioProveedor.findMany({
    where: { productoProveedorId: id },
  });

  const idsEnviados = precios.filter((p) => p.id != null).map((p) => p.id!);
  const idsEliminar = preciosExistentes
    .filter((p) => !idsEnviados.includes(p.id))
    .map((p) => p.id);

  // Eliminar los que ya no están
  if (idsEliminar.length > 0) {
    await prisma.precioProveedor.deleteMany({ where: { id: { in: idsEliminar } } });
  }

  // Actualizar existentes y crear nuevos
  for (const tier of precios) {
    if (tier.id != null) {
      await prisma.precioProveedor.update({
        where: { id: tier.id },
        data: { precio: tier.precio, moq: tier.moq },
      });
    } else {
      await prisma.precioProveedor.create({
        data: { productoProveedorId: id, precio: tier.precio, moq: tier.moq },
      });
    }
  }

  revalidatePath(`/productos/${productoId}`);
}

export async function desvincularProveedor(id: number, productoId: number) {
  await prisma.productoProveedor.delete({ where: { id } });
  revalidatePath(`/productos/${productoId}`);
}
