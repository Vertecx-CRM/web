"use client";

import React from "react";
import Modal from "@/features/dashboard/components/Modal";
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
  if (!role) return null;

  // Agrupamos permisos por módulo (misma lógica original)
  const groupedPermissions: Record<string, string[]> = {};
  role.permissions?.forEach((p) => {
    const [module, perm] = p.split("-");
    if (!groupedPermissions[module]) groupedPermissions[module] = [];
    groupedPermissions[module].push(perm);
  });

  return (
    <Modal
      title="Ver Rol"
      isOpen={open}
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md font-medium text-sm text-white"
          style={{
            backgroundColor: Colors.buttons.quaternary,
            color: Colors.texts.quaternary,
          }}
        >
          Cerrar
        </button>
      }
    >
      <div className="overflow-y-auto max-h-[60vh] space-y-6">
        {/* Nombre del rol */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Nombre del rol
          </label>
          <input
            type="text"
            value={role.name}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            style={{ borderColor: Colors.table.lines }}
          />
        </div>

        {/* Permisos */}
        <h3
          className="text-center font-semibold"
          style={{ color: Colors.texts.primary }}
        >
          Permisos Asignados
        </h3>
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
          ]
            .filter((module) => (groupedPermissions[module] || []).length > 0) // <-- filtramos solo módulos con permisos
            .map((module) => (
              <PermissionCard
                key={module}
                module={module}
                selected={groupedPermissions[module] || []}
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
}: {
  module: string;
  selected: string[];
}) {
  const options = ["Editar", "Crear", "Eliminar", "Ver"];
  return (
    <div
      className="rounded-xl p-4 shadow-sm"
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
            <div
              key={opt}
              className="flex items-center gap-2 text-sm"
              style={{ color: Colors.texts.primary }}
            >
              <span
                className={`h-5 w-5 flex items-center justify-center border rounded-md`}
                style={{
                  backgroundColor: isChecked
                    ? Colors.buttons.quaternary
                    : Colors.background.primary,
                  borderColor: isChecked
                    ? Colors.buttons.quaternary
                    : Colors.table.lines,
                  opacity: 0.6,
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
            </div>
          );
        })}
      </div>
    </div>
  );
}