import { CategoryBase, FormErrors } from "../types/typeCategoryProducts";

export const validateField = (fieldName: string, value: string): string => {
  if (fieldName === 'nombre') {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.length < 5) return 'El nombre debe tener al menos 2 caracteres';
    if (/[0-9]/.test(value)) return 'El nombre no puede contener números';
  }
  
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  if (specialChars.test(value)) return 'No se permiten caracteres especiales';
  
  return '';
};

export const validateAllFields = (data: CategoryBase): FormErrors => {
  return {
    nombre: validateField('nombre', data.nombre),
    descripcion: validateField('descripcion', data.descripcion)
  };
};

export const hasSpecialChars = (value: string): boolean => {
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  return specialChars.test(value);
};

export const hasNumbers = (value: string): boolean => {
  return /[0-9]/.test(value);
};