import { CategoryBase, FormErrors } from "../types/typeCategoryProducts";
import { showWarning } from "@/shared/utils/notifications";

export const validateField = (fieldName: string, value: string): string => {
  if (fieldName === 'name') {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (/[0-9]/.test(value)) return 'El nombre no puede contener números';
  }
  
  if (fieldName === 'description') {
    // ✅ Validar longitud máxima (no obligatoria)
    if (value.trim() && value.length > 255)
      return 'La descripción no puede superar los 255 caracteres';
  }
  
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  if (specialChars.test(value)) return 'No se permiten caracteres especiales';
  
  return '';
};

export const validateAllFields = (data: CategoryBase): FormErrors => {
  return {
    name: validateField('name', data.name),
    description: validateField('descripcion', data.description)
  };
};

export const hasSpecialChars = (value: string): boolean => {
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
  return specialChars.test(value);
};

export const hasNumbers = (value: string): boolean => {
  return /[0-9]/.test(value);
};

// VALIDACIÓN DE NOMBRES DUPLICADOS 

export const isDuplicateName = (
  name: string,
  categories: { name: string; id?: number }[],
  currentId?: number
): boolean => {
  const normalizedName = name.trim().toLowerCase();

  return categories.some(
    (cat) =>
      cat.name.trim().toLowerCase() === normalizedName &&
      cat.id !== currentId 
  );
};


// VALIDACIONES CON NOTIFICACIONES 

export const validateFormWithNotification = (
  formData: CategoryBase, 
  setErrors: (errors: FormErrors) => void,
  setTouched: (touched: { name: boolean; description: boolean }) => void
): boolean => {
  const newErrors = validateAllFields(formData);
  
  setErrors(newErrors);
  
  // Marcar todos los campos como tocados
  const allTouched = {
    name: true,
    description: true
  };
  
  setTouched(allTouched);
  
  // Solo considerar errores del nombre como relevantes (la descripción es opcional)
  const hasRelevantErrors = newErrors.name !== '';
  
  if (hasRelevantErrors) {
    // Mostrar notificación general
    showWarning('Por favor complete los campos correctamente');
    
    // Mostrar el error específico del nombre
    if (newErrors.name) {
      setTimeout(() => {
        showWarning(newErrors.name);
      }, 100);
    }
    
    return false;
  }
  
  return true;
};

// VALIDACIONES ESPECÍFICAS CON NOTIFICACIONES 

export const validateNombreWithNotification = (
  formData: CategoryBase,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<{ name: boolean; description: boolean }>>
): boolean => {
  const nombreError = validateField('name', formData.name);
  
  setErrors(prev => ({ ...prev, name: nombreError }));
  setTouched(prev => ({ ...prev, name: true }));
  
  if (nombreError) {
    showWarning(nombreError);
    return false;
  }
  
  return true;
};

export const validateDescripcionWithNotification = (
  formData: CategoryBase,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<{ name: boolean; description: boolean }>>
): boolean => {
  const descripcionError = validateField('description', formData.description);
  
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
  setTouched: React.Dispatch<React.SetStateAction<{ name: boolean; description: boolean }>>,
  fields: (keyof FormErrors)[]
): boolean => {
  const newErrors: Partial<FormErrors> = {};
  const newTouched: Partial<{ name: boolean; descripcion: boolean }> = {};
  
  fields.forEach(field => {
    // Solo validar nombre como requerido, descripción es opcional
    if (field === 'name') {
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
  setTouched(prev => ({ ...prev, ...newTouched } as { name: boolean; description: boolean }));
  
  if (Object.keys(newErrors).length > 0) {
    showWarning('Por favor complete los campos requeridos');
    return false;
  }
  
  return true;
};