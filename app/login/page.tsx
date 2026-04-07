"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nombreCorto, setNombreCorto] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreCorto, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090f] china-pattern flex items-center justify-center px-4">

      {/* Barra superior */}
      <div className="red-bar fixed top-0 left-0 right-0" />

      {/* Card de login */}
      <div className="w-full max-w-sm animate-slide-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#DE2910] flex items-center justify-center shadow-2xl animate-red-pulse mb-4">
            <span className="text-4xl font-black text-[#FFDE00]" style={{ fontFamily: "serif" }}>
              中
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">GIPCH</h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">
            Gestión de Importaciones · China
          </p>
        </div>

        {/* Formulario */}
        <div
          className="rounded-2xl border border-[#DE2910]/20 p-6"
          style={{ background: "linear-gradient(135deg, #0e1420 0%, #0a1018 100%)" }}
        >
          {/* Separador decorativo */}
          <div className="divider-china mb-6">
            <span>Iniciar sesión</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Usuario <span className="text-[#DE2910]">*</span>
              </label>
              <input
                type="text"
                value={nombreCorto}
                onChange={(e) => setNombreCorto(e.target.value)}
                placeholder="nombre de usuario"
                autoComplete="username"
                autoFocus
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/50 focus:border-[#DE2910]/50 transition-colors hover:border-white/20"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Contraseña <span className="text-[#DE2910]">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/50 focus:border-[#DE2910]/50 transition-colors hover:border-white/20"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
                <span className="text-red-400 text-xs font-medium">{error}</span>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-lg bg-[#DE2910] hover:bg-[#b52010] text-white font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              style={{ boxShadow: "0 4px 20px rgba(222,41,16,0.35)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar al sistema"
              )}
            </button>
          </form>

          {/* Decoración inferior */}
          <div className="mt-6 text-center">
            <span className="text-[10px] text-gray-700 tracking-widest uppercase">
              República Popular China · Sistema de Importaciones
            </span>
          </div>
        </div>

        {/* Esquinas decorativas */}
        <div className="relative mt-4 flex justify-center">
          <span className="text-[#DE2910]/20 text-2xl" style={{ fontFamily: "serif" }}>
            ◆
          </span>
        </div>
      </div>
    </main>
  );
}
