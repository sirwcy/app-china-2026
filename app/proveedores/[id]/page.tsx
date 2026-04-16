import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ProveedorDetalleCliente from "@/components/proveedores/ProveedorDetalleCliente";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProveedorDetallePage({ params }: PageProps) {
  const { id } = await params;
  const proveedorId = parseInt(id, 10);
  if (isNaN(proveedorId)) notFound();

  const [proveedor, productos, catalogos, fotos] = await Promise.all([
    prisma.proveedor.findUnique({ where: { id: proveedorId } }),
    prisma.productoProveedor.findMany({
      where: { proveedorId },
      orderBy: { creadoEn: "asc" },
      include: {
        producto: { select: { id: true, nombreCorto: true, nombreLargo: true } },
        precios: { orderBy: { moq: "asc" } },
      },
    }),
    prisma.catalogoProveedor.findMany({
      where: { proveedorId },
      orderBy: { creadoEn: "asc" },
    }),
    prisma.fotoProveedor.findMany({
      where: { proveedorId },
      orderBy: { creadoEn: "asc" },
    }),
  ]);

  if (!proveedor) notFound();

  return (
    <AppLayout title={proveedor.nombreEmpresa}>
      <ProveedorDetalleCliente
        proveedor={proveedor}
        productos={productos}
        catalogos={catalogos.map((c) => ({ ...c, creadoEn: c.creadoEn.toISOString() }))}
        fotos={fotos}
      />
    </AppLayout>
  );
}
