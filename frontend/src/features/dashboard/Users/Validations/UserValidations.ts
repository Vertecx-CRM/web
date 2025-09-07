import { showWarning } from "@/shared/utils/notifications";
import { user, formErrors, formTouched } from "../types/typesUser";


// ==================== VALIDACIONES PURAS ====================

export const validateField = (
  fieldName: string, 
  value: string, 
  formData: user,
  isEditMode: boolean = false
): string => {
  let error = '';
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>ç]/;

  switch (fieldName) {
    case 'tipoDocumento':
      if (!value.trim()) error = 'El tipo de documento es obligatorio';
      break;
      
    case 'numeroDocumento':
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
      // Apellido ahora es obligatorio
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
      
    case 'email':
      if (!value.trim()) {
        error = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'El formato del email no es válido';
      }
      break;
      
    case 'rol':
      // Rol ya no es obligatorio, se asignará "Usuario" por defecto
      if (value && specialChars.test(value)) {
        error = 'El rol no puede contener caracteres especiales';
      }
      break;
      
    case 'password':
      // En modo edición, la contraseña es opcional
      if (!isEditMode && !value.trim()) {
        error = 'La contraseña es obligatoria';
      } else if (value && value.length < 6) {
        error = 'La contraseña debe tener al menos 6 caracteres';
      } else if (value && formData.confirmPassword && value !== formData.confirmPassword) {
        error = 'Las contraseñas no coinciden';
      }
      break;
      
    case 'confirmPassword':
      // En modo edición, la confirmación es opcional si no hay password
      if (!isEditMode && !value.trim()) {
        error = 'Por favor confirme la contraseña';
      } else if (value && formData.password && value !== formData.password) {
        error = 'Las contraseñas no coinciden';
      }
      break;
      
    default:
      break;
  }

  return error;
};

export const validateAllFields = (
  formData: user, 
  isEditMode: boolean = false
): formErrors => {
  // Proporcionar valores por defecto para campos opcionales
  const formDataWithDefaults = {
    ...formData,
    apellido: formData.apellido || '',
    rol: formData.rol || 'Usuario', 
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || ''
  };

  const errors: formErrors = {
    tipoDocumento: validateField('tipoDocumento', formData.tipoDocumento, formDataWithDefaults, isEditMode),
    numeroDocumento: validateField('numeroDocumento', formData.numeroDocumento, formDataWithDefaults, isEditMode),
    nombre: validateField('nombre', formData.nombre, formDataWithDefaults, isEditMode),
    apellido: validateField('apellido', formData.apellido || '', formDataWithDefaults, isEditMode),
    telefono: validateField('telefono', formData.telefono, formDataWithDefaults, isEditMode),
    email: validateField('email', formData.email, formDataWithDefaults, isEditMode),
    rol: validateField('rol', formData.rol || 'Usuario', formDataWithDefaults, isEditMode), 
    password: validateField('password', formData.password || '', formDataWithDefaults, isEditMode),
    confirmPassword: validateField('confirmPassword', formData.confirmPassword || '', formDataWithDefaults, isEditMode),
  };

  return errors;
};

export const hasErrors = (errors: formErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
};

export const validateSpecificFields = (
  fields: string[], 
  formData: user, 
  isEditMode: boolean = false
): Partial<formErrors> => {
  const errors: Partial<formErrors> = {};
  
  // Crear objeto con valores por defecto
  const formDataWithDefaults = {
    ...formData,
    apellido: formData.apellido || '',
    rol: formData.rol || 'Usuario', 
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || ''
  };
  
  fields.forEach(field => {
    if (field in formDataWithDefaults) {
      const value = formDataWithDefaults[field as keyof user] as string;
      errors[field as keyof formErrors] = validateField(
        field, 
        value, 
        formDataWithDefaults, 
        isEditMode
      );
    }
  });
  
  return errors;
};

// ==================== VALIDACIONES CON NOTIFICACIONES ====================

// En UserValidations.ts, actualiza la función:
export const validateFormWithNotification = (
  formData: user, 
  setErrors: (errors: formErrors) => void,
  setTouched: (touched: formTouched) => void,
  isEditMode: boolean = false
): boolean => {
  // Para edición, ignoramos validación de password
  const validationData = isEditMode 
    ? { ...formData, password: '', confirmPassword: '' }
    : formData;

  const newErrors = validateAllFields(validationData, isEditMode);
  
  // En modo edición, limpiar errores de password
  const finalErrors = isEditMode 
    ? { ...newErrors, password: '', confirmPassword: '' }
    : newErrors;

  setErrors(finalErrors);
  
  // Marcar todos los campos como tocados (excepto password en edición)
  const allTouched: formTouched = {
    tipoDocumento: true,
    numeroDocumento: true,
    nombre: true,
    apellido: true,
    telefono: true,
    email: true,
    rol: true,
    estado: true,
    password: isEditMode ? false : true, // No marcar password como tocado en edición
    confirmPassword: isEditMode ? false : true,
  };
  
  setTouched(allTouched);
  
  // Para edición, solo considerar errores de campos relevantes
  const relevantErrors = isEditMode
    ? {
        tipoDocumento: finalErrors.tipoDocumento,
        numeroDocumento: finalErrors.numeroDocumento,
        nombre: finalErrors.nombre,
        apellido: finalErrors.apellido,
        telefono: finalErrors.telefono,
        email: finalErrors.email,
        rol: finalErrors.rol,
        estado: finalErrors.estado || '',
      }
    : finalErrors;

  const hasRelevantErrors = Object.values(relevantErrors).some(error => error !== '');
  
  if (hasRelevantErrors) {
    // Mostrar notificación general
    showWarning('Por favor complete los campos correctamente');
    
    // También mostrar el primer error específico (opcional)
    const firstError = Object.values(relevantErrors).find(error => error !== '');
    if (firstError) {
      setTimeout(() => {
        showWarning(firstError);
      }, 100);
    }
    
    return false;
  }
  
  return true;
};
// ==================== VALIDACIONES ESPECÍFICAS CON NOTIFICACIONES ====================

export const validatePasswordWithNotification = (
  formData: user,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>
): boolean => {
  const passwordError = validateField('password', formData.password || '', formData, false);
  const confirmError = validateField('confirmPassword', formData.confirmPassword || '', formData, false);
  
  setErrors(prev => ({
    ...prev,
    password: passwordError,
    confirmPassword: confirmError
  }));
  
  setTouched(prev => ({
    ...prev,
    password: true,
    confirmPassword: true
  }));
  
  if (passwordError || confirmError) {
    if (passwordError) showWarning(passwordError);
    if (confirmError && confirmError !== passwordError) showWarning(confirmError);
    return false;
  }
  
  return true;
};

export const validateEmailWithNotification = (
  formData: user,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>
): boolean => {
  const emailError = validateField('email', formData.email, formData, false);
  
  setErrors(prev => ({ ...prev, email: emailError }));
  setTouched(prev => ({ ...prev, email: true }));
  
  if (emailError) {
    showWarning(emailError);
    return false;
  }
  
  return true;
};

// Función para validar campos requeridos básicos
export const validateRequiredFieldsWithNotification = (
  formData: user,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>,
  fields: (keyof formErrors)[]
): boolean => {
  const newErrors: Partial<formErrors> = {};
  const newTouched: Partial<formTouched> = {};
  
  fields.forEach(field => {
    const value = formData[field as keyof user] as string;
    const error = validateField(field as string, value || '', formData, false);
    
    if (error) {
      newErrors[field] = error;
      newTouched[field] = true;
    }
  });
  
  // Actualizar estados
  setErrors(prev => ({ ...prev, ...newErrors }));
  setTouched(prev => ({ ...prev, ...newTouched } as formTouched));
  
  if (Object.keys(newErrors).length > 0) {
    showWarning('Por favor complete los campos requeridos');
    return false;
  }
  
  return true;
};