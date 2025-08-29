"use client";

import { UserCircle, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { routes } from "@/shared/routes";

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
};

const TopNav = () => {
  const pathname = usePathname();

  // Buscar el título según la ruta actual
  const currentTitle =
    Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] ||
    "Dashboard";

  return (
    <header className="bg-white shadow flex items-center justify-between px-6 py-3">
      <h1 className="text-2xl font-bold text-red-800">{currentTitle}</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-700">Joao Estid Ortiz Cuello</span>
        <UserCircle className="w-8 h-8 text-gray-600" />
        <button className="text-red-700 hover:text-red-900 flex items-center gap-1">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default TopNav;
