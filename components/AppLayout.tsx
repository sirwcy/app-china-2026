"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Package, Factory, BarChart3, Map, Search, Users, LogOut, ChevronDown, Trash2, Camera, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/productos",   label: "Productos",   icon: Package,  color: "red"  },
  { href: "/proveedores", label: "Proveedores", icon: Factory,  color: "red"  },
  { href: "/analisis",    label: "Análisis",    icon: BarChart3, color: "gold" },
  { href: "/buscar",      label: "Buscar",      icon: Search,   color: "red"  },
];

interface SessionUser {
  id: number;
  nombreCorto: string;
  nombreCompleto: string;
  rol: string;
  fotoUrl?: string | null;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetPass, setResetPass] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/usuarios/foto", { method: "POST", body: fd });
    if (res.ok) {
      const { fotoUrl } = await res.json();
      setUser((u) => u ? { ...u, fotoUrl } : u);
    }
  }

  async function handleReset() {
    if (!resetPass.trim()) { setResetError("Ingresá tu contraseña"); return; }
    setResetLoading(true);
    setResetError("");
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPass }),
    });
    setResetLoading(false);
    if (res.ok) {
      setResetModal(false);
      setResetPass("");
      router.refresh();
    } else {
      const err = await res.json();
      setResetError(err.error || "Error al reiniciar");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090f] china-pattern">

      {/* Barra superior animada */}
      <div className="red-bar w-full" />

      {/* Header sticky */}
      <header className="sticky top-0 z-30 w-full bg-[#07090f]/96 backdrop-blur-md border-b border-[#DE2910]/15">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* Logo / Home */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#DE2910] flex items-center justify-center shadow-md group-hover:shadow-[0_0_16px_rgba(222,41,16,0.6)] transition-all duration-300">
              <span className="text-sm font-black text-[#FFDE00]" style={{ fontFamily: "serif" }}>中</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-widest text-white uppercase">GIPCH</span>
              <span className="block text-[9px] text-gray-500 tracking-wider -mt-0.5">Importaciones China</span>
            </div>
          </Link>

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

          {/* Usuario / menú derecha */}
          {user && (
            <div className="relative shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all text-sm"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden bg-[#DE2910]/20 border border-[#DE2910]/30 flex items-center justify-center shrink-0">
                  {user.fotoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={user.fotoUrl} alt="foto" className="w-full h-full object-cover" />
                    : <span className="text-[#DE2910] text-xs font-bold uppercase">{user.nombreCorto.charAt(0)}</span>
                  }
                </div>
                <span className="hidden sm:inline text-gray-300 max-w-[100px] truncate">{user.nombreCorto}</span>
                <ChevronDown size={12} className="text-gray-500" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-[#0e1420] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {/* Info usuario + foto */}
                    <div className="px-4 py-3 border-b border-white/8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative group/foto">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#DE2910]/20 border border-[#DE2910]/30 flex items-center justify-center cursor-pointer" onClick={() => fotoInputRef.current?.click()}>
                            {user.fotoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={user.fotoUrl} alt="foto" className="w-full h-full object-cover" />
                              : <span className="text-[#DE2910] text-sm font-bold uppercase">{user.nombreCorto.charAt(0)}</span>
                            }
                          </div>
                          <button
                            type="button"
                            onClick={() => fotoInputRef.current?.click()}
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FFDE00] flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity"
                            title="Cambiar foto"
                          >
                            <Camera size={8} className="text-black" />
                          </button>
                          <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.nombreCompleto}</p>
                          <p className="text-xs text-gray-500">@{user.nombreCorto}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border",
                        user.rol === "ADMIN"
                          ? "bg-[#DE2910]/15 text-[#DE2910] border-[#DE2910]/30"
                          : "bg-gray-700/50 text-gray-400 border-white/10"
                      )}>
                        {user.rol}
                      </span>
                    </div>

                    {/* Links */}
                    {user.rol === "ADMIN" && (
                      <>
                        <Link
                          href="/admin/usuarios"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Users size={13} />
                          Gestión de usuarios
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); setResetModal(true); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-950/30 transition-colors border-t border-white/8"
                        >
                          <Trash2 size={13} />
                          Reiniciar datos
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors border-t border-white/8"
                    >
                      <LogOut size={13} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Modal reiniciar datos */}
          {resetModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setResetModal(false); setResetPass(""); setResetError(""); }} />
              <div className="relative z-10 w-full max-w-sm bg-[#0e1420] border border-red-900/60 rounded-2xl p-6 shadow-2xl">
                <button
                  type="button"
                  onClick={() => { setResetModal(false); setResetPass(""); setResetError(""); }}
                  className="absolute top-4 right-4 p-1 rounded text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                    <Trash2 size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reiniciar datos</h3>
                    <p className="text-xs text-gray-500">Esta acción es irreversible</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Se eliminarán <strong className="text-white">todos</strong> los productos, proveedores, categorías, etiquetas y archivos. Los usuarios no se eliminarán.
                </p>
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-xs font-medium text-gray-400">Confirmá con tu contraseña de administrador</label>
                  <input
                    type="password"
                    value={resetPass}
                    onChange={(e) => setResetPass(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                  />
                  {resetError && <p className="text-xs text-red-400">{resetError}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setResetModal(false); setResetPass(""); setResetError(""); }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Eliminando...</>
                    ) : (
                      <><Trash2 size={13} />Reiniciar todo</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Título */}
          {title && (
            <span className="hidden md:block text-xs text-gray-600 truncate max-w-[140px]">{title}</span>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#DE2910]/30 to-transparent" />
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
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
