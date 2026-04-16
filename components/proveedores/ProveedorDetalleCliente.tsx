"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, MessageCircle, Phone, ShieldCheck, MapPin,
  Package, BookOpen, Trash2, CreditCard, Camera, ImageIcon, X,
  AlertTriangle, Loader2, Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import ProveedorForm from "@/components/proveedores/ProveedorForm";
import ArchivoUploader, { type Archivo } from "@/components/archivos/ArchivoUploader";
import { eliminarProveedor } from "@/lib/actions/proveedores";

interface FotoProveedor {
  id: number;
  url: string;
  descripcion: string | null;
}

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
  tarjetaUrl: string | null;
}

interface PrecioTier { id: number; precio: number; moq: number; }
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
  fotos: FotoProveedor[];
}

// ─── Sección tarjeta de presentación ─────────────────────────────────────────

function TarjetaPresentacion({ proveedorId, initialUrl }: {
  proveedorId: number;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      let res: Response;
      try {
        res = await fetch(`/api/proveedores/${proveedorId}/tarjeta`, { method: "POST", body: fd });
      } catch {
        throw new Error("Sin conexión al servidor");
      }
      if (!res.ok) {
        let msg = `Error (${res.status})`;
        try { const j = await res.json(); msg = j.error || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      const data = await res.json();
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    setUploading(true);
    setError("");
    try {
      await fetch(`/api/proveedores/${proveedorId}/tarjeta`, { method: "DELETE" });
      setUrl(null);
    } catch {
      setError("Error al eliminar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {url ? (
        <div className="relative group w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Tarjeta de presentación"
            className="max-w-full sm:max-w-sm w-full rounded-xl border border-white/15 object-cover shadow-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 backdrop-blur text-white text-xs cursor-pointer hover:bg-white/20 transition-colors">
              <Camera size={13} />
              Cambiar
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </label>
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/60 backdrop-blur text-red-300 text-xs hover:bg-red-900/80 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-white/35 bg-white/3 hover:bg-white/6 transition-colors cursor-pointer text-sm text-gray-400 hover:text-gray-200">
            <Camera size={16} className="text-blue-400" />
            Tomar foto de la tarjeta
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-white/35 bg-white/3 hover:bg-white/6 transition-colors cursor-pointer text-sm text-gray-400 hover:text-gray-200">
            <ImageIcon size={16} className="text-purple-400" />
            Adjuntar imagen
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
        </div>
      )}
      {uploading && !url && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <Loader2 size={14} className="animate-spin" />
          Subiendo...
        </div>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}

// ─── Galería de fotos referenciales ──────────────────────────────────────────

function FotosReferenciales({ proveedorId, initialFotos }: {
  proveedorId: number;
  initialFotos: FotoProveedor[];
}) {
  const [fotos, setFotos] = useState(initialFotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      let res: Response;
      try {
        res = await fetch(`/api/proveedores/${proveedorId}/fotos`, { method: "POST", body: fd });
      } catch {
        throw new Error("Sin conexión al servidor");
      }
      if (!res.ok) {
        let msg = `Error (${res.status})`;
        try { const j = await res.json(); msg = j.error || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      const nueva: FotoProveedor = await res.json();
      setFotos((prev) => [...prev, nueva]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fotoId: number) {
    try {
      await fetch(`/api/proveedores/${proveedorId}/fotos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoId }),
      });
      setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    } catch {
      setError("Error al eliminar foto");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fotos.map((f) => (
            <div key={f.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.url}
                alt={f.descripcion ?? "Foto referencial"}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80"
                title="Eliminar foto"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botones de carga */}
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/25 bg-blue-500/8 text-blue-400 text-sm cursor-pointer hover:bg-blue-500/15 transition-colors">
          <Camera size={14} />
          Tomar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-gray-400 text-sm cursor-pointer hover:bg-white/10 transition-colors">
          <Plus size={14} />
          Adjuntar imagen
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (!e.target.files) return;
              Array.from(e.target.files).forEach((f) => handleFile(f));
            }}
          />
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Subiendo...
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {fotos.length === 0 && !uploading && (
        <p className="text-xs text-gray-700 italic">Sin fotos referenciales aún</p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProveedorDetalleCliente({ proveedor, productos, catalogos, fotos }: Props) {
  const router = useRouter();
  const [panelEditar, setPanelEditar] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(proveedor);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEliminar() {
    setEliminando(true);
    try {
      await eliminarProveedor(proveedor.id);
      router.push("/proveedores");
    } catch {
      setEliminando(false);
      setConfirmarEliminar(false);
    }
  }

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
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPanelEditar(true)}>
            <Pencil size={14} />
            Editar
          </Button>
          <button
            type="button"
            onClick={() => setConfirmarEliminar(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-800/40 bg-red-900/15 text-red-400 text-sm hover:bg-red-900/30 hover:border-red-700/60 transition-colors"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Info de contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {proveedorActual.nroWechat && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <MessageCircle size={15} className="text-green-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">WeChat</p>
              <p className="text-sm text-gray-200 font-mono tracking-wider">{proveedorActual.nroWechat}</p>
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

      {/* Tarjeta de presentación */}
      <div className="mb-8 pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-[#FFDE00]" />
          <h2 className="text-base font-semibold text-white">Tarjeta de presentación</h2>
        </div>
        <TarjetaPresentacion
          proveedorId={proveedor.id}
          initialUrl={proveedorActual.tarjetaUrl}
        />
      </div>

      {/* Fotos referenciales */}
      <div className="mb-8 pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon size={15} className="text-[#DE2910]" />
          <h2 className="text-base font-semibold text-white">Fotos referenciales</h2>
          {fotos.length > 0 && <Badge variant="default">{fotos.length}</Badge>}
        </div>
        <FotosReferenciales
          proveedorId={proveedor.id}
          initialFotos={fotos}
        />
      </div>

      {/* Productos vinculados */}
      <div className="mb-8 pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-3">
          <Package size={15} className="text-[#FFDE00]" />
          <h2 className="text-base font-semibold text-white">Productos vinculados</h2>
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

      {/* Archivos del proveedor */}
      <div className="pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-[#DE2910]" />
          <h2 className="text-base font-semibold text-white">Archivos del proveedor</h2>
          <span className="text-[10px] text-gray-600 border border-white/10 rounded px-1.5 py-0.5">
            Imágenes · PDF · Excel · Audio · Video
          </span>
        </div>
        <ArchivoUploader
          productoId={proveedor.id}
          initialArchivos={catalogos}
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

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">¿Eliminar proveedor?</h3>
                <p className="text-xs text-gray-500 mt-0.5">{proveedorActual.nombreEmpresa}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Se eliminarán todos los datos del proveedor, sus fotos, archivos y vínculos con productos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminar(false)}
                disabled={eliminando}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
