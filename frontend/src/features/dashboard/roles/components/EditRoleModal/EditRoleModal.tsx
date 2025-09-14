// src/features/dashboard/roles/components/EditRoleModal/EditRole.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { EditRoleData, PermissionGroup } from "../../types/typeRoles";

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
  { title: "Dashboard", permissions: ["Crear", "Editar", "Eliminar", "Ver"] },
];


interface EditRoleModalProps {
  isOpen: boolean;
  role: EditRoleData | null;
  onClose: () => void;
  onSave: (id: number, data: EditRoleData) => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  role,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Activo" | "Inactivo">("Activo");
  const [permissions, setPermissions] = useState<string[]>([]);
useEffect(() => {
  if (role) {
    setName(role.name);
    setStatus(role.status as "Activo" | "Inactivo");

    const rolePerms = Array.isArray(role.permissions) ? role.permissions : [];

    const rolePermissionsWithGroup: string[] = [];

    permissionGroups.forEach((group) => {
      group.permissions.forEach((perm) => {
        const key = `${group.title}-${perm}`;
        if (rolePerms.includes(key)) {
          rolePermissionsWithGroup.push(key);
        }
      });
    });

    setPermissions(rolePermissionsWithGroup);
  }
}, [role]);




  if (!isOpen || !role) return null;

  const handleTogglePermission = (key: string) => {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(role.id, { id: role.id, name: name.trim(), status, permissions });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative mx-auto flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="px-6 pt-6 pb-4 font-semibold text-2xl" style={{ color: Colors.texts.primary }}>
          Editar Rol
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] mx-auto" style={{ outlineColor: Colors.table.lines }} />

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre del rol
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingrese nombre del rol"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: Colors.table.lines, outlineColor: Colors.buttons.quaternary }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Activo" | "Inactivo")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: Colors.table.lines, outlineColor: Colors.buttons.quaternary }}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <h3 className="text-center font-semibold" style={{ color: Colors.texts.primary }}>
            Permisos Asignados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {permissionGroups.map((group) => (
              <PermissionCard
                key={group.title}
                group={group}
                selected={permissions}
                onToggle={handleTogglePermission}
              />
            ))}
          </div>

          <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] mx-auto" style={{ outlineColor: Colors.table.lines }} />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors"
              style={{ backgroundColor: Colors.buttons.tertiary, color: Colors.texts.quaternary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-sm text-white"
              style={{ backgroundColor: Colors.buttons.quaternary, color: Colors.texts.quaternary }}
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

function PermissionCard({
  group,
  selected,
  onToggle,
}: {
  group: PermissionGroup;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ border: `1px solid ${Colors.table.lines}`, backgroundColor: Colors.background.tertiary }}>
      <span className="block font-medium mb-3" style={{ color: Colors.texts.primary }}>
        {group.title}
      </span>
      <div className="flex flex-wrap gap-3">
        {group.permissions.map((perm) => {
          const key = `${group.title}-${perm}`;
          const isChecked = selected.includes(key);
          return (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: Colors.texts.primary }}>
              <span
                onClick={() => onToggle(key)}
                className={`h-5 w-5 flex items-center justify-center border rounded-md transition-all duration-200 ${isChecked ? "animate-[scaleIn_0.2s_ease-in-out]" : ""}`}
                style={{ backgroundColor: isChecked ? Colors.buttons.quaternary : Colors.background.primary, borderColor: isChecked ? Colors.buttons.quaternary : Colors.table.lines }}
              >
                {isChecked && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

export default EditRoleModal;
