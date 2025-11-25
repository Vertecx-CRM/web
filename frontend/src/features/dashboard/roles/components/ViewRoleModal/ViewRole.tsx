"use client";

import React from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "@/shared/theme/colors";
import { Role } from "../../types/typeRoles";

interface ViewRoleModalProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function ViewRoleModal({
  open,
  onClose,
  role,
}: ViewRoleModalProps) {
  if (!open || !role) return null;

  /** --------------------------------------------
   * Traducción backend → nombres de módulos en UI
   * -------------------------------------------- */
  const moduleTranslations: Record<string, string> = {
    Roles: "Roles",

    users: "Usuarios",
    User: "Usuarios",

    categoryProducts: "Categoría de Productos",
    Categories: "Categoría de Productos",

    products: "Productos",
    Products: "Productos",

    suppliers: "Proveedores",
    Supplier: "Proveedores",

    purchases: "Compras",
    Purchases: "Compras",

    purchaseOrders: "Órdenes de Compra",
    Orders: "Órdenes de Compra",

    services: "Servicios",
    Service: "Servicios",

    technicians: "Técnicos",
    Technician: "Técnicos",

    customers: "Clientes",
    Client: "Clientes",

    servicesRequest: "Solicitud de Servicio",
    "Service Request": "Solicitud de Servicio",
    "Service Requests": "Solicitud de Servicio",
    Requests: "Solicitud de Servicio",

    appointments: "Citas",
    Appointment: "Citas",
    Appointments: "Citas",

    quotes: "Cotización de Servicio",
    Quotes: "Cotización de Servicio",
    Quotation: "Cotización de Servicio",

    orderServices: "Orden de Servicio",
    "Service Order": "Orden de Servicio",
    "Service Orders": "Orden de Servicio",

    dashboard: "Dashboard",
    Dashboard: "Dashboard",

    /** -----------------------------------
     * ✔ NUEVO — módulo de ventas
     * ----------------------------------- */
    sales: "Ventas",
    Sales: "Ventas",
  };

  /** --------------------------------------------
   * Traducción backend → nombres de privilegios
   * -------------------------------------------- */
  const privilegeTranslations: Record<string, string> = {
    create: "Crear",
    read: "Ver",
    update: "Editar",
    delete: "Eliminar",

    /** ✔ NUEVO privilegio */
    deactivate: "Desactivar",

    all: "Todos",
  };

  /** Agrupar permisos por módulo */
  const groupedPermissions: Record<string, string[]> = {};

  role.permissions?.forEach((p) => {
    const [rawModule, rawPrivilege] = p.split("-");

    const moduleName =
      moduleTranslations[rawModule] ??
      moduleTranslations[rawModule.toLowerCase()] ??
      rawModule;

    const privilegeName =
      privilegeTranslations[rawPrivilege] ??
      privilegeTranslations[rawPrivilege.toLowerCase()] ??
      rawPrivilege;

    if (!groupedPermissions[moduleName]) {
      groupedPermissions[moduleName] = [];
    }

    groupedPermissions[moduleName].push(privilegeName);
  });

  const Checkbox = ({ checked }: { checked: boolean }) => (
    <div
      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
        checked ? "bg-[#B20000] scale-105" : "bg-white"
      }`}
      style={{ borderColor: Colors.table.lines }}
    >
      {checked && <CheckIcon className="w-3 h-3 text-white" />}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-lg relative w-full max-w-[800px] h-[88vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2
                className="text-lg font-semibold"
                style={{ color: Colors.texts.primary }}
              >
                Ver Rol
              </h2>
              <button
                onClick={onClose}
                className="cursor-pointer text-gray-500 hover:text-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 flex-1 space-y-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-base font-semibold mb-1"
                    style={{ color: Colors.texts.primary }}
                  >
                    Nombre del rol
                  </label>
                  <input
                    type="text"
                    value={role.name}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    style={{ borderColor: Colors.table.lines }}
                  />
                </div>

                <div>
                  <label
                    className="block text-base font-semibold mb-1"
                    style={{ color: Colors.texts.primary }}
                  >
                    Estado
                  </label>
                  <input
                    type="text"
                    value={role.state === "Activo" ? "Activo" : "Inactivo"}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    style={{ borderColor: Colors.table.lines }}
                  />
                </div>
              </div>

              <h3
                className="text-base font-semibold"
                style={{ color: Colors.texts.primary }}
              >
                Permisos Asignados
              </h3>

              <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                <table className="min-w-full text-sm">
                  <thead
                    className="sticky top-0 z-10"
                    style={{ backgroundColor: "#B20000" }}
                  >
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-white">
                        Módulo
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-white">
                        Permisos / Privilegios
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {Object.keys(groupedPermissions).map((moduleName) => (
                      <tr key={moduleName}>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {moduleName}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-center gap-4">
                            {groupedPermissions[moduleName].map(
                              (privilege, idx) => (
                                <div
                                  key={`${moduleName}-${privilege}-${idx}`}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox checked />
                                  <span className="text-sm">{privilege}</span>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t flex justify-end gap-2 sm:gap-3 p-4 sticky bottom-0 bg-white z-10 rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
