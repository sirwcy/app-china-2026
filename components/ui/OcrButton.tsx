"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OcrButtonProps {
  onText: (text: string) => void;
  className?: string;
}

export default function OcrButton({ onText, className }: OcrButtonProps) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Reset para permitir volver a seleccionar la misma imagen
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        title="Extraer texto de una foto"
        disabled={procesando}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border transition-colors",
          error
            ? "border-red-500/60 bg-red-900/20 text-red-400"
            : procesando
            ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
            : "border-white/10 bg-white/5 text-gray-400 hover:border-[#DE2910]/60 hover:text-[#DE2910] hover:bg-[#DE2910]/10",
          className
        )}
      >
        {procesando ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>
    </>
  );
}
