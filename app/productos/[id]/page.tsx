import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ProductoDetalleCliente from "@/components/productos/ProductoDetalleCliente";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) notFound();

  const [producto, relaciones, todosLosProveedores, categorias, subcategorias, materiales, etiquetas] =
    await Promise.all([
      prisma.producto.findUnique({
        where: { id: productoId },
        include: {
          material: true,
          categoria: true,
          subcategoria: true,
          etiquetas: { include: { etiqueta: true } },
        },
      }),
      prisma.productoProveedor.findMany({
        where: { productoId },
        orderBy: { creadoEn: "asc" },
        include: {
          proveedor: {
            select: {
              id: true,
              nombreEmpresa: true,
              nombreContacto: true,
              nroWechat: true,
              nroWhatsapp: true,
            },
          },
        },
      }),
      prisma.proveedor.findMany({ orderBy: { nombreEmpresa: "asc" } }),
      prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.subcategoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.material.findMany({ orderBy: { nombre: "asc" } }),
      prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } }),
    ]);

  if (!producto) notFound();

  const productoConIds = {
    ...producto,
    etiquetaIds: producto.etiquetas.map((e) => e.etiquetaId),
  };

  return (
    <AppLayout title={producto.nombreCorto}>
      <ProductoDetalleCliente
        producto={productoConIds}
        relaciones={relaciones}
        todosLosProveedores={todosLosProveedores}
        categorias={categorias}
        subcategorias={subcategorias}
        materiales={materiales}
        etiquetas={etiquetas}
      />
    </AppLayout>
  );
}
