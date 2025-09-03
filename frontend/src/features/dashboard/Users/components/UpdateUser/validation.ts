import { UserFormData, FormErrors } from '../../types';

export const validateField = (fieldName: string, value: string, formData: UserFormData): string => {
  let error = '';
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>ç]/;

  switch (fieldName) {
    case 'tipoDocumento':
      if (!value.trim()) error = 'El tipo de documento es obligatorio';
      break;
    case 'documento':
      if (!value.trim()) {
        error = 'El documento es obligatorio';
      } else if (!/^\d+$/.test(value)) {
        error = 'El documento solo puede contener números';
      }
      break;
    case 'nombre':
      if (!value.trim()) {
        error = 'El nombre es obligatorio';
      } else if (/[0-9]/.test(value)) {
        error = 'El nombre no puede contener números';
      } else if (specialChars.test(value)) {
        error = 'El nombre no puede contener caracteres especiales';
      }
      break;
    case 'apellido':
      if (!value.trim()) {
        error = 'El apellido es obligatorio';
      } else if (/[0-9]/.test(value)) {
        error = 'El apellido no puede contener números';
      } else if (specialChars.test(value)) {
        error = 'El apellido no puede contener caracteres especiales';
      }
      break;
    case 'telefono':
      if (!value.trim()) {
        error = 'El teléfono es obligatorio';
      } else if (!/^\d+$/.test(value)) {
        error = 'El teléfono solo puede contener números';
      } else if (value.length !== 10) {
        error = 'El teléfono debe tener exactamente 10 dígitos';
      }
      break;
    case 'password':
      if (value && value.length < 6) {
        error = 'La contraseña debe tener al menos 6 caracteres';
      } else if (formData.confirmPassword && value !== formData.confirmPassword) {
        error = 'Las contraseñas no coinciden';
      }
      break;
    case 'confirmPassword':
      if (!value.trim()) {
        error = 'Por favor confirme la contraseña';
      } else if (value !== formData.password) {
        error = 'Las contraseñas no coinciden';
      }
      break;
      case 'rol':
      if (!value.trim()) error = 'El rol es obligatorio';
      break;
  }

  return error;
};

export const validateAllFields = (formData: UserFormData): FormErrors => {
  const errors: FormErrors = {
    tipoDocumento: validateField('tipoDocumento', formData.tipoDocumento, formData),
    documento: validateField('documento', formData.documento, formData),
    nombre: validateField('nombre', formData.nombre, formData),
    apellido: validateField('apellido', formData.apellido, formData),
    telefono: validateField('telefono', formData.telefono, formData),
    email: '',
    rol: validateField('rol', formData.rol || '', formData),
    password: validateField('password', formData.password || '', formData),
    confirmPassword: validateField('confirmPassword', formData.confirmPassword || '', formData),
  };

  return errors;
};