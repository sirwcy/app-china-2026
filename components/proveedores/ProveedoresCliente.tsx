"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Factory } from "lucide-react";
import ProveedorCard from "./ProveedorCard";
import ProveedorForm from "./ProveedorForm";
import SlideOver from "@/components/ui/SlideOver";
import Button from "@/components/ui/Button";

interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  nroLicencia: string | null;
  nroWechat: string | null;
  nroWhatsapp: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  _count: { productos: number };
}

interface ProveedoresClienteProps {
  proveedores: Proveedor[];
}

export default function ProveedoresCliente({ proveedores }: ProveedoresClienteProps) {
  const [busqueda, setBusqueda] = useState("");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return proveedores;
    const q = busqueda.toLowerCase();
    return proveedores.filter(
      (p) =>
        p.nombreEmpresa.toLowerCase().includes(q) ||
        p.nombreContacto.toLowerCase().includes(q) ||
        p.nroLicencia?.toLowerCase().includes(q) ||
        p.nroWechat?.toLowerCase().includes(q) ||
        p.nroWhatsapp?.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  function abrirNuevo() {
    setProveedorEditar(null);
    setPanelAbierto(true);
  }

  function abrirEdicion(proveedor: Proveedor) {
    setProveedorEditar(proveedor);
    setPanelAbierto(true);
  }

  function cerrarPanel() {
    setPanelAbierto(false);
    setProveedorEditar(null);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, licencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/50 focus:border-[#DE2910]/50 transition-colors"
          />
        </div>
        <Button variant="primary" size="md" onClick={abrirNuevo} className="shrink-0">
          <Plus size={16} />
          Nuevo proveedor
        </Button>
      </div>

      {busqueda && (
        <p className="text-xs text-gray-500 mb-4">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
        </p>
      )}

      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((proveedor) => (
            <ProveedorCard
              key={proveedor.id}
              proveedor={proveedor}
              onEditar={abrirEdicion}
            />
          ))}
        </div>
      ) : (
        <EmptyState busqueda={busqueda} onNuevo={abrirNuevo} />
      )}

      <SlideOver
        open={panelAbierto}
        onClose={cerrarPanel}
        title={proveedorEditar ? "Editar proveedor" : "Nuevo proveedor"}
      >
        <ProveedorForm
          proveedor={proveedorEditar ?? undefined}
          onSuccess={cerrarPanel}
          onCancel={cerrarPanel}
        />
      </SlideOver>
    </>
  );
}

function EmptyState({ busqueda, onNuevo }: { busqueda: string; onNuevo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <Factory size={48} className="text-gray-700" />
      {busqueda ? (
        <>
          <p className="text-gray-400 font-medium">Sin resultados</p>
          <p className="text-gray-600 text-sm">
            No hay proveedores que coincidan con &ldquo;{busqueda}&rdquo;
          </p>
        </>
      ) : (
        <>
          <p className="text-gray-400 font-medium">Aún no hay proveedores</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Registrá el primer proveedor para luego vincularlo con productos.
          </p>
          <Button variant="primary" onClick={onNuevo}>
            <Plus size={16} />
            Crear primer proveedor
          </Button>
        </>
      )}
    </div>
  );
}
