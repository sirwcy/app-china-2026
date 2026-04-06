"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nombreSchema = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(60, "Máximo 60 caracteres")
  .trim();

export async function crearCategoria(nombre: string) {
  const parsed = nombreSchema.parse(nombre);
  const categoria = await prisma.categoria.upsert({
    where: { nombre: parsed },
    update: {},
    create: { nombre: parsed },
  });
  revalidatePath("/productos");
  return categoria;
}

export async function crearSubcategoria(nombre: string, categoriaId: number) {
  const parsed = nombreSchema.parse(nombre);
  const subcategoria = await prisma.subcategoria.upsert({
    where: { nombre_categoriaId: { nombre: parsed, categoriaId } },
    update: {},
    create: { nombre: parsed, categoriaId },
  });
  revalidatePath("/productos");
  return subcategoria;
}

export async function crearMaterial(nombre: string) {
  const parsed = nombreSchema.parse(nombre);
  const material = await prisma.material.upsert({
    where: { nombre: parsed },
    update: {},
    create: { nombre: parsed },
  });
  revalidatePath("/productos");
  return material;
}

export async function actualizarCategoria(id: number, nombre: string) {
  const parsed = nombreSchema.parse(nombre);
  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nombre: parsed },
  });
  revalidatePath("/productos");
  return categoria;
}

export async function actualizarSubcategoria(id: number, nombre: string) {
  const parsed = nombreSchema.parse(nombre);
  const subcategoria = await prisma.subcategoria.update({
    where: { id },
    data: { nombre: parsed },
  });
  revalidatePath("/productos");
  return subcategoria;
}

export async function actualizarMaterial(id: number, nombre: string) {
  const parsed = nombreSchema.parse(nombre);
  const material = await prisma.material.update({
    where: { id },
    data: { nombre: parsed },
  });
  revalidatePath("/productos");
  return material;
}

export async function getCategorias() {
  return prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: {
      subcategorias: { orderBy: { nombre: "asc" } },
    },
  });
}

export async function getMateriales() {
  return prisma.material.findMany({ orderBy: { nombre: "asc" } });
}
