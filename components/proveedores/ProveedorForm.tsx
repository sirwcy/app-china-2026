"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { proveedorSchema, type ProveedorFormData } from "@/lib/validations/proveedor";
import { crearProveedor, actualizarProveedor } from "@/lib/actions/proveedores";
import { buscarCodigoPostal, getCoordsParaZona, calcularDistanciaKm, GUANGZHOU_COORDS, YIWU_COORDS } from "@/lib/china-postal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import OcrButton from "@/components/ui/OcrButton";
import PhoneInput from "@/components/ui/PhoneInput";
import { MapPin, Map } from "lucide-react";

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
  distrito?: string | null;
  distanciaGuangzhou?: number | null;
  tiempoVueloGuangzhou?: string | null;
  distanciaYiwu?: number | null;
  tiempoVueloYiwu?: string | null;
}

interface NuevoProveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
}

interface ProveedorFormProps {
  proveedor?: ProveedorConDatos;
  onSuccess: (nuevo?: NuevoProveedor) => void;
  onCancel: () => void;
}

function MapaUbicacion({ lat, lng, ciudad, provincia }: { lat: number | null | undefined; lng: number | null | undefined; ciudad?: string; provincia?: string }) {
  if (!lat || !lng) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border border-white/10 bg-white/[0.02] text-gray-600">
        <Map size={28} />
        <p className="text-xs text-center">Complete el código postal para<br />ver la ubicación aproximada</p>
      </div>
    );
  }
  const url = `https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed&hl=es`;
  const urlExterno = `https://www.google.com/maps?q=${lat},${lng}&z=12`;
  const label = [ciudad, provincia].filter(Boolean).join(" — ");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Map size={13} className="text-[#FFDE00]" />
        <span className="text-xs text-gray-400">Referencia aproximada{label ? `: ${label}` : ""}</span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-white/10">
        <iframe
          src={url}
          className="w-full h-56"
          title="Mapa de ubicación"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={urlExterno}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#07090f]/80 backdrop-blur-sm border border-white/15 text-xs text-gray-300 hover:text-white hover:border-white/30 transition-all"
        >
          <Map size={11} />
          Abrir en Google Maps ↗
        </a>
      </div>
    </div>
  );
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
      distrito: proveedor?.distrito ?? "",
      distanciaGuangzhou: proveedor?.distanciaGuangzhou ?? null as number | null,
      tiempoVueloGuangzhou: proveedor?.tiempoVueloGuangzhou ?? "",
      distanciaYiwu: proveedor?.distanciaYiwu ?? null as number | null,
      tiempoVueloYiwu: proveedor?.tiempoVueloYiwu ?? "",
    },
  });

  const codigoPostal = watch("codigoPostal");
  const latActual = watch("lat");
  const lngActual = watch("lng");
  const ciudadActual = watch("ciudad");
  const provinciaActual = watch("provincia");

  useEffect(() => {
    const codigo = (codigoPostal ?? "").replace(/\D/g, "");

    // Si el código postal fue borrado, limpiar todos los campos derivados
    if (codigo.length < 2) {
      setValue("provincia", "", { shouldDirty: true });
      setValue("ciudad", "", { shouldDirty: true });
      setValue("distrito", "", { shouldDirty: true });
      setValue("lat", null, { shouldDirty: true });
      setValue("lng", null, { shouldDirty: true });
      setValue("distanciaGuangzhou", null, { shouldDirty: true });
      setValue("tiempoVueloGuangzhou", "", { shouldDirty: true });
      setValue("distanciaYiwu", null, { shouldDirty: true });
      setValue("tiempoVueloYiwu", "", { shouldDirty: true });
      return;
    }

    const zona = buscarCodigoPostal(codigo);
    if (!zona) return;

    // Siempre rellenar provincia
    setValue("provincia", `${zona.provincia} (${zona.provinciaZh})`, { shouldDirty: true });

    // Ciudad: rellenar si hay 4+ dígitos
    if (codigo.length >= 4 && zona.ciudad) {
      setValue("ciudad", `${zona.ciudad}${zona.ciudadZh ? ` (${zona.ciudadZh})` : ""}`, { shouldDirty: true });
    }

    // Distrito: rellenar si hay 5+ dígitos y se encontró
    if (codigo.length >= 5 && zona.distrito) {
      setValue("distrito", zona.distrito, { shouldDirty: true });
    }

    // Coords y distancias: calcular con 4+ dígitos
    if (codigo.length >= 4) {
      const coords = getCoordsParaZona(zona);
      if (coords) {
        setValue("lat", coords.lat, { shouldDirty: true });
        setValue("lng", coords.lng, { shouldDirty: true });

        // Distancias en km usando Haversine
        const distGZ = calcularDistanciaKm(coords.lat, coords.lng, GUANGZHOU_COORDS.lat, GUANGZHOU_COORDS.lng);
        const distYW = calcularDistanciaKm(coords.lat, coords.lng, YIWU_COORDS.lat, YIWU_COORDS.lng);
        setValue("distanciaGuangzhou", distGZ, { shouldDirty: true });
        setValue("distanciaYiwu", distYW, { shouldDirty: true });

        // Tiempo de vuelo estimado: velocidad crucero ~850 km/h + 1h de maniobras
        const vueloHorasGZ = distGZ / 850 + 1;
        const vueloHorasYW = distYW / 850 + 1;
        const formatVuelo = (h: number) => {
          if (h < 1.5) return "~1h";
          const horas = Math.floor(h);
          const mins = Math.round((h - horas) * 60 / 15) * 15;
          return mins > 0 ? `~${horas}h ${mins}min` : `~${horas}h`;
        };
        setValue("tiempoVueloGuangzhou", formatVuelo(vueloHorasGZ), { shouldDirty: true });
        setValue("tiempoVueloYiwu", formatVuelo(vueloHorasYW), { shouldDirty: true });
      }
    }
  }, [codigoPostal, setValue]);

  async function onSubmit(data: ProveedorFormData) {
    setServerError(null);
    try {
      if (esEdicion) {
        await actualizarProveedor(proveedor.id, data);
        onSuccess();
      } else {
        const nuevo = await crearProveedor(data);
        onSuccess({ id: nuevo.id, nombreEmpresa: nuevo.nombreEmpresa, nombreContacto: nuevo.nombreContacto });
      }
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

        {/* Código postal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Código postal chino</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Ej: 510000"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20 font-mono tracking-widest"
            {...register("codigoPostal")}
            onChange={(e) => {
              const filtered = e.target.value.replace(/\D/g, "").slice(0, 6);
              e.target.value = filtered;
              setValue("codigoPostal", filtered, { shouldDirty: true, shouldValidate: false });
            }}
          />
          <p className="text-xs text-gray-600">
            6 dígitos — al completarlo se rellena provincia, ciudad, distrito y distancias automáticamente
          </p>
        </div>

        {/* Provincia, Ciudad, Distrito */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Provincia</label>
            <input
              placeholder="Auto-relleno"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
              {...register("provincia")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Ciudad</label>
            <input
              placeholder="Auto-relleno"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
              {...register("ciudad")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Distrito</label>
            <input
              placeholder="Ej: Tianhe, Baiyun..."
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
              {...register("distrito")}
            />
          </div>
        </div>

        {/* Mapa */}
        <MapaUbicacion
          lat={latActual}
          lng={lngActual}
          ciudad={ciudadActual?.split(" (")[0]}
          provincia={provinciaActual?.split(" (")[0]}
        />

        <Input
          label="Dirección / Referencia"
          placeholder="Ej: Mercado Yiwu, Distrito 2, Piso 3, Stand 42"
          error={errors.direccion?.message}
          hint="Referencia textual para identificar el lugar"
          {...register("direccion")}
        />
      </div>

      {/* ─── Distancias de referencia ──────────────────────────── */}
      <div className="border-t border-white/8 pt-4 flex flex-col gap-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          Distancias de referencia
        </p>

        {/* Guangzhou */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
            <span className="text-base">🏙️</span> Desde Guangzhou
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Distancia (km)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 1200"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
                {...register("distanciaGuangzhou", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Tiempo vuelo</label>
              <input
                type="text"
                placeholder="Ej: 2h 30min"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
                {...register("tiempoVueloGuangzhou")}
              />
            </div>
          </div>
        </div>

        {/* Yiwu */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
            <span className="text-base">🏙️</span> Desde Yiwu
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Distancia (km)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 800"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
                {...register("distanciaYiwu", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Tiempo vuelo</label>
              <input
                type="text"
                placeholder="Ej: 1h 45min"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DE2910]/60 focus:border-[#DE2910]/60 hover:border-white/20"
                {...register("tiempoVueloYiwu")}
              />
            </div>
          </div>
        </div>
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
