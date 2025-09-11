// src/features/dashboard/roles/validations.ts
import { Role } from "../types/typeRoles";
import { showWarning } from "@/shared/utils/notifications";

export type RoleFormData = {
  name: string;
  status?: "Activo" | "Inactivo";
  permissions: string[];
};

export type RoleFormErrors = {
  name: string;
  permissions: string;
};

// ==================== VALIDACIONES INDIVIDUALES ====================

export const validateField = (
  fieldName: keyof RoleFormErrors,
  value: string,
  existingRoles: Role[] = [],
  currentRoleId?: number
): string => {
  if (fieldName === "name") {
    if (!value.trim()) return "El nombre del rol es obligatorio";
    if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";

    // Validar que no exista otro rol con el mismo nombre (ignorando el rol actual si estamos editando)
    const duplicate = existingRoles.find(
      (r) =>
        r.name.toLowerCase() === value.trim().toLowerCase() &&
        r.id !== currentRoleId
    );
    if (duplicate) return "Ya existe un rol con ese nombre";
  }

  if (fieldName === "permissions") {
    if (!value || value.length === 0) return "Debe asignar al menos un permiso";
  }

  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  if (specialChars.test(value)) return "No se permiten caracteres especiales";

  return "";
};

// ==================== VALIDAR TODO EL FORMULARIO ====================

export const validateAllFields = (
  data: RoleFormData,
  existingRoles: Role[],
  currentRoleId?: number
): RoleFormErrors => {
  return {
    name: validateField("name", data.name, existingRoles, currentRoleId),
    permissions: validateField("permissions", data.permissions.join(",")),
  };
};

// ==================== VALIDACIONES CON NOTIFICACIÓN ====================

export const validateFormWithNotification = (
  formData: RoleFormData,
  existingRoles: Role[],
  setErrors: React.Dispatch<React.SetStateAction<RoleFormErrors>>,
  currentRoleId?: number
): boolean => {
  const newErrors = validateAllFields(formData, existingRoles, currentRoleId);
  setErrors(newErrors);

  const hasErrors = Object.values(newErrors).some((e) => e !== "");
  if (hasErrors) {
    showWarning("Por favor complete los campos correctamente");
    return false;
  }
  return true;
};

// ==================== VALIDACIONES ESPECÍFICAS ====================

export const validateNameWithNotification = (
  formData: RoleFormData,
  existingRoles: Role[],
  setErrors: React.Dispatch<React.SetStateAction<RoleFormErrors>>,
  currentRoleId?: number
): boolean => {
  const error = validateField("name", formData.name, existingRoles, currentRoleId);
  setErrors((prev) => ({ ...prev, name: error }));
  if (error) showWarning(error);
  return !error;
};

export const validatePermissionsWithNotification = (
  formData: RoleFormData,
  setErrors: React.Dispatch<React.SetStateAction<RoleFormErrors>>
): boolean => {
  const error = validateField("permissions", formData.permissions.join(","));
  setErrors((prev) => ({ ...prev, permissions: error }));
  if (error) showWarning(error);
  return !error;
};
