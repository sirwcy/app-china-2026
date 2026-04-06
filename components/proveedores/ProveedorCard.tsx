"use client";

import { Pencil, Trash2, MessageCircle, Phone, ShieldCheck, Package, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { eliminarProveedor } from "@/lib/actions/proveedores";

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

interface ProveedorCardProps {
  proveedor: Proveedor;
  onEditar: (proveedor: Proveedor) => void;
}

export default function ProveedorCard({ proveedor, onEditar }: ProveedorCardProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEliminar() {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
      return;
    }
    setEliminando(true);
    await eliminarProveedor(proveedor.id);
  }

  const nroProductos = proveedor._count.productos;

  return (
    <article className="group flex flex-col gap-3 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/16 hover:bg-white/6 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug truncate">
            {proveedor.nombreEmpresa}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5 truncate">
            {proveedor.nombreContacto}
          </p>
        </div>
        <span className="text-xl shrink-0">🏭</span>
      </div>

      {/* Info de contacto */}
      <div className="flex flex-col gap-1">
        {proveedor.nroWechat && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MessageCircle size={12} className="text-green-500 shrink-0" />
            <span className="truncate">{proveedor.nroWechat}</span>
          </div>
        )}
        {proveedor.nroWhatsapp && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Phone size={12} className="text-green-400 shrink-0" />
            <span className="truncate">{proveedor.nroWhatsapp}</span>
          </div>
        )}
        {proveedor.nroLicencia && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck size={12} className="text-blue-400 shrink-0" />
            <span className="truncate font-mono">{proveedor.nroLicencia}</span>
          </div>
        )}
        {proveedor.direccion && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={12} className="text-[#FFDE00] shrink-0" />
            <span className="truncate">{proveedor.direccion}</span>
          </div>
        )}
      </div>

      {/* Badge de productos */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={nroProductos > 0 ? "green" : "default"}>
          <Package size={11} className="mr-1" />
          {nroProductos === 0
            ? "Sin productos"
            : `${nroProductos} producto${nroProductos > 1 ? "s" : ""}`}
        </Badge>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/6">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center"
          onClick={() => onEditar(proveedor)}
        >
          <Pencil size={13} />
          Editar
        </Button>

        <Button
          variant={confirmando ? "danger" : "ghost"}
          size="sm"
          className="flex-1 justify-center"
          onClick={handleEliminar}
          loading={eliminando}
        >
          <Trash2 size={13} />
          {confirmando ? "¿Confirmar?" : "Eliminar"}
        </Button>
      </div>
    </article>
  );
}
