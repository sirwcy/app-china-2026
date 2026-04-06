"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Package, Factory, MapPin, Users, Tag } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Tipo = "productos" | "proveedores";

interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
}

interface Producto {
  id: number;
  nombreCorto: string;
  nombreLargo: string;
  caracteristicas: string | null;
  material: { nombre: string } | null;
  categoria: { nombre: string } | null;
  subcategoria: { nombre: string } | null;
  etiquetas: { etiqueta: Etiqueta }[];
  _count: { proveedores: number };
}

interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  nroWechat: string | null;
  nroWhatsapp: string | null;
  direccion: string | null;
  _count: { productos: number };
}

export default function BuscarCliente() {
  const [tipo, setTipo] = useState<Tipo>("productos");
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Producto[] | Proveedor[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResultados([]);
      setBuscado(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(query)}&tipo=${tipo}`);
        const data = await res.json();
        setResultados(data);
        setBuscado(true);
      } finally {
        setBuscando(false);
      }
    }, 350);
  }, [query, tipo]);

  // Al cambiar tipo, resetear resultados
  function cambiarTipo(t: Tipo) {
    setTipo(t);
    setResultados([]);
    setBuscado(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle tipo */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/8 w-fit">
        {(["productos", "proveedores"] as Tipo[]).map((t) => (
          <button
            key={t}
            onClick={() => cambiarTipo(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tipo === t
                ? "bg-[#DE2910] text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {t === "productos" ? <Package size={14} /> : <Factory size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          size={16}
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
            buscando ? "text-[#DE2910] animate-pulse" : "text-gray-500"
          )}
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tipo === "productos"
              ? "Nombre, categoría, etiqueta, material, proveedor..."
              : "Empresa, contacto, WeChat, WhatsApp, dirección..."
          }
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/50 focus:border-[#DE2910]/50 transition-colors"
        />
      </div>

      {/* Resultados */}
      {query.trim().length >= 2 && (
        <div className="flex flex-col gap-2">
          {buscado && (
            <p className="text-xs text-gray-500">
              {resultados.length === 0
                ? `Sin resultados para "${query}"`
                : `${resultados.length} resultado${resultados.length > 1 ? "s" : ""} para "${query}"`}
            </p>
          )}

          {tipo === "productos"
            ? (resultados as Producto[]).map((p) => (
                <ResultadoProducto key={p.id} producto={p} query={query} />
              ))
            : (resultados as Proveedor[]).map((p) => (
                <ResultadoProveedor key={p.id} proveedor={p} query={query} />
              ))}
        </div>
      )}

      {query.trim().length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search size={40} className="text-gray-700" />
          <p className="text-gray-500 text-sm">Escribí al menos 2 caracteres para buscar</p>
        </div>
      )}
    </div>
  );
}

function ResultadoProducto({ producto, query }: { producto: Producto; query: string }) {
  return (
    <Link
      href={`/productos/${producto.id}`}
      className="flex flex-col gap-2 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-[#DE2910]/40 hover:bg-white/6 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-sm">
            <Highlight text={producto.nombreCorto} query={query} />
          </p>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
            <Highlight text={producto.nombreLargo} query={query} />
          </p>
        </div>
        <Package size={16} className="text-gray-600 shrink-0 mt-0.5" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {producto.categoria && <Badge variant="red">{producto.categoria.nombre}</Badge>}
        {producto.subcategoria && <Badge variant="default">{producto.subcategoria.nombre}</Badge>}
        {producto.material && <Badge variant="blue">{producto.material.nombre}</Badge>}
        {producto.etiquetas.map(({ etiqueta }) => (
          <span key={etiqueta.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-gray-300">
            <Tag size={9} />
            {etiqueta.nombre}
          </span>
        ))}
        <Badge variant={producto._count.proveedores > 0 ? "green" : "default"}>
          <Users size={10} className="mr-1" />
          {producto._count.proveedores} proveedor{producto._count.proveedores !== 1 ? "es" : ""}
        </Badge>
      </div>
    </Link>
  );
}

function ResultadoProveedor({ proveedor, query }: { proveedor: Proveedor; query: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-[#DE2910]/40 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-sm">
            <Highlight text={proveedor.nombreEmpresa} query={query} />
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            <Highlight text={proveedor.nombreContacto} query={query} />
          </p>
        </div>
        <Factory size={16} className="text-gray-600 shrink-0 mt-0.5" />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {proveedor.nroWechat && <span>WeChat: {proveedor.nroWechat}</span>}
        {proveedor.nroWhatsapp && <span>WA: {proveedor.nroWhatsapp}</span>}
        {proveedor.direccion && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            <Highlight text={proveedor.direccion} query={query} />
          </span>
        )}
        <Badge variant={proveedor._count.productos > 0 ? "green" : "default"}>
          <Package size={10} className="mr-1" />
          {proveedor._count.productos} producto{proveedor._count.productos !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#FFDE00]/30 text-white rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
