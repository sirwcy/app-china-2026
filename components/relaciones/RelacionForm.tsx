"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { relacionSchema, type RelacionFormData } from "@/lib/validations/relacion";
import { vincularProveedor, actualizarRelacion } from "@/lib/actions/relaciones";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
}

interface PrecioExistente {
  id: number;
  precio: number;
  moq: number;
}

interface RelacionExistente {
  id: number;
  proveedorId: number;
  moneda: string;
  notas: string | null;
  caracteristicas: string | null;
  precios: PrecioExistente[];
}

interface RelacionFormProps {
  productoId: number;
  proveedores: Proveedor[];
  proveedoresVinculadosIds: number[];
  relacion?: RelacionExistente;
  onSuccess: () => void;
  onCancel: () => void;
  onCrearProveedor?: () => void;
}

export default function RelacionForm({
  productoId,
  proveedores,
  proveedoresVinculadosIds,
  relacion,
  onSuccess,
  onCancel,
  onCrearProveedor,
}: RelacionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const esEdicion = !!relacion;

  const proveedoresDisponibles = esEdicion
    ? proveedores
    : proveedores.filter((p) => !proveedoresVinculadosIds.includes(p.id));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RelacionFormData>({
    resolver: zodResolver(relacionSchema),
    defaultValues: {
      proveedorId: relacion?.proveedorId ?? undefined,
      moneda: (relacion?.moneda as "USD" | "CNY" | "EUR") ?? "USD",
      precios: relacion?.precios?.length
        ? relacion.precios.map((p) => ({ id: p.id, precio: p.precio, moq: p.moq }))
        : [{ precio: undefined as unknown as number, moq: undefined as unknown as number }],
      notas: relacion?.notas ?? "",
      caracteristicas: relacion?.caracteristicas ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "precios" });

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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Proveedor <span className="text-[#DE2910] ml-1">*</span>
          </label>
          {!esEdicion && onCrearProveedor && (
            <button
              type="button"
              onClick={onCrearProveedor}
              className="text-xs text-[#FFDE00] hover:text-[#FFDE00]/80 transition-colors flex items-center gap-1"
            >
              <Plus size={11} />
              Nuevo proveedor
            </button>
          )}
        </div>
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
          <p className="text-xs text-yellow-400">Todos los proveedores ya están vinculados.</p>
        )}
      </div>

      {/* Moneda */}
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

      {/* Precios por MOQ */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-300">Precios por cantidad (MOQ)</label>
            <p className="text-xs text-gray-600 mt-0.5">Cada precio corresponde a una cantidad mínima de pedido</p>
          </div>
          <button
            type="button"
            onClick={() => append({ precio: undefined as unknown as number, moq: undefined as unknown as number })}
            className="flex items-center gap-1 text-xs text-[#FFDE00] hover:text-[#FFDE00]/80 transition-colors px-2 py-1 rounded border border-[#FFDE00]/20 hover:border-[#FFDE00]/40"
          >
            <Plus size={12} />
            Agregar precio
          </button>
        </div>

        {errors.precios?.root && (
          <p className="text-xs text-red-400">{errors.precios.root.message}</p>
        )}
        {typeof errors.precios?.message === "string" && (
          <p className="text-xs text-red-400">{errors.precios.message}</p>
        )}

        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start p-3 rounded-lg bg-white/[0.03] border border-white/8">
              <div className="flex-1 grid grid-cols-2 gap-2">
                {/* Precio */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">
                    Precio <span className="text-[#DE2910]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60"
                    {...register(`precios.${index}.precio`, { valueAsNumber: true })}
                  />
                  {errors.precios?.[index]?.precio && (
                    <p className="text-xs text-red-400">{errors.precios[index]?.precio?.message}</p>
                  )}
                </div>
                {/* MOQ */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">
                    MOQ <span className="text-[#DE2910]">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Ej: 100"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60"
                    {...register(`precios.${index}.moq`, { valueAsNumber: true })}
                  />
                  {errors.precios?.[index]?.moq && (
                    <p className="text-xs text-red-400">{errors.precios[index]?.moq?.message}</p>
                  )}
                </div>
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-5 p-1.5 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

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
        placeholder="Condiciones de pago, plazos de entrega, observaciones..."
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
