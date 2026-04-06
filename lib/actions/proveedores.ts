"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { proveedorSchema } from "@/lib/validations/proveedor";

export async function crearProveedor(data: unknown) {
  const parsed = proveedorSchema.parse(data);
  const proveedor = await prisma.proveedor.create({ data: parsed });
  revalidatePath("/proveedores");
  return proveedor;
}

export async function actualizarProveedor(id: number, data: unknown) {
  const parsed = proveedorSchema.parse(data);
  const proveedor = await prisma.proveedor.update({ where: { id }, data: parsed });
  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${id}`);
  return proveedor;
}

export async function eliminarProveedor(id: number) {
  await prisma.proveedor.delete({ where: { id } });
  revalidatePath("/proveedores");
}
