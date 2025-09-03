import { CategoryFormData, FormErrors } from './types';

export const validateField = (fieldName: string, value: string): string => {
  let error = '';
  
  // Lista de caracteres especiales no permitidos
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  
  switch (fieldName) {
    case 'nombre':
      if (!value.trim()) {
        error = 'El nombre de la categoría es obligatorio';
      } else if (value.length < 3) {
        error = 'El nombre debe tener al menos 3 caracteres';
      } else if (/[0-9]/.test(value)) {
        error = 'El nombre no puede contener números';
      } else if (specialChars.test(value)) {
        error = 'El nombre no puede contener caracteres especiales';
      }
      break;
    case 'descripcion':
      if (value && specialChars.test(value)) {
        error = 'La descripción no puede contener caracteres especiales';
      }
      break;
  }
  
  return error;
};

export const validateAllFields = (formData: CategoryFormData): FormErrors => {
  const errors: FormErrors = {
    nombre: validateField('nombre', formData.nombre),
    descripcion: validateField('descripcion', formData.descripcion),
  };

  return errors;
};