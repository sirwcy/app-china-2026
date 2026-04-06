"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import type { MarcadorProveedor } from "@/components/ChinaMap";

// Carga dinámica para evitar SSR con react-simple-maps
const ChinaMap = dynamic(() => import("@/components/ChinaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-china-gold text-lg">Cargando mapa...</div>
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
    <main className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Header */}
      <header className="w-full py-4 px-4 md:px-8 border-b border-[#DE2910]/30 bg-[#0d1117]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇨🇳</span>
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-wide text-white uppercase leading-tight">
                Sistema de Gestión
              </h1>
              <p className="text-[#DE2910] font-semibold text-sm md:text-base tracking-widest uppercase">
                Captación de Precios
              </p>
            </div>
          </div>
          <nav className="flex gap-2 flex-wrap justify-center">
            <a
              href="/productos"
              className="px-3 py-1.5 text-sm rounded-md border border-[#DE2910]/50 text-gray-300 hover:bg-[#DE2910] hover:text-white transition-colors"
            >
              Productos
            </a>
            <a
              href="/proveedores"
              className="px-3 py-1.5 text-sm rounded-md border border-[#DE2910]/50 text-gray-300 hover:bg-[#DE2910] hover:text-white transition-colors"
            >
              Proveedores
            </a>
            <a
              href="/analisis"
              className="px-3 py-1.5 text-sm rounded-md border border-[#FFDE00]/50 text-[#FFDE00] hover:bg-[#FFDE00] hover:text-black transition-colors font-medium"
            >
              Análisis
            </a>
          </nav>
        </div>
      </header>

      {/* Mapa principal */}
      <section className="flex-1 flex flex-col items-center justify-center px-2 py-4">
        <div className="w-full max-w-4xl">
          <div
            className="relative w-full rounded-xl overflow-hidden border border-[#DE2910]/20 shadow-2xl"
            style={{ height: "clamp(300px, 60vw, 560px)" }}
          >
            <ChinaMap onProvinciaClick={setProvincia} marcadores={marcadores} />
          </div>

          {provincia && (
            <div className="mt-3 text-center">
              <span className="inline-block bg-[#DE2910]/20 border border-[#DE2910]/40 text-[#DE2910] px-4 py-1.5 rounded-full text-sm font-medium">
                {provincia}
              </span>
            </div>
          )}
        </div>

        {/* Cards de acceso rápido */}
        <div className="w-full max-w-4xl mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
          <QuickCard
            href="/productos"
            icon="📦"
            title="Productos"
            desc="Registrar y gestionar productos"
            color="red"
          />
          <QuickCard
            href="/proveedores"
            icon="🏭"
            title="Proveedores"
            desc="Gestionar contactos y documentación"
            color="gold"
          />
          <QuickCard
            href="/analisis"
            icon="📊"
            title="Análisis Comparativo"
            desc="Comparar precio, MOQ y factibilidad"
            color="blue"
          />
        </div>
      </section>
    </main>
  );
}

function QuickCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  color: "red" | "gold" | "blue";
}) {
  const borderColor =
    color === "red"
      ? "border-[#DE2910]/40 hover:border-[#DE2910]"
      : color === "gold"
      ? "border-[#FFDE00]/40 hover:border-[#FFDE00]"
      : "border-blue-500/40 hover:border-blue-400";

  return (
    <a
      href={href}
      className={`block p-4 rounded-xl border bg-white/5 hover:bg-white/10 transition-all ${borderColor}`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm mt-1">{desc}</p>
    </a>
  );
}
