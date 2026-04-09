"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package, Factory, ChevronRight, X, Award, TrendingDown,
  Hash, Users, DollarSign, ShoppingCart,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PrecioData {
  id: number;
  moq: number;
  precio: number;
}

interface RelacionData {
  id: number;
  productoId: number;
  proveedorId: number;
  moneda: string;
  notas: string | null;
  caracteristicas: string | null;
  proveedor: {
    id: number;
    nombreEmpresa: string;
    nombreContacto: string;
    nroWechat: string | null;
    nroWhatsapp: string | null;
  };
  producto: {
    id: number;
    nombreCorto: string;
    nombreLargo: string;
    categoria: { nombre: string } | null;
    subcategoria: { nombre: string } | null;
    material: { nombre: string } | null;
  };
  precios: PrecioData[];
}

interface ProductoAgrupado {
  producto: RelacionData["producto"];
  relaciones: RelacionData[];
}

interface ProveedorAgrupado {
  proveedor: RelacionData["proveedor"];
  relaciones: RelacionData[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function precioMinimo(rel: RelacionData): number | null {
  if (!rel.precios.length) return null;
  return Math.min(...rel.precios.map((p) => p.precio));
}

function moqDePrecioMinimo(rel: RelacionData): number | null {
  if (!rel.precios.length) return null;
  const min = precioMinimo(rel)!;
  return rel.precios.find((p) => p.precio === min)?.moq ?? null;
}

function mejorRelacion(relaciones: RelacionData[]): RelacionData | null {
  const conPrecios = relaciones.filter((r) => r.precios.length > 0);
  if (!conPrecios.length) return null;
  return conPrecios.reduce((mejor, rel) => {
    const pm = precioMinimo(rel)!;
    const bm = precioMinimo(mejor)!;
    return pm < bm ? rel : mejor;
  });
}

function fmtPrecio(valor: number, moneda: string) {
  return `${moneda} ${valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = "gray" }: {
  label: string;
  value: number;
  icon?: React.ElementType;
  color?: "gray" | "red" | "gold" | "green";
}) {
  const colorMap = {
    gray:  "text-gray-400 bg-white/5",
    red:   "text-[#DE2910] bg-[#DE2910]/10",
    gold:  "text-[#FFDE00] bg-[#FFDE00]/10",
    green: "text-emerald-400 bg-emerald-400/10",
  };
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon size={15} />
        </div>
      )}
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Tabla Por Producto ──────────────────────────────────────────────────────

function TablaProductos({ datos, onSelect }: {
  datos: ProductoAgrupado[];
  onSelect: (id: number) => void;
}) {
  if (!datos.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p>No hay productos con proveedores aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/3">
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">#</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Producto</th>
            <th className="text-center px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Proveedores</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Mejor precio</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Proveedor líder</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium whitespace-nowrap">MOQ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {datos.map(({ producto, relaciones }, i) => {
            const mejor = mejorRelacion(relaciones);
            const mp = mejor ? precioMinimo(mejor) : null;
            const moq = mejor ? moqDePrecioMinimo(mejor) : null;
            const sinPrecios = relaciones.every((r) => r.precios.length === 0);

            return (
              <tr
                key={producto.id}
                className="border-b border-white/5 hover:bg-white/4 transition-colors cursor-pointer"
                onClick={() => onSelect(producto.id)}
              >
                <td className="px-4 py-3 text-gray-600">{i + 1}</td>

                {/* Producto */}
                <td className="px-4 py-3">
                  <p className="text-gray-100 font-medium">{producto.nombreCorto}</p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[200px]">
                    {[producto.categoria?.nombre, producto.subcategoria?.nombre].filter(Boolean).join(" › ")}
                  </p>
                </td>

                {/* # Proveedores */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/8 text-gray-300 text-xs font-medium">
                    {relaciones.length}
                  </span>
                </td>

                {/* Mejor precio */}
                <td className="px-4 py-3 text-right">
                  {mp !== null && mejor ? (
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      {fmtPrecio(mp, mejor.moneda)}
                    </span>
                  ) : (
                    <span className="text-gray-700 italic text-xs">sin precios</span>
                  )}
                </td>

                {/* Proveedor líder */}
                <td className="px-4 py-3">
                  {mejor ? (
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-[#FFDE00] shrink-0" />
                      <span className="text-gray-300 truncate max-w-[160px]">
                        {mejor.proveedor.nombreEmpresa}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-700 text-xs italic">—</span>
                  )}
                </td>

                {/* MOQ */}
                <td className="px-4 py-3 text-right">
                  {moq !== null ? (
                    <span className="text-gray-400 tabular-nums">{moq.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>

                {/* Acción */}
                <td className="px-4 py-3">
                  <ChevronRight size={15} className="text-gray-600 ml-auto" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tabla Por Proveedor ─────────────────────────────────────────────────────

function TablaProveedores({ datos, onSelect }: {
  datos: ProveedorAgrupado[];
  onSelect: (id: number) => void;
}) {
  if (!datos.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Factory size={40} className="mx-auto mb-3 opacity-30" />
        <p>No hay proveedores vinculados aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/3">
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">#</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Proveedor</th>
            <th className="text-center px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Productos</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Precio más bajo</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Producto</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium whitespace-nowrap">MOQ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {datos.map(({ proveedor, relaciones }, i) => {
            const mejor = mejorRelacion(relaciones);
            const mp = mejor ? precioMinimo(mejor) : null;
            const moq = mejor ? moqDePrecioMinimo(mejor) : null;

            return (
              <tr
                key={proveedor.id}
                className="border-b border-white/5 hover:bg-white/4 transition-colors cursor-pointer"
                onClick={() => onSelect(proveedor.id)}
              >
                <td className="px-4 py-3 text-gray-600">{i + 1}</td>

                {/* Proveedor */}
                <td className="px-4 py-3">
                  <p className="text-gray-100 font-medium">{proveedor.nombreEmpresa}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{proveedor.nombreContacto}</p>
                </td>

                {/* # Productos */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/8 text-gray-300 text-xs font-medium">
                    {relaciones.length}
                  </span>
                </td>

                {/* Precio más bajo */}
                <td className="px-4 py-3 text-right">
                  {mp !== null && mejor ? (
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      {fmtPrecio(mp, mejor.moneda)}
                    </span>
                  ) : (
                    <span className="text-gray-700 italic text-xs">sin precios</span>
                  )}
                </td>

                {/* Producto con mejor precio */}
                <td className="px-4 py-3">
                  {mejor ? (
                    <span className="text-gray-400 truncate max-w-[160px] block">
                      {mejor.producto.nombreCorto}
                    </span>
                  ) : (
                    <span className="text-gray-700 text-xs italic">—</span>
                  )}
                </td>

                {/* MOQ */}
                <td className="px-4 py-3 text-right">
                  {moq !== null ? (
                    <span className="text-gray-400 tabular-nums">{moq.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>

                {/* Acción */}
                <td className="px-4 py-3">
                  <ChevronRight size={15} className="text-gray-600 ml-auto" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Detalle Producto (slide-over) ───────────────────────────────────────────

function DetalleProducto({ data, onClose }: {
  data: ProductoAgrupado;
  onClose: () => void;
}) {
  const { producto, relaciones } = data;
  const mejorRel = mejorRelacion(relaciones);
  const mpGlobal = mejorRel ? precioMinimo(mejorRel) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-[#111] border-l border-white/10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-white/8 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#DE2910] shrink-0" />
              <h2 className="text-base font-semibold text-white truncate">{producto.nombreCorto}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">{producto.nombreLargo}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {producto.categoria && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-gray-400">
                  {producto.categoria.nombre}
                </span>
              )}
              {producto.subcategoria && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-gray-400">
                  {producto.subcategoria.nombre}
                </span>
              )}
              {producto.material && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                  {producto.material.nombre}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/productos/${producto.id}`}
              className="text-xs text-[#DE2910] hover:underline"
              onClick={onClose}
            >
              Ver producto →
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mejor precio resumen */}
        {mpGlobal !== null && mejorRel && (
          <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <TrendingDown size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-emerald-400/70">Mejor precio disponible</p>
              <p className="text-lg font-bold text-emerald-400">
                {fmtPrecio(mpGlobal, mejorRel.moneda)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500">Proveedor</p>
              <p className="text-sm text-white font-medium">{mejorRel.proveedor.nombreEmpresa}</p>
            </div>
          </div>
        )}

        {/* Proveedores */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <p className="text-xs text-gray-600 uppercase tracking-wider">
            {relaciones.length} proveedor{relaciones.length !== 1 ? "es" : ""} vinculado{relaciones.length !== 1 ? "s" : ""}
          </p>

          {relaciones.map((rel) => {
            const mp = precioMinimo(rel);
            const esMejor = mejorRel?.id === rel.id;

            return (
              <div
                key={rel.id}
                className={`rounded-xl border p-4 flex flex-col gap-3 ${
                  esMejor
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/8 bg-white/3"
                }`}
              >
                {/* Header proveedor */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {esMejor && (
                      <Award size={14} className="text-[#FFDE00] shrink-0" />
                    )}
                    <Link
                      href={`/proveedores/${rel.proveedor.id}`}
                      className="text-sm font-semibold text-gray-100 hover:text-white hover:underline"
                      onClick={onClose}
                    >
                      {rel.proveedor.nombreEmpresa}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {esMejor && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Mejor precio
                      </span>
                    )}
                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                      {rel.moneda}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{rel.proveedor.nombreContacto}</p>

                {/* Tabla de precios */}
                {rel.precios.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border border-white/8">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">MOQ</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-medium">Precio unit.</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-medium">Total (MOQ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rel.precios.map((p) => {
                          const esMejorTier = mp !== null && p.precio === mp;
                          return (
                            <tr
                              key={p.id}
                              className={`border-t border-white/5 ${esMejorTier ? "bg-emerald-500/8" : ""}`}
                            >
                              <td className="px-3 py-2 text-gray-400 tabular-nums">
                                {p.moq.toLocaleString()} u.
                              </td>
                              <td className={`px-3 py-2 text-right font-semibold tabular-nums ${esMejorTier ? "text-emerald-400" : "text-gray-200"}`}>
                                {fmtPrecio(p.precio, rel.moneda)}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-500 tabular-nums">
                                {fmtPrecio(p.precio * p.moq, rel.moneda)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 italic">Sin precios cargados</p>
                )}

                {/* Notas y características */}
                {(rel.notas || rel.caracteristicas) && (
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-white/8">
                    {rel.caracteristicas && (
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-600">Características: </span>
                        {rel.caracteristicas}
                      </p>
                    )}
                    {rel.notas && (
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-700">Notas: </span>
                        {rel.notas}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {relaciones.length === 0 && (
            <p className="text-sm text-gray-600 italic text-center py-8">
              Sin proveedores vinculados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detalle Proveedor (slide-over) ──────────────────────────────────────────

function DetalleProveedor({ data, onClose }: {
  data: ProveedorAgrupado;
  onClose: () => void;
}) {
  const { proveedor, relaciones } = data;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-[#111] border-l border-white/10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-white/8 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Factory size={16} className="text-[#DE2910] shrink-0" />
              <h2 className="text-base font-semibold text-white truncate">{proveedor.nombreEmpresa}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">{proveedor.nombreContacto}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {proveedor.nroWechat && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                  WeChat: {proveedor.nroWechat}
                </span>
              )}
              {proveedor.nroWhatsapp && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  WA: {proveedor.nroWhatsapp}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/proveedores/${proveedor.id}`}
              className="text-xs text-[#DE2910] hover:underline"
              onClick={onClose}
            >
              Ver proveedor →
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <p className="text-xs text-gray-600 uppercase tracking-wider">
            {relaciones.length} producto{relaciones.length !== 1 ? "s" : ""} vinculado{relaciones.length !== 1 ? "s" : ""}
          </p>

          {relaciones.map((rel) => {
            const mp = precioMinimo(rel);

            return (
              <div key={rel.id} className="rounded-xl border border-white/8 bg-white/3 p-4 flex flex-col gap-3">
                {/* Header producto */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/productos/${rel.producto.id}`}
                    className="text-sm font-semibold text-gray-100 hover:text-white hover:underline"
                    onClick={onClose}
                  >
                    {rel.producto.nombreCorto}
                  </Link>
                  <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                    {rel.moneda}
                  </span>
                </div>

                {rel.producto.categoria && (
                  <p className="text-xs text-gray-600">
                    {[rel.producto.categoria.nombre, rel.producto.subcategoria?.nombre].filter(Boolean).join(" › ")}
                  </p>
                )}

                {/* Precios */}
                {rel.precios.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border border-white/8">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">MOQ</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-medium">Precio unit.</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-medium">Total (MOQ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rel.precios.map((p) => {
                          const esMejorTier = mp !== null && p.precio === mp;
                          return (
                            <tr
                              key={p.id}
                              className={`border-t border-white/5 ${esMejorTier ? "bg-emerald-500/8" : ""}`}
                            >
                              <td className="px-3 py-2 text-gray-400 tabular-nums">
                                {p.moq.toLocaleString()} u.
                              </td>
                              <td className={`px-3 py-2 text-right font-semibold tabular-nums ${esMejorTier ? "text-emerald-400" : "text-gray-200"}`}>
                                {fmtPrecio(p.precio, rel.moneda)}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-500 tabular-nums">
                                {fmtPrecio(p.precio * p.moq, rel.moneda)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 italic">Sin precios cargados</p>
                )}

                {(rel.notas || rel.caracteristicas) && (
                  <div className="flex flex-col gap-1 pt-1 border-t border-white/8">
                    {rel.caracteristicas && (
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-600">Características: </span>
                        {rel.caracteristicas}
                      </p>
                    )}
                    {rel.notas && (
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-700">Notas: </span>
                        {rel.notas}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AnalisisCliente({ relaciones }: { relaciones: RelacionData[] }) {
  const [vista, setVista] = useState<"producto" | "proveedor">("producto");
  const [detalleProductoId, setDetalleProductoId] = useState<number | null>(null);
  const [detalleProveedorId, setDetalleProveedorId] = useState<number | null>(null);

  const porProducto = useMemo<ProductoAgrupado[]>(() => {
    const map = new Map<number, ProductoAgrupado>();
    for (const rel of relaciones) {
      if (!map.has(rel.productoId)) {
        map.set(rel.productoId, { producto: rel.producto, relaciones: [] });
      }
      map.get(rel.productoId)!.relaciones.push(rel);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.producto.nombreCorto.localeCompare(b.producto.nombreCorto)
    );
  }, [relaciones]);

  const porProveedor = useMemo<ProveedorAgrupado[]>(() => {
    const map = new Map<number, ProveedorAgrupado>();
    for (const rel of relaciones) {
      if (!map.has(rel.proveedorId)) {
        map.set(rel.proveedorId, { proveedor: rel.proveedor, relaciones: [] });
      }
      map.get(rel.proveedorId)!.relaciones.push(rel);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.proveedor.nombreEmpresa.localeCompare(b.proveedor.nombreEmpresa)
    );
  }, [relaciones]);

  const detalleProductoData = detalleProductoId
    ? porProducto.find((p) => p.producto.id === detalleProductoId) ?? null
    : null;

  const detalleProveedorData = detalleProveedorId
    ? porProveedor.find((p) => p.proveedor.id === detalleProveedorId) ?? null
    : null;

  const totalConPrecios = relaciones.filter((r) => r.precios.length > 0).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle vista */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setVista("producto")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            vista === "producto"
              ? "bg-[#DE2910] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Package size={15} />
          Por Producto
        </button>
        <button
          onClick={() => setVista("proveedor")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            vista === "proveedor"
              ? "bg-[#DE2910] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Factory size={15} />
          Por Proveedor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Productos" value={porProducto.length} icon={Package} color="red" />
        <StatCard label="Proveedores" value={porProveedor.length} icon={Factory} color="red" />
        <StatCard label="Vínculos" value={relaciones.length} icon={Hash} color="gray" />
        <StatCard label="Con precios" value={totalConPrecios} icon={DollarSign} color="green" />
      </div>

      {/* Tabla */}
      {vista === "producto" ? (
        <TablaProductos datos={porProducto} onSelect={setDetalleProductoId} />
      ) : (
        <TablaProveedores datos={porProveedor} onSelect={setDetalleProveedorId} />
      )}

      {/* Panels de detalle */}
      {detalleProductoData && (
        <DetalleProducto
          data={detalleProductoData}
          onClose={() => setDetalleProductoId(null)}
        />
      )}
      {detalleProveedorData && (
        <DetalleProveedor
          data={detalleProveedorData}
          onClose={() => setDetalleProveedorId(null)}
        />
      )}
    </div>
  );
}
