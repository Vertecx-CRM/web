"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { UserCircle, LogOut, Pencil, Menu, X, Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { routes } from "@/shared/routes";
import { useAuth } from "@/features/auth/authcontext";
import ProfileModal from "@/features/auth/porfile/porfilemodal";

const titles: Record<string, string> = {
  [routes.dashboard.main]: "Dashboard",
  [routes.dashboard.users]: "Usuarios",
  [routes.dashboard.roles]: "Roles",
  [routes.dashboard.purchases]: "Compras",
  [routes.dashboard.purchasesOrders]: "Ordenes de Compras",
  [routes.dashboard.services]: "Servicios",
  [routes.dashboard.technicians]: "Tecnicos",
  [routes.dashboard.newService]: "Nuevo Servicio",
  [routes.dashboard.clients]: "Clientes",
  [routes.dashboard.newClient]: "Nuevo Cliente",
  [routes.dashboard.settings]: "Configuración",
  [routes.dashboard.products]: "Productos",
  [routes.dashboard.productsCategories]: "Categoría de Productos",
  [routes.dashboard.suppliers]: "Proveedores",
  [routes.dashboard.requestsServices]: "Solicitudes de Servicio",
  [routes.dashboard.ordersServices]: "Ordenes de Servicio",
  [routes.dashboard.orders]: "Órdenes de Servicio",
  [routes.dashboard.appointments]: "Citas",
  [routes.dashboard.sales]: "Ventas",
  [routes.dashboard.quotes]: "Cotizaciones",
};

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0D141C]/60 backdrop-blur-sm z-[9999]">
      <div className="w-12 h-12 border-4 border-[#B20000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function TopNav({
  logoutRedirectTo = "/auth/login",
  fallbackUserName = "Usuario",
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuProfileOpen, setMenuProfileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentTitle = useMemo(() => {
    return (
      titles[pathname] ||
      Object.entries(titles)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([path]) => pathname.startsWith(path))?.[1] ||
      "Gestión"
    );
  }, [pathname]);

  const display = useMemo(
    () => ({
      name: profile?.name ?? user?.name ?? "Ingeniero",
      email: profile?.email ?? user?.email ?? "",
      image: profile?.image ?? user?.image ?? "",
    }),
    [profile, user],
  );

  // Efecto de escritura para el título (más fluido)
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(currentTitle.slice(0, i + 1));
      i++;
      if (i >= currentTitle.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [currentTitle]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace(logoutRedirectTo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}

      <header className="bg-[#E8E8E8] border-b border-[#626262]/20 px-6 py-4 flex items-center justify-between sticky top-0 z-30 h-20">
        {/* Título con Estilo Técnico */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-[3px] bg-[#B20000] hidden md:block" />
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em] text-[#0D141C]">
            {displayedText}
            <span className="inline-block w-2 h-5 bg-[#B20000]/30 ml-1 animate-pulse" />
          </h1>
        </div>

        <div className="flex items-center gap-6">
         

          {/* Perfil del Usuario */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuProfileOpen(!menuProfileOpen)}
              className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-full transition-all duration-300 border ${
                menuProfileOpen
                  ? "bg-[#0D141C] border-[#0D141C] shadow-lg"
                  : "bg-white border-[#626262]/20 hover:border-[#B20000]/50"
              }`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-widest hidden md:block ml-2 ${
                  menuProfileOpen ? "text-white" : "text-[#0D141C]"
                }`}
              >
                {display.name}
              </span>

              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#B20000] bg-[#330101] flex items-center justify-center">
                {display.image ? (
                  <img
                    src={display.image}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle size={22} className="text-white" />
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-[#0D141C] rounded-xl shadow-2xl border border-[#626262]/40 overflow-hidden z-50"
                >
                  <div className="p-5 border-b border-[#626262]/40 bg-[#ffffff]/5">
                    <p className="text-[11px] font-black text-[#B20000] uppercase tracking-widest mb-1">
                      Sesión Iniciada
                    </p>
                    <p className="text-sm font-bold text-white truncate">
                      {display.name}
                    </p>
                    <p className="text-[10px] text-[#717680] truncate font-medium">
                      {display.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileOpen(true);
                        setMenuProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#d1d1d1] uppercase tracking-wider hover:bg-[#B20000] hover:text-white transition-all rounded-lg"
                    >
                      <Pencil size={14} />
                      Configurar Perfil
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#FF0000] uppercase tracking-wider hover:bg-[#FF0000]/10 transition-all rounded-lg mt-1"
                    >
                      <LogOut size={14} />
                      Finalizar Sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </header>
    </>
  );
}
