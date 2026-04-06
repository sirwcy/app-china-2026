-- CreateTable
CREATE TABLE "etiquetas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "producto_etiqueta" (
    "productoId" INTEGER NOT NULL,
    "etiquetaId" INTEGER NOT NULL,

    PRIMARY KEY ("productoId", "etiquetaId"),
    CONSTRAINT "producto_etiqueta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "producto_etiqueta_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "etiquetas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_key" ON "etiquetas"("nombre");
