//  IMPORTS 
import { Dispatch, SetStateAction } from "react";
import { ClientBase, FormErrors, FormTouched } from "../types/typeClients";
import { showWarning } from "@/shared/utils/notifications";

//  REGEX 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numericRegex = /^[0-9]+$/;
const alphaRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

// REGLAS DE VALIDACIÓN 
// Cada campo tiene su función unificada
export const fieldValidators: Record<keyof ClientBase,
(value: string) => string
> = {
  nombre: (v) => {
    if (!v.trim()) return "El nombre es obligatorio";
    if (!alphaRegex.test(v)) return "El nombre solo puede contener letras y espacios";
    if (v.length < 2) return "El nombre debe tener mínimo 2 caracteres";
    return "";
  },

  apellido: (v) => {
    if (!v.trim()) return "El apellido es obligatorio";
    if (!alphaRegex.test(v)) return "El apellido solo puede contener letras y espacios";
    return "";
  },

  documento: (v) => {
    if (!v.trim()) return "El documento es obligatorio";
    if (!numericRegex.test(v)) return "El documento debe contener solo números";
    if (v.length < 6 || v.length > 15)
      return "El documento debe tener entre 6 y 15 dígitos";
    return "";
  },

  telefono: (v) => {
    if (!v.trim()) return "El teléfono es obligatorio";
    if (!numericRegex.test(v)) return "El teléfono debe contener solo números";
    if (v.length < 7 || v.length > 10)
      return "El teléfono debe ser un número válido (7-10 dígitos)";
    return "";
  },

  correoElectronico: (v) => {
    if (!v.trim()) return "El correo es obligatorio";
    if (!emailRegex.test(v)) return "El formato del correo es inválido";
    return "";
  },

  tipo: (v) => {
    if (!v.trim()) return "El tipo de documento es obligatorio";
    return "";
  },

  rol: (v) => {
    if (!v.trim()) return "El rol es obligatorio";
    return "";
  },

  estado: (v) => {
    if (!v.trim()) return "El estado es obligatorio";
    if (!["Activo", "Inactivo"].includes(v))
      return "El estado debe ser Activo o Inactivo";
    return "";
  },

};

// VALIDACIÓN GENERAL

export const validateAllFields = (data: ClientBase): FormErrors => {
  const errors: FormErrors = {
    nombre: fieldValidators.nombre(data.nombre),
    apellido: fieldValidators.apellido(data.apellido),
    documento: fieldValidators.documento(data.documento),
    telefono: fieldValidators.telefono(data.telefono),
    correoElectronico: fieldValidators.correoElectronico(data.correoElectronico),
    tipo: fieldValidators.tipo(data.tipo),
    rol: fieldValidators.rol(data.rol),
    estado: fieldValidators.estado(data.estado),
  };

  return errors;
};

// VALIDACIÓN GLOBAL CON NOTIFICACIONES

export const validateFormWithNotification = (
  data: ClientBase,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
): boolean => {
  const errors = validateAllFields(data);

  setErrors(errors);

  // marcar todos como tocados
  setTouched({
    nombre: true,
    apellido: true,
    documento: true,
    telefono: true,
    correoElectronico: true,
    tipo: true,
    rol: true,
    estado: true,
  });

  const firstError = Object.values(errors).find((x) => x !== "");

  if (firstError) {
    showWarning(firstError);
    return false;
  }

  return true;
};

// VALIDACIÓN DE UN SOLO CAMPO (REUTILIZABLE)

export const validateSingleField = <
  K extends keyof ClientBase
>(
  field: K,
  value: string,
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  setTouched: Dispatch<SetStateAction<FormTouched>>
) => {
  const error = fieldValidators[field](value);

  setErrors((prev) => ({ ...prev, [field]: error }));
  setTouched((prev) => ({ ...prev, [field]: true }));

  if (error) showWarning(error);
};
