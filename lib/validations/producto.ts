import { z } from "zod";

export const productoSchema = z.object({
  nombreLargo: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(200, "Máximo 200 caracteres"),
  nombreCorto: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(40, "Máximo 40 caracteres"),
  caracteristicas: z.string().max(1000).optional().or(z.literal("")),
  materialId: z.number().int().positive().optional().nullable(),
  categoriaId: z.number().int().positive().optional().nullable(),
  subcategoriaId: z.number().int().positive().optional().nullable(),
  etiquetaIds: z.array(z.number().int().positive()).optional().default([]),
  requiereMedidas: z.boolean().optional().default(false),
  ancho: z.number().positive().optional().nullable(),
  largo: z.number().positive().optional().nullable(),
  alto: z.number().positive().optional().nullable(),
  espesor: z.number().positive().optional().nullable(),
});

export type ProductoFormData = z.infer<typeof productoSchema>;
