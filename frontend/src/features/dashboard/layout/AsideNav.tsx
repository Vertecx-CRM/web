"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Wrench,
  Truck,
  ChevronDown,
  Box,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { routes } from "@/shared/routes";
import { useAuth } from "@/features/auth/authcontext";
import { canViewModule, type AuthzModule } from "@/features/auth/authz";

// --- COMPONENTE: ITEM DE MENÚ ---
const MenuItem = React.memo(
  ({
    href,
    icon: Icon,
    label,
    isActive,
    onClick,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-6 py-4 transition-all duration-300 border-b border-gray-50 ${
        isActive
          ? "bg-gray-50 text-[#B22222]"
          : "text-gray-500 hover:text-black hover:bg-gray-100/50"
      }`}
    >
      {/* Indicador lateral activo */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 w-1 h-full bg-[#B22222]"
        />
      )}

      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span
        className={`text-[11px] font-black uppercase tracking-[0.15em] ${isActive ? "opacity-100" : "opacity-80"}`}
      >
        {label}
      </span>
    </Link>
  ),
);

MenuItem.displayName = "MenuItem";

// --- COMPONENTE: SUBMENÚ ---
const SubMenu = React.memo(
  ({
    parent,
    icon: Icon,
    label,
    childrenRoutes,
    pathname,
    openMenu,
    toggleMenu,
    items,
    setOpenMenu,
  }: {
    parent: string;
    icon: React.ElementType;
    label: string;
    childrenRoutes: string[];
    pathname: string;
    openMenu: string | null;
    toggleMenu: (menu: string) => void;
    items: { href: string; label: string }[];
    setOpenMenu: (menu: string | null) => void;
  }) => {
    const isActive = childrenRoutes.some((child) => pathname.startsWith(child));

    return (
      <div
        className="relative border-b border-gray-50"
        onMouseEnter={() => setOpenMenu(parent)}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <button
          onClick={() => toggleMenu(parent)}
          className={`cursor-pointer flex items-center justify-between w-full px-6 py-4 transition-colors ${
            isActive
              ? "bg-gray-50 text-[#B22222]"
              : "text-gray-500 hover:text-black hover:bg-gray-100/50"
          }`}
        >
          <span className="flex items-center gap-3">
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[11px] font-black uppercase tracking-[0.15em]">
              {label}
            </span>
          </span>
          <ChevronRight
            size={14}
            className={`transition-transform duration-300 ${openMenu === parent ? "rotate-90 text-[#B22222]" : ""}`}
          />
        </button>

        <AnimatePresence>
          {openMenu === parent && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute top-0 left-full z-[100] w-56 bg-white shadow-[15px_0_30px_rgba(0,0,0,0.1)] border border-gray-100"
            >
              <div className="bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest">
                Opciones de {label}
              </div>
              {items.map(({ href, label: itemLabel }) => {
                const isSubActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpenMenu(null)}
                    className={`block px-5 py-3 text-[10px] font-bold uppercase tracking-wider border-b border-gray-50 last:border-0 transition-colors ${
                      isSubActive
                        ? "text-[#B22222] bg-gray-50"
                        : "text-gray-500 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    {itemLabel}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

SubMenu.displayName = "SubMenu";

// --- COMPONENTE PRINCIPAL ---
const AsideNav = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const permissions = useMemo<string[]>(
    () => ((user as any)?.permissions || []) as string[],
    [user],
  );

  const canView = useCallback(
    (module: AuthzModule) => canViewModule(permissions, module),
    [permissions],
  );

  const toggleMenu = useCallback(
    (menu: string) => setOpenMenu(openMenu === menu ? null : menu),
    [openMenu],
  );

  const isLinkActive = useCallback(
    (href: string) => {
      if (href === routes.dashboard.main) return pathname === href;
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname],
  );

  const menuConfig = useMemo(
    () => [
      {
        type: "link" as const,
        href: routes.dashboard.main,
        label: "Dashboard",
        icon: LayoutGrid,
        module: "dashboard" as AuthzModule,
      },
      {
        type: "link" as const,
        href: routes.dashboard.users,
        label: "Usuarios",
        icon: Users,
        module: "users" as AuthzModule,
      },
      {
        type: "link" as const,
        href: routes.dashboard.roles,
        label: "Roles",
        icon: Users,
        module: "Roles" as AuthzModule,
      },
      {
        type: "submenu" as const,
        parent: "compras",
        icon: Truck,
        label: "Compras",
        childrenRoutes: [
          routes.dashboard.suppliers,
          routes.dashboard.purchasesOrders,
          routes.dashboard.purchases,
        ],
        items: [
          {
            href: routes.dashboard.suppliers,
            label: "Proveedores",
            module: "suppliers" as AuthzModule,
          },
          {
            href: routes.dashboard.purchasesOrders,
            label: "Órdenes",
            module: "purchaseOrders" as AuthzModule,
          },
          {
            href: routes.dashboard.purchases,
            label: "Compras",
            module: "purchases" as AuthzModule,
          },
        ],
      },
      {
        type: "submenu" as const,
        parent: "productos",
        icon: Box,
        label: "Productos",
        childrenRoutes: [
          routes.dashboard.products,
          routes.dashboard.productsCategories,
        ],
        items: [
          {
            href: routes.dashboard.productsCategories,
            label: "Categorías",
            module: "categoryProducts" as AuthzModule,
          },
          {
            href: routes.dashboard.products,
            label: "Productos",
            module: "products" as AuthzModule,
          },
        ],
      },
      {
        type: "submenu" as const,
        parent: "servicios",
        icon: Wrench,
        label: "Servicios",
        childrenRoutes: [
          routes.dashboard.services,
          routes.dashboard.technicians,
        ],
        items: [
          {
            href: routes.dashboard.services,
            label: "Servicios",
            module: "services" as AuthzModule,
          },
          {
            href: routes.dashboard.technicians,
            label: "Técnicos",
            module: "technicians" as AuthzModule,
          },
        ],
      },
      {
        type: "submenu" as const,
        parent: "ventas",
        icon: Users,
        label: "Ventas",
        childrenRoutes: [
          routes.dashboard.sales,
          routes.dashboard.clients,
          routes.dashboard.requestsServices,
          routes.dashboard.ordersServices,
          routes.dashboard.appointments,
          routes.dashboard.quotes,
        ],
        items: [
          {
            href: routes.dashboard.sales,
            label: "Ventas",
            module: "sales" as AuthzModule,
          },
          {
            href: routes.dashboard.clients,
            label: "Clientes",
            module: "customers" as AuthzModule,
          },
          {
            href: routes.dashboard.requestsServices,
            label: "Solicitudes",
            module: "servicesRequest" as AuthzModule,
          },
          {
            href: routes.dashboard.ordersServices,
            label: "Órdenes",
            module: "orderServices" as AuthzModule,
          },
          {
            href: routes.dashboard.appointments,
            label: "Citas",
            module: "appointments" as AuthzModule,
          },
          {
            href: routes.dashboard.quotes,
            label: "Cotizaciones",
            module: "quotes" as AuthzModule,
          },
        ],
      },
      {
        type: "link" as const,
        href: routes.path,
        label: "Volver a Web",
        icon: ChevronLeft,
      },
    ],
    [pathname],
  );

  return (
    <>
      {/* Overlay para móvil si fuera necesario */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/10 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: isCollapsed ? -260 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-gray-100 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.04)]"
      >
        {/* Toggle Button Industrial */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-10 top-6 bg-black text-white p-2 hover:bg-[#B22222] transition-colors shadow-xl"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Brand / Logo Section */}
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] leading-none text-black">
                Sistemas<span className="text-[#B22222]">PC</span>
              </h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Engineering Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <p className="px-6 mb-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Menú de Gestión
          </p>
          {menuConfig.map((item, idx) => {
            if (item.type === "link") {
              if (item.module && !canView(item.module)) return null;
              return (
                <MenuItem
                  key={idx}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isLinkActive(item.href)}
                />
              );
            }

            if (item.type === "submenu") {
              const visibleItems = item.items.filter((i) => canView(i.module));
              if (visibleItems.length === 0) return null;
              return (
                <SubMenu
                  key={idx}
                  parent={item.parent}
                  icon={item.icon}
                  label={item.label}
                  childrenRoutes={item.childrenRoutes}
                  pathname={pathname}
                  openMenu={openMenu}
                  toggleMenu={toggleMenu}
                  items={visibleItems}
                  setOpenMenu={setOpenMenu}
                />
              );
            }
            return null;
          })}
        </nav>

        {/* User Info / Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
              {user?.name?.substring(0, 2) || "US"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-black uppercase truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-[9px] font-bold text-[#B22222] uppercase tracking-tighter">
                Acceso Autorizado
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AsideNav;
