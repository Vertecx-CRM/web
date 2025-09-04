"use client";

import { useState } from "react";
import { UserCircle, LogOut, Menu, X } from "lucide-react";
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
  [routes.dashboard.technicians]: "Técnicos",
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
  const [menuOpen, setMenuOpen] = useState(false);

  const currentTitle =
    titles[pathname] ||
    Object.entries(titles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ||
    "Dashboard";

  async function handleLogout() {
    try {
      setLoading(true);
      logout();
      router.replace(logoutRedirectTo);
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="bg-white shadow px-8 py-3 flex items-center justify-between relative">
      {/* Título */}
      <h1 className="text-xl md:text-2xl font-bold text-red-800 truncate">
        {currentTitle}
      </h1>

      {/* Botón hamburguesa en móvil */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-gray-700"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menú en desktop */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-gray-700 truncate max-w-[200px]">
          {user?.name ?? fallbackUserName}
        </span>
        <UserCircle className="w-8 h-8 text-gray-600" />

        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-red-700 hover:text-red-900 flex items-center gap-1 disabled:opacity-60"
        >
          <LogOut size={18} />
          {loading ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>

      {/* Menú desplegable en móvil */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-2 w-48 bg-white border rounded-lg shadow-md p-3 flex flex-col gap-3 md:hidden z-50">
          <div className="flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-gray-600" />
            <span className="text-gray-700 truncate">
              {user?.name ?? fallbackUserName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-red-700 hover:text-red-900 flex items-center gap-2 disabled:opacity-60"
          >
            <LogOut size={18} />
            {loading ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      )}
    </header>
  );
};

export default TopNav;
