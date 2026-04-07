"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { proveedorSchema, type ProveedorFormData } from "@/lib/validations/proveedor";
import { crearProveedor, actualizarProveedor } from "@/lib/actions/proveedores";
import { buscarCodigoPostal } from "@/lib/china-postal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import OcrButton from "@/components/ui/OcrButton";
import PhoneInput from "@/components/ui/PhoneInput";
import { MapPin } from "lucide-react";

interface ProveedorConDatos {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  nroLicencia: string | null;
  nroWechat: string | null;
  nroWhatsapp: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  codigoPostal?: string | null;
  provincia?: string | null;
  ciudad?: string | null;
}

interface ProveedorFormProps {
  proveedor?: ProveedorConDatos;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProveedorForm({ proveedor, onSuccess, onCancel }: ProveedorFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const esEdicion = !!proveedor;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombreEmpresa: proveedor?.nombreEmpresa ?? "",
      nombreContacto: proveedor?.nombreContacto ?? "",
      nroLicencia: proveedor?.nroLicencia ?? "",
      nroWechat: proveedor?.nroWechat ?? "",
      nroWhatsapp: proveedor?.nroWhatsapp ?? "",
      direccion: proveedor?.direccion ?? "",
      lat: proveedor?.lat ?? null,
      lng: proveedor?.lng ?? null,
      codigoPostal: proveedor?.codigoPostal ?? "",
      provincia: proveedor?.provincia ?? "",
      ciudad: proveedor?.ciudad ?? "",
    },
  });

  // Auto-fill province/city when postal code is complete
  const codigoPostal = watch("codigoPostal");
  useEffect(() => {
    const codigo = (codigoPostal ?? "").replace(/\D/g, "");
    if (codigo.length === 6) {
      const zona = buscarCodigoPostal(codigo);
      if (zona) {
        setValue("provincia", `${zona.provincia} (${zona.provinciaZh})`, { shouldDirty: true });
        setValue("ciudad", zona.ciudad ? `${zona.ciudad} (${zona.ciudadZh ?? ""})` : "", { shouldDirty: true });
      }
    }
  }, [codigoPostal, setValue]);

  async function onSubmit(data: ProveedorFormData) {
    setServerError(null);
    try {
      if (esEdicion) {
        await actualizarProveedor(proveedor.id, data);
      } else {
        await crearProveedor(data);
      }
      onSuccess();
    } catch {
      setServerError("Ocurrió un error. Intenta nuevamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      {/* Nombre empresa con OCR */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Nombre de la empresa <span className="text-[#DE2910]">*</span>
        </label>
        <div className="flex gap-2">
          <input
            placeholder="Ej: Guangzhou Textile Co."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
            {...register("nombreEmpresa")}
          />
          <OcrButton onText={(t) => setValue("nombreEmpresa", t, { shouldValidate: true })} />
        </div>
        {errors.nombreEmpresa && (
          <p className="text-xs text-red-400">{errors.nombreEmpresa.message}</p>
        )}
      </div>

      {/* Nombre contacto con OCR */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Nombre del contacto <span className="text-[#DE2910]">*</span>
        </label>
        <div className="flex gap-2">
          <input
            placeholder="Ej: Li Wei"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
            {...register("nombreContacto")}
          />
          <OcrButton onText={(t) => setValue("nombreContacto", t, { shouldValidate: true })} />
        </div>
        {errors.nombreContacto && (
          <p className="text-xs text-red-400">{errors.nombreContacto.message}</p>
        )}
      </div>

      <Input
        label="Nro. de licencia"
        placeholder="Ej: 91440101MA9XXXXXX"
        error={errors.nroLicencia?.message}
        hint="Licencia comercial del proveedor"
        {...register("nroLicencia")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="WeChat"
          placeholder="ID de WeChat"
          error={errors.nroWechat?.message}
          {...register("nroWechat")}
        />

        {/* WhatsApp con selector de código de país */}
        <Controller
          control={control}
          name="nroWhatsapp"
          render={({ field }) => (
            <PhoneInput
              label="WhatsApp"
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.nroWhatsapp?.message}
            />
          )}
        />
      </div>

      {/* ─── Ubicación ──────────────────────────────────────────── */}
      <div className="border-t border-white/8 pt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#FFDE00]" />
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Ubicación</p>
        </div>

        {/* Código postal + auto-fill */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Código postal chino
          </label>
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 flex-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Ej: 510000"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20 font-mono tracking-widest"
                {...register("codigoPostal", {
                  onChange: (e) => {
                    // Only allow digits
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  },
                })}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600">
            6 dígitos — al completarlo se rellena provincia y ciudad automáticamente
          </p>
          {errors.codigoPostal && (
            <p className="text-xs text-red-400">{errors.codigoPostal.message}</p>
          )}
        </div>

        {/* Provincia y ciudad (auto-filled, editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Provincia</label>
            <input
              placeholder="Se completa con el código postal"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
              {...register("provincia")}
            />
            {errors.provincia && (
              <p className="text-xs text-red-400">{errors.provincia.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Ciudad</label>
            <input
              placeholder="Se completa con el código postal"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
              {...register("ciudad")}
            />
            {errors.ciudad && (
              <p className="text-xs text-red-400">{errors.ciudad.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Dirección / Referencia"
          placeholder="Ej: Mercado Yiwu, Distrito 2, Piso 3, Stand 42"
          error={errors.direccion?.message}
          hint="Referencia textual para identificar el lugar"
          {...register("direccion")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitud"
            type="number"
            step="any"
            placeholder="Ej: 29.3236"
            error={errors.lat?.message}
            hint="-90 a 90"
            {...register("lat", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          <Input
            label="Longitud"
            type="number"
            step="any"
            placeholder="Ej: 120.0753"
            error={errors.lng?.message}
            hint="-180 a 180"
            {...register("lng", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
        </div>
        <p className="text-xs text-gray-600 -mt-2">
          En Google Maps: clic derecho → copiar coordenadas (lat, lng)
        </p>
      </div>

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
          {esEdicion ? "Guardar cambios" : "Crear proveedor"}
        </Button>
      </div>
    </form>
  );
}
