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
} from "lucide-react";
import Colors from "@/shared/theme/colors";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

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

const AsideNav = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { canView } = usePermissions();

  const toggleMenu = useCallback(
    (menu: string) => {
      setOpenMenu(openMenu === menu ? null : menu);
    },
    [openMenu]
  );

  const menuConfig = useMemo(
    () => [
      {
        type: "link",
        href: "/dashboard",
        label: "Dashboard",
        icon: Home,
        module: "dashboard",
      },
      {
        type: "link",
        href: "/dashboard/access/users",
        label: "Usuarios",
        icon: Users,
        module: "users",
      },
      {
        type: "link",
        href: "/dashboard/access/roles",
        label: "Roles",
        icon: Users,
        module: "Roles",
      },
      {
        type: "submenu",
        parent: "compras",
        icon: Truck,
        label: "Compras",
        moduleChildren: ["suppliers", "purchaseOrders", "purcharse"],
        childrenRoutes: [
          "/dashboard/purchases/suppliers",
          "/dashboard/purchases/orders",
          "/dashboard/purchases",
          "/dashboard/purchases/graph",
        ],
        items: [
          {
            href: "/dashboard/purchases/suppliers",
            label: "Proveedores",
            module: "suppliers",
          },
          {
            href: "/dashboard/purchases/orders",
            label: "Órdenes de compras",
            module: "purchaseOrders",
          },
          {
            href: "/dashboard/purchases",
            label: "Compras",
            module: "purcharse",
          },
          {
            href: "/dashboard/purchases/graph",
            label: "Gráficas compras",
            module: "purcharse",
          },
        ],
      },
      {
        type: "submenu",
        parent: "productos",
        icon: Box,
        label: "Productos",
        moduleChildren: ["products", "categoryProducts"],
        childrenRoutes: [
          "/dashboard/products",
          "/dashboard/products/categories",
        ],
        items: [
          {
            href: "/dashboard/products/categories",
            label: "Categorías",
            module: "categoryProducts",
          },
          {
            href: "/dashboard/products",
            label: "Productos",
            module: "products",
          },
        ],
      },
      {
        type: "submenu",
        parent: "servicios",
        icon: Wrench,
        label: "Servicios",
        moduleChildren: ["services", "technicians"],
        childrenRoutes: [
          "/dashboard/services",
          "/dashboard/technicians",
        ],
        items: [
          {
            href: "/dashboard/services",
            label: "Servicios",
            module: "services",
          },
          {
            href: "/dashboard/technicians",
            label: "Técnicos",
            module: "technicians",
          },
        ],
      },
      {
        type: "submenu",
        parent: "ventas",
        icon: Users,
        label: "Ventas",
        moduleChildren: [
          "customers",
          "servicesRequest",
          "orderServices",
          "appointments",
          "quotes",
        ],
        childrenRoutes: [
          "/dashboard/clients",
        ],
        items: [
          {
            href: "/dashboard/sales",
            label: "Ventas",
            module: "customers",
          },
          {
            href: "/dashboard/clients",
            label: "Clientes",
            module: "customers",
          },
          {
            href: "/dashboard/requests",
            label: "Solicitudes",
            module: "servicesRequest",
          },
          {
            href: "/dashboard/orders",
            label: "Órdenes",
            module: "orderServices",
          },
          {
            href: "/dashboard/appointments",
            label: "Citas",
            module: "appointments",
          },
          {
            href: "/dashboard/quotes",
            label: "Cotizaciones",
            module: "quotes",
          },
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
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="cursor-pointer absolute -right-5 top-4 bg-red-700 text-white rounded-full p-1 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:bg-red-600 transition"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="flex items-center gap-2 px-4 py-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-lg text-white font-bold">
          V
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white">Vertecx</h1>
          <p className="text-xs text-center text-white">Panel de gestión</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {menuConfig.map((item) => {
          if (item.type === "link") {
            return (
              canView(item.module) && (
                <MenuItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              )
            );
          }

          if (item.type === "submenu") {
            const visibleItems = item.items.filter((i) => canView(i.module));

            if (visibleItems.length === 0) return null;

            if (visibleItems.length === 1) {
              const only = visibleItems[0];
              return (
                <MenuItem
                  key={only.href}
                  href={only.href}
                  icon={item.icon}
                  label={only.label}
                  isActive={pathname.startsWith(only.href)}
                />
              );
            }

            return (
              <SubMenu
                key={item.parent}
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
    </motion.aside>
  );
};

export default AsideNav;
