"use client";

import { useState, useMemo } from "react";
import { Plus, Search, PackageOpen, ChevronDown, ChevronRight, Pencil, Trash2, ExternalLink, Users, FolderOpen, Folder, LayoutList, Building2 } from "lucide-react";
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
  categoria: { id: number; nombre: string } | null;
  subcategoria: { id: number; nombre: string } | null;
  etiquetas: { etiqueta: { id: number; nombre: string; color: string } }[];
  proveedores: { proveedor: { id: number; nombreEmpresa: string } }[];
  _count: { proveedores: number };
}

interface ProductosClienteProps {
  productos: Producto[];
  categorias: SelectOption[];
  subcategorias: SubcategoriaOption[];
  materiales: SelectOption[];
  etiquetas: EtiquetaOption[];
}

type Vista = "producto" | "proveedor";

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
  const [productosExpandidos, setProductosExpandidos] = useState<Set<number>>(new Set());
  const [nodosExpandidos, setNodosExpandidos] = useState<Set<string>>(new Set());
  const [vista, setVista] = useState<Vista>("producto");

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
        p.etiquetas.some((e) => e.etiqueta.nombre.toLowerCase().includes(q)) ||
        p.proveedores.some((pp) => pp.proveedor.nombreEmpresa.toLowerCase().includes(q))
    );
  }, [productos, busqueda]);

  // ─── Árbol por Producto ────────────────────────────────────────────────────
  const arbolProducto = useMemo(() => {
    type SubGroup = { subcategoria: { id: number; nombre: string } | null; productos: Producto[] };
    type CatGroup = { categoria: { id: number; nombre: string }; subgrupos: Map<number | null, SubGroup> };

    const porCategoria = new Map<number | null, CatGroup | Producto[]>();
    const sinCategoria: Producto[] = [];

    for (const p of filtrados) {
      if (!p.categoriaId) {
        sinCategoria.push(p);
        continue;
      }
      if (!porCategoria.has(p.categoriaId)) {
        porCategoria.set(p.categoriaId, {
          categoria: { id: p.categoriaId, nombre: p.categoria!.nombre },
          subgrupos: new Map(),
        });
      }
      const cg = porCategoria.get(p.categoriaId) as CatGroup;
      const subId = p.subcategoriaId ?? null;
      if (!cg.subgrupos.has(subId)) {
        cg.subgrupos.set(subId, {
          subcategoria: p.subcategoria ? { id: p.subcategoria.id, nombre: p.subcategoria.nombre } : null,
          productos: [],
        });
      }
      cg.subgrupos.get(subId)!.productos.push(p);
    }

    return { porCategoria: porCategoria as Map<number, CatGroup>, sinCategoria };
  }, [filtrados]);

  // ─── Árbol por Proveedor ───────────────────────────────────────────────────
  const arbolProveedor = useMemo(() => {
    const porProveedor = new Map<number, { proveedor: { id: number; nombreEmpresa: string }; productos: Producto[] }>();
    const sinProveedor: Producto[] = [];

    for (const p of filtrados) {
      if (p.proveedores.length === 0) {
        sinProveedor.push(p);
      } else {
        for (const pp of p.proveedores) {
          const provId = pp.proveedor.id;
          if (!porProveedor.has(provId)) {
            porProveedor.set(provId, { proveedor: pp.proveedor, productos: [] });
          }
          porProveedor.get(provId)!.productos.push(p);
        }
      }
    }
    return { porProveedor, sinProveedor };
  }, [filtrados]);

  function toggleProducto(id: number) {
    setProductosExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleNodo(key: string) {
    setNodosExpandidos((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function abrirNuevo() { setProductoEditar(null); setPanelAbierto(true); }
  function abrirEdicion(p: Producto) { setProductoEditar(p); setPanelAbierto(true); }
  function cerrarPanel() { setPanelAbierto(false); setProductoEditar(null); }

  const hayResultados = filtrados.length > 0;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, proveedor..."
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

      {/* Toggle de vista */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
        <button
          type="button"
          onClick={() => setVista("producto")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            vista === "producto"
              ? "bg-[#DE2910]/20 text-[#DE2910] border border-[#DE2910]/30"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <LayoutList size={13} />
          Por producto
        </button>
        <button
          type="button"
          onClick={() => setVista("proveedor")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            vista === "proveedor"
              ? "bg-[#DE2910]/20 text-[#DE2910] border border-[#DE2910]/30"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <Building2 size={13} />
          Por proveedor
        </button>
      </div>

      {busqueda && (
        <p className="text-xs text-gray-500 mb-3">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
        </p>
      )}

      {!hayResultados ? (
        <EmptyState busqueda={busqueda} onNuevo={abrirNuevo} />
      ) : vista === "producto" ? (
        // ─── Vista por Producto (árbol Categoría > Subcategoría > Producto) ──
        <div className="flex flex-col gap-1">
          {Array.from(arbolProducto.porCategoria.values())
            .sort((a, b) => a.categoria.nombre.localeCompare(b.categoria.nombre))
            .map((cg) => {
              const catKey = `cat-${cg.categoria.id}`;
              const catExpandida = nodosExpandidos.has(catKey);
              const totalCat = Array.from(cg.subgrupos.values()).reduce((s, sg) => s + sg.productos.length, 0);

              return (
                <div key={catKey} className="rounded-xl border border-white/[0.08] overflow-hidden">
                  {/* Header Categoría */}
                  <button
                    type="button"
                    onClick={() => toggleNodo(catKey)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                  >
                    {catExpandida
                      ? <FolderOpen size={14} className="text-[#DE2910] shrink-0" />
                      : <Folder size={14} className="text-[#DE2910] shrink-0" />
                    }
                    <span className="text-sm font-semibold text-white flex-1">{cg.categoria.nombre}</span>
                    <span className="text-xs text-gray-500">{totalCat} producto{totalCat !== 1 ? "s" : ""}</span>
                    <ChevronDown size={13} className={cn("text-gray-500 transition-transform", catExpandida && "rotate-180")} />
                  </button>

                  {catExpandida && (
                    <div className="divide-y divide-white/[0.04]">
                      {Array.from(cg.subgrupos.values())
                        .sort((a, b) => (a.subcategoria?.nombre ?? "").localeCompare(b.subcategoria?.nombre ?? ""))
                        .map((sg) => {
                          const subKey = sg.subcategoria
                            ? `sub-${sg.subcategoria.id}`
                            : `cat-${cg.categoria.id}-noSub`;
                          const subExpandida = nodosExpandidos.has(subKey);

                          return (
                            <div key={subKey}>
                              {/* Header Subcategoría */}
                              {sg.subcategoria && (
                                <button
                                  type="button"
                                  onClick={() => toggleNodo(subKey)}
                                  className="w-full flex items-center gap-2 px-5 py-2 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04]"
                                >
                                  <ChevronRight size={12} className={cn("text-gray-600 shrink-0 transition-transform", subExpandida && "rotate-90")} />
                                  <span className="text-xs font-medium text-gray-400 flex-1">{sg.subcategoria.nombre}</span>
                                  <span className="text-[10px] text-gray-600">{sg.productos.length}</span>
                                </button>
                              )}

                              {/* Productos (directos si no hay subcategoría, o bajo subcategoría) */}
                              {(!sg.subcategoria || subExpandida) && (
                                <div className="divide-y divide-white/[0.04]">
                                  {sg.productos.map((p) => (
                                    <ProductoFila
                                      key={p.id}
                                      producto={p}
                                      expandido={productosExpandidos.has(p.id)}
                                      onToggle={() => toggleProducto(p.id)}
                                      onEditar={() => abrirEdicion(p)}
                                      indent={sg.subcategoria ? "doble" : "simple"}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Sin categoría */}
          {arbolProducto.sinCategoria.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleNodo("sin-categoria")}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
              >
                <Folder size={14} className="text-gray-600 shrink-0" />
                <span className="text-sm font-semibold text-gray-400 flex-1">Sin categoría</span>
                <span className="text-xs text-gray-600">{arbolProducto.sinCategoria.length}</span>
                <ChevronDown size={13} className={cn("text-gray-600 transition-transform", nodosExpandidos.has("sin-categoria") && "rotate-180")} />
              </button>
              {nodosExpandidos.has("sin-categoria") && (
                <div className="divide-y divide-white/[0.04]">
                  {arbolProducto.sinCategoria.map((p) => (
                    <ProductoFila
                      key={p.id}
                      producto={p}
                      expandido={productosExpandidos.has(p.id)}
                      onToggle={() => toggleProducto(p.id)}
                      onEditar={() => abrirEdicion(p)}
                      indent="simple"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // ─── Vista por Proveedor ────────────────────────────────────────────
        <div className="flex flex-col gap-1">
          {Array.from(arbolProveedor.porProveedor.values())
            .sort((a, b) => a.proveedor.nombreEmpresa.localeCompare(b.proveedor.nombreEmpresa))
            .map(({ proveedor, productos: prods }) => {
              const provKey = `prov-${proveedor.id}`;
              const provExpandido = nodosExpandidos.has(provKey);

              return (
                <div key={provKey} className="rounded-xl border border-white/[0.08] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleNodo(provKey)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                  >
                    <Building2 size={14} className="text-[#FFDE00] shrink-0" />
                    <span className="text-sm font-semibold text-white flex-1">{proveedor.nombreEmpresa}</span>
                    <span className="text-xs text-gray-500">{prods.length} producto{prods.length !== 1 ? "s" : ""}</span>
                    <ChevronDown size={13} className={cn("text-gray-500 transition-transform", provExpandido && "rotate-180")} />
                  </button>
                  {provExpandido && (
                    <div className="divide-y divide-white/[0.04]">
                      {prods.map((p) => (
                        <ProductoFila
                          key={p.id}
                          producto={p}
                          expandido={productosExpandidos.has(p.id)}
                          onToggle={() => toggleProducto(p.id)}
                          onEditar={() => abrirEdicion(p)}
                          indent="simple"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {arbolProveedor.sinProveedor.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleNodo("sin-proveedor")}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
              >
                <Building2 size={14} className="text-gray-600 shrink-0" />
                <span className="text-sm font-semibold text-gray-400 flex-1">Sin proveedor</span>
                <span className="text-xs text-gray-600">{arbolProveedor.sinProveedor.length}</span>
                <ChevronDown size={13} className={cn("text-gray-600 transition-transform", nodosExpandidos.has("sin-proveedor") && "rotate-180")} />
              </button>
              {nodosExpandidos.has("sin-proveedor") && (
                <div className="divide-y divide-white/[0.04]">
                  {arbolProveedor.sinProveedor.map((p) => (
                    <ProductoFila
                      key={p.id}
                      producto={p}
                      expandido={productosExpandidos.has(p.id)}
                      onToggle={() => toggleProducto(p.id)}
                      onEditar={() => abrirEdicion(p)}
                      indent="simple"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <SlideOver
        open={panelAbierto}
        onClose={cerrarPanel}
        title={productoEditar ? "Editar producto" : "Nuevo producto"}
      >
        <ProductoForm
          key={productoEditar?.id ?? "nuevo"}
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

// ─── Fila de producto ─────────────────────────────────────────────────────────

interface ProductoFilaProps {
  producto: Producto;
  expandido: boolean;
  onToggle: () => void;
  onEditar: () => void;
  indent?: "simple" | "doble";
}

function ProductoFila({ producto, expandido, onToggle, onEditar, indent = "simple" }: ProductoFilaProps) {
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

  const nombresProveedores = producto.proveedores.map((pp) => pp.proveedor.nombreEmpresa);
  const pl = indent === "doble" ? "pl-10" : "pl-6";

  return (
    <div className={cn("bg-white/[0.01] transition-colors", expandido && "bg-white/[0.03]")}>
      <button
        type="button"
        onClick={onToggle}
        className={cn("w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors group", pl)}
      >
        <span className="text-sm shrink-0">📦</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-200 group-hover:text-white transition-colors truncate block">
            {producto.nombreCorto}
            {nombresProveedores.length > 0 && (
              <span className="text-gray-500 font-normal">
                {" "}—{" "}
                <span className="text-gray-400">{nombresProveedores.join(", ")}</span>
              </span>
            )}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={cn("shrink-0 text-gray-600 transition-transform duration-200", expandido && "rotate-180")}
        />
      </button>

      {expandido && (
        <div className={cn("px-4 pb-3 pt-1 border-t border-white/[0.04]", pl)}>
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{producto.nombreLargo}</p>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {producto.categoria && <Badge variant="red">{producto.categoria.nombre}</Badge>}
            {producto.subcategoria && <Badge variant="default">{producto.subcategoria.nombre}</Badge>}
            {producto.material && <Badge variant="blue">{producto.material.nombre}</Badge>}
            {producto.etiquetas.map(({ etiqueta }) => (
              <span
                key={etiqueta.id}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-gray-300"
              >
                # {etiqueta.nombre}
              </span>
            ))}
            <Badge variant={produto_proveedores(producto) > 0 ? "green" : "default"}>
              <Users size={10} className="mr-1" />
              {produto_proveedores(producto) === 0
                ? "Sin proveedores"
                : `${produto_proveedores(producto)} proveedor${produto_proveedores(producto) > 1 ? "es" : ""}`}
            </Badge>
          </div>

          {producto.caracteristicas && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
              {producto.caracteristicas}
            </p>
          )}

          <div className="flex items-center gap-1.5">
            <Link
              href={`/productos/${producto.id}`}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={11} />
              Ver
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEditar(); }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
            >
              <Pencil size={11} />
              Editar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              disabled={eliminando}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors disabled:opacity-50",
                confirmando
                  ? "bg-red-900/30 text-red-400 border border-red-700/40"
                  : "hover:bg-white/10 text-gray-600 hover:text-red-400"
              )}
            >
              <Trash2 size={11} />
              {confirmando ? "¿Confirmar?" : "Borrar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function produto_proveedores(p: Producto) { return p._count.proveedores; }

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
