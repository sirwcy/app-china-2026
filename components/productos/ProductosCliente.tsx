"use client";

import { useState, useMemo } from "react";
import { Plus, Search, PackageOpen, ChevronDown, Pencil, Trash2, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import ProductoForm from "./ProductoForm";
import SlideOver from "@/components/ui/SlideOver";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { eliminarProducto } from "@/lib/actions/productos";
import type { SelectOption } from "@/components/ui/CreatableSelect";

interface SubcategoriaOption extends SelectOption {
  categoriaId: number;
}

interface EtiquetaOption extends SelectOption {
  color: string;
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
  etiquetas: { etiqueta: { id: number; nombre: string; color: string } }[];
  _count: { proveedores: number };
}

interface ProductosClienteProps {
  productos: Producto[];
  categorias: SelectOption[];
  subcategorias: SubcategoriaOption[];
  materiales: SelectOption[];
  etiquetas: EtiquetaOption[];
}

export default function ProductosCliente({
  productos,
  categorias,
  subcategorias,
  materiales,
  etiquetas,
}: ProductosClienteProps) {
  const [busqueda, setBusqueda] = useState("");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const q = busqueda.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombreCorto.toLowerCase().includes(q) ||
        p.nombreLargo.toLowerCase().includes(q) ||
        p.material?.nombre.toLowerCase().includes(q) ||
        p.categoria?.nombre.toLowerCase().includes(q) ||
        p.subcategoria?.nombre.toLowerCase().includes(q) ||
        p.etiquetas.some((e) => e.etiqueta.nombre.toLowerCase().includes(q))
    );
  }, [productos, busqueda]);

  function toggleExpandir(id: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function abrirNuevo() {
    setProductoEditar(null);
    setPanelAbierto(true);
  }

  function abrirEdicion(producto: Producto) {
    setProductoEditar(producto);
    setPanelAbierto(true);
  }

  function cerrarPanel() {
    setPanelAbierto(false);
    setProductoEditar(null);
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
            placeholder="Buscar por nombre, material, categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/50 focus:border-[#DE2910]/50 transition-colors"
          />
        </div>
        <Button variant="primary" size="md" onClick={abrirNuevo} className="shrink-0">
          <Plus size={16} />
          Nuevo producto
        </Button>
      </div>

      {busqueda && (
        <p className="text-xs text-gray-500 mb-4">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
        </p>
      )}

      {filtrados.length > 0 ? (
        <div className="flex flex-col divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden">
          {filtrados.map((producto) => (
            <ProductoFila
              key={producto.id}
              producto={producto}
              expandido={expandidos.has(producto.id)}
              onToggle={() => toggleExpandir(producto.id)}
              onEditar={() => abrirEdicion(producto)}
            />
          ))}
        </div>
      ) : (
        <EmptyState busqueda={busqueda} onNuevo={abrirNuevo} />
      )}

      <SlideOver
        open={panelAbierto}
        onClose={cerrarPanel}
        title={productoEditar ? "Editar producto" : "Nuevo producto"}
      >
        <ProductoForm
          producto={productoEditar ?? undefined}
          categorias={categorias}
          subcategorias={subcategorias}
          materiales={materiales}
          etiquetas={etiquetas}
          onSuccess={cerrarPanel}
          onCancel={cerrarPanel}
        />
      </SlideOver>
    </>
  );
}

// ─── Fila acordeón ───────────────────────────────────────────────────────────

interface ProductoFilaProps {
  producto: {
    id: number;
    nombreLargo: string;
    nombreCorto: string;
    caracteristicas: string | null;
    material: { nombre: string } | null;
    categoria: { nombre: string } | null;
    subcategoria: { nombre: string } | null;
    etiquetas: { etiqueta: { id: number; nombre: string; color: string } }[];
    _count: { proveedores: number };
  };
  expandido: boolean;
  onToggle: () => void;
  onEditar: () => void;
}

function ProductoFila({ producto, expandido, onToggle, onEditar }: ProductoFilaProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEliminar(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
      return;
    }
    setEliminando(true);
    await eliminarProducto(producto.id);
  }

  const nroProveedores = producto._count.proveedores;

  return (
    <div className={cn("bg-white/[0.02] transition-colors", expandido && "bg-white/[0.04]")}>
      {/* Fila principal — clickeable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors group"
      >
        <span className="text-base shrink-0">📦</span>

        {/* Nombre */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white group-hover:text-[#FFDE00] transition-colors truncate block">
            {producto.nombreCorto}
          </span>
        </div>

        {/* Info compacta */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {producto.categoria && (
            <Badge variant="red">{producto.categoria.nombre}</Badge>
          )}
          <Badge variant={nroProveedores > 0 ? "green" : "default"}>
            <Users size={10} className="mr-1" />
            {nroProveedores}
          </Badge>
        </div>

        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-gray-500 transition-transform duration-200",
            expandido && "rotate-180"
          )}
        />
      </button>

      {/* Detalle expandido */}
      {expandido && (
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.06]">
          {/* Nombre largo */}
          <p className="text-xs text-gray-400 mb-3 leading-relaxed pl-7">
            {producto.nombreLargo}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3 pl-7">
            {producto.categoria && (
              <Badge variant="red">{producto.categoria.nombre}</Badge>
            )}
            {producto.subcategoria && (
              <Badge variant="default">{producto.subcategoria.nombre}</Badge>
            )}
            {producto.material && (
              <Badge variant="blue">{producto.material.nombre}</Badge>
            )}
            {producto.etiquetas.map(({ etiqueta }) => (
              <span
                key={etiqueta.id}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-gray-300"
              >
                # {etiqueta.nombre}
              </span>
            ))}
            <Badge variant={nroProveedores > 0 ? "green" : "default"}>
              <Users size={10} className="mr-1" />
              {nroProveedores === 0
                ? "Sin proveedores"
                : `${nroProveedores} proveedor${nroProveedores > 1 ? "es" : ""}`}
            </Badge>
          </div>

          {/* Características */}
          {producto.caracteristicas && (
            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed pl-7 mb-3">
              {producto.caracteristicas}
            </p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 pl-7">
            <Link
              href={`/productos/${producto.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              Ver detalle
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEditar(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Pencil size={12} />
              Editar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              disabled={eliminando}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50",
                confirmando
                  ? "bg-red-900/30 text-red-400 border border-red-700/40"
                  : "hover:bg-white/10 text-gray-500 hover:text-red-400"
              )}
            >
              <Trash2 size={12} />
              {confirmando ? "¿Confirmar?" : "Borrar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ busqueda, onNuevo }: { busqueda: string; onNuevo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <PackageOpen size={48} className="text-gray-700" />
      {busqueda ? (
        <>
          <p className="text-gray-400 font-medium">Sin resultados</p>
          <p className="text-gray-600 text-sm">
            No hay productos que coincidan con &ldquo;{busqueda}&rdquo;
          </p>
        </>
      ) : (
        <>
          <p className="text-gray-400 font-medium">Aún no hay productos</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Empezá registrando el primer producto para luego vincularlo con proveedores.
          </p>
          <Button variant="primary" onClick={onNuevo}>
            <Plus size={16} />
            Crear primer producto
          </Button>
        </>
      )}
    </div>
  );
}
