"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/shared/routes";
import {
  Home,
  Users,
  Wrench,
  Truck,
  ChevronDown,
  Box,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Colors from "@/shared/theme/colors";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

/* ========= SUBCOMPONENTES ========= */

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
      className={`flex items-center gap-2 px-4 py-3 rounded-md text-base transition transform duration-200 ${
        isActive
          ? "bg-red-800 text-white hover:scale-105"
          : "hover:bg-red-600 hover:scale-105"
      }`}
    >
      <Icon size={20} /> {label}
    </Link>
  )
);

MenuItem.displayName = "MenuItem";

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
        className="relative"
        onMouseEnter={() => setOpenMenu(parent)}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <button
          onClick={() => toggleMenu(parent)}
          className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base transition transform duration-200 ${
            isActive
              ? "bg-red-800 text-white hover:scale-105"
              : "hover:bg-red-600 hover:scale-105"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon size={20} /> {label}
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform ${
              openMenu === parent ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {openMenu === parent && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
            >
              {items.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpenMenu(null)}
                  className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                >
                  {label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SubMenu.displayName = "SubMenu";

/* ========= COMPONENTE PRINCIPAL ========= */

const AsideNav = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleMenu = useCallback(
    (menu: string) => {
      setOpenMenu(openMenu === menu ? null : menu);
    },
    [openMenu]
  );

  // Memoizamos items del menú para no recrearlos siempre
  const menuConfig = useMemo(
    () => [
      {
        type: "link",
        href: routes.dashboard.main,
        icon: Home,
        label: "Dashboard",
      },
      {
        type: "link",
        href: routes.dashboard.users,
        icon: Users,
        label: "Usuarios",
      },
      {
        type: "link",
        href: routes.dashboard.roles,
        icon: Users,
        label: "Roles",
      },
      {
        type: "submenu",
        parent: "compras",
        icon: Truck,
        label: "Compras",
        childrenRoutes: [
          routes.dashboard.suppliers,
          routes.dashboard.purchasesOrders,
          routes.dashboard.purchases,
          routes.dashboard.purchasesGraph,
        ],
        items: [
          { href: routes.dashboard.suppliers, label: "Proveedores" },
          {
            href: routes.dashboard.purchasesOrders,
            label: "Órdenes de compras",
          },
          { href: routes.dashboard.purchases, label: "Compras" },
          { href: routes.dashboard.purchasesGraph, label: "Gráficas compras" },
        ],
      },
      {
        type: "submenu",
        parent: "productos",
        icon: Box,
        label: "Productos",
        childrenRoutes: [
          routes.dashboard.products,
          routes.dashboard.productsCategories,
        ],
        items: [
          { href: routes.dashboard.productsCategories, label: "Categorías" },
          { href: routes.dashboard.products, label: "Productos" },
        ],
      },
      {
        type: "submenu",
        parent: "servicios",
        icon: Wrench,
        label: "Servicios",
        childrenRoutes: [
          routes.dashboard.services,
          routes.dashboard.technicians,
        ],
        items: [
          { href: routes.dashboard.services, label: "Servicios" },
          { href: routes.dashboard.technicians, label: "Técnicos" },
        ],
      },
      {
        type: "submenu",
        parent: "clientes",
        icon: Users,
        label: "Ventas",
        childrenRoutes: [routes.dashboard.clients],
        items: [
          { href: routes.dashboard.sales, label: "Ventas" },
          { href: routes.dashboard.clients, label: "Clientes" },
          { href: routes.dashboard.requestsServices, label: "Solicitudes" },
          { href: routes.dashboard.ordersServices, label: "Órdenes" },
          { href: routes.dashboard.appointments, label: "Citas" },
        ],
      },
    ],
    []
  );

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: isCollapsed ? -260 : 0 }}
      transition={{ duration: 0.3 }}
      className="text-white w-64 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-[6px_0_12px_-2px_rgba(0,0,0,0.25)]"
      style={{ backgroundColor: Colors.asideNavBackground.primary }}
    >
      {/* Botón flecha */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="cursor-pointer absolute -right-5 top-4 bg-red-700 text-white rounded-full p-1 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:bg-red-600 transition"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-lg text-white font-bold">
          V
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white">Vertecx</h1>
          <p className="text-xs text-center text-white">Panel de gestión</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex flex-col gap-1 px-2">
        {menuConfig.map((item) =>
          item.type === "link" ? (
            <MenuItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ) : (
            <SubMenu
              key={item.parent}
              parent={item.parent}
              icon={item.icon}
              label={item.label}
              childrenRoutes={item.childrenRoutes}
              pathname={pathname}
              openMenu={openMenu}
              toggleMenu={toggleMenu}
              items={item.items}
              setOpenMenu={setOpenMenu}
            />
          )
        )}
      </nav>
    </motion.aside>
  );
};

export default AsideNav;
