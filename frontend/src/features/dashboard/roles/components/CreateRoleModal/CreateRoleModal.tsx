"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";
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
    setTimeout(validateForm, 0); // mantiene validación en tiempo real
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
    Object.entries(permissions).forEach(([module, perms]) => {
      perms.forEach((perm) => {
        formattedPermissions.push(`${module}-${perm}`);
      });
    });

    onSubmit({ name: roleName.trim(), permissions: formattedPermissions });
    onClose();
  };

  return (
    <Modal
      title="Crear Rol"
      isOpen={open}
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
            Guardar
          </button>
        </>
      }
    >
      <div className="overflow-y-auto max-h-[60vh] space-y-6">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Nombre del rol <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Ingrese nombre de rol"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: errors.name ? "red" : Colors.table.lines,
              outlineColor: Colors.buttons.quaternary,
            }}
            onBlur={validateForm}
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>

        <h3
          className="text-center font-semibold"
          style={{ color: Colors.texts.primary }}
        >
          Permisos Asignados <span className="text-red-500">*</span>
        </h3>
        {errors.permissions && (
          <p className="text-center text-xs text-red-500">{errors.permissions}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            "Roles",
            "Usuarios",
            "Categoría de Productos",
            "Productos",
            "Proveedores",
            "Órdenes de Compra",
            "Compras",
            "Servicios",
            "Técnicos",
            "Horarios de los técnicos",
            "Clientes",
            "Solicitud de Servicio",
            "Citas",
            "Cotización de Servicio",
            "Orden de Servicio",
            "Dashboard",
          ].map((module) => (
            <PermissionCard
              key={module}
              module={module}
              selected={permissions[module] || []}
              onToggle={togglePermission}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function PermissionCard({
  module,
  selected,
  onToggle,
}: {
  module: string;
  selected: string[];
  onToggle: (module: string, permission: string) => void;
}) {
  const options = ["Editar", "Crear", "Eliminar", "Ver"];
  return (
    <div
      className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{
        border: `1px solid ${Colors.table.lines}`,
        backgroundColor: Colors.background.tertiary,
      }}
    >
      <span
        className="block font-medium mb-3"
        style={{ color: Colors.texts.primary }}
      >
        {module}
      </span>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm cursor-pointer"
              style={{ color: Colors.texts.primary }}
            >
              <span
                onClick={() => onToggle(module, opt)}
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
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}
