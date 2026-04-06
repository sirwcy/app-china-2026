"use client";

import { useState, useMemo } from "react";
import { Plus, Search, PackageOpen } from "lucide-react";
import ProductoCard from "./ProductoCard";
import ProductoForm from "./ProductoForm";
import SlideOver from "@/components/ui/SlideOver";
import Button from "@/components/ui/Button";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEditar={abrirEdicion}
              etiquetas={etiquetas}
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
