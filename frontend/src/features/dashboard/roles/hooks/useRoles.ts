import { useState } from "react";
import { Role, CreateRoleData, EditRoleData } from "../types/typeRoles";
import { initialRoles } from "../mocks/mockRoles";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { validateRoleForm } from "../validations/rolesValidations";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EditRoleData | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  const isEditModalOpen = editingRole !== null;
  const isViewModalOpen = viewingRole !== null;

  const selectedRole = editingRole ?? viewingRole ?? null;

  const handleCreateRole = (payload: CreateRoleData) => {
    const errors = validateRoleForm(payload, roles);
    if (errors.name) return showWarning(errors.name);
    if (errors.permissions) return showWarning(errors.permissions);

    const nextId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1;
    const newRole: Role = {
      id: nextId,
      name: payload.name.trim(),
      state: "Activo",
      permissions: payload.permissions,
    };
    setRoles(prev => [...prev, newRole]);
    setIsCreateModalOpen(false);
    showSuccess("Rol creado exitosamente!");
  };

  const handleEditRole = (id: number, payload: EditRoleData) => {
    const errors = validateRoleForm(payload, roles, id);
    if (errors.name) return showWarning(errors.name);
    if (errors.permissions) return showWarning(errors.permissions);

    setRoles(prev => prev.map(r => (r.id === id ? { ...r, ...payload, name: payload.name.trim() } : r)));
    setEditingRole(null);
    showSuccess("Rol actualizado exitosamente!");
  };

  const handleDeleteRole = async (role: Role): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: role.name,
        itemType: "rol",
        successMessage: `El rol "${role.name}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el rol. Intenta nuevamente.",
      },
      () => {
        setRoles(prev => prev.filter(r => r.id !== role.id));
      }
    );
  };

  const handleView = (role: Role) => {
    setViewingRole(role);
  };

  const handleEdit = (role: Role) => {
    setEditingRole({
      id: role.id,
      name: role.name,
      state: role.state,
      permissions: role.permissions ?? [],
    });
  };

  const handleDelete = async (role: Role) => {
    await handleDeleteRole(role);
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
    setIsEditModalOpen: (v: boolean) => { if (!v) setEditingRole(null); },

    isViewModalOpen,
    setIsViewModalOpen: (v: boolean) => { if (!v) setViewingRole(null); },

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
  };
};
