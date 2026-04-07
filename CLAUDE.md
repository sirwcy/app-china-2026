# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

## Proyecto

**App China 2026 — Sistema de Gestión Captación de Precios**

Aplicación web responsive (móvil, tablet, escritorio) que funciona como agente de compras en China. Permite registrar productos con múltiples proveedores y analizar comparativamente precio, MOQ y características entre proveedores del mismo producto.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** para estilos responsive (mobile-first)
- **Prisma + SQLite** como base de datos local
- **react-simple-maps** para el mapa interactivo de China
- **Zustand** para estado global
- **React Hook Form + Zod** para formularios y validación

## Comandos

```bash
npm run dev               # Servidor de desarrollo
npm run build             # Build de producción
npm run lint              # Linter
npx prisma migrate dev    # Aplicar migraciones de BD
npx prisma studio         # Interfaz visual de la base de datos
npx prisma generate       # Regenerar cliente Prisma
```

## Arquitectura

### Modelo de datos (Prisma)

Cuatro modelos en `prisma/schema.prisma`:

- **Producto**: `nombreLargo`, `nombreCorto`, `material`, `caracteristicas`
- **Proveedor**: `nombreEmpresa`, `nombreContacto`, `nroLicencia`, `nroWechat`, `nroWhatsapp`
- **ProductoProveedor** (tabla pivote N:M): `precio`, `moneda`, `moq`, `notas`, `caracteristicas` — permite que un mismo producto tenga datos distintos por proveedor
- **FotoProveedor**: `url`, `descripcion` — fotos de documentación vinculadas a un proveedor

### Rutas (App Router)

```
/                    → Mapa interactivo de China (pantalla principal)
/productos           → Lista y gestión de productos
/productos/[id]      → Detalle de producto con sus proveedores
/proveedores         → Lista y gestión de proveedores
/proveedores/[id]    → Detalle de proveedor con fotos y productos
/analisis            → Comparativa de proveedores por producto (precio, MOQ, factibilidad)
```

### Rutas API

```
/api/productos       → CRUD productos
/api/proveedores     → CRUD proveedores
/api/relaciones      → CRUD ProductoProveedor (precio, MOQ, características)
```

## Flujo de trabajo

### Commit + Push automático

Después de completar cualquier bloque de cambios significativos (nuevas funcionalidades, correcciones, actualizaciones de esquema, nuevos componentes), hacer `git add` + `git commit` + `git push` de forma automática **sin esperar que el usuario lo solicite**. Esto dispara el deploy automático en Netlify.

### Decisiones de diseño

- La relación **ProductoProveedor** es el núcleo del sistema: concentra precio, MOQ y características diferenciales por proveedor para cada producto.
- Las **fotos de proveedores** se almacenan físicamente en `/public/uploads/` y su ruta relativa se guarda en la tabla `FotoProveedor`.
- El cliente Prisma se instancia como singleton en `lib/prisma.ts` para evitar múltiples conexiones en desarrollo.
- El mapa de la portada usa `react-simple-maps` con carga dinámica (`dynamic` + `ssr: false`) para evitar errores de hidratación.
- Los tipos de `react-simple-maps` se declaran manualmente en `types/react-simple-maps.d.ts`.
