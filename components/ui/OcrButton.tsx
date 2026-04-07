"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OcrButtonProps {
  onText: (text: string) => void;
  className?: string;
}

export default function OcrButton({ onText, className }: OcrButtonProps) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(false);
  const camaraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(false);
    setProcesando(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const data = await res.json();

      if (data.text) {
        onText(data.text);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setProcesando(false);
      if (camaraRef.current) camaraRef.current.value = "";
      if (galeriaRef.current) galeriaRef.current.value = "";
    }
  }

  const btnBase = cn(
    "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border transition-colors",
    error
      ? "border-red-500/60 bg-red-900/20 text-red-400"
      : procesando
      ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
      : "border-white/10 bg-white/5 text-gray-400 hover:border-[#DE2910]/60 hover:text-[#DE2910] hover:bg-[#DE2910]/10",
    className
  );

  return (
    <>
      {/* Cámara: captura directa con la cámara trasera */}
      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      {/* Galería: selección desde archivos/galería */}
      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <button
        type="button"
        title="Tomar foto con la cámara"
        disabled={procesando}
        onClick={() => camaraRef.current?.click()}
        className={btnBase}
      >
        {procesando ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>

      <button
        type="button"
        title="Seleccionar imagen de la galería"
        disabled={procesando}
        onClick={() => galeriaRef.current?.click()}
        className={cn(
          "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border transition-colors",
          error
            ? "border-red-500/60 bg-red-900/20 text-red-400"
            : procesando
            ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
            : "border-white/10 bg-white/5 text-gray-400 hover:border-[#FFDE00]/60 hover:text-[#FFDE00] hover:bg-[#FFDE00]/10"
        )}
      >
        <ImageIcon size={16} />
      </button>
    </>
  );
}
