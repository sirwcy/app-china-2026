"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SlideOver from "@/components/ui/SlideOver";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { UserPlus, Pencil, Trash2, Shield, Eye } from "lucide-react";

interface Usuario {
  id: number;
  nombreCorto: string;
  nombreCompleto: string;
  empresa: string | null;
  nroWhatsapp: string | null;
  nroWechat: string | null;
  rol: string;
  creadoEn: string;
}

const schema = z.object({
  nombreCorto: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y _"),
  nombreCompleto: z.string().min(2, "Requerido"),
  empresa: z.string().optional(),
  nroWhatsapp: z.string().optional(),
  nroWechat: z.string().optional(),
  rol: z.enum(["ADMIN", "LECTOR"]),
  password: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  usuarios: Usuario[];
  currentUserId: number;
}

export default function UsuariosCliente({ usuarios: init, currentUserId }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(init);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() {
    setEditing(null);
    reset({
      nombreCorto: "",
      nombreCompleto: "",
      empresa: "",
      nroWhatsapp: "",
      nroWechat: "",
      rol: "LECTOR",
      password: "",
    });
    setApiError("");
    setPanelOpen(true);
  }

  function openEdit(u: Usuario) {
    setEditing(u);
    reset({
      nombreCorto: u.nombreCorto,
      nombreCompleto: u.nombreCompleto,
      empresa: u.empresa ?? "",
      nroWhatsapp: u.nroWhatsapp ?? "",
      nroWechat: u.nroWechat ?? "",
      rol: u.rol as "ADMIN" | "LECTOR",
      password: "",
    });
    setApiError("");
    setPanelOpen(true);
  }

  async function onSubmit(data: FormData) {
    setApiError("");
    if (!editing && (!data.password || data.password.trim() === "")) {
      setApiError("La contraseña es requerida para nuevos usuarios");
      return;
    }

    const url = editing ? `/api/admin/usuarios/${editing.id}` : "/api/admin/usuarios";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setApiError(err.error || "Error al guardar");
      return;
    }

    const saved: Usuario = await res.json();

    if (editing) {
      setUsuarios((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
    } else {
      setUsuarios((prev) => [...prev, saved]);
    }
    setPanelOpen(false);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || "Error al eliminar");
    }
    setDeletingId(null);
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Usuarios del sistema</h1>
          <p className="text-gray-500 text-sm mt-0.5">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="flex items-center gap-1.5">
          <UserPlus size={14} />
          Nuevo usuario
        </Button>
      </div>

      {/* Tabla / lista */}
      <div className="flex flex-col gap-3">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="card-china rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              {/* Avatar inicial */}
              <div className="w-10 h-10 rounded-lg bg-[#DE2910]/15 border border-[#DE2910]/25 flex items-center justify-center shrink-0">
                <span className="text-[#DE2910] font-bold text-sm uppercase">
                  {u.nombreCorto.charAt(0)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{u.nombreCompleto}</span>
                  <code className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">@{u.nombreCorto}</code>
                  {/* Rol badge */}
                  {u.rol === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DE2910]/15 text-[#DE2910] border border-[#DE2910]/30">
                      <Shield size={9} /> ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-700/50 text-gray-400 border border-white/10">
                      <Eye size={9} /> LECTOR
                    </span>
                  )}
                  {u.id === currentUserId && (
                    <span className="text-[10px] text-[#FFDE00]/60 bg-[#FFDE00]/8 border border-[#FFDE00]/15 px-1.5 py-0.5 rounded-full">Tú</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {u.empresa && <span className="text-xs text-gray-500">🏢 {u.empresa}</span>}
                  {u.nroWhatsapp && <span className="text-xs text-gray-500">📱 {u.nroWhatsapp}</span>}
                  {u.nroWechat && <span className="text-xs text-gray-500">💬 {u.nroWechat}</span>}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button variant="secondary" size="sm" onClick={() => openEdit(u)} className="flex items-center gap-1">
                <Pencil size={12} /> Editar
              </Button>
              {u.id !== currentUserId && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={deletingId === u.id}
                  onClick={() => {
                    if (confirm(`¿Eliminar al usuario @${u.nombreCorto}?`)) handleDelete(u.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={12} /> Eliminar
                </Button>
              )}
            </div>
          </div>
        ))}

        {usuarios.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">👤</p>
            <p>No hay usuarios registrados</p>
          </div>
        )}
      </div>

      {/* Panel crear/editar */}
      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? `Editar @${editing.nombreCorto}` : "Nuevo usuario"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nombre de usuario"
            placeholder="ej: williams"
            required
            disabled={!!editing}
            error={errors.nombreCorto?.message}
            hint={!editing ? "Solo minúsculas, números y _ (no se puede cambiar)" : undefined}
            {...register("nombreCorto")}
          />
          <Input
            label="Nombre completo"
            placeholder="ej: Williams García"
            required
            error={errors.nombreCompleto?.message}
            {...register("nombreCompleto")}
          />
          <Input
            label="Empresa"
            placeholder="ej: Importaciones del Sur S.A."
            {...register("empresa")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="WhatsApp"
              placeholder="+58 412..."
              {...register("nroWhatsapp")}
            />
            <Input
              label="WeChat"
              placeholder="ID WeChat"
              {...register("nroWechat")}
            />
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">
              Rol <span className="text-[#DE2910]">*</span>
            </label>
            <div className="flex gap-2">
              {(["ADMIN", "LECTOR"] as const).map((r) => (
                <label
                  key={r}
                  className="flex-1 flex items-center gap-2 cursor-pointer border border-white/10 rounded-lg px-3 py-2 hover:border-white/20 has-[:checked]:border-[#DE2910]/50 has-[:checked]:bg-[#DE2910]/8 transition-colors"
                >
                  <input type="radio" value={r} {...register("rol")} className="accent-[#DE2910]" />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    {r === "ADMIN" ? <><Shield size={12} className="text-[#DE2910]" /> Admin</> : <><Eye size={12} className="text-gray-400" /> Lector</>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Contraseña */}
          <Input
            label={editing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            type="password"
            placeholder="••••••••"
            required={!editing}
            {...register("password")}
          />

          {apiError && (
            <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2 text-xs text-red-400">
              {apiError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {editing ? "Guardar cambios" : "Crear usuario"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
