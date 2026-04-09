"use client";

import { useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, ArrowLeft, DollarSign, Package2, StickyNote,
  Paperclip, Images, ChevronDown, ChevronUp, Upload, Loader2, X, ExternalLink,
  FileText, FileSpreadsheet, FileType, Mic, Video, ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import RelacionForm from "@/components/relaciones/RelacionForm";
import ProductoForm from "@/components/productos/ProductoForm";
import ProveedorForm from "@/components/proveedores/ProveedorForm";
import { desvincularProveedor } from "@/lib/actions/relaciones";
import type { SelectOption } from "@/components/ui/CreatableSelect";
import ArchivoUploader, { type Archivo } from "@/components/archivos/ArchivoUploader";

interface SubcategoriaOption extends SelectOption {
  categoriaId: number;
}

interface PrecioTier {
  id: number;
  precio: number;
  moq: number;
}

interface FotoRel {
  id: number;
  url: string;
  descripcion: string | null;
  creadoEn: string;
}

interface ArchivoRel {
  id: number;
  nombre: string;
  url: string;
  tipo: string;
  tamano: number | null;
  creadoEn: string;
}

interface Relacion {
  id: number;
  proveedorId: number;
  moneda: string;
  notas: string | null;
  caracteristicas: string | null;
  precios: PrecioTier[];
  fotos: FotoRel[];
  archivos: ArchivoRel[];
  proveedor: {
    id: number;
    nombreEmpresa: string;
    nombreContacto: string;
    nroWechat: string | null;
    nroWhatsapp: string | null;
  };
}

interface Producto {
  id: number;
  nombreLargo: string;
  nombreCorto: string;
  caracteristicas: string | null;
  materialId: number | null;
  categoriaId: number | null;
  subcategoriaId: number | null;
  requiereMedidas?: boolean;
  ancho?: number | null;
  largo?: number | null;
  alto?: number | null;
  espesor?: number | null;
  material: { nombre: string } | null;
  categoria: { nombre: string } | null;
  subcategoria: { nombre: string } | null;
}

interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
}

interface EtiquetaOption extends SelectOption {
  color: string;
}

interface ProductoDetalleClienteProps {
  producto: Producto;
  relaciones: Relacion[];
  todosLosProveedores: Proveedor[];
  categorias: SelectOption[];
  subcategorias: SubcategoriaOption[];
  materiales: SelectOption[];
  etiquetas: EtiquetaOption[];
  archivos?: Archivo[];
}

export default function ProductoDetalleCliente({
  producto,
  relaciones,
  todosLosProveedores,
  categorias,
  subcategorias,
  materiales,
  etiquetas,
  archivos = [],
}: ProductoDetalleClienteProps) {
  const [panelRelacion, setPanelRelacion] = useState(false);
  const [panelEditar, setPanelEditar] = useState(false);
  const [panelNuevoProveedor, setPanelNuevoProveedor] = useState(false);
  const [relacionEditar, setRelacionEditar] = useState<Relacion | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>(todosLosProveedores);

  const proveedoresVinculadosIds = relaciones.map((r) => r.proveedorId);

  function abrirNuevaRelacion() {
    setRelacionEditar(null);
    setPanelRelacion(true);
  }

  function abrirEditarRelacion(rel: Relacion) {
    setRelacionEditar(rel);
    setPanelRelacion(true);
  }

  function cerrarPanelRelacion() {
    setPanelRelacion(false);
    setRelacionEditar(null);
  }

  function handleProveedorCreado(nuevo: Proveedor) {
    setProveedores((prev) => [...prev, nuevo].sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa)));
    setPanelNuevoProveedor(false);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link
            href="/productos"
            className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Volver a productos"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{producto.nombreCorto}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{producto.nombreLargo}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {producto.categoria && <Badge variant="red">{producto.categoria.nombre}</Badge>}
              {producto.subcategoria && <Badge variant="default">{producto.subcategoria.nombre}</Badge>}
              {producto.material && <Badge variant="blue">{producto.material.nombre}</Badge>}
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPanelEditar(true)} className="shrink-0">
          <Pencil size={14} />
          Editar producto
        </Button>
      </div>

      {/* Características del producto */}
      {producto.caracteristicas && (
        <div className="mb-4 p-4 rounded-xl bg-white/4 border border-white/8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Características</p>
          <p className="text-sm text-gray-300 leading-relaxed">{producto.caracteristicas}</p>
        </div>
      )}

      {/* Medidas */}
      {producto.requiereMedidas && (producto.ancho || producto.largo || producto.alto || producto.espesor) && (
        <div className="mb-6 p-4 rounded-xl bg-white/4 border border-white/8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Medidas</p>
          <div className="flex flex-wrap gap-4">
            {producto.ancho != null && (
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Ancho</p>
                <p className="text-sm font-semibold text-gray-200">{producto.ancho} cm</p>
              </div>
            )}
            {producto.largo != null && (
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Largo</p>
                <p className="text-sm font-semibold text-gray-200">{producto.largo} cm</p>
              </div>
            )}
            {producto.alto != null && (
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Alto</p>
                <p className="text-sm font-semibold text-gray-200">{producto.alto} cm</p>
              </div>
            )}
            {producto.espesor != null && (
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Espesor</p>
                <p className="text-sm font-semibold text-gray-200">{producto.espesor} mm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección proveedores */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Proveedores vinculados</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {relaciones.length === 0
              ? "Ningún proveedor vinculado aún"
              : `${relaciones.length} proveedor${relaciones.length > 1 ? "es" : ""}`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={abrirNuevaRelacion}>
          <Plus size={15} />
          Vincular proveedor
        </Button>
      </div>

      {relaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-white/10 rounded-xl">
          <Package2 size={40} className="text-gray-700" />
          <p className="text-gray-400 text-sm">Sin proveedores vinculados</p>
          <p className="text-gray-600 text-xs max-w-xs">
            Vinculá un proveedor para registrar precio, MOQ y condiciones específicas.
          </p>
          <Button variant="primary" size="sm" onClick={abrirNuevaRelacion}>
            <Plus size={14} />
            Vincular primer proveedor
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {relaciones.map((rel) => (
            <RelacionCard
              key={rel.id}
              relacion={rel}
              onEditar={() => abrirEditarRelacion(rel)}
              productoId={producto.id}
            />
          ))}
        </div>
      )}

      {/* Sección de archivos adjuntos del producto */}
      <div className="mt-8 pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <Paperclip size={16} className="text-[#FFDE00]" />
          <h2 className="text-base font-semibold text-white">Archivos del producto</h2>
        </div>
        <ArchivoUploader
          productoId={producto.id}
          initialArchivos={archivos}
          apiBase={`/api/archivos/producto/${producto.id}`}
        />
      </div>

      {/* Panel: vincular / editar relación */}
      <SlideOver
        open={panelRelacion}
        onClose={cerrarPanelRelacion}
        title={relacionEditar ? "Editar relación con proveedor" : "Vincular proveedor"}
      >
        <RelacionForm
          key={relacionEditar?.id ?? "nueva"}
          productoId={producto.id}
          proveedores={proveedores}
          proveedoresVinculadosIds={proveedoresVinculadosIds}
          relacion={relacionEditar ?? undefined}
          onSuccess={cerrarPanelRelacion}
          onCancel={cerrarPanelRelacion}
          onCrearProveedor={() => setPanelNuevoProveedor(true)}
        />
      </SlideOver>

      {/* Panel: editar producto */}
      <SlideOver
        open={panelEditar}
        onClose={() => setPanelEditar(false)}
        title="Editar producto"
      >
        <ProductoForm
          producto={producto}
          categorias={categorias}
          subcategorias={subcategorias}
          materiales={materiales}
          etiquetas={etiquetas}
          onSuccess={() => setPanelEditar(false)}
          onCancel={() => setPanelEditar(false)}
        />
      </SlideOver>

      {/* Panel: crear nuevo proveedor desde ficha producto */}
      <SlideOver
        open={panelNuevoProveedor}
        onClose={() => setPanelNuevoProveedor(false)}
        title="Crear nuevo proveedor"
      >
        <ProveedorForm
          onSuccess={(nuevo) => {
            if (nuevo) handleProveedorCreado(nuevo);
            else setPanelNuevoProveedor(false);
          }}
          onCancel={() => setPanelNuevoProveedor(false)}
        />
      </SlideOver>
    </>
  );
}

// ─── Tarjeta de relación con proveedor ───────────────────────────────────────

function RelacionCard({
  relacion,
  onEditar,
  productoId,
}: {
  relacion: Relacion;
  onEditar: () => void;
  productoId: number;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [expandido, setExpandido] = useState(false);

  const [fotos, setFotos] = useState<FotoRel[]>(relacion.fotos);
  const [archivos, setArchivos] = useState<ArchivoRel[]>(relacion.archivos);

  async function handleEliminar() {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
      return;
    }
    setEliminando(true);
    await desvincularProveedor(relacion.id, productoId);
  }

  const monedaSymbol = { USD: "$", CNY: "¥", EUR: "€" }[relacion.moneda] ?? relacion.moneda;
  const totalMedia = fotos.length + archivos.length;

  return (
    <article className="rounded-xl bg-white/4 border border-white/8 hover:border-white/12 transition-all overflow-hidden">
      {/* Info principal */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Info proveedor */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-sm">
                {relacion.proveedor.nombreEmpresa}
              </h3>
              <span className="text-gray-500 text-xs">{relacion.proveedor.nombreContacto}</span>
              {relacion.proveedor.nroWechat && (
                <Badge variant="green">WeChat: {relacion.proveedor.nroWechat}</Badge>
              )}
            </div>

            {/* Precios por MOQ */}
            <div className="flex flex-wrap gap-2 mt-2">
              {relacion.precios.length === 0 ? (
                <span className="text-gray-600 text-xs italic">Sin precio registrado</span>
              ) : (
                relacion.precios.map((tier) => (
                  <div key={tier.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
                    <DollarSign size={11} className="text-[#FFDE00] shrink-0" />
                    <span className="font-semibold text-[#FFDE00] text-sm">
                      {monedaSymbol}{tier.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-500 text-xs">{relacion.moneda}</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <Package2 size={10} className="text-gray-500 shrink-0" />
                    <span className="text-xs text-gray-400">
                      MOQ <strong className="text-gray-300">{tier.moq.toLocaleString()}</strong>
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Características / notas */}
            {relacion.caracteristicas && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {relacion.caracteristicas}
              </p>
            )}
            {relacion.notas && (
              <div className="flex items-start gap-1.5 mt-1.5">
                <StickyNote size={11} className="text-gray-600 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{relacion.notas}</p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onEditar}>
              <Pencil size={13} />
              Editar
            </Button>
            <Button
              variant={confirmando ? "danger" : "ghost"}
              size="sm"
              onClick={handleEliminar}
              loading={eliminando}
            >
              <Trash2 size={13} />
              {confirmando ? "¿Confirmar?" : "Desvincular"}
            </Button>
          </div>
        </div>

        {/* Toggle media */}
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="mt-3 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expandido ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <Images size={12} />
          <span>
            {totalMedia === 0
              ? "Agregar fotos y archivos"
              : `${fotos.length} foto${fotos.length !== 1 ? "s" : ""} · ${archivos.length} archivo${archivos.length !== 1 ? "s" : ""}`}
          </span>
        </button>
      </div>

      {/* Sección expandible de media */}
      {expandido && (
        <div className="border-t border-white/8 p-4 bg-white/2 flex flex-col gap-5">
          {/* Fotos de referencia */}
          <FotoGaleria
            relacionId={relacion.id}
            fotos={fotos}
            onFotosChange={setFotos}
          />

          {/* Archivos / documentos */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Paperclip size={11} />
              Documentos y archivos
            </p>
            <ArchivoUploader
              productoId={0}
              initialArchivos={archivos.map(a => ({ ...a }))}
              apiBase={`/api/relaciones/${relacion.id}/archivos`}
              soloDocumentos
              onArchivosChange={(updated) => setArchivos(updated as ArchivoRel[])}
            />
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Galería de fotos por relación ───────────────────────────────────────────

function FotoGaleria({
  relacionId,
  fotos,
  onFotosChange,
}: {
  relacionId: number;
  fotos: FotoRel[];
  onFotosChange: (fotos: FotoRel[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<FotoRel | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/relaciones/${relacionId}/fotos`, { method: "POST", body: fd });
      if (res.ok) {
        const nueva: FotoRel = await res.json();
        onFotosChange([...fotos, nueva]);
        fotos = [...fotos, nueva]; // update local ref for loop
      }
    }
    setUploading(false);
  }

  async function handleDelete(fotoId: number) {
    const res = await fetch(`/api/relaciones/${relacionId}/fotos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fotoId }),
    });
    if (res.ok) onFotosChange(fotos.filter((f) => f.id !== fotoId));
  }

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Images size={11} />
        Fotos de referencia
      </p>

      <div className="flex flex-wrap gap-2">
        {/* Thumbnails */}
        {fotos.map((foto) => (
          <div key={foto.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.url}
              alt={foto.descripcion ?? "foto"}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightbox(foto)}
            />
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setLightbox(foto)}
                className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                title="Ver"
              >
                <ExternalLink size={11} className="text-white" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(foto.id)}
                className="p-1 rounded bg-red-900/60 hover:bg-red-800/80 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={11} className="text-red-300" />
              </button>
            </div>
          </div>
        ))}

        {/* Botón agregar */}
        <label className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 ${
          uploading ? "border-white/10 opacity-50" : "border-white/15 hover:border-[#DE2910]/50 hover:bg-[#DE2910]/5"
        }`}>
          {uploading ? (
            <Loader2 size={18} className="text-gray-500 animate-spin" />
          ) : (
            <>
              <Upload size={16} className="text-gray-500 mb-1" />
              <span className="text-[10px] text-gray-600">Agregar</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>

        {/* Captura con cámara (mobile) */}
        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-blue-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/5 transition-colors shrink-0">
          <ImageIcon size={16} className="text-blue-500/60 mb-1" />
          <span className="text-[10px] text-blue-500/60">Cámara</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {fotos.length === 0 && !uploading && (
        <p className="text-xs text-gray-600 mt-2">Sin fotos de referencia — subí imágenes del producto de este proveedor.</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={18} className="text-white" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.descripcion ?? "foto"}
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.descripcion && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-300 bg-black/60 px-3 py-1.5 rounded-full">
              {lightbox.descripcion}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Iconos para tipos de archivo (usados por ArchivoUploader interno)
export { FileText, FileSpreadsheet, FileType, Mic, Video, ImageIcon };
