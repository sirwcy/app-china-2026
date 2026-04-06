import { z } from "zod";

export const relacionSchema = z.object({
  proveedorId: z.number().int().positive("Seleccioná un proveedor"),
  precio: z.number().positive("Debe ser mayor a 0").optional().nullable(),
  moneda: z.enum(["USD", "CNY", "EUR"]).default("USD"),
  moq: z.number().int().positive("Debe ser mayor a 0").optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
  caracteristicas: z.string().max(1000).optional().nullable(),
});

export type RelacionFormData = z.infer<typeof relacionSchema>;
