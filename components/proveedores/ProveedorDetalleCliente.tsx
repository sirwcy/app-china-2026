"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, MessageCircle, Phone, ShieldCheck, MapPin, Package, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import ProveedorForm from "@/components/proveedores/ProveedorForm";
import ArchivoUploader, { type Archivo } from "@/components/archivos/ArchivoUploader";

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
  codigoPostal: string | null;
  provincia: string | null;
  ciudad: string | null;
  distrito: string | null;
  distanciaGuangzhou: number | null;
  tiempoVueloGuangzhou: string | null;
  distanciaYiwu: number | null;
  tiempoVueloYiwu: string | null;
}

interface PrecioTier {
  id: number;
  precio: number;
  moq: number;
}

interface ProductoVinculado {
  id: number;
  productoId: number;
  moneda: string;
  precios?: PrecioTier[];
  producto: { id: number; nombreCorto: string; nombreLargo: string };
}

interface Props {
  proveedor: Proveedor;
  productos: ProductoVinculado[];
  catalogos: Archivo[];
}

export default function ProveedorDetalleCliente({ proveedor, productos, catalogos }: Props) {
  const [panelEditar, setPanelEditar] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(proveedor);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link
            href="/proveedores"
            className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{proveedorActual.nombreEmpresa}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{proveedorActual.nombreContacto}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPanelEditar(true)}>
          <Pencil size={14} />
          Editar proveedor
        </Button>
      </div>

      {/* Info de contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {proveedorActual.nroWechat && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <MessageCircle size={15} className="text-green-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">WeChat</p>
              <p className="text-sm text-gray-200">{proveedorActual.nroWechat}</p>
            </div>
          </div>
        )}
        {proveedorActual.nroWhatsapp && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <Phone size={15} className="text-green-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">WhatsApp</p>
              <p className="text-sm text-gray-200">{proveedorActual.nroWhatsapp}</p>
            </div>
          </div>
        )}
        {proveedorActual.nroLicencia && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <ShieldCheck size={15} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Licencia comercial</p>
              <p className="text-sm text-gray-200 font-mono">{proveedorActual.nroLicencia}</p>
            </div>
          </div>
        )}
        {(proveedorActual.codigoPostal || proveedorActual.provincia || proveedorActual.ciudad) && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <MapPin size={15} className="text-[#FFDE00] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ubicación postal</p>
              {proveedorActual.codigoPostal && (
                <p className="text-xs text-gray-500 font-mono">{proveedorActual.codigoPostal}</p>
              )}
              {proveedorActual.provincia && (
                <p className="text-sm text-gray-200 truncate">{proveedorActual.provincia}</p>
              )}
              {proveedorActual.ciudad && (
                <p className="text-xs text-gray-400 truncate">{proveedorActual.ciudad}</p>
              )}
              {proveedorActual.distrito && (
                <p className="text-xs text-gray-500 truncate">Distrito: {proveedorActual.distrito}</p>
              )}
            </div>
          </div>
        )}
        {(proveedorActual.distanciaGuangzhou || proveedorActual.distanciaYiwu) && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-white/4 border border-white/8 col-span-full sm:col-span-1">
            <MapPin size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex flex-col gap-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Distancias</p>
              {proveedorActual.distanciaGuangzhou && (
                <p className="text-xs text-gray-300">
                  🏙️ Guangzhou: <span className="text-white font-medium">{proveedorActual.distanciaGuangzhou.toLocaleString()} km</span>
                  {proveedorActual.tiempoVueloGuangzhou && <span className="text-gray-500"> · ✈️ {proveedorActual.tiempoVueloGuangzhou}</span>}
                </p>
              )}
              {proveedorActual.distanciaYiwu && (
                <p className="text-xs text-gray-300">
                  🏙️ Yiwu: <span className="text-white font-medium">{proveedorActual.distanciaYiwu.toLocaleString()} km</span>
                  {proveedorActual.tiempoVueloYiwu && <span className="text-gray-500"> · ✈️ {proveedorActual.tiempoVueloYiwu}</span>}
                </p>
              )}
            </div>
          </div>
        )}
        {proveedorActual.direccion && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <MapPin size={15} className="text-[#FFDE00] shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dirección</p>
              <p className="text-sm text-gray-200">{proveedorActual.direccion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Productos vinculados */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Package size={15} className="text-[#FFDE00]" />
          <h2 className="text-base font-semibold text-white">
            Productos vinculados
          </h2>
          <Badge variant="default">{productos.length}</Badge>
        </div>
        {productos.length === 0 ? (
          <p className="text-sm text-gray-600 italic">Sin productos vinculados</p>
        ) : (
          <div className="flex flex-col gap-2">
            {productos.map((rel) => {
              const symbol = { USD: "$", CNY: "¥", EUR: "€" }[rel.moneda] ?? rel.moneda;
              const precioMin = rel.precios?.length
                ? rel.precios.reduce((min, p) => p.precio < min.precio ? p : min)
                : null;
              return (
                <Link
                  key={rel.id}
                  href={`/productos/${rel.producto.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8 hover:border-white/16 hover:bg-white/6 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-[#FFDE00] transition-colors">
                      {rel.producto.nombreCorto}
                    </p>
                    <p className="text-xs text-gray-500">{rel.producto.nombreLargo}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                    {precioMin && (
                      <>
                        <span className="text-[#FFDE00] font-semibold">
                          desde {symbol}{precioMin.precio.toLocaleString()}
                        </span>
                        <span className="text-gray-600">MOQ: {precioMin.moq}</span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Catálogo */}
      <div className="pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-[#DE2910]" />
          <h2 className="text-base font-semibold text-white">Catálogo</h2>
          <span className="text-[10px] text-gray-600 border border-white/10 rounded px-1.5 py-0.5">
            PDF · Excel · Imágenes
          </span>
        </div>
        <ArchivoUploader
          productoId={proveedor.id}
          initialArchivos={catalogos}
          soloDocumentos={true}
          apiBase={`/api/archivos/catalogo/${proveedor.id}`}
        />
      </div>

      {/* Panel editar */}
      <SlideOver open={panelEditar} onClose={() => setPanelEditar(false)} title="Editar proveedor">
        <ProveedorForm
          proveedor={proveedorActual}
          onSuccess={() => { setPanelEditar(false); }}
          onCancel={() => setPanelEditar(false)}
        />
      </SlideOver>
    </>
  );
}
