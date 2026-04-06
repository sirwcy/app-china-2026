"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Plus, Check, Loader2, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  id: number;
  nombre: string;
}

interface CreatableSelectProps {
  options: SelectOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  onCreateOption: (nombre: string) => Promise<SelectOption>;
  onEditOption?: (id: number, nuevoNombre: string) => Promise<void>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function CreatableSelect({
  options,
  value,
  onChange,
  onCreateOption,
  onEditOption,
  placeholder = "Seleccionar...",
  label,
  error,
  disabled = false,
  required = false,
}: CreatableSelectProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNombre, setEditandoNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const seleccionado = options.find((o) => o.id === value) ?? null;

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        cerrar();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editandoId !== null) {
          setEditandoId(null);
        } else {
          cerrar();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editandoId]);

  // Foco en búsqueda al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [abierto]);

  // Foco en input de edición al activar
  useEffect(() => {
    if (editandoId !== null) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editandoId]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setBusqueda("");
    setEditandoId(null);
  }, []);

  const filtrados = options.filter((o) =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const textoExacto = busqueda.trim();
  const yaExiste = options.some(
    (o) => o.nombre.toLowerCase() === textoExacto.toLowerCase()
  );
  const mostrarCrear = textoExacto.length >= 2 && !yaExiste;

  async function handleCrear() {
    if (!textoExacto || creando) return;
    setCreando(true);
    try {
      const nueva = await onCreateOption(textoExacto);
      onChange(nueva.id);
      cerrar();
    } finally {
      setCreando(false);
    }
  }

  function handleSeleccionar(id: number) {
    onChange(id);
    cerrar();
  }

  function handleLimpiar(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  function iniciarEdicion(e: React.MouseEvent, id: number, nombre: string) {
    e.stopPropagation();
    setEditandoId(id);
    setEditandoNombre(nombre);
  }

  async function handleGuardarEdicion(id: number) {
    const nombre = editandoNombre.trim();
    if (!nombre || guardando || !onEditOption) return;
    setGuardando(true);
    try {
      await onEditOption(id, nombre);
      setEditandoId(null);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-[#DE2910] ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setAbierto((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
          "bg-white/5 border",
          error
            ? "border-red-500/60"
            : abierto
            ? "border-[#DE2910]/60 ring-2 ring-[#DE2910]/30"
            : "border-white/10 hover:border-white/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={seleccionado ? "text-gray-100" : "text-gray-500"}>
          {seleccionado ? seleccionado.nombre : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {seleccionado && !disabled && (
            <span
              role="button"
              onClick={handleLimpiar}
              className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-500 transition-transform",
              abierto && "rotate-180"
            )}
          />
        </span>
      </button>

      {/* Dropdown */}
      {abierto && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[200px] bg-[#1a2235] border border-white/12 rounded-xl shadow-2xl overflow-hidden"
          style={{ position: "relative" }}
        >
          {/* Búsqueda */}
          <div className="px-2 pt-2 pb-1 border-b border-white/8">
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar o escribir nuevo..."
              className="w-full bg-white/8 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#DE2910]/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtrados.length === 1) {
                    handleSeleccionar(filtrados[0].id);
                  } else if (mostrarCrear) {
                    handleCrear();
                  }
                }
              }}
            />
          </div>

          {/* Lista */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtrados.length === 0 && !mostrarCrear && (
              <li className="px-3 py-2 text-xs text-gray-500 text-center">
                Sin resultados
              </li>
            )}

            {filtrados.map((option) => {
              const editando = editandoId === option.id;
              return (
                <li key={option.id}>
                  {editando ? (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-[#1a2235]">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editandoNombre}
                        onChange={(e) => setEditandoNombre(e.target.value)}
                        className="flex-1 bg-[#0d1526] border border-white/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#DE2910]/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleGuardarEdicion(option.id);
                          }
                          if (e.key === "Escape") {
                            e.stopPropagation();
                            setEditandoId(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleGuardarEdicion(option.id)}
                        disabled={guardando}
                        className="p-1 rounded text-green-400 hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        {guardando ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoId(null)}
                        className="p-1 rounded text-gray-500 hover:bg-white/10 hover:text-gray-300 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSeleccionar(option.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-white/8 transition-colors text-left group"
                    >
                      <span>{option.nombre}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        {option.id === value && (
                          <Check size={13} className="text-[#DE2910]" />
                        )}
                        {onEditOption && (
                          <span
                            role="button"
                            onClick={(e) => iniciarEdicion(e, option.id, option.nombre)}
                            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
                          >
                            <Pencil size={11} />
                          </span>
                        )}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}

            {/* Opción de crear */}
            {mostrarCrear && (
              <li className="border-t border-white/8 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleCrear}
                  disabled={creando}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#FFDE00] hover:bg-[#FFDE00]/8 transition-colors text-left disabled:opacity-60"
                >
                  {creando ? (
                    <Loader2 size={13} className="animate-spin shrink-0" />
                  ) : (
                    <Plus size={13} className="shrink-0" />
                  )}
                  <span>
                    Crear <strong>&ldquo;{textoExacto}&rdquo;</strong>
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
