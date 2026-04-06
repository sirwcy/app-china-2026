"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productoSchema, type ProductoFormData } from "@/lib/validations/producto";
import { crearProducto, actualizarProducto } from "@/lib/actions/productos";
import { crearCategoria, crearSubcategoria, crearMaterial, actualizarCategoria, actualizarSubcategoria, actualizarMaterial } from "@/lib/actions/categorias";
import { crearEtiqueta } from "@/lib/actions/etiquetas";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import CreatableSelect, { type SelectOption } from "@/components/ui/CreatableSelect";
import { useState } from "react";

interface SubcategoriaOption extends SelectOption {
  categoriaId: number;
}

interface EtiquetaOption extends SelectOption {
  color: string;
}

interface ProductoConRelaciones {
  id: number;
  nombreLargo: string;
  nombreCorto: string;
  caracteristicas: string | null;
  materialId: number | null;
  categoriaId: number | null;
  subcategoriaId: number | null;
  etiquetaIds?: number[];
}

interface ProductoFormProps {
  producto?: ProductoConRelaciones;
  categorias: SelectOption[];
  subcategorias: SubcategoriaOption[];
  materiales: SelectOption[];
  etiquetas: EtiquetaOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductoForm({
  producto,
  categorias: categoriasProp,
  subcategorias: subcategoriasProp,
  materiales: materialesProp,
  etiquetas: etiquetasProp,
  onSuccess,
  onCancel,
}: ProductoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  // Listas locales que se actualizan al crear nuevas opciones
  const [categorias, setCategorias] = useState<SelectOption[]>(categoriasProp);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaOption[]>(subcategoriasProp);
  const [materiales, setMateriales] = useState<SelectOption[]>(materialesProp);
  const [etiquetas, setEtiquetas] = useState<EtiquetaOption[]>(etiquetasProp);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<number[]>(
    producto?.etiquetaIds ?? []
  );

  const esEdicion = !!producto;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombreLargo: producto?.nombreLargo ?? "",
      nombreCorto: producto?.nombreCorto ?? "",
      caracteristicas: producto?.caracteristicas ?? "",
      materialId: producto?.materialId ?? null,
      categoriaId: producto?.categoriaId ?? null,
      subcategoriaId: producto?.subcategoriaId ?? null,
      etiquetaIds: producto?.etiquetaIds ?? [],
    },
  });

  const categoriaSeleccionada = watch("categoriaId");

  // Subcategorías filtradas por la categoría seleccionada
  const subcategoriasFiltradas = subcategorias.filter(
    (s) => s.categoriaId === categoriaSeleccionada
  );

  async function handleEditarCategoria(id: number, nombre: string) {
    await actualizarCategoria(id, nombre);
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nombre } : c)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  }

  async function handleEditarSubcategoria(id: number, nombre: string) {
    await actualizarSubcategoria(id, nombre);
    setSubcategorias((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nombre } : s)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  }

  async function handleEditarMaterial(id: number, nombre: string) {
    await actualizarMaterial(id, nombre);
    setMateriales((prev) =>
      prev.map((m) => (m.id === id ? { ...m, nombre } : m)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  }

  async function handleCrearCategoria(nombre: string): Promise<SelectOption> {
    const nueva = await crearCategoria(nombre);
    setCategorias((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    // Limpiar subcategoría al cambiar de categoría
    setValue("subcategoriaId", null);
    return nueva;
  }

  async function handleCrearSubcategoria(nombre: string): Promise<SelectOption> {
    if (!categoriaSeleccionada) throw new Error("Seleccioná una categoría primero");
    const nueva = await crearSubcategoria(nombre, categoriaSeleccionada);
    const nuevaConCat: SubcategoriaOption = { ...nueva, categoriaId: categoriaSeleccionada };
    setSubcategorias((prev) =>
      [...prev, nuevaConCat].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    return nueva;
  }

  async function handleCrearMaterial(nombre: string): Promise<SelectOption> {
    const nuevo = await crearMaterial(nombre);
    setMateriales((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return nuevo;
  }

  async function handleCrearEtiqueta(nombre: string): Promise<SelectOption> {
    const nueva = await crearEtiqueta(nombre);
    setEtiquetas((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return nueva;
  }

  function toggleEtiqueta(id: number) {
    setEtiquetasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function onSubmit(data: ProductoFormData) {
    setServerError(null);
    try {
      if (esEdicion) {
        await actualizarProducto(producto.id, { ...data, etiquetaIds: etiquetasSeleccionadas });
      } else {
        await crearProducto({ ...data, etiquetaIds: etiquetasSeleccionadas });
      }
      onSuccess();
    } catch {
      setServerError("Ocurrió un error. Intenta nuevamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nombres */}
      <Input
        label="Nombre corto"
        placeholder="Ej: Silla ergonómica"
        required
        error={errors.nombreCorto?.message}
        hint="Máx. 40 caracteres — aparece en listados y badges"
        {...register("nombreCorto")}
      />

      <Input
        label="Nombre largo / descripción"
        placeholder="Ej: Silla de oficina ergonómica con soporte lumbar ajustable"
        required
        error={errors.nombreLargo?.message}
        {...register("nombreLargo")}
      />

      {/* Clasificación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="categoriaId"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              label="Categoría"
              options={categorias}
              value={field.value ?? null}
              onChange={(id) => {
                field.onChange(id);
                setValue("subcategoriaId", null); // reset al cambiar categoría
              }}
              onCreateOption={handleCrearCategoria}
              onEditOption={handleEditarCategoria}
              placeholder="Seleccionar categoría..."
              error={errors.categoriaId?.message}
            />
          )}
        />

        <Controller
          name="subcategoriaId"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              label="Subcategoría"
              options={subcategoriasFiltradas}
              value={field.value ?? null}
              onChange={field.onChange}
              onCreateOption={handleCrearSubcategoria}
              onEditOption={handleEditarSubcategoria}
              placeholder={
                categoriaSeleccionada
                  ? "Seleccionar subcategoría..."
                  : "Primero elegí una categoría"
              }
              disabled={!categoriaSeleccionada}
              error={errors.subcategoriaId?.message}
            />
          )}
        />
      </div>

      {/* Material */}
      <Controller
        name="materialId"
        control={control}
        render={({ field }) => (
          <CreatableSelect
            label="Material principal"
            options={materiales}
            value={field.value ?? null}
            onChange={field.onChange}
            onCreateOption={handleCrearMaterial}
            onEditOption={handleEditarMaterial}
            placeholder="Ej: Aluminio, Plástico ABS, Tela mesh..."
            error={errors.materialId?.message}
          />
        )}
      />

      {/* Características */}
      <Textarea
        label="Características"
        placeholder="Especificaciones técnicas, dimensiones, colores disponibles, certificaciones..."
        rows={4}
        error={errors.caracteristicas?.message}
        {...register("caracteristicas")}
      />

      {/* Etiquetas */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Etiquetas</label>
          <button
            type="button"
            onClick={async () => {
              const nombre = window.prompt("Nombre de la nueva etiqueta:");
              if (nombre?.trim()) {
                const nueva = await handleCrearEtiqueta(nombre.trim());
                setEtiquetasSeleccionadas((prev) => [...prev, nueva.id]);
              }
            }}
            className="text-xs text-[#DE2910] hover:underline"
          >
            + Nueva etiqueta
          </button>
        </div>
        {etiquetas.length === 0 ? (
          <p className="text-xs text-gray-600 italic">No hay etiquetas creadas aún.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {etiquetas.map((e) => {
              const activa = etiquetasSeleccionadas.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEtiqueta(e.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    activa
                      ? "bg-[#DE2910]/20 border-[#DE2910]/60 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {activa ? "✓ " : ""}{e.nombre}
                </button>
              );
            })}
          </div>
        )}
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
          {esEdicion ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
