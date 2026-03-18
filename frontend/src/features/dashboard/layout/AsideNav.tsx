"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Wrench,
  Truck,
  Box,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ShieldCheck,
  Globe,
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
      className={`group relative flex items-center gap-3 px-6 py-4 transition-all duration-200 border-b border-[#626262]/20 ${
        isActive
          ? "bg-[#B20000]/20 text-[#ffffff]"
          : "text-[#d1d1d1]/70 hover:text-[#ffffff] hover:bg-[#ffffff]/5"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 w-1.5 h-full bg-[#B20000]"
        />
      )}

      <Icon
        size={18}
        strokeWidth={isActive ? 2.5 : 2}
        style={{ color: isActive ? "#B20000" : "inherit" }}
      />
      <span
        className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
          isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
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
  }: {
    parent: string;
    icon: React.ElementType;
    label: string;
    childrenRoutes: string[];
    pathname: string;
    openMenu: string | null;
    toggleMenu: (menu: string) => void;
    items: { href: string; label: string }[];
  }) => {
    const isActive = childrenRoutes.some((child) => pathname.startsWith(child));
    const isOpen = openMenu === parent;

    return (
      <div className="border-b border-[#626262]/20">
        <button
          onClick={() => toggleMenu(parent)}
          className={`cursor-pointer flex items-center justify-between w-full px-6 py-4 transition-colors group ${
            isActive
              ? "bg-[#B20000]/10 text-[#ffffff]"
              : "text-[#d1d1d1]/70 hover:text-[#ffffff] hover:bg-[#ffffff]/5"
          }`}
        >
          <span className="flex items-center gap-3">
            <Icon
              size={18}
              strokeWidth={isActive ? 2.5 : 2}
              style={{ color: isActive ? "#B20000" : "inherit" }}
            />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              {label}
            </span>
          </span>

          <ChevronRight
            size={14}
            className={`transition-transform duration-300 ${
              isOpen
                ? "rotate-90 text-[#B20000]"
                : "text-[#717680] group-hover:text-white"
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-[#000000]/30"
            >
              <div className="py-2">
                {items.map(({ href, label: itemLabel }) => {
                  const isSubActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`block pl-16 pr-6 py-3 text-[10px] font-bold uppercase tracking-widest border-l-4 transition-all ${
                        isSubActive
                          ? "text-[#B20000] border-[#B20000] bg-[#000000]/40"
                          : "text-[#d1d1d1]/60 border-transparent hover:text-[#ffffff] hover:border-[#626262]"
                      }`}
                    >
                      {itemLabel}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

SubMenu.displayName = "SubMenu";

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

  const permissions = useMemo(
    () => ((user as any)?.permissions || []) as string[],
    [user],
  );
  const canView = useCallback(
    (module: AuthzModule) => canViewModule(permissions, module),
    [permissions],
  );
  const toggleMenu = useCallback(
    (menu: string) => setOpenMenu((prev) => (prev === menu ? null : menu)),
    [],
  );
  const isLinkActive = useCallback(
    (href: string) =>
      href === routes.dashboard.main
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/"),
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
        icon: ShieldCheck,
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
        icon: Globe,
      },
    ],
    [canView],
  );

  return (
    <>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: isCollapsed ? -260 : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 z-50 w-64 h-screen bg-[#330101] border-r border-[#626262]/30 flex flex-col shadow-2xl"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="cursor-pointer absolute -right-11 top-5 bg-[#CC0000] text-[#ffffff] p-3 hover:bg-[#ffffff] hover:text-[#CC0000] transition-all shadow-xl rounded-r-lg"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Brand Header */}
        <div className="p-8 border-b border-[#626262]/30 bg-[#000000]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B20000] rounded flex items-center justify-center shadow-lg">
              <span className="text-[#ffffff] font-black text-xl">S</span>
            </div>

            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] leading-none text-[#ffffff]">
                Sistemas<span className="text-[#B20000]">PC</span>
              </h1>
              <p className="text-[9px] font-black text-[#d1d1d1]/50 uppercase tracking-widest mt-1">
                Engineering Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <p className="px-8 mb-6 text-[9px] font-black text-[#ffffff] uppercase tracking-[0.4em]">
            Menú de Gestión
          </p>
          <div className="space-y-0.5">
            {menuConfig.map((item, idx) =>
              item.type === "link" ? (
                (!item.module || canView(item.module)) && (
                  <MenuItem
                    key={idx}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isLinkActive(item.href)}
                  />
                )
              ) : (
                <SubMenu
                  key={idx}
                  parent={item.parent}
                  icon={item.icon}
                  label={item.label}
                  childrenRoutes={item.childrenRoutes}
                  pathname={pathname}
                  openMenu={openMenu}
                  toggleMenu={toggleMenu}
                  items={item.items.filter((i) => canView(i.module))}
                />
              ),
            )}
          </div>
        </nav>

        {/* Footer Minimalista */}
        <div className="p-6 bg-[#000000]/40 border-t border-[#626262]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#B20000] flex items-center justify-center text-[11px] font-black text-white shadow-inner">
              {user?.name?.substring(0, 2).toUpperCase() || "SP"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase text-[#ffffff] truncate">
                {user?.name || "Ingeniero"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#189416]"></span>
                <p className="text-[8px] font-bold text-[#189416]/80 uppercase tracking-tighter">
                  Sistema Activo
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AsideNav;
