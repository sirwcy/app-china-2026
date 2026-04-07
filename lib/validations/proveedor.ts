import { z } from "zod";

export const proveedorSchema = z.object({
  nombreEmpresa: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  nombreContacto: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  nroLicencia: z.string().max(60).optional().nullable().or(z.literal("")),
  nroWechat: z.string().max(60).optional().nullable().or(z.literal("")),
  nroWhatsapp: z.string().max(30).optional().nullable().or(z.literal("")),
  direccion: z.string().max(200).optional().nullable().or(z.literal("")),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  codigoPostal: z.string().max(6).optional().nullable().or(z.literal("")),
  provincia: z.string().max(100).optional().nullable().or(z.literal("")),
  ciudad: z.string().max(100).optional().nullable().or(z.literal("")),
  distrito: z.string().max(100).optional().nullable().or(z.literal("")),
  distanciaGuangzhou: z.number().optional().nullable(),
  tiempoVueloGuangzhou: z.string().max(50).optional().nullable().or(z.literal("")),
  distanciaYiwu: z.number().optional().nullable(),
  tiempoVueloYiwu: z.string().max(50).optional().nullable().or(z.literal("")),
});

export type ProveedorFormData = z.infer<typeof proveedorSchema>;
