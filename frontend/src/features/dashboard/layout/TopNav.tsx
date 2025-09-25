"use client";

import { useState, useEffect, useRef } from "react";
import { UserCircle, LogOut, Pencil } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/shared/routes";
import { useAuth } from "@/features/auth/authcontext";
import { useLoader } from "@/shared/components/loader";
import ProfileModal from "@/features/auth/porfile/porfilemodal";

// 🔹 Tipado de rutas con títulos
const titles: Record<string, string> = {
  [routes.dashboard.main]: "Dashboard",
  [routes.dashboard.users]: "Usuarios",
  [routes.dashboard.roles]: "Roles",
  [routes.dashboard.purchases]: "Compras",
  [routes.dashboard.purchasesOrders]: "Órdenes de Compras",
  [routes.dashboard.purchasesGraph]: "Gráficas de Compras",
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
  [routes.dashboard.ordersServices]: "Órdenes de Servicio",
  [routes.dashboard.appointments]: "Citas",
};

type TopNavProps = {
  logoutRedirectTo?: string;
  fallbackUserName?: string;
};

// 🔹 Opcional: tipar al usuario de tu contexto (ajústalo si en tu auth tienes otros campos)
interface AuthUser {
  name?: string;
}

export default function TopNav({
  logoutRedirectTo = "/auth/access",
  fallbackUserName = "Usuario",
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth() as {
    user: AuthUser | null;
    logout: () => void;
  };
  const { showLoader, hideLoader } = useLoader();


  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuProfileOpen, setMenuProfileOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Detectar título actual por ruta
  const currentTitle =
    titles[pathname] ||
    Object.entries(titles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ||
    "Dashboard";

  // 🔹 Efecto para animación de escritura
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const id = setInterval(() => {
      if (i < currentTitle.length) {
        setDisplayedText(currentTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(id);
      }
    }, 80);
    return () => clearInterval(id);
  }, [currentTitle]);

  // 🔹 Prefetch para que el logout sea más rápido
  useEffect(() => {
    router.prefetch(logoutRedirectTo);
  }, [router, logoutRedirectTo]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuProfileOpen) return;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setMenuProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuProfileOpen]);

  useEffect(() => {
    hideLoader();
  }, [pathname, hideLoader]);

  // 🔹 Logout con loader
  const handleLogout = async () => {
    setMenuProfileOpen(false);
    setLoading(true);
    showLoader();
    try {
      await logout();
      router.replace(logoutRedirectTo);
    } finally {
      setLoading(false);
      hideLoader();
      setTimeout(hideLoader, 250);
    }
  };

  const handleOpenProfile = () => {
    setMenuProfileOpen(false);
    setProfileOpen(true);
  };

  return (
    <header className="bg-white shadow-[0_6px_10px_-1px_rgba(0,0,0,0.25)] px-8 py-3 flex items-center justify-between relative">
      {/* Título animado */}
      <h1 className="text-xl md:text-4xl font-bold text-red-800 truncate pl-5 pb-2">
        {displayedText}
      </h1>

      {/* Botón de menú en móvil */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-gray-700"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    <header className="bg-white shadow-[0_6px_10px_-1px_rgba(0,0,0,0.25)] px-4 md:px-8 py-3 flex items-center justify-between relative">
      <h1 className="text-xl md:text-4xl font-bold text-red-800 truncate pl-2 md:pl-5">
        {displayedText}
      </h1>

      {/* Opciones en escritorio */}
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setMenuProfileOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuProfileOpen}
          className="flex items-center gap-3 rounded-full px-3 py-1 border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:bg-gray-100/70 transition"
        >
          <span className="hidden md:block text-gray-700 max-w-[180px] truncate">
            {user?.name ?? fallbackUserName}
          </span>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <UserCircle className="w-9 h-9 md:w-10 md:h-10 text-gray-600" />
          )}
        </button>

        {menuProfileOpen && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium truncate">
                {user?.name ?? fallbackUserName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

      {/* Menú en móvil */}
            <button
              onClick={handleOpenProfile}
              role="menuitem"
              className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-gray-50"
            >
              <Pencil size={16} />
              Editar perfil
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              role="menuitem"
              className="w-full text-left px-4 py-3 flex items-center gap-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut size={16} />
              {loading ? "Saliendo…" : "Cerrar sesión"}
            </button>
          </div>
        )}
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
