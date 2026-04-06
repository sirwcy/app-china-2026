/*
  Warnings:

  - You are about to drop the column `material` on the `productos` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "materiales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreLargo" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "materialId" INTEGER,
    "caracteristicas" TEXT,
    "categoriaId" INTEGER,
    "subcategoriaId" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "productos_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiales" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "subcategorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_productos" ("actualizadoEn", "caracteristicas", "categoriaId", "creadoEn", "id", "nombreCorto", "nombreLargo", "subcategoriaId") SELECT "actualizadoEn", "caracteristicas", "categoriaId", "creadoEn", "id", "nombreCorto", "nombreLargo", "subcategoriaId" FROM "productos";
DROP TABLE "productos";
ALTER TABLE "new_productos" RENAME TO "productos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "materiales_nombre_key" ON "materiales"("nombre");
