"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ImageIcon, FileText, FileSpreadsheet, Mic, Video,
  Upload, Trash2, Loader2, StopCircle, Camera, ExternalLink, FileType,
} from "lucide-react";
import Button from "@/components/ui/Button";

export interface Archivo {
  id: number;
  nombre: string;
  url: string;
  tipo: string;
  tamano: number | null;
  creadoEn: string;
}

interface ArchivoUploaderProps {
  productoId: number;
  initialArchivos?: Archivo[];
  /** Solo imágenes, PDF y Excel (para catálogos de proveedor) */
  soloDocumentos?: boolean;
  apiBase?: string; // override de ruta API
  onArchivosChange?: (archivos: Archivo[]) => void;
}

const TIPO_ICON: Record<string, React.ElementType> = {
  imagen: ImageIcon,
  pdf: FileText,
  excel: FileSpreadsheet,
  word: FileType,
  audio: Mic,
  video: Video,
};

const TIPO_COLOR: Record<string, string> = {
  imagen: "text-blue-400",
  pdf: "text-red-400",
  excel: "text-green-400",
  word: "text-blue-300",
  audio: "text-purple-400",
  video: "text-orange-400",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ArchivoUploader({
  productoId,
  initialArchivos = [],
  soloDocumentos = false,
  apiBase,
  onArchivosChange,
}: ArchivoUploaderProps) {
  const [archivos, setArchivos] = useState<Archivo[]>(initialArchivos);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Audio/Video recording
  const [grabandoAudio, setGrabandoAudio] = useState(false);
  const [grabandoVideo, setGrabandoVideo] = useState(false);
  const [camaraTraseraDisponible, setCamaraTraseraDisponible] = useState(false);
  const [usarCamaraFrontal, setUsarCamaraFrontal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const endpoint = apiBase ?? `/api/archivos/producto/${productoId}`;

  // Adjuntar stream al elemento <video> una vez que se renderiza (grabandoVideo=true)
  useEffect(() => {
    if (grabandoVideo && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [grabandoVideo]);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError("");
      try {
        const fd = new FormData();
        fd.append("file", file);

        let res: Response;
        try {
          res = await fetch(endpoint, { method: "POST", body: fd });
        } catch {
          throw new Error("Sin conexión — no se pudo contactar al servidor");
        }

        if (!res.ok) {
          let msg = `Error del servidor (${res.status})`;
          try {
            const err = await res.json();
            msg = err.error || msg;
          } catch {
            // El servidor respondió con HTML u otro formato no-JSON
          }
          throw new Error(msg);
        }

        const nuevo: Archivo = await res.json();
        setArchivos((prev) => {
          const updated = [...prev, nuevo];
          onArchivosChange?.(updated);
          return updated;
        });
      } catch (e: unknown) {
        setUploadError(e instanceof Error ? e.message : "Error al subir archivo");
      } finally {
        setUploading(false);
      }
    },
    [endpoint]
  );

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  // Drag & drop
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // Eliminar
  async function handleDelete(id: number) {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivoId: id }),
    });
    if (res.ok) {
      setArchivos((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        onArchivosChange?.(updated);
        return updated;
      });
    }
  }

  // Grabar audio
  async function iniciarAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        uploadFile(file);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabandoAudio(true);
    } catch {
      setUploadError("No se pudo acceder al micrófono");
    }
  }

  function detenerAudio() {
    mediaRecorderRef.current?.stop();
    setGrabandoAudio(false);
  }

  // Grabar video con selección de cámara
  async function iniciarVideo(frontal = false) {
    try {
      // Detener stream anterior si existe
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const facingMode = frontal ? "user" : "environment";
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      // Detectar si hay cámara trasera disponible
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCams = devices.filter((d) => d.kind === "videoinput");
      setCamaraTraseraDisponible(videoCams.length > 1);
      setUsarCamaraFrontal(frontal);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
        uploadFile(file);
      };
      recorder.start(100); // timeslice para ondataavailable frecuente
      mediaRecorderRef.current = recorder;
      setGrabandoVideo(true);

      // Detener automáticamente a los 60 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") detenerVideo();
      }, 60000);
    } catch {
      setUploadError("No se pudo acceder a la cámara/micrófono");
    }
  }

  function detenerVideo() {
    mediaRecorderRef.current?.stop();
    setGrabandoVideo(false);
  }

  function cambiarCamara() {
    iniciarVideo(!usarCamaraFrontal);
  }

  const accept = soloDocumentos
    ? "image/*,application/pdf,.xlsx,.xls,.csv,.doc,.docx"
    : "image/*,application/pdf,.xlsx,.xls,.csv,.doc,.docx,audio/*,video/*";

  return (
    <div className="flex flex-col gap-4">

      {/* Zona de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
          dragging
            ? "border-[#DE2910]/60 bg-[#DE2910]/8"
            : "border-white/15 hover:border-white/25"
        }`}
      >
        <Upload size={20} className="mx-auto text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">
          Arrastrá archivos aquí o usá los botones
        </p>
        <p className="text-xs text-gray-700 mt-0.5">
          {soloDocumentos
            ? "Imágenes, PDF, Excel, Word"
            : "Imágenes, PDF, Excel, Word, Audio, Video"}
        </p>
        <input
          type="file"
          multiple
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* Botones de captura */}
      <div className="flex flex-wrap gap-2">
        {/* Foto con cámara (mobile) */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/25 bg-blue-500/8 text-blue-400 text-sm cursor-pointer hover:bg-blue-500/15 transition-colors">
          <Camera size={14} />
          Tomar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {/* Audio */}
        {!soloDocumentos && (
          grabandoAudio ? (
            <button
              type="button"
              onClick={detenerAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 text-purple-300 text-sm animate-pulse"
            >
              <StopCircle size={14} />
              Detener audio
            </button>
          ) : (
            <button
              type="button"
              onClick={iniciarAudio}
              disabled={grabandoVideo || uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/25 bg-purple-500/8 text-purple-400 text-sm hover:bg-purple-500/15 transition-colors disabled:opacity-40"
            >
              <Mic size={14} />
              Grabar audio
            </button>
          )
        )}

        {/* Video */}
        {!soloDocumentos && (
          grabandoVideo ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={detenerVideo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/40 bg-orange-500/15 text-orange-300 text-sm animate-pulse"
              >
                <StopCircle size={14} />
                Detener
              </button>
              {camaraTraseraDisponible && (
                <button
                  type="button"
                  onClick={cambiarCamara}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
                  title="Cambiar cámara"
                >
                  <Camera size={14} />
                  {usarCamaraFrontal ? "Trasera" : "Frontal"}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => iniciarVideo(false)}
              disabled={grabandoAudio || uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/25 bg-orange-500/8 text-orange-400 text-sm hover:bg-orange-500/15 transition-colors disabled:opacity-40"
            >
              <Video size={14} />
              Grabar video (max 60s)
            </button>
          )
        )}
      </div>

      {/* Preview video en vivo */}
      {grabandoVideo && (
        <div className="relative rounded-xl overflow-hidden border border-orange-500/30 bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`w-full max-h-56 object-cover ${usarCamaraFrontal ? "scale-x-[-1]" : ""}`}
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600/80 text-white text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            REC
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded">
            {usarCamaraFrontal ? "Cámara frontal" : "Cámara trasera"}
          </div>
        </div>
      )}

      {/* Estado de upload */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Subiendo...
        </div>
      )}
      {uploadError && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      {/* Lista de archivos */}
      {archivos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {archivos.length} archivo{archivos.length !== 1 ? "s" : ""} adjunto{archivos.length !== 1 ? "s" : ""}
          </p>
          {archivos.map((a) => {
            const Icon = TIPO_ICON[a.tipo] ?? Upload;
            const color = TIPO_COLOR[a.tipo] ?? "text-gray-400";
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/4 border border-white/8 group"
              >
                {/* Thumbnail o icono */}
                {a.tipo === "imagen" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.url}
                    alt={a.nombre}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                )}

                {/* Nombre + tamaño */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{a.nombre}</p>
                  <p className="text-xs text-gray-600">{formatBytes(a.tamano)}</p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
                    title="Abrir"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
