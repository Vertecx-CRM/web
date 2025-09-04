"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/shared/routes";
import {
  Home,
  Users,
  Settings,
  Wrench,
  Truck,
  ChevronDown,
  Box,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Colors from "@/shared/theme/colors";
import { motion, AnimatePresence } from "framer-motion";

const AsideNav = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isParentActive = (children: string[]) =>
    children.some((child) => pathname.startsWith(child))
      ? "bg-red-800 text-white hover:scale-105 transition transform duration-200"
      : "hover:bg-red-600 hover:scale-105 transition transform duration-200";

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "bg-red-800 text-white hover:scale-105 transition transform duration-200"
      : "hover:bg-red-600 hover:scale-105 transition transform duration-200";

  return (
    <motion.aside
      initial={{ x: -260 }} // 👈 animación inicial
      animate={{ x: isCollapsed ? -260 : 0 }} // 👈 se mueve con toggle
      transition={{ duration: 0.3 }}
      className="text-white w-64 h-screen flex flex-col fixed left-0 top-0 z-50"
      style={{ backgroundColor: Colors.asideNavBackground.primary }}
    >
      {/* Botón flecha arriba a la derecha */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="cursor-pointer absolute -right-7 top-4 bg-red-700 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Header */}
      <h2 className="text-xl font-bold p-4">Dashboard Administrador</h2>

      {/* NAV */}
      <nav className="flex flex-col gap-1 px-2">
        {/* Dashboard */}
        <Link
          href={routes.dashboard.main}
          className={`flex items-center gap-2 px-4 py-3 rounded-md text-base ${isActive(
            routes.dashboard.main
          )}`}
        >
          <Home size={20} /> Dashboard
        </Link>

        {/* Acceso */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("acceso")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => toggleMenu("acceso")}
            className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base ${isParentActive(
              [routes.dashboard.users, routes.dashboard.roles]
            )}`}
          >
            <span className="flex items-center gap-2">
              <Users size={20} /> Acceso
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "acceso" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "acceso" && (
            <AnimatePresence>
              {openMenu === "acceso" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-0 left-0 w-full bg-red-600"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
                  >
                    <Link
                      href={routes.dashboard.users}
                      onClick={() => setOpenMenu(null)} // 👈 se cierra al hacer clic
                      className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                    >
                      Usuarios
                    </Link>
                    <Link
                      href={routes.dashboard.roles}
                      onClick={() => setOpenMenu(null)}
                      className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                    >
                      Roles
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Compras */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("compras")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => toggleMenu("compras")}
            className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base ${isParentActive(
              [
                routes.dashboard.suppliers,
                routes.dashboard.purchasesOrders,
                routes.dashboard.purchases,
                routes.dashboard.purchasesGraph,
              ]
            )}`}
          >
            <span className="flex items-center gap-2">
              <Truck size={20} /> Compras
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "compras" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "compras" && (
            <AnimatePresence>
              {openMenu === "compras" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
                >
                  <Link
                    href={routes.dashboard.suppliers}
                    onClick={() => setOpenMenu(null)} // 👈 se cierra al hacer click
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Proveedores
                  </Link>
                  <Link
                    href={routes.dashboard.purchasesOrders}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Órdenes de compras
                  </Link>
                  <Link
                    href={routes.dashboard.purchases}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Compras
                  </Link>
                  <Link
                    href={routes.dashboard.purchasesGraph}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Listado de compras
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Servicios */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("servicios")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => toggleMenu("servicios")}
            className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base ${isParentActive(
              [routes.dashboard.services, routes.dashboard.technicians]
            )}`}
          >
            <span className="flex items-center gap-2">
              <Wrench size={20} /> Servicios
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "servicios" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "servicios" && (
            <AnimatePresence>
              {openMenu === "servicios" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
                >
                  <Link
                    href={routes.dashboard.services}
                    onClick={() => setOpenMenu(null)} // 👈 se cierra al hacer click
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Servicios
                  </Link>
                  <Link
                    href={routes.dashboard.technicians}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Tecnicos
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Clientes */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("clientes")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => toggleMenu("clientes")}
            className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base ${isParentActive(
              [routes.dashboard.clients]
            )}`}
          >
            <span className="flex items-center gap-2">
              <Users size={20} /> Clientes
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "clientes" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "clientes" && (
            <AnimatePresence>
              {openMenu === "clientes" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
                >
                  <Link
                    href={routes.dashboard.clients}
                    onClick={() => setOpenMenu(null)} // 👈 se cierra al hacer click
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Clientes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Productos */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("productos")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            onClick={() => toggleMenu("productos")}
            className={`cursor-pointer flex items-center justify-between w-full px-4 py-3 rounded-md text-base ${isParentActive(
              [routes.dashboard.products, routes.dashboard.productsCategories]
            )}`}
          >
            <span className="flex items-center gap-2">
              <Box size={20} /> Productos
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                openMenu === "productos" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "productos" && (
            <AnimatePresence>
              {openMenu === "productos" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-60 z-50"
                >
                  <Link
                    href={routes.dashboard.products}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Productos
                  </Link>
                  <Link
                    href={routes.dashboard.productsCategories}
                    onClick={() => setOpenMenu(null)}
                    className="px-4 py-3 hover:bg-red-100 hover:text-red-700 transition rounded-md"
                  >
                    Categorias
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </nav>

      {/* Configuración */}
      <div className="mt-auto border-t border-red-700 p-4">
        <Link
          href={routes.dashboard.settings}
          className={`flex items-center gap-2 px-4 py-3 rounded-md text-base ${isActive(
            routes.dashboard.settings
          )}`}
        >
          <Settings size={20} /> Configuración
        </Link>
      </div>
    </motion.aside>
  );
};

export default AsideNav;
