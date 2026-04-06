"use client";

import { Pencil, Trash2, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { eliminarProducto } from "@/lib/actions/productos";

interface EtiquetaOption {
  id: number;
  nombre: string;
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

interface ProductoCardProps {
  producto: Producto;
  onEditar: (producto: Producto) => void;
  etiquetas: EtiquetaOption[];
}

export default function ProductoCard({ producto, onEditar, etiquetas: _etiquetas }: ProductoCardProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEliminar() {
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
    <article className="group flex flex-col gap-3 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/16 hover:bg-white/6 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug truncate">
            {producto.nombreCorto}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {producto.nombreLargo}
          </p>
        </div>
        <span className="text-xl shrink-0">📦</span>
      </div>

      {/* Badges de clasificación */}
      <div className="flex flex-wrap gap-1.5">
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
          <Users size={11} className="mr-1" />
          {nroProveedores === 0
            ? "Sin proveedores"
            : `${nroProveedores} proveedor${nroProveedores > 1 ? "es" : ""}`}
        </Badge>
      </div>

      {/* Características (preview) */}
      {producto.caracteristicas && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed border-t border-white/6 pt-2">
          {producto.caracteristicas}
        </p>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/6">
        <Link
          href={`/productos/${producto.id}`}
          className="inline-flex items-center justify-center gap-1.5 flex-1 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ExternalLink size={13} />
          Ver detalle
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="justify-center"
          onClick={() => onEditar(producto)}
        >
          <Pencil size={13} />
        </Button>
        <Button
          variant={confirmando ? "danger" : "ghost"}
          size="sm"
          className="justify-center"
          onClick={handleEliminar}
          loading={eliminando}
        >
          <Trash2 size={13} />
          {confirmando ? "¿Confirmar?" : ""}
        </Button>
      </div>
    </article>
  );
}
