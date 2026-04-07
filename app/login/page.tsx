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
    <main
      className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, #8a0e06 0%, #c1200f 25%, #DE2910 55%, #a81609 80%, #6e0a04 100%)",
      }}
    >
      {/* Scan lines — tech texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        }}
      />

      {/* Gold grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,222,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,222,0,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Chinese flag stars — background decoration ── */}
      {/* Big star */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ top: "7%", left: "5%", opacity: 0.13 }}
      >
        <span
          style={{
            fontSize: 170,
            color: "#FFDE00",
            lineHeight: 1,
            display: "block",
            filter: "drop-shadow(0 0 40px rgba(255,222,0,0.6))",
          }}
        >
          ★
        </span>
      </div>
      {/* 4 small stars arcing around the big one */}
      {[
        { top: "7%",  left: "24%" },
        { top: "17%", left: "29%" },
        { top: "28%", left: "26%" },
        { top: "33%", left: "17%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ ...pos, opacity: 0.13 }}
        >
          <span
            style={{
              fontSize: 54,
              color: "#FFDE00",
              lineHeight: 1,
              display: "block",
              filter: "drop-shadow(0 0 14px rgba(255,222,0,0.5))",
            }}
          >
            ★
          </span>
        </div>
      ))}

      {/* Glow center bleed */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Animated red bar */}
      <div className="red-bar fixed top-0 left-0 right-0 z-20" />

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-sm animate-slide-in">
        <div
          className="rounded-2xl border border-[#FFDE00]/20 p-7 shadow-2xl"
          style={{
            background: "rgba(5, 7, 12, 0.80)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 30px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,222,0,0.07), inset 0 1px 0 rgba(255,222,0,0.07)",
          }}
        >
          {/* ── Logo / Header ── */}
          <div className="flex flex-col items-center mb-8">
            {/* Mini flag star constellation */}
            <div
              className="relative mb-5"
              style={{ width: 100, height: 60 }}
            >
              <span
                className="absolute text-[#FFDE00] select-none animate-gold-pulse"
                style={{
                  fontSize: 50,
                  top: "50%",
                  left: "22%",
                  transform: "translate(-50%, -50%)",
                  lineHeight: 1,
                  filter: "drop-shadow(0 0 14px rgba(255,222,0,0.9))",
                }}
              >
                ★
              </span>
              <span className="absolute text-[#FFDE00] select-none" style={{ fontSize: 19, top: "8%",  right: "14%", lineHeight: 1, filter: "drop-shadow(0 0 7px rgba(255,222,0,0.8))" }}>★</span>
              <span className="absolute text-[#FFDE00] select-none" style={{ fontSize: 19, top: "36%", right: "3%",  lineHeight: 1, filter: "drop-shadow(0 0 7px rgba(255,222,0,0.8))" }}>★</span>
              <span className="absolute text-[#FFDE00] select-none" style={{ fontSize: 19, top: "62%", right: "9%",  lineHeight: 1, filter: "drop-shadow(0 0 7px rgba(255,222,0,0.8))" }}>★</span>
              <span className="absolute text-[#FFDE00] select-none" style={{ fontSize: 19, top: "80%", right: "28%", lineHeight: 1, filter: "drop-shadow(0 0 7px rgba(255,222,0,0.8))" }}>★</span>
            </div>

            <h1
              className="text-3xl font-black text-white tracking-[0.18em] mb-2"
              style={{ textShadow: "0 0 30px rgba(255,255,255,0.2)" }}
            >
              GIPCH
            </h1>
            <p className="text-[11px] text-[#FFDE00]/55 tracking-[0.1em] text-center leading-relaxed">
              Gestión de Información de<br />Productos Chinos
            </p>
          </div>

          {/* Divider */}
          <div className="divider-china mb-6">
            <span>Iniciar sesión</span>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Usuario <span className="text-[#FFDE00]">*</span>
              </label>
              <input
                type="text"
                value={nombreCorto}
                onChange={(e) => setNombreCorto(e.target.value)}
                placeholder="nombre de usuario"
                autoComplete="username"
                autoFocus
                required
                className="w-full bg-white/[0.07] border border-white/15 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFDE00]/35 focus:border-[#FFDE00]/35 transition-colors hover:border-white/25"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Contraseña <span className="text-[#FFDE00]">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-white/[0.07] border border-white/15 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFDE00]/35 focus:border-[#FFDE00]/35 transition-colors hover:border-white/25"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-black/40 border border-red-500/50 rounded-lg px-3 py-2">
                <span className="text-red-400 text-xs font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-lg font-black text-sm tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
              style={{
                background: "linear-gradient(135deg, #FFE033 0%, #FFDE00 55%, #e6c800 100%)",
                color: "#1a0600",
                boxShadow: "0 4px 24px rgba(255,222,0,0.40), 0 1px 0 rgba(255,255,255,0.2) inset",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar al sistema"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[10px] text-white/18 tracking-widest uppercase">
              中华人民共和国 · República Popular China
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <span className="text-[#FFDE00]/12 text-lg select-none">★</span>
          <span className="text-[#FFDE00]/20 text-lg select-none">◆</span>
          <span className="text-[#FFDE00]/12 text-lg select-none">★</span>
        </div>
      </div>
    </main>
  );
}
