import AppLayout from "@/components/AppLayout";
import BuscarCliente from "@/components/buscar/BuscarCliente";

export default function BuscarPage() {
  return (
    <AppLayout title="Buscador">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Buscador</h1>
        <p className="text-gray-500 text-sm mt-1">
          Buscá productos o proveedores por cualquier dato relacionado.
        </p>
      </div>
      <BuscarCliente />
    </AppLayout>
  );
}
