import { z } from "zod";

export const precioTierSchema = z.object({
  id: z.number().int().optional(), // undefined = nuevo, número = existente
  precio: z.number().positive("El precio debe ser mayor a 0"),
  moq: z.number().int().min(1, "El MOQ mínimo es 1"),
});

export const relacionSchema = z.object({
  proveedorId: z.number().int().positive("Seleccioná un proveedor"),
  moneda: z.enum(["USD", "CNY", "EUR"]).default("USD"),
  precios: z.array(precioTierSchema).min(1, "Agregá al menos un precio"),
  notas: z.string().max(500).optional().nullable(),
  caracteristicas: z.string().max(1000).optional().nullable(),
});

export type PrecioTier = z.infer<typeof precioTierSchema>;
export type RelacionFormData = z.infer<typeof relacionSchema>;
