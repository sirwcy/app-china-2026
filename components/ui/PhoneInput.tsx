"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PAISES = [
  { code: "+86",  flag: "🇨🇳", nombre: "China" },
  { code: "+1",   flag: "🇺🇸", nombre: "EE.UU." },
  { code: "+44",  flag: "🇬🇧", nombre: "Reino Unido" },
  { code: "+34",  flag: "🇪🇸", nombre: "España" },
  { code: "+54",  flag: "🇦🇷", nombre: "Argentina" },
  { code: "+55",  flag: "🇧🇷", nombre: "Brasil" },
  { code: "+56",  flag: "🇨🇱", nombre: "Chile" },
  { code: "+57",  flag: "🇨🇴", nombre: "Colombia" },
  { code: "+51",  flag: "🇵🇪", nombre: "Perú" },
  { code: "+52",  flag: "🇲🇽", nombre: "México" },
  { code: "+58",  flag: "🇻🇪", nombre: "Venezuela" },
  { code: "+593", flag: "🇪🇨", nombre: "Ecuador" },
  { code: "+595", flag: "🇵🇾", nombre: "Paraguay" },
  { code: "+598", flag: "🇺🇾", nombre: "Uruguay" },
  { code: "+591", flag: "🇧🇴", nombre: "Bolivia" },
  { code: "+507", flag: "🇵🇦", nombre: "Panamá" },
  { code: "+506", flag: "🇨🇷", nombre: "Costa Rica" },
  { code: "+502", flag: "🇬🇹", nombre: "Guatemala" },
  { code: "+503", flag: "🇸🇻", nombre: "El Salvador" },
  { code: "+504", flag: "🇭🇳", nombre: "Honduras" },
  { code: "+505", flag: "🇳🇮", nombre: "Nicaragua" },
  { code: "+1787",flag: "🇵🇷", nombre: "Puerto Rico" },
  { code: "+1809",flag: "🇩🇴", nombre: "Rep. Dominicana" },
  { code: "+33",  flag: "🇫🇷", nombre: "Francia" },
  { code: "+49",  flag: "🇩🇪", nombre: "Alemania" },
  { code: "+39",  flag: "🇮🇹", nombre: "Italia" },
  { code: "+81",  flag: "🇯🇵", nombre: "Japón" },
  { code: "+82",  flag: "🇰🇷", nombre: "Corea del Sur" },
  { code: "+91",  flag: "🇮🇳", nombre: "India" },
  { code: "+971", flag: "🇦🇪", nombre: "Emiratos Árabes" },
  { code: "+7",   flag: "🇷🇺", nombre: "Rusia" },
  { code: "+62",  flag: "🇮🇩", nombre: "Indonesia" },
  { code: "+60",  flag: "🇲🇾", nombre: "Malasia" },
  { code: "+66",  flag: "🇹🇭", nombre: "Tailandia" },
  { code: "+84",  flag: "🇻🇳", nombre: "Vietnam" },
  { code: "+63",  flag: "🇵🇭", nombre: "Filipinas" },
];

// Parse stored value "+86 138000000" → { code: "+86", numero: "138000000" }
function parseValue(value: string): { code: string; numero: string } {
  // Sort codes by length desc to match "+1787" before "+1"
  const sorted = [...PAISES].sort((a, b) => b.code.length - a.code.length);
  for (const p of sorted) {
    if (value.startsWith(p.code + " ")) {
      return { code: p.code, numero: value.slice(p.code.length + 1) };
    }
    if (value.startsWith(p.code)) {
      return { code: p.code, numero: value.slice(p.code.length) };
    }
  }
  return { code: "+86", numero: value };
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export default function PhoneInput({ value = "", onChange, error, label, required }: PhoneInputProps) {
  const parsed = value ? parseValue(value) : { code: "+86", numero: "" };

  const [countryCode, setCountryCode] = useState(parsed.code);
  const [numero, setNumero] = useState(parsed.numero);
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const busquedaRef = useRef<HTMLInputElement>(null);

  const paisActual = PAISES.find((p) => p.code === countryCode) ?? PAISES[0];

  // Sync internal state if external value changes (e.g. on reset)
  useEffect(() => {
    if (value !== undefined) {
      const p = value ? parseValue(value) : { code: "+86", numero: "" };
      setCountryCode(p.code);
      setNumero(p.numero);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setBusqueda("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (abierto) {
      setTimeout(() => busquedaRef.current?.focus(), 40);
    }
  }, [abierto]);

  function seleccionarPais(code: string) {
    setCountryCode(code);
    setAbierto(false);
    setBusqueda("");
    onChange?.(numero ? `${code} ${numero}` : "");
  }

  function handleNumeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only digits, max 9
    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
    setNumero(val);
    onChange?.(val ? `${countryCode} ${val}` : "");
  }

  const filtrados = busqueda.trim()
    ? PAISES.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.code.includes(busqueda)
      )
    : PAISES;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-[#DE2910] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex gap-0">
        {/* Country code button */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-2 rounded-l-lg border-y border-l text-sm transition-colors shrink-0",
            "bg-white/5",
            error
              ? "border-red-500/60"
              : abierto
              ? "border-[#DE2910]/60"
              : "border-white/10 hover:border-white/20"
          )}
        >
          <span className="text-base leading-none">{paisActual.flag}</span>
          <span className="text-gray-300 text-xs font-mono">{paisActual.code}</span>
          <ChevronDown
            size={12}
            className={cn("text-gray-500 transition-transform", abierto && "rotate-180")}
          />
        </button>

        {/* Number input */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={9}
          value={numero}
          onChange={handleNumeroChange}
          placeholder="138 0000 0000"
          className={cn(
            "flex-1 bg-white/5 border-y border-r rounded-r-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-white/10 hover:border-white/20 focus:ring-[#DE2910]/40 focus:border-[#DE2910]/60"
          )}
        />

        {/* Dropdown */}
        {abierto && (
          <div
            className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl shadow-2xl overflow-hidden"
            style={{ background: "#0e1420", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {/* Search */}
            <div className="px-2 pt-2 pb-1 border-b border-white/8">
              <input
                ref={busquedaRef}
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar país..."
                className="w-full rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>

            {/* List */}
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtrados.map((p) => (
                <li key={p.code}>
                  <button
                    type="button"
                    onClick={() => seleccionarPais(p.code)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-200 text-left transition-colors"
                    style={{ background: p.code === countryCode ? "rgba(222,41,16,0.12)" : "transparent" }}
                    onMouseEnter={(e) => {
                      if (p.code !== countryCode)
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (p.code !== countryCode)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="text-base">{p.flag}</span>
                    <span className="flex-1 truncate text-xs">{p.nombre}</span>
                    <span className="text-xs text-gray-500 font-mono shrink-0">{p.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
