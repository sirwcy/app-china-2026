import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import ProveedoresCliente from "@/components/proveedores/ProveedoresCliente";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const [proveedores, categorias] = await Promise.all([
    prisma.proveedor.findMany({
      orderBy: { nombreEmpresa: "asc" },
      select: {
        id: true,
        nombreEmpresa: true,
        nombreContacto: true,
        nroLicencia: true,
        nroWechat: true,
        nroWhatsapp: true,
        direccion: true,
        lat: true,
        lng: true,
        provincia: true,
        ciudad: true,
        _count: { select: { productos: true } },
        productos: {
          select: {
            producto: {
              select: {
                categoriaId: true,
                categoria: { select: { id: true, nombre: true } },
              },
            },
          },
        },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Proveedores</h1>
        <p className="text-gray-500 text-sm mt-1">
          {proveedores.length === 0
            ? "Registrá proveedores para luego vincularlos con productos."
            : `${proveedores.length} proveedor${proveedores.length !== 1 ? "es" : ""} registrado${proveedores.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <ProveedoresCliente proveedores={proveedores} categorias={categorias} />
    </AppLayout>
  );
}
