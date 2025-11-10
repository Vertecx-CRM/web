"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "@/shared/theme/colors";
import { EditRoleData, PermissionGroup, Role } from "../../types/typeRoles";
import { showWarning } from "@/shared/utils/notifications";

const permissionGroups: PermissionGroup[] = [
  { title: "Roles", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Usuarios", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  {
    title: "Categoría de Productos",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  { title: "Productos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Proveedores", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  {
    title: "Órdenes de Compra",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  { title: "Compras", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Servicios", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Técnicos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  {
    title: "Horarios de los técnicos",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  { title: "Clientes", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  {
    title: "Solicitud de Servicio",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  { title: "Citas", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  {
    title: "Cotización de Servicio",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  {
    title: "Orden de Servicio",
    permissions: ["Crear", "Editar", "Eliminar", "Ver"],
  },
  { title: "Dashboard", permissions: ["Ver"] },
];

/** Traducciones defensivas Backend -> UI (privilegios y módulos) */
const PRIV_BACK_TO_UI: Record<string, "Crear" | "Ver" | "Editar" | "Eliminar"> =
  {
    create: "Crear",
    read: "Ver",
    update: "Editar",
    delete: "Eliminar",
  };

const MODULE_BACK_TO_UI: Record<string, string> = {
  Roles: "Roles",
  users: "Usuarios",
  User: "Usuarios",
  Products: "Productos",
  products: "Productos",
  suppliers: "Proveedores",
  Supplier: "Proveedores",
  Purchases: "Compras",
  purchaseOrders: "Compras",
  purcharse: "Compras", // typo común visto en tu backend
  "Órdenes de Compra": "Órdenes de Compra",
  Orders: "Órdenes de Compra",
  "Service Request": "Solicitud de Servicio",
  "Service Requests": "Solicitud de Servicio",
  Requests: "Solicitud de Servicio",
  "Service Orders": "Orden de Servicio",
  "Service Order": "Orden de Servicio",
  Technicians: "Técnicos",
  Technician: "Técnicos",
  "Technicians Schedules": "Horarios de los técnicos",
  Schedules: "Horarios de los técnicos",
  Clients: "Clientes",
  Client: "Clientes",
  Quotes: "Cotización de Servicio",
  Quotation: "Cotización de Servicio",
  Appointments: "Citas",
  Appointment: "Citas",
  Dashboard: "Dashboard",
  Categories: "Categoría de Productos",
  categoryProducts: "Categoría de Productos",
  services: "Servicios",
  Service: "Servicios",
  technicians: "Técnicos",
  customers: "Clientes",
  servicesRequest: "Solicitud de Servicio",
  appointments: "Citas",
  quotes: "Cotización de Servicio",
  orderServices: "Orden de Servicio",
  dashboard: "Dashboard",
};


interface EditRoleModalProps {
  isOpen: boolean;
  role: EditRoleData | null;
  onClose: () => void;
  onSave: (id: number, data: EditRoleData) => void | Promise<void>;
  existingRoles: Role[];
}

export default function EditRoleModal({
  isOpen,
  role,
  onClose,
  onSave,
  existingRoles,
}: EditRoleModalProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Activo" | "Inactivo">("Activo");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>(
    {}
  );

  useEffect(() => {
    if (!role) return;

    setName(role.name);
    setStatus((role.state ?? "Activo") as "Activo" | "Inactivo");

    // 🔧 Normaliza los tokens a los nombres reales de la UI
    const normalized = (role.permissions ?? []).map((token) => {
      const idx = token.lastIndexOf("-");
      if (idx === -1) return token;

      const rawModule = token.slice(0, idx);
      const rawPriv = token.slice(idx + 1).toLowerCase();

      // Traduce del backend a la UI
      const modUI =
        MODULE_BACK_TO_UI[rawModule.trim()] ??
        MODULE_BACK_TO_UI[rawModule.replace(/\s/g, "")] ??
        rawModule;
      const privUI = PRIV_BACK_TO_UI[rawPriv] ?? rawPriv;

      return `${modUI}-${privUI}`;
    });

    // 🔍 Marca los permisos correspondientes
    const mapped: Record<string, string[]> = {};
    permissionGroups.forEach((group) => {
      mapped[group.title] = group.permissions.filter((perm) =>
        normalized.includes(`${group.title}-${perm}`)
      );
    });

    setPermissions(mapped);
    setErrors({});
  }, [role]);

  if (!isOpen || !role) return null;

  const validateForm = (
    nameVal?: string,
    permsVal?: Record<string, string[]>
  ) => {
    const newErrors: { name?: string; permissions?: string } = {};
    const nameToCheck = (nameVal ?? name).trim();
    const permsToCheck = permsVal ?? permissions;

    if (!nameToCheck) {
      newErrors.name = "El nombre del rol es obligatorio";
    } else {
      const isDuplicate = existingRoles.some(
        (r) =>
          r.name.toLowerCase() === nameToCheck.toLowerCase() && r.id !== role.id
      );
      if (isDuplicate) newErrors.name = "Ya existe un rol con ese nombre";
    }

    const selectedCount = Object.values(permsToCheck).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    if (selectedCount === 0)
      newErrors.permissions = "Debe asignar al menos un permiso al rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTogglePermission = (module: string, permission: string) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];
      const newPermissions = { ...prev, [module]: updated };
      validateForm(undefined, newPermissions);
      return newPermissions;
    });
  };

  const handleToggleModuleAll = (module: string) => {
    if (module === "Dashboard") return; // Dashboard solo tiene "Ver"
    setPermissions((prev) => {
      const current = prev[module] || [];
      const total =
        permissionGroups.find((g) => g.title === module)?.permissions.length ??
        0;
      const allSelected = current.length === total;
      const updated = allSelected
        ? []
        : [
            ...(permissionGroups.find((g) => g.title === module)?.permissions ||
              []),
          ];
      const newPermissions = { ...prev, [module]: updated };
      validateForm(undefined, newPermissions);
      return newPermissions;
    });
  };

  const handleToggleAllPermissions = () => {
    const selectedNow = Object.values(permissions).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    const totalAll = permissionGroups.reduce(
      (acc, g) => acc + g.permissions.length,
      0
    );
    const allSelected = selectedNow === totalAll;

    if (allSelected) {
      setPermissions({});
      validateForm(undefined, {});
    } else {
      const fullSelection: Record<string, string[]> = {};
      permissionGroups.forEach((group) => {
        fullSelection[group.title] = [...group.permissions];
      });
      setPermissions(fullSelection);
      validateForm(undefined, fullSelection);
    }
  };

  const handleSubmit = async () => {
    const formattedPermissions: string[] = [];
    Object.entries(permissions).forEach(([module, perms]) =>
      perms.forEach((perm) => formattedPermissions.push(`${module}-${perm}`))
    );

    if (!validateForm(name, permissions)) {
      showWarning("Por favor completa los campos obligatorios correctamente");
      return;
    }

    // No cerramos aquí. El hook cierra el modal cuando el guardado finaliza OK.
    await onSave(role.id, {
      id: role.id,
      name: name.trim(),
      state: status,
      permissions: formattedPermissions,
    });
  };

  const Checkbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded-md border border-gray-400 flex items-center justify-center transition-all duration-150 
        ${checked ? "bg-[#B20000] scale-110" : "bg-white"}`}
      aria-pressed={checked}
    >
      <CheckIcon
        className={`w-3 h-3 text-white transition-opacity duration-150 ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="text-lg font-semibold">Editar Rol</h2>
              <button
                onClick={onClose}
                className="cursor-pointer text-gray-500 hover:text-black"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-base font-semibold mb-1"
                    style={{ color: Colors.texts.primary }}
                  >
                    Nombre del rol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      validateForm(e.target.value, permissions);
                    }}
                    placeholder="Ingrese nombre de rol"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{
                      borderColor: errors.name ? "red" : Colors.table.lines,
                    }}
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </div>

                <div>
                  <label
                    className="block text-base font-semibold mb-1"
                    style={{ color: Colors.texts.primary }}
                  >
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "Activo" | "Inactivo")
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ borderColor: Colors.table.lines }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold"
                  style={{ color: Colors.texts.primary }}
                >
                  Permisos Asignados <span className="text-red-500">*</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      Object.values(permissions).reduce(
                        (acc, arr) => acc + arr.length,
                        0
                      ) ===
                      permissionGroups.reduce(
                        (acc, g) => acc + g.permissions.length,
                        0
                      )
                    }
                    onChange={handleToggleAllPermissions}
                  />
                  <span className="text-sm">Seleccionar todos</span>
                </div>
              </div>

              {errors.permissions && (
                <p className="text-left text-xs text-red-500">
                  {errors.permissions}
                </p>
              )}

              <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                <table className="min-w-full text-sm">
                  <thead
                    style={{ backgroundColor: "#B20000" }}
                    className="sticky top-0 z-10"
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
                    {permissionGroups.map((group) => {
                      const allSelected =
                        (permissions[group.title]?.length ?? 0) ===
                        group.permissions.length;
                      return (
                        <tr key={group.title}>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {group.title}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-center gap-4">
                              {group.title !== "Dashboard" && (
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={allSelected}
                                    onChange={() =>
                                      handleToggleModuleAll(group.title)
                                    }
                                  />
                                  <span className="text-sm">Todos</span>
                                </div>
                              )}
                              {group.permissions.map((perm) => {
                                const isChecked =
                                  permissions[group.title]?.includes(perm);
                                return (
                                  <div
                                    key={`${group.title}-${perm}`}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      checked={isChecked || false}
                                      onChange={() =>
                                        handleTogglePermission(
                                          group.title,
                                          perm
                                        )
                                      }
                                    />
                                    <span className="text-sm">{perm}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t flex justify-end gap-2 sm:gap-3 p-4 sticky bottom-0 bg-white z-10 rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
