import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Gestión Captación de Precios",
  description: "Agente de compras en China — gestión y análisis de proveedores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0d1117] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
