import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, UserFormData, FormErrors, FormTouched } from '../../types';
import { validateField, validateAllFields } from './validation';

export const useEditUser = (user: User | null, isOpen: boolean, onClose: () => void, onSave: (userData: any) => void) => {
  const [formData, setFormData] = useState<UserFormData>({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    imagen: null,
    estado: 'Activo'
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

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      // Separar nombre y apellido
      const nombreCompleto = user.nombre?.split(' ') || [];
      const nombre = nombreCompleto[0] || '';
      const apellido = nombreCompleto.slice(1).join(' ') || '';

      setFormData({
        id: user.id,
        tipoDocumento: user.documento || '',
        documento: user.numeroDocumento || '',
        nombre: nombre,
        apellido: apellido,
        telefono: user.telefono || '',
        email: user.email || '',
        rol: user.rol || 'Usuario', 
        imagen: null,
        estado: user.estado || 'Activo'
      });

      // Resetear errores y touched
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
  }, [isOpen, user]);

  // Validar campos cuando cambian
  useEffect(() => {
    const newErrors = { ...errors };

    Object.keys(formData).forEach((key) => {
      if (key !== 'imagen' && key !== 'email' && key !== 'estado' && key !== 'id') {
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

    // Validar todos los campos antes de enviar (excluyendo password y confirmPassword)
    const validationData = {
      ...formData,
      password: 'dummy', // Valor dummy para evitar errores de validación
      confirmPassword: 'dummy'
    };

    const newErrors = validateAllFields(validationData);

    // Eliminar errores de password y confirmPassword ya que no son requeridos en edición
    const filteredErrors = {
      ...newErrors,
      password: '',
      confirmPassword: ''
    };

    setErrors(filteredErrors);

    // Verificar si hay errores (excluyendo password y confirmPassword)
    const hasErrors = Object.entries(filteredErrors)
      .filter(([key]) => key !== 'password' && key !== 'confirmPassword')
      .some(([_, error]) => error !== '');

    if (!hasErrors) {
      // Preparar datos para enviar
      const userData = {
        id: formData.id!,
        tipoDocumento: formData.tipoDocumento,
        documento: formData.documento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email,
        rol: formData.rol || 'Usuario',
        estado: formData.estado || 'Activo'
      };

      // Mostrar mensaje de éxito con react-toastify
      toast.success('Usuario actualizado exitosamente!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });

      // Llamar a la función onSave para guardar los datos
      onSave(userData);

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