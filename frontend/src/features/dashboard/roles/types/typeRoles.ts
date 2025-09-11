// src/features/dashboard/roles/types/typeRoles.ts
export type Role = {
  id: number;
  name: string;
  state: "Activo" | "Inactivo";
  permissions?: string[]; // lista de permisos (ej: "Roles-Crear")
};

export type CreateRoleData = {
  name: string;
  permissions: string[];
};

export type EditRoleData = {
  id: number;
  name: string;
  state: "Activo" | "Inactivo";
  permissions?: string[];
};

export type PermissionGroup = {
  title: string;
  permissions: string[];
};

/** Props para los modales */
export interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoleData) => void;
}

export interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: EditRoleData) => void;
  role: Role | null;
}

export interface ViewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}
