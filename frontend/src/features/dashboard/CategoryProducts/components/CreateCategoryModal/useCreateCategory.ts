import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CategoryFormData, FormErrors, FormTouched } from './types';
import { validateField, validateAllFields } from './validation';

export const useCreateCategory = (isOpen: boolean, onClose: () => void, onSave: (categoryData: any) => void) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: '',
    descripcion: '',
    icono: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    nombre: '',
    descripcion: ''
  });

  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    descripcion: false
  });

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        icono: null
      });
      setErrors({
        nombre: '',
        descripcion: ''
      });
      setTouched({
        nombre: false,
        descripcion: false
      });
    }
  }, [isOpen]);

  // Validar campos cuando cambian
  useEffect(() => {
    const newErrors = { ...errors };
    
    Object.keys(formData).forEach((key) => {
      if (key !== 'icono') {
        newErrors[key as keyof FormErrors] = validateField(
          key, 
          formData[key as keyof CategoryFormData] as string
        );
      }
    });
    
    setErrors(newErrors);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real para los campos
    if (name === 'nombre' || name === 'descripcion') {
      // No permitir caracteres especiales
      const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>]/;
      if (specialChars.test(value)) {
        return; // No actualizar el valor si contiene caracteres especiales
      }
      
      // Para el campo nombre, no permitir números
      if (name === 'nombre' && /[0-9]/.test(value)) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Marcar el campo como "touched" cuando el usuario interactúa con él
    setTouched(prev => ({...prev, [name]: true}));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, icono: file }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como "touched" para mostrar errores
    setTouched(prev => ({...prev, nombre: true, descripcion: true}));
    
    // Validar todos los campos antes de enviar
    const newErrors = validateAllFields(formData);
    setErrors(newErrors);
    
    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      // Mostrar mensaje de éxito con react-toastify
      toast.success('Categoría creada exitosamente!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      
      // Llamar a la función onSave para guardar los datos
      onSave(formData);
      
      // Cerrar el modal después de guardar
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Mostrar mensaje de error si hay campos inválidos
      toast.error('Por favor complete los campos correctamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit
  };
};