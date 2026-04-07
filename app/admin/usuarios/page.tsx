import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/AppLayout";
import UsuariosCliente from "@/components/admin/UsuariosCliente";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.rol !== "ADMIN") redirect("/");

  const usuarios = await prisma.usuario.findMany({
    orderBy: { creadoEn: "asc" },
    select: {
      id: true,
      nombreCorto: true,
      nombreCompleto: true,
      empresa: true,
      nroWhatsapp: true,
      nroWechat: true,
      rol: true,
      creadoEn: true,
    },
  });

  return (
    <AppLayout>
      <UsuariosCliente
        usuarios={usuarios.map((u) => ({ ...u, creadoEn: u.creadoEn.toISOString() }))}
        currentUserId={session.id}
      />
    </AppLayout>
  );
}
