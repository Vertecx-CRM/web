import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { useCreateClientForm } from "../../hooks/useClients";
import { CreateClientModalProps } from "../../types/typeClients";

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
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
  } = useCreateClientForm({ isOpen, onClose, onSave });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl relative">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-3 relative">
          <h2 className="text-xl font-semibold text-gray-800">
            Crear Cliente
          </h2>
          <button onClick={onClose} className="absolute top-5 right-5">
            <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-gray-300" />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Documento tipo */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Documento
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.tipo && touched.tipo ? "red" : Colors.table.lines,
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

          {/* Número documento */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Número de Documento
            </label>
            <input
              type="text"
              name="documento"
              placeholder="Ingrese su documento"
              value={formData.documento}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.documento && touched.documento
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.documento && touched.documento && (
              <span className="text-red-500 text-xs">
                {errors.documento}
              </span>
            )}
          </div>

          {/* Nombres */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Nombres
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese su nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.nombre && touched.nombre
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.nombre && touched.nombre && (
              <span className="text-red-500 text-xs">{errors.nombre}</span>
            )}
          </div>

          {/* Apellidos (usa el mismo campo nombre si tu lógica lo requiere) */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Apellidos
            </label>
            <input
              type="text"
              name="apellido"
              placeholder="Ingrese su apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.nombre && touched.nombre
                    ? "red"
                    : Colors.table.lines,
              }}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              placeholder="Ingrese su teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.telefono && touched.telefono
                    ? "red"
                    : Colors.table.lines,
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
            <label className="block text-sm mb-1 text-gray-700">
              Correo Electronico
            </label>
            <input
              type="email"
              name="correoElectronico"
              placeholder="Ingrese su correo electrónico"
              value={formData.correoElectronico}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor:
                  errors.correoElectronico &&
                  touched.correoElectronico
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.correoElectronico &&
              touched.correoElectronico && (
                <span className="text-red-500 text-xs">
                  {errors.correoElectronico}
                </span>
              )}
          </div>

          {/* Botones */}
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-300 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-md text-sm bg-gray-400 text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-sm bg-black text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateClientModal;