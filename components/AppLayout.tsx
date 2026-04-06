"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, Factory, BarChart3, Map, Search } from "lucide-react";

const NAV_ITEMS = [
  { href: "/productos",   label: "Productos",   icon: Package },
  { href: "/proveedores", label: "Proveedores", icon: Factory },
  { href: "/analisis",    label: "Análisis",    icon: BarChart3 },
  { href: "/buscar",      label: "Buscar",      icon: Search },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 w-full bg-[#0d1117]/95 backdrop-blur-sm border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo / Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors shrink-0"
          >
            <Map size={18} className="text-[#DE2910]" />
            <span className="hidden sm:inline tracking-wide uppercase text-xs text-[#DE2910] font-bold">
              China 2026
            </span>
          </Link>

          {/* Nav central */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-[#DE2910]/15 text-[#DE2910] font-medium"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/8"
                  )}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Breadcrumb / título de sección */}
          {title && (
            <p className="text-xs text-gray-500 hidden md:block truncate">{title}</p>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
