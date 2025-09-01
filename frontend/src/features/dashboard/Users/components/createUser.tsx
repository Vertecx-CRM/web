import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    imagen: null as File | null,
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    tipoDocumento: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoDocumento: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        imagen: null,
        password: "",
        confirmPassword: "",
      });
      setErrors({
        tipoDocumento: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setTouched({
        tipoDocumento: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        email: false,
        password: false,
        confirmPassword: false,
      });
    }
  }, [isOpen]);

  // Validar campos cuando cambian
  useEffect(() => {
    validateField("tipoDocumento", formData.tipoDocumento);
    validateField("documento", formData.documento);
    validateField("nombre", formData.nombre);
    validateField("apellido", formData.apellido);
    validateField("telefono", formData.telefono);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);
  }, [formData]);

    const validateField = (fieldName: string, value: string) => {
        let error = '';

        // Lista de caracteres especiales no permitidos
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
                    setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
                } else if (formData.confirmPassword && value === formData.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
                break;
            case 'confirmPassword':
                if (!value.trim()) {
                    error = 'Por favor confirme la contraseña';
                } else if (value !== formData.password) {
                    error = 'Las contraseñas no coinciden';
                }
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
    };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
            acc[key as keyof typeof touched] = true;
            return acc;
        }, {} as typeof touched);

        setTouched(allTouched);

        // Validar todos los campos antes de enviar
        validateField('tipoDocumento', formData.tipoDocumento);
        validateField('documento', formData.documento);
        validateField('nombre', formData.nombre);
        validateField('apellido', formData.apellido);
        validateField('telefono', formData.telefono);
        validateField('password', formData.password);
        validateField('confirmPassword', formData.confirmPassword);

        // Verificar si hay errores
        const hasErrors = Object.values(errors).some(error => error !== '');

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

  if (!isOpen) return null;

    return createPortal(

        <>

            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">

                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50">


                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10"
                    >
                        <img
                            src="/icons/X.svg"
                            alt="Cerrar"
                            className="w-6 h-6"
                        />
                    </button>

          {/* Header */}
          <div className="px-6 py-4 rounded-t-lg text-black font-semibold text-3xl">
            Crear usuario
          </div>

          <div className="w-110 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Documento */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Documento
                            </label>
                            <div className="flex gap-0.5">
                                {/* Select de tipo de documento */}
                                <div className="flex relative">
                                    <select
                                        name="tipoDocumento"
                                        value={formData.tipoDocumento}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className="w-19 px-3 py-2 border border-gray-300 rounded-md"
                                        style={{
                                            borderColor: errors.tipoDocumento && touched.tipoDocumento ? 'red' : Colors.table.lines,
                                        }}

                                    >
                                        <option value="" disabled hidden></option>
                                        <option value="CC">CC</option>
                                        <option value="CE">CE</option>
                                        <option value="PPT">PPT</option>
                                        <option value="TI">TI</option>
                                        <option value="RC">RC</option>
                                    </select>
                                </div>

                                {/* Input de número de documento */}
                                <div className="flex-2 flex flex-col">
                                    <input
                                        type="text"
                                        name="documento"
                                        placeholder="Ingrese su documento"
                                        value={formData.documento}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: errors.documento && touched.documento ? 'red' : Colors.table.lines,
                                        }}

                                    />
                                    {errors.documento && touched.documento && (
                                        <span className="text-red-500 text-xs mt-1">{errors.documento}</span>
                                    )}
                                </div>
                            </div>
                            {errors.tipoDocumento && touched.tipoDocumento && (
                                <span className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</span>
                            )}
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ingrese su nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: errors.nombre && touched.nombre ? 'red' : Colors.table.lines,
                                    }}

                                />
                                {errors.nombre && touched.nombre && (
                                    <span className="text-red-500 text-xs mt-1">{errors.nombre}</span>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    placeholder="Ingrese su apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: errors.apellido && touched.apellido ? 'red' : Colors.table.lines,
                                    }}

                                />
                                {errors.apellido && touched.apellido && (
                                    <span className="text-red-500 text-xs mt-1">{errors.apellido}</span>
                                )}
                            </div>
                        </div>

                        {/* Teléfono y Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    placeholder="Ingrese su teléfono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: errors.telefono && touched.telefono ? 'red' : Colors.table.lines,
                                    }}

                                />
                                {errors.telefono && touched.telefono && (
                                    <span className="text-red-500 text-xs mt-1">{errors.telefono}</span>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Ingrese su correo electronico"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: Colors.table.lines,
                                    }}

                                />
                            </div>
                        </div>

            {/* Imagen */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Imagen
              </label>
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  name="imagen"
                  onChange={handleInputChange}
                  className="hidden"
                  id="imagen-upload"
                  accept="image/*"
                />
                <label htmlFor="imagen-upload" className="cursor-pointer">
                  <div className="text-sm text-gray-500">Cargar el archivo</div>
                  {formData.imagen && (
                    <div className="text-xs text-green-600 mt-1">
                      {formData.imagen.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Ingrese una contraseña"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: errors.password && touched.password ? 'red' : Colors.table.lines,
                                }}

                            />
                            {errors.password && touched.password && (
                                <span className="text-red-500 text-xs mt-1">{errors.password}</span>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirme la contraseña"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: errors.confirmPassword && touched.confirmPassword ? 'red' : Colors.table.lines
                                }}

                            />
                            {errors.confirmPassword && touched.confirmPassword && (
                                <span className="text-red-500 text-xs mt-1">{errors.confirmPassword}</span>
                            )}
                        </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md font-medium"
                style={{
                  backgroundColor: Colors.buttons.tertiary,
                  color: Colors.texts.quaternary,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md font-medium"
                style={{
                  backgroundColor: Colors.buttons.quaternary,
                  color: Colors.texts.quaternary,
                }}
              >
                Guardar
              </button>
            </div>
            <div className="w-108 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CreateUserModal;
