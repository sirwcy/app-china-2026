import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import AnalisisCliente from "@/components/analisis/AnalisisCliente";

export const dynamic = "force-dynamic";

export default async function AnalisisPage() {
  const relaciones = await prisma.productoProveedor.findMany({
    include: {
      producto: {
        include: {
          categoria: true,
          subcategoria: true,
          material: true,
        },
      },
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
    },
    orderBy: { productoId: "asc" },
  });

  return (
    <AppLayout title="Análisis Comparativo">
      <AnalisisCliente relaciones={relaciones} />
    </AppLayout>
  );
}
