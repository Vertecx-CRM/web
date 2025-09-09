"use client";

import { useState, useEffect } from "react";
import { UserCircle, LogOut, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/shared/routes";
import { useAuth } from "@/features/auth/authcontext";
import { useLoader } from "@/shared/components/loader";

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
  [routes.dashboard.requestsServices]: "Solicitudes de Servicio",
  [routes.dashboard.ordersServices]: "Ordenes de Servicio",
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
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentTitle =
    titles[pathname] ||
    Object.entries(titles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ||
    "Dashboard";

  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentTitle.length) {
        setDisplayedText(currentTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [currentTitle]);

  const handleLogout = async () => {
    setLoading(true);
    showLoader();
    sessionStorage.setItem("__loader_min_until__", String(Date.now() + 900));
    try {
      await Promise.resolve(logout());
      router.replace(logoutRedirectTo);
      router.refresh();
    } catch {
      hideLoader();
      setLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-[0_6px_10px_-1px_rgba(0,0,0,0.25)] px-8 py-3 flex items-center justify-between relative">
      <h1 className="text-xl md:text-2xl font-bold text-red-800 truncate">
        {displayedText}
      </h1>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-gray-700"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden md:flex items-center gap-4">
        <span className="text-gray-700 truncate max-w-[200px]">
          {user?.name ?? fallbackUserName}
        </span>
        <UserCircle className="w-8 h-8 text-gray-600" />
        <button
          onClick={handleLogout}
          disabled={loading}
          className="cursor-pointer text-red-700 hover:text-red-900 flex items-center gap-1 disabled:opacity-60"
        >
          <LogOut size={18} />
          {loading ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>

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
            className="cursor-pointer text-red-700 hover:text-red-900 flex items-center gap-2 disabled:opacity-60"
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
