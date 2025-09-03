"use client";

import { useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/shared/routes";
import { useAuth } from "@/features/auth/authcontext";

const titles: Record<string, string> = {
  [routes.dashboard.main]: "Dashboard",
  [routes.dashboard.users]: "Usuarios",
  [routes.dashboard.roles]: "Roles",
  [routes.dashboard.purchases]: "Compras",
  [routes.dashboard.purchasesOrders]: "Órdenes de Compras",
  [routes.dashboard.purchasesGraph]: "Listado de Compras",
  [routes.dashboard.services]: "Servicios",
  [routes.dashboard.newService]: "Nuevo Servicio",
  [routes.dashboard.clients]: "Clientes",
  [routes.dashboard.newClient]: "Nuevo Cliente",
  [routes.dashboard.settings]: "Configuración",
  [routes.dashboard.products]: "Productos",
  [routes.dashboard.productsCategories]: "Categorías de Productos",
  [routes.dashboard.suppliers]: "Proveedores",
};

type TopNavProps = {
  logoutRedirectTo?: string;
  fallbackUserName?: string;
};

const TopNav = ({
  logoutRedirectTo = "/auth/login",
  fallbackUserName = "Usuario",
}: TopNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const currentTitle =
    titles[pathname] || // exact match
    Object.entries(titles)
      .sort((a, b) => b[0].length - a[0].length) // rutas largas primero
      .find(([path]) => pathname.startsWith(path))?.[1] ||
    "Dashboard";

  async function handleLogout() {
    try {
      setLoading(true);
      logout(); // limpia contexto + localStorage (según AuthContext que te entregué)
      router.replace(logoutRedirectTo);
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="bg-white shadow flex items-center justify-between px-6 py-3">
      <h1 className="text-2xl font-bold text-red-800">{currentTitle}</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-700 truncate max-w-[200px]">
          {user?.name ?? fallbackUserName}
        </span>
        <UserCircle className="w-8 h-8 text-gray-600" />

        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-red-700 hover:text-red-900 flex items-center gap-1 disabled:opacity-60"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          {loading ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
};

export default TopNav;
