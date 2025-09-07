import { CategoryBase, FormErrors } from "../types/typeCategoryProducts";
import { showWarning } from "@/shared/utils/notifications";

export const validateField = (fieldName: string, value: string): string => {
  if (fieldName === 'nombre') {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (/[0-9]/.test(value)) return 'El nombre no puede contener números';
  }
  
  if (fieldName === 'descripcion') {
    // Solo validar si hay contenido, pero no es obligatorio
    if (value.trim() && value.length < 10) return 'La descripción debe tener al menos 10 caracteres si se proporciona';
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

// ==================== VALIDACIONES CON NOTIFICACIONES ====================

export const validateFormWithNotification = (
  formData: CategoryBase, 
  setErrors: (errors: FormErrors) => void,
  setTouched: (touched: { nombre: boolean; descripcion: boolean }) => void
): boolean => {
  const newErrors = validateAllFields(formData);
  
  setErrors(newErrors);
  
  // Marcar todos los campos como tocados
  const allTouched = {
    nombre: true,
    descripcion: true
  };
  
  setTouched(allTouched);
  
  // Solo considerar errores del nombre como relevantes (la descripción es opcional)
  const hasRelevantErrors = newErrors.nombre !== '';
  
  if (hasRelevantErrors) {
    // Mostrar notificación general
    showWarning('Por favor complete los campos correctamente');
    
    // Mostrar el error específico del nombre
    if (newErrors.nombre) {
      setTimeout(() => {
        showWarning(newErrors.nombre);
      }, 100);
    }
    
    return false;
  }
  
  return true;
};

// ==================== VALIDACIONES ESPECÍFICAS CON NOTIFICACIONES ====================

export const validateNombreWithNotification = (
  formData: CategoryBase,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<{ nombre: boolean; descripcion: boolean }>>
): boolean => {
  const nombreError = validateField('nombre', formData.nombre);
  
  setErrors(prev => ({ ...prev, nombre: nombreError }));
  setTouched(prev => ({ ...prev, nombre: true }));
  
  if (nombreError) {
    showWarning(nombreError);
    return false;
  }
  
  return true;
};

export const validateDescripcionWithNotification = (
  formData: CategoryBase,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<{ nombre: boolean; descripcion: boolean }>>
): boolean => {
  const descripcionError = validateField('descripcion', formData.descripcion);
  
  setErrors(prev => ({ ...prev, descripcion: descripcionError }));
  setTouched(prev => ({ ...prev, descripcion: true }));
  
  if (descripcionError) {
    showWarning(descripcionError);
    return false;
  }
  
  return true;
};

// Función para validar campos requeridos básicos
export const validateRequiredFieldsWithNotification = (
  formData: CategoryBase,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<{ nombre: boolean; descripcion: boolean }>>,
  fields: (keyof FormErrors)[]
): boolean => {
  const newErrors: Partial<FormErrors> = {};
  const newTouched: Partial<{ nombre: boolean; descripcion: boolean }> = {};
  
  fields.forEach(field => {
    // Solo validar nombre como requerido, descripción es opcional
    if (field === 'nombre') {
      const value = formData[field as keyof CategoryBase] as string;
      const error = validateField(field as string, value || '');
      
      if (error) {
        newErrors[field] = error;
        newTouched[field] = true;
      }
    }
  });
  
  // Actualizar estados
  setErrors(prev => ({ ...prev, ...newErrors }));
  setTouched(prev => ({ ...prev, ...newTouched } as { nombre: boolean; descripcion: boolean }));
  
  if (Object.keys(newErrors).length > 0) {
    showWarning('Por favor complete los campos requeridos');
    return false;
  }
  
  return true;
};