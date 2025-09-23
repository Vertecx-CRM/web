"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { EditRoleData, PermissionGroup, Role } from "../../types/typeRoles";
import { showWarning } from "@/shared/utils/notifications";

const permissionGroups: PermissionGroup[] = [
  { title: "Roles", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Usuarios", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Categoría de Productos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Productos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Proveedores", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Órdenes de Compra", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Compras", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Servicios", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Técnicos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Horarios de los técnicos", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Clientes", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Solicitud de Servicio", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Citas", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Cotización de Servicio", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Orden de Servicio", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
  { title: "Dashboard", permissions: ["Ver"] },
];

interface EditRoleModalProps {
  isOpen: boolean;
  role: EditRoleData | null;
  onClose: () => void;
  onSave: (id: number, data: EditRoleData) => void;
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
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({});

  useEffect(() => {
    if (role) {
      setName(role.name);
      setStatus((role.state ?? "Activo") as "Activo" | "Inactivo");
      setErrors({});
      // Mapea los permisos del rol al formato Record<string, string[]>
      const mappedPermissions: Record<string, string[]> = {};
      const rolePerms = role.permissions ?? []; // Agregamos la verificación aquí
      permissionGroups.forEach((group) => {
        const groupPerms: string[] = [];
        group.permissions.forEach((perm) => {
          if (rolePerms.includes(`${group.title}-${perm}`)) {
            groupPerms.push(perm);
          }
        });
        mappedPermissions[group.title] = groupPerms;
      });
      setPermissions(mappedPermissions);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const validateForm = (nameVal?: string, permsVal?: Record<string, string[]>) => {
    const newErrors: { name?: string; permissions?: string } = {};
    const nameToCheck = (nameVal ?? name).trim();
    const permsToCheck = permsVal ?? permissions;

    if (!nameToCheck) {
      newErrors.name = "El nombre del rol es obligatorio";
    } else {
      const isDuplicate = existingRoles.some(
        (r) => r.name.toLowerCase() === nameToCheck.toLowerCase() && r.id !== role.id
      );
      if (isDuplicate) newErrors.name = "Ya existe un rol con ese nombre";
    }

    const selectedCount = Object.values(permsToCheck).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    if (selectedCount === 0) {
      newErrors.permissions = "Debe asignar al menos un permiso al rol";
    }

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

  const handleToggleAllPermissions = (module: string, isChecked: boolean) => {
    setPermissions((prev) => {
      const updatedPermissions = { ...prev };
      const moduleGroup = permissionGroups.find(g => g.title === module);
      if (isChecked && moduleGroup) {
        updatedPermissions[module] = moduleGroup.permissions;
      } else {
        updatedPermissions[module] = [];
      }
      validateForm(undefined, updatedPermissions);
      return updatedPermissions;
    });
  };

  const handleSubmit = () => {
    const formattedPermissions: string[] = [];
    Object.entries(permissions).forEach(([module, perms]) => {
      perms.forEach((perm) => {
        formattedPermissions.push(`${module}-${perm}`);
      });
    });

    if (!validateForm(name, permissions)) {
      showWarning("Por favor completa los campos obligatorios correctamente");
      return;
    }

    onSave(role.id, { id: role.id, name: name.trim(), state: status, permissions: formattedPermissions });
    onClose();
  };

  function PermissionCard({
    module,
    selected,
    allPermissions,
    onToggle,
    onToggleAll,
  }: {
    module: string;
    selected: string[];
    allPermissions: string[];
    onToggle: (module: string, permission: string) => void;
    onToggleAll: (module: string, isChecked: boolean) => void;
  }) {
    const isAllSelected = selected.length === allPermissions.length;

    return (
      <div
        className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        style={{
          border: `1px solid ${Colors.table.lines}`,
          backgroundColor: Colors.background.tertiary,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          {/* Checkbox "Seleccionar Todos" a la izquierda */}
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: Colors.texts.primary }}>
            <span
              onClick={() => onToggleAll(module, !isAllSelected)}
              className={`h-5 w-5 flex items-center justify-center border rounded-md transition-all duration-200 ${isAllSelected ? "animate-[scaleIn_0.2s_ease-in-out]" : ""}`}
              style={{
                backgroundColor: isAllSelected ? Colors.buttons.quaternary : Colors.background.primary,
                borderColor: isAllSelected ? Colors.buttons.quaternary : Colors.table.lines,
              }}
            >
              {isAllSelected && (
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </label>
          <span
            className="font-medium"
            style={{ color: Colors.texts.primary }}
          >
            {module}
          </span>
        </div>
        {/* Línea difuminada separadora */}
        <div className="h-[1px] my-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}></div>
        <div className="flex flex-wrap gap-3">
          {allPermissions.map((perm) => {
            const isChecked = selected.includes(perm);
            return (
              <label
                key={perm}
                className="flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: Colors.texts.primary }}
              >
                <span
                  onClick={() => onToggle(module, perm)}
                  className={`h-5 w-5 flex items-center justify-center border rounded-md transition-all duration-200 ${
                    isChecked ? "animate-[scaleIn_0.2s_ease-in-out]" : ""
                  }`}
                  style={{
                    backgroundColor: isChecked
                      ? Colors.buttons.quaternary
                      : Colors.background.primary,
                    borderColor: isChecked
                      ? Colors.buttons.quaternary
                      : Colors.table.lines,
                  }}
                >
                  {isChecked && (
                    <svg
                      className="h-3 w-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {perm}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Modal
      title="Editar Rol"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-sm transition-colors"
            style={{
              backgroundColor: Colors.buttons.tertiary,
              color: Colors.texts.quaternary,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md font-medium text-sm text-white"
            style={{
              backgroundColor: Colors.buttons.quaternary,
              color: Colors.texts.quaternary,
            }}
          >
            Actualizar
          </button>
        </>
      }
    >
      <div className="overflow-y-auto max-h-[60vh] space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
            Nombre del rol <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateForm(e.target.value, permissions);
            }}
            onBlur={() => validateForm()}
            placeholder="Ingrese nombre del rol"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: errors.name ? "red" : Colors.table.lines,
              outlineColor: Colors.buttons.quaternary,
            }}
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Activo" | "Inactivo")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: Colors.table.lines,
              outlineColor: Colors.buttons.quaternary,
            }}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <h3 className="text-center font-semibold" style={{ color: Colors.texts.primary }}>
          Permisos Asignados <span className="text-red-500">*</span>
        </h3>
        {errors.permissions && (
          <p className="text-center text-xs text-red-500">{errors.permissions}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {permissionGroups.map((group) => (
            <PermissionCard
              key={group.title}
              module={group.title}
              selected={permissions[group.title] || []}
              allPermissions={group.permissions}
              onToggle={handleTogglePermission}
              onToggleAll={handleToggleAllPermissions}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}