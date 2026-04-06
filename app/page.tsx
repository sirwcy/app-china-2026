"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import type { MarcadorProveedor } from "@/components/ChinaMap";

const ChinaMap = dynamic(() => import("@/components/ChinaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#07090f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#DE2910] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#FFDE00]/60 text-xs tracking-widest uppercase">Cargando mapa...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [provincia, setProvincia] = useState<string | null>(null);
  const [marcadores, setMarcadores] = useState<MarcadorProveedor[]>([]);

  useEffect(() => {
    fetch("/api/proveedores/ubicaciones")
      .then((r) => r.json())
      .then(setMarcadores)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-[#07090f] china-pattern">

      {/* ── Barra superior animada ─────────────── */}
      <div className="red-bar w-full" />

      {/* ── Header ────────────────────────────── */}
      <header className="w-full border-b border-[#DE2910]/20 bg-[#07090f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-[#DE2910] flex items-center justify-center shadow-lg animate-red-pulse">
                <span className="text-2xl font-black text-[#FFDE00]" style={{ fontFamily: 'serif' }}>中</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                  GIPCH
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 bg-[#FFDE00]/10 border border-[#FFDE00]/30 rounded text-[10px] text-[#FFDE00] font-bold tracking-widest">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-gray-400 tracking-widest uppercase">
                Gestión de Importaciones · República Popular China
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { href: "/productos",   label: "Productos",   icon: "📦" },
              { href: "/proveedores", label: "Proveedores", icon: "🏭" },
              { href: "/buscar",      label: "Buscar",      icon: "🔍" },
            ].map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-[#DE2910]/25 text-gray-300 hover:bg-[#DE2910] hover:text-white hover:border-[#DE2910] transition-all duration-200 font-medium"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </a>
            ))}
            <a
              href="/analisis"
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-[#FFDE00]/10 border border-[#FFDE00]/40 text-[#FFDE00] hover:bg-[#FFDE00] hover:text-black transition-all duration-200 font-bold"
            >
              <span>📊</span>
              <span>Análisis</span>
            </a>
          </nav>
        </div>

        {/* Decoración inferior del header */}
        <div className="flex items-center gap-0 h-px">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#DE2910]/50 to-[#FFDE00]/50" />
          <div className="px-3 text-[#FFDE00]/30 text-xs">◆</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#DE2910]/50 to-[#FFDE00]/50" />
        </div>
      </header>

      {/* ── Cuerpo principal ───────────────────── */}
      <section className="flex-1 flex flex-col items-center px-3 py-6 gap-6">

        {/* Subtítulo decorativo */}
        <div className="divider-china w-full max-w-4xl">
          <span>República Popular China — Red de Proveedores</span>
        </div>

        {/* Mapa */}
        <div className="w-full max-w-4xl animate-slide-in">
          <div className="china-frame rounded-xl overflow-hidden border border-[#DE2910]/25 shadow-2xl"
            style={{ height: "clamp(280px, 58vw, 540px)", boxShadow: "0 0 60px rgba(222,41,16,0.12), 0 25px 50px rgba(0,0,0,0.6)" }}
          >
            <ChinaMap onProvinciaClick={setProvincia} marcadores={marcadores} />
          </div>

          {/* Provincia seleccionada */}
          {provincia && (
            <div className="mt-3 flex justify-center">
              <div className="flex items-center gap-2 bg-[#DE2910]/15 border border-[#DE2910]/40 rounded-full px-5 py-2 shimmer-gold">
                <span className="w-2 h-2 rounded-full bg-[#DE2910] animate-pulse" />
                <span className="text-sm text-[#DE2910] font-semibold">{provincia}</span>
              </div>
            </div>
          )}

          {/* Badge de marcadores */}
          {marcadores.length > 0 && (
            <div className="mt-2 flex justify-center">
              <span className="text-xs text-[#FFDE00]/50 tracking-wide">
                {marcadores.length} proveedor{marcadores.length > 1 ? "es" : ""} con ubicación registrada
              </span>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="divider-china w-full max-w-4xl">
          <span>Módulos del sistema</span>
        </div>

        {/* Cards de acceso rápido */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickCard
            href="/productos"
            icon="📦"
            label="Productos"
            sublabel="CATÁLOGO"
            desc="Registra y organiza productos por categoría, material y etiquetas"
            accent="red"
            chars="货"
          />
          <QuickCard
            href="/proveedores"
            icon="🏭"
            label="Proveedores"
            sublabel="CONTACTOS"
            desc="Gestiona empresas, contactos WeChat/WhatsApp y documentación"
            accent="gold"
            chars="商"
          />
          <QuickCard
            href="/analisis"
            icon="📊"
            label="Análisis"
            sublabel="COMPARATIVA"
            desc="Compara precio, MOQ y factibilidad entre proveedores"
            accent="blue"
            chars="析"
          />
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-600 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE2910]" />
            Sistema de captación de precios
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFDE00]" />
            Powered by Supabase + Netlify
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Next.js 16 · TypeScript
          </span>
        </div>
      </section>
    </main>
  );
}

/* ── QuickCard ──────────────────────────────── */
function QuickCard({
  href, icon, label, sublabel, desc, accent, chars,
}: {
  href: string;
  icon: string;
  label: string;
  sublabel: string;
  desc: string;
  accent: "red" | "gold" | "blue";
  chars: string;
}) {
  const styles = {
    red:  { border: "border-[#DE2910]/20 hover:border-[#DE2910]/60", glow: "hover:shadow-[0_8px_32px_rgba(222,41,16,0.2)]", badge: "bg-[#DE2910]/10 text-[#DE2910] border-[#DE2910]/25", char: "text-[#DE2910]/8" },
    gold: { border: "border-[#FFDE00]/15 hover:border-[#FFDE00]/50", glow: "hover:shadow-[0_8px_32px_rgba(255,222,0,0.15)]", badge: "bg-[#FFDE00]/10 text-[#FFDE00] border-[#FFDE00]/25", char: "text-[#FFDE00]/8" },
    blue: { border: "border-blue-500/15 hover:border-blue-400/50",   glow: "hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]", badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",   char: "text-blue-400/8" },
  }[accent];

  return (
    <a
      href={href}
      className={`relative block p-5 rounded-xl border bg-[#0e1420] overflow-hidden transition-all duration-300 hover:-translate-y-1 group ${styles.border} ${styles.glow}`}
    >
      {/* Carácter chino decorativo de fondo */}
      <span className={`absolute top-1 right-3 text-8xl font-black select-none pointer-events-none ${styles.char} transition-all duration-300 group-hover:scale-110 group-hover:opacity-[0.12]`}
        style={{ fontFamily: 'serif', lineHeight: 1 }}>
        {chars}
      </span>

      {/* Badge de sección */}
      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border mb-3 ${styles.badge}`}>
        {sublabel}
      </span>

      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-lg font-bold text-white mt-0.5">{label}</h3>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>

      {/* Flecha */}
      <div className="mt-4 flex justify-end">
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
          Ingresar →
        </span>
      </div>
    </a>
  );
}
