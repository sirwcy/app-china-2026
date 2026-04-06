import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import ProductosCliente from "@/components/productos/ProductosCliente";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const [productos, categorias, subcategorias, materiales, etiquetas] = await Promise.all([
    prisma.producto.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        material: true,
        categoria: true,
        subcategoria: true,
        etiquetas: { include: { etiqueta: true } },
        _count: { select: { proveedores: true } },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.subcategoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.material.findMany({ orderBy: { nombre: "asc" } }),
    prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Productos</h1>
        <p className="text-gray-500 text-sm mt-1">
          {productos.length === 0
            ? "Registrá productos para luego vincularlos con proveedores."
            : `${productos.length} producto${productos.length !== 1 ? "s" : ""} registrado${productos.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <ProductosCliente
        productos={productos}
        categorias={categorias}
        subcategorias={subcategorias}
        materiales={materiales}
        etiquetas={etiquetas}
      />
    </AppLayout>
  );
}
