"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, DollarSign, Package2, StickyNote } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import RelacionForm from "@/components/relaciones/RelacionForm";
import ProductoForm from "@/components/productos/ProductoForm";
import { desvincularProveedor } from "@/lib/actions/relaciones";
import type { SelectOption } from "@/components/ui/CreatableSelect";

interface SubcategoriaOption extends SelectOption {
  categoriaId: number;
}

interface Relacion {
  id: number;
  proveedorId: number;
  precio: number | null;
  moneda: string;
  moq: number | null;
  notas: string | null;
  caracteristicas: string | null;
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
}

export default function ProductoDetalleCliente({
  producto,
  relaciones,
  todosLosProveedores,
  categorias,
  subcategorias,
  materiales,
  etiquetas,
}: ProductoDetalleClienteProps) {
  const [panelRelacion, setPanelRelacion] = useState(false);
  const [panelEditar, setPanelEditar] = useState(false);
  const [relacionEditar, setRelacionEditar] = useState<Relacion | null>(null);

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
        <div className="mb-6 p-4 rounded-xl bg-white/4 border border-white/8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Características</p>
          <p className="text-sm text-gray-300 leading-relaxed">{producto.caracteristicas}</p>
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

      {/* Panel: vincular / editar relación */}
      <SlideOver
        open={panelRelacion}
        onClose={cerrarPanelRelacion}
        title={relacionEditar ? "Editar relación con proveedor" : "Vincular proveedor"}
      >
        <RelacionForm
          productoId={producto.id}
          proveedores={todosLosProveedores}
          proveedoresVinculadosIds={proveedoresVinculadosIds}
          relacion={relacionEditar ?? undefined}
          onSuccess={cerrarPanelRelacion}
          onCancel={cerrarPanelRelacion}
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
    </>
  );
}

// --- Subcomponente tarjeta de relación ---

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

  return (
    <article className="p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/12 transition-all">
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

          {/* Precio + MOQ */}
          <div className="flex flex-wrap gap-3 mt-2">
            {relacion.precio != null ? (
              <div className="flex items-center gap-1 text-sm">
                <DollarSign size={13} className="text-[#FFDE00]" />
                <span className="font-semibold text-[#FFDE00]">
                  {monedaSymbol}{relacion.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-500 text-xs">{relacion.moneda}</span>
              </div>
            ) : (
              <span className="text-gray-600 text-xs italic">Sin precio registrado</span>
            )}

            {relacion.moq != null && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Package2 size={12} />
                <span>MOQ: <strong className="text-gray-200">{relacion.moq.toLocaleString()}</strong> uds.</span>
              </div>
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
    </article>
  );
}
