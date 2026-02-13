import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { useEditClientForm } from "../../hooks/useClients";
import { EditClientModalProps } from "../../types/typeClients";

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onSave,
}) => {
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit
  } = useEditClientForm({ isOpen, client, onClose, onSave });

  if (!isOpen || !client) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative">

        {/* Header */}
        <div className="px-6 pt-6 pb-3 relative">
          <h2 className="text-2xl font-semibold text-gray-800">
            Editar Cliente
          </h2>
          <button onClick={onClose} className="absolute top-6 right-6">
            <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-gray-300 mx-6" />

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {/* Documento Tipo */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Documento
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor:
                  errors.tipo && touched.tipo ? "red" : "#d1d5db",
              }}
            >
              <option value="">Seleccione</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PPN">PPN</option>
            </select>
            {errors.tipo && touched.tipo && (
              <span className="text-red-500 text-xs">{errors.tipo}</span>
            )}
          </div>

          {/* Número Documento */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Número de Documento
            </label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor:
                  errors.documento && touched.documento
                    ? "red"
                    : "#d1d5db",
              }}
            />
            {errors.documento && touched.documento && (
              <span className="text-red-500 text-xs">
                {errors.documento}
              </span>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor:
                  errors.nombre && touched.nombre
                    ? "red"
                    : "#d1d5db",
              }}
            />
            {errors.nombre && touched.nombre && (
              <span className="text-red-500 text-xs">
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Apellido (usa mismo campo si tu modelo lo maneja unido) */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor:
                  errors.telefono && touched.telefono
                    ? "red"
                    : "#d1d5db",
              }}
            />
            {errors.telefono && touched.telefono && (
              <span className="text-red-500 text-xs">
                {errors.telefono}
              </span>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Correo Electronico
            </label>
            <input
              type="email"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor:
                  errors.correoElectronico &&
                  touched.correoElectronico
                    ? "red"
                    : "#d1d5db",
              }}
            />
            {errors.correoElectronico &&
              touched.correoElectronico && (
                <span className="text-red-500 text-xs">
                  {errors.correoElectronico}
                </span>
              )}
          </div>

          {/* Estado - ancho completo */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Botones */}
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm bg-gray-400 text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm bg-black text-white"
            >
              Guardar
            </button>
          </div>
        </form>

        <div className="border-t border-gray-300 mx-6 mb-4" />
      </div>
    </div>,
    document.body
  );
};

export default EditClientModal;
