"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, Factory, BarChart3, Map, Search } from "lucide-react";

const NAV_ITEMS = [
  { href: "/productos",   label: "Productos",   icon: Package,  color: "red"  },
  { href: "/proveedores", label: "Proveedores", icon: Factory,  color: "red"  },
  { href: "/analisis",    label: "Análisis",    icon: BarChart3, color: "gold" },
  { href: "/buscar",      label: "Buscar",      icon: Search,   color: "red"  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090f] china-pattern">

      {/* Barra superior roja animada */}
      <div className="red-bar w-full" />

      {/* Header sticky */}
      <header className="sticky top-0 z-30 w-full bg-[#07090f]/96 backdrop-blur-md border-b border-[#DE2910]/15">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* Logo / Home */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DE2910] flex items-center justify-center shadow-md group-hover:shadow-[0_0_16px_rgba(222,41,16,0.6)] transition-all duration-300">
              <span className="text-sm font-black text-[#FFDE00]" style={{ fontFamily: 'serif' }}>中</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-widest text-white uppercase">GIPCH</span>
              <span className="block text-[9px] text-gray-500 tracking-wider -mt-0.5">Importaciones China</span>
            </div>
          </Link>

          {/* Divisor */}
          <div className="hidden sm:block w-px h-5 bg-[#DE2910]/20" />

          {/* Nav */}
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
              const active = pathname.startsWith(href);
              const isGold = color === "gold";
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? isGold
                        ? "bg-[#FFDE00]/12 text-[#FFDE00] border border-[#FFDE00]/25"
                        : "bg-[#DE2910]/15 text-[#ff6644] border border-[#DE2910]/25"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Título / breadcrumb */}
          {title && (
            <span className="hidden md:block text-xs text-gray-600 truncate max-w-[160px]">{title}</span>
          )}
        </div>

        {/* Línea decorativa inferior */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#DE2910]/30 to-transparent" />
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-[#DE2910]/10 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="text-[10px] text-gray-700 tracking-widest uppercase">GIPCH · Sistema de Importaciones</span>
          <Link href="/" className="text-[10px] text-[#DE2910]/40 hover:text-[#DE2910]/70 transition-colors flex items-center gap-1">
            <Map size={10} />
            <span>Ver mapa</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
