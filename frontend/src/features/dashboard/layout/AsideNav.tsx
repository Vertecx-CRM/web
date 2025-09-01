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
} from "lucide-react";
import Colors from "@/shared/theme/colors";

const AsideNav = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (path: string) =>
    pathname.startsWith(path) ? "bg-red-800 text-white" : "hover:bg-red-700";

  return (
    <aside
      className="text-white w-64 h-screen flex flex-col relative"
      style={{ backgroundColor: Colors.asideNavBackground.primary }}
    >
      <h2 className="text-xl font-bold p-4">Dashboard Administrador</h2>

      <nav className="flex flex-col gap-1 px-2">
        {/* Dashboard */}
        <Link
          href={routes.dashboard.main}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive(
            routes.dashboard.main
          )}`}
        >
          <Home size={18} /> Dashboard
        </Link>

        {/* Acceso */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("acceso")}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive(
              routes.dashboard.users
            )}`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} /> Acceso
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu === "acceso" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "acceso" && (
            <div className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-48 z-50">
              <Link
                href={routes.dashboard.users}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Usuarios
              </Link>
              <Link
                href={routes.dashboard.roles}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Roles
              </Link>
            </div>
          )}
        </div>

        {/* Compras */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("compras")}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive(
              routes.dashboard.purchases
            )}`}
          >
            <span className="flex items-center gap-2">
              <Truck size={18} /> Compras
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu === "compras" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "compras" && (
            <div className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-56 z-50">
              <Link
                href={routes.dashboard.suppliers}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Proveedores
              </Link>
              <Link
                href={routes.dashboard.purchasesOrders}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Órdenes de compras
              </Link>
              <Link
                href={routes.dashboard.purchases}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Compras
              </Link>
              <Link
                href={routes.dashboard.purchasesGraph}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Listado de compras
              </Link>
            </div>
          )}
        </div>

        {/* Servicios */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("servicios")}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive(
              routes.dashboard.services
            )}`}
          >
            <span className="flex items-center gap-2">
              <Wrench size={18} /> Servicios
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu === "servicios" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "servicios" && (
            <div className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-48 z-50">
              <Link
                href={routes.dashboard.services}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Listado
              </Link>
              <Link
                href={routes.notFound}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Nuevo servicio
              </Link>
            </div>
          )}
        </div>

        {/* Clientes */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("clientes")}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive(
              routes.dashboard.clients
            )}`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} /> Clientes
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu === "clientes" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "clientes" && (
            <div className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-48 z-50">
              <Link
                href={routes.dashboard.clients}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Listado
              </Link>
              <Link
                href={routes.notFound}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Nuevo cliente
              </Link>
            </div>
          )}
        </div>
        {/* Productos */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("productos")}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive(
              routes.dashboard.products
            )}`}
          >
            <span className="flex items-center gap-2">
              <Box size={18} /> Productos
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu === "productos" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openMenu === "productos" && (
            <div className="absolute top-0 left-full ml-1 bg-white text-red-800 rounded-md shadow-lg flex flex-col w-56 z-50">
              <Link
                href={routes.dashboard.products}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Listado
              </Link>
              <Link
                href={routes.notFound}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Nuevo producto
              </Link>
              <Link
                href={routes.dashboard.productsCategories}
                className="px-3 py-2 hover:bg-gray-200"
              >
                Categorías
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Configuración */}
      <div className="mt-auto border-t border-red-700 p-4">
        <Link
          href={routes.dashboard.settings}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive(
            routes.dashboard.settings
          )}`}
        >
          <Settings size={18} /> Configuración
        </Link>
      </div>
    </aside>
  );
};

export default AsideNav;
