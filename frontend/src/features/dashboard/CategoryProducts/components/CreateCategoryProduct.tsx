import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    icono: null as File | null,
  });

  const [errors, setErrors] = useState({
    nombre: "",
  });

  const [touched, setTouched] = useState({
    nombre: false,
  });

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: "",
        descripcion: "",
        icono: null,
      });
      setErrors({
        nombre: "",
      });
      setTouched({
        nombre: false,
      });
    }
  }, [isOpen]);

  // Validar campos cuando cambian
  useEffect(() => {
    validateField("nombre", formData.nombre);
  }, [formData]);

  const validateField = (fieldName: string, value: any) => {
    let error = "";

    switch (fieldName) {
      case "nombre":
        if (!value.trim()) {
          error = "El nombre de la categoría es obligatorio";
        } else if (value.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (/[0-9]/.test(value)) {
          error = "El nombre no puede contener números";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validación en tiempo real para el campo nombre (no permitir números)
    if (name === "nombre" && /[0-9]/.test(value)) {
      return; // No actualizar el valor si contiene números
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Marcar el campo como "touched" cuando el usuario interactúa con él
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, icono: file }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar el campo nombre como "touched" para mostrar el error
    setTouched((prev) => ({ ...prev, nombre: true }));

    // Validar el campo nombre antes de enviar
    validateField("nombre", formData.nombre);

    // Verificar si hay errores (solo validamos el nombre)
    const hasErrors = errors.nombre !== "";

    if (!hasErrors) {
      // Mostrar mensaje de éxito con react-toastify
      toast.success("Categoría creada exitosamente!", {
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
      toast.error("Por favor complete el nombre correctamente", {
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
          <button onClick={onClose} className="absolute top-4 right-4 z-10">
            <img src="/icons/X.svg" alt="Cerrar" className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="px-6 py-4 rounded-t-lg text-black font-semibold text-3xl">
            Crear Categoría
          </div>

          <div className="w-110 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: Colors.texts.primary }}
              >
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                placeholder="Ingrese el nombre de la categoría del producto"
                value={formData.nombre}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  borderColor:
                    errors.nombre && touched.nombre
                      ? "red"
                      : Colors.table.lines,
                }}
              />
              {errors.nombre && touched.nombre && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.nombre}
                </span>
              )}
            </div>

            {/* Icono (opcional) */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: Colors.texts.primary }}
              >
                Icono
              </label>
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  name="icono"
                  onChange={handleIconChange}
                  className="hidden"
                  id="icono-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="icono-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    Seleccione el icono de la categoría del producto (opcional)
                  </div>
                  {formData.icono ? (
                    <div className="text-xs text-green-600 font-medium">
                      {formData.icono.name}
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: Colors.texts.primary }}
              >
                Descripción
              </label>
              <textarea
                name="descripcion"
                placeholder="Ingrese la descripción de la categoría del producto"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  borderColor: Colors.table.lines,
                }}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                style={{
                  backgroundColor: Colors.buttons.tertiary,
                  color: Colors.texts.quaternary,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-md font-medium text-white"
                style={{
                  backgroundColor: Colors.buttons.quaternary,
                  color: Colors.texts.quaternary,
                }}
              >
                Guardar
              </button>
            </div>
            <div className="w-107 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CreateCategoryModal;
