// validations/clientsValidations.ts
import { Dispatch, SetStateAction } from "react";
import { ClientBase, FormErrors, FormTouched } from "../types/typeClients";
import { showWarning } from "@/shared/utils/notifications";

// ==================== HELPERS ====================

export const hasNumbers = (str: string): boolean => /\d/.test(str);

export const hasSpecialChars = (str: string): boolean =>
  /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/.test(str);

// ==================== VALIDACIÓN DE CAMPOS ====================

export const validateField = (fieldName: string, value: string): string => {
  if (fieldName === "nombre") {
    if (!value.trim()) return "El nombre es requerido";
    if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
    if (/[0-9]/.test(value)) return "El nombre no puede contener números";
    if (hasSpecialChars(value)) return "El nombre no puede contener caracteres especiales";
  }

  if (fieldName === "documento") {
    if (!value.trim()) return "El documento es requerido";
    if (!/^[0-9]{6,15}$/.test(value))
      return "El documento debe tener entre 6 y 15 dígitos numéricos";
  }

  if (fieldName === "telefono") {
    if (!value.trim()) return "El teléfono es requerido";
    if (!/^[0-9]{7,10}$/.test(value))
      return "El teléfono debe ser un número válido de 7 a 10 dígitos";
  }

  if (fieldName === "correo") {
    if (!value.trim()) return "El correo es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Formato de correo inválido";
  }

  if (fieldName === "tipo") {
    if (!value.trim()) return "El tipo de documento es requerido";
  }

  if (fieldName === "rol") {
    if (!value.trim()) return "El rol es requerido";
  }

  if (fieldName === "estado") {
    if (!["Activo", "Inactivo"].includes(value))
      return "El estado debe ser Activo o Inactivo";
  }

  return "";
};

export const validateAllFields = (data: ClientBase): FormErrors => {
  return {
    nombre: validateField("nombre", data.nombre),
    documento: validateField("documento", data.documento),
    telefono: validateField("telefono", data.telefono),
    // validateField espera "correo", pero en el objeto usamos correoElectronico
    correoElectronico: validateField("correo", data.correoElectronico),
    tipo: validateField("tipo", data.tipo),
    rol: validateField("rol", data.rol),
    estado: validateField("estado", data.estado),
  };
};

// ==================== VALIDACIONES CON NOTIFICACIONES ====================

export const validateFormWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): boolean => {
  const newErrors = validateAllFields(formData);

  setErrors(newErrors);

  // Marcar todos los campos como tocados
  const allTouched = Object.keys(newErrors).reduce((acc, key) => {
    // @ts-ignore -- key proviene de FormErrors keys
    acc[key] = true;
    return acc;
  }, {} as Partial<FormTouched>);

  setTouched(allTouched as FormTouched);

  const hasErrors = Object.values(newErrors).some((error) => error !== "");

  if (hasErrors) {
    showWarning("Por favor complete los campos correctamente");

    const firstError = Object.values(newErrors).find((e) => e !== "");
    if (firstError) {
      setTimeout(() => {
        showWarning(firstError);
      }, 100);
    }

    return false;
  }

  return true;
};

// ==================== VALIDACIONES INDIVIDUALES CON NOTIFICACIÓN ====================

export const validateNombreWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("nombre", formData.nombre);
  setErrors((prev) => ({ ...prev, nombre: error }));
  setTouched((prev) => ({ ...prev, nombre: true }));
  if (error) showWarning(error);
};

export const validateDocumentoWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("documento", formData.documento);
  setErrors((prev) => ({ ...prev, documento: error }));
  setTouched((prev) => ({ ...prev, documento: true }));
  if (error) showWarning(error);
};

export const validateTelefonoWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("telefono", formData.telefono);
  setErrors((prev) => ({ ...prev, telefono: error }));
  setTouched((prev) => ({ ...prev, telefono: true }));
  if (error) showWarning(error);
};

export const validateCorreoWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("correo", formData.correoElectronico);
  setErrors((prev) => ({ ...prev, correoElectronico: error }));
  setTouched((prev) => ({ ...prev, correoElectronico: true }));
  if (error) showWarning(error);
};

export const validateTipoWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("tipo", formData.tipo);
  setErrors((prev) => ({ ...prev, tipo: error }));
  setTouched((prev) => ({ ...prev, tipo: true }));
  if (error) showWarning(error);
};

export const validateRolWithNotification = (
  formData: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): void => {
  const error = validateField("rol", formData.rol);
  setErrors((prev) => ({ ...prev, rol: error }));
  setTouched((prev) => ({ ...prev, rol: true }));
  if (error) showWarning(error);
};

