import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, UserFormData, FormErrors, FormTouched } from '../../types';
import { validateField, validateAllFields } from './validation';

export const useCreateUser = (isOpen: boolean, onClose: () => void, onSave: (userData: any) => void) => {
  const [formData, setFormData] = useState<UserFormData>({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    imagen: null,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipoDocumento: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    email: false,
    rol: false,
    password: false,
    confirmPassword: false,
  });

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        imagen: null,
        password: '',
        confirmPassword: '',
      });
      setErrors({
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        rol: '',
        password: '',
        confirmPassword: '',
      });
      setTouched({
        tipoDocumento: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        email: false,
        rol: false,
        password: false,
        confirmPassword: false,
      });
    }
  }, [isOpen]);

  // Validar campos cuando cambian
  useEffect(() => {
    const newErrors = { ...errors };
    
    Object.keys(formData).forEach((key) => {
      if (key !== 'imagen' && key !== 'email') {
        newErrors[key as keyof FormErrors] = validateField(
          key, 
          formData[key as keyof UserFormData] as string, 
          formData
        );
      }
    });
    
    setErrors(newErrors);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Validación en tiempo real para campos numéricos
    if ((name === 'documento' || name === 'telefono') && value && !/^\d*$/.test(value)) {
      return; // No actualizar el valor si no es numérico
    }

    // Validación en tiempo real para nombre y apellido (no permitir caracteres especiales)
    if ((name === 'nombre' || name === 'apellido') && value) {
      const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>ç]/;
      if (specialChars.test(value)) {
        return; // No actualizar el valor si contiene caracteres especiales
      }
    }

    if (name === 'imagen' && type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const selectedFile = fileInput.files?.[0];
      if (selectedFile) {
        setFormData(prev => ({ ...prev, imagen: selectedFile }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Marcar el campo como "touched" cuando el usuario interactúa con él
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como "touched" para mostrar todos los errores
    const allTouched = Object.keys(touched).reduce((acc, key) => {
      acc[key as keyof FormTouched] = true;
      return acc;
    }, {} as FormTouched);

    setTouched(allTouched);

    // Validar todos los campos antes de enviar
    const newErrors = validateAllFields(formData);
    setErrors(newErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    if (!hasErrors) {
      // Mostrar mensaje de éxito con react-toastify
      toast.success('Usuario creado exitosamente!', {
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
      toast.error('Por favor complete todos los campos correctamente', {
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
    handleBlur,
    handleSubmit
  };
};