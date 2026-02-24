//  IMPORTS 
import { Dispatch, SetStateAction } from "react";
import { ClientFormBase, FormErrors, FormTouched } from "../types/typeClients";
import { showWarning } from "@/shared/utils/notifications";

//  REGEX 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numericRegex = /^[0-9]+$/;
const alphaRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

// Definir todas las claves usadas en validación
type FieldKey =
  | "nombre"
  | "apellido"
  | "documento"
  | "telefono"
  | "correoElectronico"
  | "tipo"
  | "estado";

// REGLAS DE VALIDACIÓN 
export const fieldValidators: Record<FieldKey, (value: string) => string> = {
  nombre: (v: string) => {
    if (!v.trim()) return "El nombre es obligatorio";
    if (!alphaRegex.test(v)) return "El nombre solo puede contener letras y espacios";
    if (v.length < 2) return "El nombre debe tener mínimo 2 caracteres";
    return "";
  },

  apellido: (v: string) => {
    if (!v.trim()) return "El apellido es obligatorio";
    if (!alphaRegex.test(v)) return "El apellido solo puede contener letras y espacios";
    return "";
  },

  documento: (v: string) => {
    if (!v.trim()) return "El documento es obligatorio";
    if (!numericRegex.test(v)) return "El documento debe contener solo números";
    if (v.length < 6 || v.length > 15) return "El documento debe tener entre 6 y 15 dígitos";
    return "";
  },

  telefono: (v: string) => {
    if (!v.trim()) return "El teléfono es obligatorio";
    if (!numericRegex.test(v)) return "El teléfono debe contener solo números";
    if (v.length < 7 || v.length > 10) return "El teléfono debe ser un número válido (7-10 dígitos)";
    return "";
  },

  correoElectronico: (v: string) => {
    if (!v.trim()) return "El correo es obligatorio";
    if (!emailRegex.test(v)) return "El formato del correo es inválido";
    return "";
  },

  tipo: (v: string) => {
    if (!v.trim()) return "El tipo de documento es obligatorio";
    return "";
  },

  estado: (v: string) => {
    if (!v.trim()) return "El estado es obligatorio";
    if (!["Activo", "Inactivo"].includes(v)) return "El estado debe ser Activo o Inactivo";
    return "";
  },
};

// VALIDACIÓN GENERAL
export const validateAllFields = (data: Partial<ClientFormBase>): FormErrors => {
  const errors: FormErrors = {
    tipo: fieldValidators.tipo(data.tipo ?? ""),
    documento: fieldValidators.documento(data.documento ?? ""),
    nombre: fieldValidators.nombre(data.nombre ?? ""),
    apellido: fieldValidators.apellido(data.apellido ?? ""),
    telefono: fieldValidators.telefono(data.telefono ?? ""),
    correoElectronico: fieldValidators.correoElectronico(data.correoElectronico ?? ""),
  };

  // estado puede venir como booleano o string
  const estadoStr = typeof (data as any).estado === 'boolean' ? ((data as any).estado ? 'Activo' : 'Inactivo') : (data as any).estado ?? '';
  (errors as any).estado = fieldValidators.estado(estadoStr);

  return errors;
};

// VALIDACIÓN GLOBAL CON NOTIFICACIONES
export const validateFormWithNotification = (
  data: Partial<ClientFormBase>,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): boolean => {
  const errors = validateAllFields(data);

  setErrors(errors);

  // marcar todos como tocados
  setTouched({
    tipo: true,
    documento: true,
    nombre: true,
    apellido: true,
    telefono: true,
    correoElectronico: true,
  } as FormTouched);

  // marcar estado si existe
  (setTouched as any)((prev: any) => ({ ...prev, estado: true }));

  const firstError = Object.values(errors).find((x) => x !== "");

  if (firstError) {
    showWarning(firstError);
    return false;
  }

  return true;
};

// VALIDACIÓN DE UN SOLO CAMPO (REUTILIZABLE)
export const validateSingleField = <K extends FieldKey>(
  field: K,
  value: string,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
) => {
  const validator = fieldValidators[field];
  const error = validator(value);

  setErrors((prev) => ({ ...prev, [field]: error }));
  setTouched((prev) => ({ ...prev, [field]: true }));

  if (error) showWarning(error);
};
