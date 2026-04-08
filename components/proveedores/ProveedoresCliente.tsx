"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Factory, ChevronDown, Building2, LayoutList, FolderOpen, Folder, MapPin } from "lucide-react";
import Link from "next/link";
import ProveedorForm from "./ProveedorForm";
import SlideOver from "@/components/ui/SlideOver";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Categoria {
  id: number;
  nombre: string;
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
  provincia: string | null;
  ciudad: string | null;
  _count: { productos: number };
  productos: {
    producto: {
      categoriaId: number | null;
      categoria: { id: number; nombre: string } | null;
    };
  }[];
}

interface ProveedoresClienteProps {
  proveedores: Proveedor[];
  categorias: Categoria[];
}

type Vista = "alfabetico" | "categoria";

export default function ProveedoresCliente({ proveedores, categorias }: ProveedoresClienteProps) {
  const [busqueda, setBusqueda] = useState("");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);
  const [vista, setVista] = useState<Vista>("alfabetico");
  const [nodosExpandidos, setNodosExpandidos] = useState<Set<string>>(new Set());

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return proveedores;
    const q = busqueda.toLowerCase();
    return proveedores.filter(
      (p) =>
        p.nombreEmpresa.toLowerCase().includes(q) ||
        p.nombreContacto.toLowerCase().includes(q) ||
        p.nroLicencia?.toLowerCase().includes(q) ||
        p.nroWechat?.toLowerCase().includes(q) ||
        p.provincia?.toLowerCase().includes(q) ||
        p.ciudad?.toLowerCase().includes(q)
    );
  }, [proveedores, busqueda]);

  // Árbol por letra inicial (alfabético)
  const arbolAlfabetico = useMemo(() => {
    const porLetra = new Map<string, Proveedor[]>();
    for (const p of filtrados) {
      const letra = p.nombreEmpresa.charAt(0).toUpperCase();
      if (!porLetra.has(letra)) porLetra.set(letra, []);
      porLetra.get(letra)!.push(p);
    }
    return new Map([...porLetra.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filtrados]);

  // Árbol por categoría de producto vinculado
  const arbolCategoria = useMemo(() => {
    const porCategoria = new Map<number | null, { nombre: string; proveedores: Proveedor[] }>();
    const NINGUNA = -1;

    for (const p of filtrados) {
      const cats = new Set<number | null>();
      for (const rel of p.productos) {
        cats.add(rel.producto.categoriaId ?? NINGUNA);
      }
      if (cats.size === 0) cats.add(NINGUNA);

      for (const catId of cats) {
        if (!porCategoria.has(catId)) {
          const nombre =
            catId === NINGUNA
              ? "Sin categoría"
              : categorias.find((c) => c.id === catId)?.nombre ?? "Sin categoría";
          porCategoria.set(catId, { nombre, proveedores: [] });
        }
        const grupo = porCategoria.get(catId)!;
        if (!grupo.proveedores.find((x) => x.id === p.id)) {
          grupo.proveedores.push(p);
        }
      }
    }

    return new Map(
      [...porCategoria.entries()].sort(([, a], [, b]) => a.nombre.localeCompare(b.nombre))
    );
  }, [filtrados, categorias]);

  function toggleNodo(key: string) {
    setNodosExpandidos((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function abrirNuevo() { setProveedorEditar(null); setPanelAbierto(true); }
  function cerrarPanel() { setPanelAbierto(false); setProveedorEditar(null); }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, provincia..."
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

      {/* Toggle vista */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
        <button
          type="button"
          onClick={() => setVista("alfabetico")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            vista === "alfabetico"
              ? "bg-[#DE2910]/20 text-[#DE2910] border border-[#DE2910]/30"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <LayoutList size={13} />
          Alfabético
        </button>
        <button
          type="button"
          onClick={() => setVista("categoria")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            vista === "categoria"
              ? "bg-[#DE2910]/20 text-[#DE2910] border border-[#DE2910]/30"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <FolderOpen size={13} />
          Por categoría
        </button>
      </div>

      {busqueda && (
        <p className="text-xs text-gray-500 mb-3">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
        </p>
      )}

      {filtrados.length === 0 ? (
        <EmptyState busqueda={busqueda} onNuevo={abrirNuevo} />
      ) : vista === "alfabetico" ? (
        // ─── Árbol Alfabético ────────────────────────────────────────────────
        <div className="flex flex-col gap-1">
          {Array.from(arbolAlfabetico.entries()).map(([letra, grupo]) => {
            const key = `letra-${letra}`;
            const expandido = nodosExpandidos.has(key);
            return (
              <div key={key} className="rounded-xl border border-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNodo(key)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#DE2910]/15 border border-[#DE2910]/25 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-[#DE2910]">{letra}</span>
                  </span>
                  <span className="text-sm font-semibold text-white flex-1">Proveedores — {letra}</span>
                  <span className="text-xs text-gray-500">{grupo.length}</span>
                  <ChevronDown size={13} className={cn("text-gray-500 transition-transform", expandido && "rotate-180")} />
                </button>
                {expandido && (
                  <div className="divide-y divide-white/[0.04]">
                    {grupo.map((p) => <ProveedorFila key={p.id} proveedor={p} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // ─── Árbol por Categoría ─────────────────────────────────────────────
        <div className="flex flex-col gap-1">
          {Array.from(arbolCategoria.entries()).map(([catId, { nombre, proveedores: grupo }]) => {
            const key = `cat-${catId}`;
            const expandido = nodosExpandidos.has(key);
            return (
              <div key={key} className="rounded-xl border border-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNodo(key)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
                >
                  {expandido
                    ? <FolderOpen size={14} className="text-[#FFDE00] shrink-0" />
                    : <Folder size={14} className="text-[#FFDE00] shrink-0" />
                  }
                  <span className="text-sm font-semibold text-white flex-1">{nombre}</span>
                  <span className="text-xs text-gray-500">{grupo.length} proveedor{grupo.length !== 1 ? "es" : ""}</span>
                  <ChevronDown size={13} className={cn("text-gray-500 transition-transform", expandido && "rotate-180")} />
                </button>
                {expandido && (
                  <div className="divide-y divide-white/[0.04]">
                    {grupo
                      .slice()
                      .sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa))
                      .map((p) => <ProveedorFila key={p.id} proveedor={p} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

// ─── Fila de proveedor ────────────────────────────────────────────────────────

function ProveedorFila({ proveedor }: { proveedor: Proveedor }) {
  const ubicacion = [proveedor.ciudad?.split(" (")[0], proveedor.provincia?.split(" (")[0]]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/proveedores/${proveedor.id}`}
      className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.04] transition-colors group"
    >
      <Building2 size={13} className="text-gray-600 group-hover:text-[#FFDE00] transition-colors shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors block truncate">
          {proveedor.nombreEmpresa}
        </span>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-600 truncate">{proveedor.nombreContacto}</span>
          {ubicacion && (
            <span className="flex items-center gap-0.5 text-xs text-gray-600 truncate">
              <MapPin size={9} className="shrink-0" />
              {ubicacion}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {proveedor.nroWechat && (
          <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">WeChat</span>
        )}
        <span className="text-[10px] text-gray-600 border border-white/8 rounded px-1.5 py-0.5">
          {proveedor._count.productos} prod.
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ busqueda, onNuevo }: { busqueda: string; onNuevo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <Factory size={48} className="text-gray-700" />
      {busqueda ? (
        <>
          <p className="text-gray-400 font-medium">Sin resultados</p>
          <p className="text-gray-600 text-sm">No hay proveedores que coincidan con &ldquo;{busqueda}&rdquo;</p>
        </>
      ) : (
        <>
          <p className="text-gray-400 font-medium">Aún no hay proveedores</p>
          <p className="text-gray-600 text-sm max-w-xs">Registrá el primer proveedor para luego vincularlo con productos.</p>
          <Button variant="primary" onClick={onNuevo}><Plus size={16} />Crear primer proveedor</Button>
        </>
      )}
    </div>
  );
}
