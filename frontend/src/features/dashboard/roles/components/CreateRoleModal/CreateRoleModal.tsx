import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";

export default function CreateRoleModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  // 🔑 Resetea datos cada vez que el modal se abre
  useEffect(() => {
    if (open) {
      setRoleName("");
      setPermissions({});
    }
  }, [open]);

  const togglePermission = (module: string, permission: string) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      return {
        ...prev,
        [module]: current.includes(permission)
          ? current.filter((p) => p !== permission)
          : [...current, permission],
      };
    });
  };

  const handleSubmit = () => {
  const formattedPermissions: string[] = [];

  Object.entries(permissions).forEach(([module, perms]) => {
    perms.forEach((perm) => {
      formattedPermissions.push(`${module}-${perm}`);
    });
  });

  onSubmit({ name: roleName, permissions: formattedPermissions });
  onClose();
};


  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative mx-auto flex flex-col max-h-[90vh]">
        {/* Botón cerrar */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div
          className="px-6 pt-6 pb-4 font-semibold text-2xl"
          style={{ color: Colors.texts.primary }}
        >
          Crear Rol
        </div>

        {/* DIVIDER */}
        <div
          className="w-full h-0 outline outline-1 outline-offset-[-0.5px] mx-auto"
          style={{ outlineColor: Colors.table.lines }}
        />

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {/* Nombre del Rol */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Nombre del rol
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ingrese nombre de rol"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{
                borderColor: Colors.table.lines,
                outlineColor: Colors.buttons.quaternary,
              }}
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
            ].map((module) => (
              <PermissionCard
                key={module}
                module={module}
                selected={permissions[module] || []}
                onToggle={togglePermission}
              />
            ))}
            {[
              "Órdenes de compras",
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

        {/* DIVIDER */}
        <div
          className="w-full h-0 outline outline-1 outline-offset-[-0.5px] mx-auto"
          style={{ outlineColor: Colors.table.lines }}
        />

        {/* FOOTER */}
        <div className="flex justify-end space-x-3 p-4">
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
        </div>
      </div>
    </div>,
    document.body
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
        backgroundColor: Colors.background.tertiary, // 🌸 más clarito
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
