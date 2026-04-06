"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { relacionSchema, type RelacionFormData } from "@/lib/validations/relacion";
import { vincularProveedor, actualizarRelacion } from "@/lib/actions/relaciones";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useState } from "react";

interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
}

interface RelacionExistente {
  id: number;
  proveedorId: number;
  precio: number | null;
  moneda: string;
  moq: number | null;
  notas: string | null;
  caracteristicas: string | null;
}

interface RelacionFormProps {
  productoId: number;
  proveedores: Proveedor[];
  /** Proveedores ya vinculados (para filtrar del selector al crear) */
  proveedoresVinculadosIds: number[];
  relacion?: RelacionExistente;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RelacionForm({
  productoId,
  proveedores,
  proveedoresVinculadosIds,
  relacion,
  onSuccess,
  onCancel,
}: RelacionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const esEdicion = !!relacion;

  // Al crear, filtrar proveedores ya vinculados
  const proveedoresDisponibles = esEdicion
    ? proveedores
    : proveedores.filter((p) => !proveedoresVinculadosIds.includes(p.id));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RelacionFormData>({
    resolver: zodResolver(relacionSchema),
    defaultValues: {
      proveedorId: relacion?.proveedorId ?? undefined,
      precio: relacion?.precio ?? null,
      moneda: (relacion?.moneda as "USD" | "CNY" | "EUR") ?? "USD",
      moq: relacion?.moq ?? null,
      notas: relacion?.notas ?? "",
      caracteristicas: relacion?.caracteristicas ?? "",
    },
  });

  async function onSubmit(data: RelacionFormData) {
    setServerError(null);
    try {
      if (esEdicion) {
        await actualizarRelacion(relacion.id, productoId, data);
      } else {
        await vincularProveedor(productoId, data);
      }
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ocurrió un error. Intenta nuevamente.";
      setServerError(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Proveedor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Proveedor <span className="text-[#DE2910] ml-1">*</span>
        </label>
        <select
          {...register("proveedorId", { valueAsNumber: true })}
          disabled={esEdicion}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 disabled:opacity-50"
        >
          <option value="">Seleccionar proveedor...</option>
          {proveedoresDisponibles.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111827]">
              {p.nombreEmpresa} — {p.nombreContacto}
            </option>
          ))}
        </select>
        {errors.proveedorId && (
          <p className="text-xs text-red-400">{errors.proveedorId.message}</p>
        )}
        {!esEdicion && proveedoresDisponibles.length === 0 && (
          <p className="text-xs text-yellow-400">
            Todos los proveedores ya están vinculados a este producto.
          </p>
        )}
      </div>

      {/* Precio + Moneda */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Precio unitario"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.precio?.message}
          {...register("precio", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Moneda</label>
          <select
            {...register("moneda")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60"
          >
            <option value="USD" className="bg-[#111827]">USD — Dólar</option>
            <option value="CNY" className="bg-[#111827]">CNY — Yuan</option>
            <option value="EUR" className="bg-[#111827]">EUR — Euro</option>
          </select>
        </div>
      </div>

      {/* MOQ */}
      <Input
        label="MOQ (cantidad mínima)"
        type="number"
        min="1"
        placeholder="Ej: 100"
        error={errors.moq?.message}
        hint="Minimum Order Quantity"
        {...register("moq", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
      />

      {/* Características específicas del proveedor */}
      <Textarea
        label="Características del proveedor"
        placeholder="Especificaciones particulares de este proveedor para este producto..."
        rows={3}
        error={errors.caracteristicas?.message}
        {...register("caracteristicas")}
      />

      {/* Notas */}
      <Textarea
        label="Notas"
        placeholder="Observaciones, condiciones de pago, plazos de entrega..."
        rows={3}
        error={errors.notas?.message}
        {...register("notas")}
      />

      {serverError && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
          {esEdicion ? "Guardar cambios" : "Vincular proveedor"}
        </Button>
      </div>
    </form>
  );
}
