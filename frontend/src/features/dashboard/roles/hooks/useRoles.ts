"use client";

import { useCallback, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Role, CreateRoleData, EditRoleData } from "../types/typeRoles";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { validateRoleForm } from "../validations/rolesValidations";
import {
  getRoles as apiGetRoles,
  deleteRole as apiDeleteRole,
  getRoleDetail,
  createRole as apiCreateRole,
  updateRoleMatrix,
  patchRoleMeta,
} from "../api/roles.api";

const MODULE_TO_PERMISSION_ID: Record<string, number> = {
  Roles: 1,
  Usuarios: 2,
  "Categoría de Productos": 3,
  Productos: 4,
  Proveedores: 5,
  "Órdenes de Compra": 6,
  Compras: 7,
  Servicios: 8,
  Técnicos: 9,
  Clientes: 10,
  "Solicitud de Servicio": 11,
  Citas: 12,
  "Cotización de Servicio": 13,
  "Orden de Servicio": 14,
  Dashboard: 15,
  Ventas: 16,
};


const PRIVILEGE_TO_ID: Record<string, number> = {
  Crear: 1,
  Ver: 2,
  Editar: 3,
  Eliminar: 4,
  Desactivar: 5,
};

function isValidConfig(
  v: { permissionid: number; privilegeid: number } | null
): v is { permissionid: number; privilegeid: number } {
  return v !== null;
}

const toUiStatus = (s?: string): "Activo" | "Inactivo" =>
  (s ?? "").toLowerCase() === "active" ? "Activo" : "Inactivo";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EditRoleData | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);

  const isEditModalOpen = editingRole !== null;
  const isViewModalOpen = viewingRole !== null;
  const selectedRole = editingRole ?? viewingRole ?? null;
  const isDefaultAdmin = (role: { id: number }) => Number(role.id) === 1;

  const DEFAULT_ADMIN_WARNING =
    "El rol administrador inicial no puede ser editado ni eliminado.";

  const loadRoles = useCallback(async () => {
    const rows = await apiGetRoles();
    const mapped: Role[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      permissions: [],
    }));
    setRoles(mapped);
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);


  const handleCreateRole = async (payload: CreateRoleData) => {
    const errors = validateRoleForm(payload, roles);
    if (errors.name) return showWarning(errors.name);
    if (errors.permissions) return showWarning(errors.permissions);

    const roleconfigurations = payload.permissions
      .map((token) => {
        const idx = token.lastIndexOf("-");
        if (idx === -1) return null;
        const moduleName = token.slice(0, idx);
        const privilegeName = token.slice(idx + 1);

        const permissionid = MODULE_TO_PERMISSION_ID[moduleName];
        const privilegeid = PRIVILEGE_TO_ID[privilegeName];

        if (!permissionid || !privilegeid) return null;

        return { permissionid, privilegeid };
      })
      .filter(isValidConfig);

    if (roleconfigurations.length === 0) {
      return showWarning("No se pudo mapear ningún permiso a IDs válidos.");
    }

    try {
      setCreating(true);
      await apiCreateRole({
        name: payload.name.trim(),
        roleconfigurations,
        status: "active",
      });
      await loadRoles();
      setIsCreateModalOpen(false);
      showSuccess("Rol creado exitosamente!");
    } finally {
      setCreating(false);
    }
  };

  const buildMatrixFromTokens = (tokens: string[]) => {
    const map = new Map<number, number[]>();

    for (const t of tokens) {
      const idx = t.lastIndexOf("-");
      if (idx === -1) continue;

      const moduleName = t.slice(0, idx);
      const privilegeName = t.slice(idx + 1);

      const permissionid = MODULE_TO_PERMISSION_ID[moduleName];
      const privilegeid = PRIVILEGE_TO_ID[privilegeName];
      if (!permissionid || !privilegeid) continue;

      const arr = map.get(permissionid) ?? [];
      if (!arr.includes(privilegeid)) arr.push(privilegeid);

      map.set(permissionid, arr);
    }

    return Array.from(map.entries()).map(([permissionid, privilegeids]) => ({
      permissionid,
      privilegeids,
    }));
  };


  const handleEditRole = async (id: number, payload: EditRoleData) => {
    if (isDefaultAdmin({ id })) {
      return showWarning(DEFAULT_ADMIN_WARNING);
    }

    const errors = validateRoleForm(payload, roles, id);
    if (errors.name) return showWarning(errors.name);
    if (errors.permissions) return showWarning(errors.permissions);

    const items = buildMatrixFromTokens(payload.permissions ?? []);
    if (items.length === 0) {
      return showWarning("Debe seleccionar al menos un permiso/privilegio.");
    }

    try {
      await updateRoleMatrix(id, items);

      await patchRoleMeta(id, {
        name: payload.name.trim(),
        status: payload.state,
      });

      await loadRoles();
      setEditingRole(null);
      showSuccess("Rol actualizado exitosamente!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar el rol.";
      showWarning(Array.isArray(msg) ? msg.join(", ") : msg);
      console.error("Error al editar rol:", err);
    }
  };

  const handleView = async (role: Role) => {
    try {
      const { role: roleInfo, configurations } = await getRoleDetail(role.id);

      const mappedPermissions = configurations.map(
        (cfg: any) => `${cfg.permission.module}-${cfg.privilege.name}`
      );

      setViewingRole({
        ...role,
        permissions: mappedPermissions,
        state: toUiStatus(roleInfo.status),
      });
    } catch (err) {
      console.error("Error al obtener detalle del rol:", err);
      setViewingRole(role);
    }
  };

  const handleEdit = async (role: Role) => {
    if (isDefaultAdmin(role)) {
      return showWarning(DEFAULT_ADMIN_WARNING);
    }

    try {
      const { role: roleInfo, configurations } = await getRoleDetail(role.id);

      const mappedPermissions = configurations.map(
        (cfg: any) => `${cfg.permission.module}-${cfg.privilege.name}`
      );

      setEditingRole({
        id: roleInfo.roleid,
        name: roleInfo.name,
        state: toUiStatus(roleInfo.status),
        permissions: mappedPermissions,
      });
    } catch (err) {
      console.error("Error al obtener detalle de rol:", err);
      setEditingRole({
        id: role.id,
        name: role.name,
        state: role.state,
        permissions: [],
      });
    }
  };

  const handleDelete = async (role: Role) => {
    if (isDefaultAdmin(role)) {
      return showWarning(DEFAULT_ADMIN_WARNING);
    }

    await handleDeleteRole(role);
  };

  const handleDeleteRole = async (role: Role): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: role.name,
        itemType: "rol",
        successMessage: `El rol "${role.name}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el rol. Intenta nuevamente.",
      },
      async () => {
        try {
          await apiDeleteRole(role.id);
          await loadRoles();
        } catch (err) {
          const ax = err as AxiosError<any>;

          if (ax.response?.status === 404) {
            showWarning("El rol ya no existe.");
          } else if (ax.response?.status === 400 || ax.response?.status === 409) {
            showWarning(
              ax.response?.data?.message ??
                "No se puede eliminar el rol (está vinculado a usuarios)."
            );
          } else {
            showWarning("Ocurrió un error al eliminar el rol.");
          }

          throw err;
        }
      }
    );
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingRole(null);
    setViewingRole(null);
  };

  return {
    roles,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen: (v: boolean) => !v && setEditingRole(null),
    isViewModalOpen,
    setIsViewModalOpen: (v: boolean) => !v && setViewingRole(null),
    selectedRole,

    handleCreateRole,
    handleEditRole,
    handleView,
    handleEdit,
    handleDelete,

    closeModals,

    editingRole,
    viewingRole,
    setEditingRole,
    setViewingRole,

    creating,
  };
};
