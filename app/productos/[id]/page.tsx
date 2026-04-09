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

  const [producto, relaciones, todosLosProveedores, categorias, subcategorias, materiales, etiquetas, archivos] =
    await Promise.all([
      prisma.producto.findUnique({
        where: { id: productoId },
        include: {
          material: true,
          categoria: true,
          subcategoria: true,
          etiquetas: { include: { etiqueta: true } },
        },
      }) as Promise<{
        id: number; nombreLargo: string; nombreCorto: string; caracteristicas: string | null;
        materialId: number | null; categoriaId: number | null; subcategoriaId: number | null;
        requiereMedidas: boolean; ancho: number | null; largo: number | null; alto: number | null; espesor: number | null;
        material: { nombre: string } | null; categoria: { nombre: string } | null; subcategoria: { nombre: string } | null;
        etiquetas: { etiquetaId: number }[];
      } | null>,
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
          precios: { orderBy: { moq: "asc" } },
          fotos: { orderBy: { creadoEn: "asc" } },
          archivos: { orderBy: { creadoEn: "asc" } },
        },
      }),
      prisma.proveedor.findMany({ orderBy: { nombreEmpresa: "asc" } }),
      prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.subcategoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.material.findMany({ orderBy: { nombre: "asc" } }),
      prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } }),
      prisma.archivoProducto.findMany({ where: { productoId }, orderBy: { creadoEn: "asc" } }),
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
        relaciones={relaciones.map(r => ({
          ...r,
          fotos: r.fotos.map(f => ({ ...f, creadoEn: f.creadoEn.toISOString() })),
          archivos: r.archivos.map(a => ({ ...a, creadoEn: a.creadoEn.toISOString() })),
        }))}
        todosLosProveedores={todosLosProveedores}
        categorias={categorias}
        subcategorias={subcategorias}
        materiales={materiales}
        etiquetas={etiquetas}
        archivos={archivos.map(a => ({ ...a, creadoEn: a.creadoEn.toISOString() }))}
      />
    </AppLayout>
  );
}
