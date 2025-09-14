import { showWarning } from "@/shared/utils/notifications";
import { purchaseOrder, formErrors, formTouched } from "../types/typesPurchaseOrder";

// ==================== VALIDACIONES PURAS ====================

export const validateField = (
  fieldName: string, 
  value: string | number, 
  formData: purchaseOrder,
  isEditMode: boolean = false
): string => {
  let error = '';
  const specialChars = /[@,.;:\{\[\}^\]`+*~´¨¡¿'\\=)(/&%$#"!°|¬<>ç]/;
  const stringValue = String(value);

  switch (fieldName) {
    case 'numeroOrden':
      if (!stringValue.trim()) {
        error = 'El número de orden es obligatorio';
      } else if (stringValue.length < 3) {
        error = 'El número de orden debe tener al menos 3 caracteres';
      } else if (specialChars.test(stringValue)) {
        error = 'El número de orden no puede contener caracteres especiales';
      }
      break;
      
    case 'proveedor':
      if (!stringValue.trim()) {
        error = 'El proveedor es obligatorio';
      } else if (stringValue.length < 2) {
        error = 'El nombre del proveedor debe tener al menos 2 caracteres';
      } else if (/[0-9]/.test(stringValue)) {
        error = 'El nombre del proveedor no puede contener números';
      }
      break;
      
    case 'precioUnitario':
      const precio = typeof value === 'number' ? value : parseFloat(stringValue);
      if (isNaN(precio) || precio <= 0) {
        error = 'El precio unitario debe ser mayor a 0';
      } else if (precio > 999999999) {
        error = 'El precio unitario no puede exceder $999,999,999';
      }
      break;
      
    case 'fecha':
      if (!stringValue.trim()) {
        error = 'La fecha de entrega es obligatoria';
      } else {
        const fechaSeleccionada = new Date(stringValue);
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);
        
        if (isNaN(fechaSeleccionada.getTime())) {
          error = 'La fecha no es válida';
        } else if (fechaSeleccionada < fechaHoy) {
          error = 'La fecha de entrega no puede ser anterior a hoy';
        }
      }
      break;
      
    case 'cantidad':
      const cantidad = typeof value === 'number' ? value : parseInt(stringValue);
      if (isNaN(cantidad) || cantidad <= 0) {
        error = 'La cantidad debe ser mayor a 0';
      } else if (cantidad > 99999) {
        error = 'La cantidad no puede exceder 99,999 unidades';
      }
      break;
      
    case 'descripcion':
      // Descripción es opcional, pero si se proporciona, validar longitud
      if (stringValue.length > 500) {
        error = 'La descripción no puede exceder 500 caracteres';
      }
      break;
      
    default:
      break;
  }

  return error;
};

export const validateAllFields = (
  formData: purchaseOrder, 
  isEditMode: boolean = false
): formErrors => {
  // Proporcionar valores por defecto para campos opcionales
  const formDataWithDefaults = {
    ...formData,
    descripcion: formData.descripcion || '',
    cantidad: formData.cantidad || 1,
  };

  const errors: formErrors = {
    numeroOrden: validateField('numeroOrden', formData.numeroOrden, formDataWithDefaults, isEditMode),
    proveedor: validateField('proveedor', formData.proveedor, formDataWithDefaults, isEditMode),
    precioUnitario: validateField('precioUnitario', formData.precioUnitario, formDataWithDefaults, isEditMode),
    fecha: validateField('fecha', formData.fecha, formDataWithDefaults, isEditMode),
    cantidad: validateField('cantidad', formData.cantidad || 1, formDataWithDefaults, isEditMode),
    descripcion: validateField('descripcion', formData.descripcion || '', formDataWithDefaults, isEditMode),
  };

  return errors;
};

export const hasErrors = (errors: formErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
};

export const validateSpecificFields = (
  fields: string[], 
  formData: purchaseOrder, 
  isEditMode: boolean = false
): Partial<formErrors> => {
  const errors: Partial<formErrors> = {};
  
  // Crear objeto con valores por defecto
  const formDataWithDefaults = {
    ...formData,
    descripcion: formData.descripcion || '',
    cantidad: formData.cantidad || 1,
  };
  
  fields.forEach(field => {
    if (field in formDataWithDefaults) {
      const value = formDataWithDefaults[field as keyof purchaseOrder];
      errors[field as keyof formErrors] = validateField(
        field, 
        value as string | number, 
        formDataWithDefaults, 
        isEditMode
      );
    }
  });
  
  return errors;
};

// ==================== VALIDACIONES CON NOTIFICACIONES ====================

export const validateFormWithNotification = (
  formData: purchaseOrder, 
  setErrors: (errors: formErrors) => void,
  setTouched: (touched: formTouched) => void,
  isEditMode: boolean = false
): boolean => {
  const newErrors = validateAllFields(formData, isEditMode);
  
  setErrors(newErrors);
  
  // Marcar todos los campos como tocados
  const allTouched: formTouched = {
    numeroOrden: true,
    proveedor: true,
    precioUnitario: true,
    fecha: true,
    cantidad: true,
    descripcion: false, // Descripción es opcional, no la marcamos como tocada
  };
  
  setTouched(allTouched);
  
  // Considerar errores de campos obligatorios
  const relevantErrors = {
    numeroOrden: newErrors.numeroOrden,
    proveedor: newErrors.proveedor,
    precioUnitario: newErrors.precioUnitario,
    fecha: newErrors.fecha,
    cantidad: newErrors.cantidad,
    // descripcion es opcional, solo incluir si hay error
    ...(newErrors.descripcion && { descripcion: newErrors.descripcion })
  };

  const hasRelevantErrors = Object.values(relevantErrors).some(error => error !== '');
  
  if (hasRelevantErrors) {
    // Mostrar notificación general
    showWarning('Por favor complete los campos correctamente');
    
    // Mostrar el primer error específico
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

export const validatePriceWithNotification = (
  formData: purchaseOrder,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>
): boolean => {
  const priceError = validateField('precioUnitario', formData.precioUnitario, formData, false);
  const quantityError = validateField('cantidad', formData.cantidad || 1, formData, false);
  
  setErrors(prev => ({
    ...prev,
    precioUnitario: priceError,
    cantidad: quantityError
  }));
  
  setTouched(prev => ({
    ...prev,
    precioUnitario: true,
    cantidad: true
  }));
  
  if (priceError || quantityError) {
    if (priceError) showWarning(priceError);
    if (quantityError && quantityError !== priceError) showWarning(quantityError);
    return false;
  }
  
  return true;
};

export const validateProviderWithNotification = (
  formData: purchaseOrder,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>
): boolean => {
  const providerError = validateField('proveedor', formData.proveedor, formData, false);
  
  setErrors(prev => ({ ...prev, proveedor: providerError }));
  setTouched(prev => ({ ...prev, proveedor: true }));
  
  if (providerError) {
    showWarning(providerError);
    return false;
  }
  
  return true;
};

export const validateDateWithNotification = (
  formData: purchaseOrder,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>
): boolean => {
  const dateError = validateField('fecha', formData.fecha, formData, false);
  
  setErrors(prev => ({ ...prev, fecha: dateError }));
  setTouched(prev => ({ ...prev, fecha: true }));
  
  if (dateError) {
    showWarning(dateError);
    return false;
  }
  
  return true;
};

// Función para validar campos requeridos básicos
export const validateRequiredFieldsWithNotification = (
  formData: purchaseOrder,
  setErrors: React.Dispatch<React.SetStateAction<formErrors>>,
  setTouched: React.Dispatch<React.SetStateAction<formTouched>>,
  fields: (keyof formErrors)[]
): boolean => {
  const newErrors: Partial<formErrors> = {};
  const newTouched: Partial<formTouched> = {};
  
  fields.forEach(field => {
    const value = formData[field as keyof purchaseOrder];
    const error = validateField(field as string, value as string | number, formData, false);
    
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

// ==================== VALIDACIONES DE NEGOCIO ESPECÍFICAS ====================

// Validar que el total de la orden no exceda un límite
export const validateOrderTotal = (
  precioUnitario: number,
  cantidad: number,
  limiteMaximo: number = 50000000 // 50 millones por defecto
): string => {
  const total = precioUnitario * cantidad;
  
  if (total > limiteMaximo) {
    return `El total de la orden ($${total.toLocaleString('es-CO')}) excede el límite máximo permitido ($${limiteMaximo.toLocaleString('es-CO')})`;
  }
  
  return '';
};

// Validar código de orden único (simula verificación con base de datos)
export const validateUniqueOrderNumber = (
  numeroOrden: string,
  existingOrders: string[] = []
): string => {
  if (existingOrders.includes(numeroOrden)) {
    return 'Este número de orden ya existe. Por favor elija otro.';
  }
  
  return '';
};