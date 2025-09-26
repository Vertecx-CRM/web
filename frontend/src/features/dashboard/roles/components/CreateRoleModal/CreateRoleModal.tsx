"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "@/shared/theme/colors";
import { showWarning } from "@/shared/utils/notifications";
import { Role } from "../../types/typeRoles";

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; permissions: string[] }) => void;
  existingRoles: Role[];
}

export default function CreateRoleModal({
  open,
  onClose,
  onSubmit,
  existingRoles,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({});

  const allModulePermissions: Record<string, string[]> = {
    Roles: ["Editar", "Crear", "Eliminar", "Ver"],
    Usuarios: ["Editar", "Crear", "Eliminar", "Ver"],
    "Categoría de Productos": ["Editar", "Crear", "Eliminar", "Ver"],
    Productos: ["Editar", "Crear", "Eliminar", "Ver"],
    Proveedores: ["Editar", "Crear", "Eliminar", "Ver"],
    "Órdenes de Compra": ["Editar", "Crear", "Eliminar", "Ver"],
    Compras: ["Editar", "Crear", "Eliminar", "Ver"],
    Servicios: ["Editar", "Crear", "Eliminar", "Ver"],
    Técnicos: ["Editar", "Crear", "Eliminar", "Ver"],
    "Horarios de los técnicos": ["Editar", "Crear", "Eliminar", "Ver"],
    Clientes: ["Editar", "Crear", "Eliminar", "Ver"],
    "Solicitud de Servicio": ["Editar", "Crear", "Eliminar", "Ver"],
    Citas: ["Editar", "Crear", "Eliminar", "Ver"],
    "Cotización de Servicio": ["Editar", "Crear", "Eliminar", "Ver"],
    "Orden de Servicio": ["Editar", "Crear", "Eliminar", "Ver"],
    Dashboard: ["Ver"]
  };

  useEffect(() => {
    if (open) {
      setRoleName("");
      setPermissions({});
      setErrors({});
    }
  }, [open]);

  const togglePermission = (module: string, permission: string) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];
      return { ...prev, [module]: updated };
    });
    setTimeout(validateForm, 0);
  };

  const toggleModuleAll = (module: string) => {
    if (module === "Dashboard") return; // <-- evita seleccionar "Todo" en Dashboard
    setPermissions((prev) => {
      const current = prev[module] || [];
      const allSelected = current.length === allModulePermissions[module].length;
      const updated = allSelected ? [] : [...allModulePermissions[module]];
      return { ...prev, [module]: updated };
    });
    setTimeout(validateForm, 0);
  };

  const toggleAllPermissions = () => {
    const allSelected =
      Object.values(permissions).reduce((acc, arr) => acc + arr.length, 0) ===
      Object.values(allModulePermissions).reduce((acc, arr) => acc + arr.length, 0);

    if (allSelected) {
      setPermissions({});
    } else {
      const fullSelection: Record<string, string[]> = {};
      Object.entries(allModulePermissions).forEach(([module, perms]) => {
        fullSelection[module] = [...perms];
      });
      setPermissions(fullSelection);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; permissions?: string } = {};
    if (!roleName.trim()) {
      newErrors.name = "El nombre del rol es obligatorio";
    } else if (
      existingRoles.some((r) => r.name.toLowerCase() === roleName.trim().toLowerCase())
    ) {
      newErrors.name = "Ya existe un rol con ese nombre";
    }

    const selectedCount = Object.values(permissions).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    if (selectedCount === 0) {
      newErrors.permissions = "Debe asignar al menos un permiso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showWarning("Por favor completa los campos obligatorios correctamente");
      return;
    }

    const formattedPermissions: string[] = [];
    Object.entries(permissions).forEach(([module, perms]) =>
      perms.forEach((perm) => formattedPermissions.push(`${module}-${perm}`))
    );

    onSubmit({ name: roleName.trim(), permissions: formattedPermissions });
    onClose();
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
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="text-lg font-semibold">Crear Rol</h2>
              <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-black">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 space-y-6 overflow-hidden">
              <div>
                <label className="block text-base font-semibold mb-1" style={{ color: Colors.texts.primary }}>
                  Nombre del rol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ingrese nombre de rol"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{
                    borderColor: errors.name ? "red" : Colors.table.lines,
                    color: Colors.texts.primary,
                  }}
                  onBlur={validateForm}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: Colors.texts.primary }}>
                  Asignar permisos y privilegios <span className="text-red-500">*</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      Object.values(permissions).reduce((acc, arr) => acc + arr.length, 0) ===
                      Object.values(allModulePermissions).reduce((acc, arr) => acc + arr.length, 0)
                    }
                    onChange={toggleAllPermissions}
                  />
                  <span className="text-sm">Seleccionar todos</span>
                </div>
              </div>

              {errors.permissions && (
                <p className="text-left text-xs text-red-500">{errors.permissions}</p>
              )}

              <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10" style={{ backgroundColor: "#B20000" }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-white">Módulo</th>
                      <th className="px-4 py-3 text-center font-semibold text-white">
                        Permisos / Privilegios
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(allModulePermissions).map(([module, perms]) => {
                      const moduleAllSelected =
                        (permissions[module]?.length ?? 0) === perms.length;
                      return (
                        <tr key={module}>
                          <td className="px-4 py-3 font-medium text-gray-800">{module}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-center gap-4">
                              {/* Oculta el "Todo" si es Dashboard */}
                              {module !== "Dashboard" && (
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={moduleAllSelected}
                                    onChange={() => toggleModuleAll(module)}
                                  />
                                  <span className="text-sm">Todos</span>
                                </div>
                              )}
                              {perms.map((perm) => {
                                const isChecked = permissions[module]?.includes(perm);
                                return (
                                  <div key={`${module}-${perm}`} className="flex items-center gap-2">
                                    <Checkbox checked={isChecked || false} onChange={() => togglePermission(module, perm)} />
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

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white z-10 rounded-b-3xl">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: Colors.buttons.tertiary,
                  color: Colors.texts.quaternary,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg font-medium text-sm text-white"
                style={{
                  backgroundColor: Colors.buttons.quaternary,
                }}
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
