import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIPCH — Gestión de Importaciones desde China",
  description: "Sistema profesional de agente de compras en China — gestión y análisis de proveedores, precios y MOQ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#07090f] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
