import React from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { User } from "../../types";
import { useEditUser } from "./useEditUser";
import { EditUserModalProps } from "./types";

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user
}) => {
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit
  } = useEditUser(user, isOpen, onClose, onSave);

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
            Editar usuario
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

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: Colors.table.lines,
                }}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
                Actualizar
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

export default EditUserModal;