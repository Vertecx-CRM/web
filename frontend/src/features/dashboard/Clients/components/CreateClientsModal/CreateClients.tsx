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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="px-4 py-3 rounded-t-lg text-black font-semibold text-2xl">
          Crear Cliente
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-96 overflow-y-auto">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.tipo && touched.tipo ? "red" : Colors.table.lines,
              }}
            >
              <option value="">Seleccione el tipo</option>
              <option value="CC">CC - Cédula de Ciudadanía</option>
              <option value="TI">TI - Tarjeta de Identidad</option>
              <option value="CE">CE - Cédula de Extranjería</option>
              <option value="PPN">PPN - Pasaporte</option>
            </select>
            {errors.tipo && touched.tipo && (
              <span className="text-red-500 text-xs mt-1">{errors.tipo}</span>
            )}
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Documento
            </label>
            <input
              type="text"
              name="documento"
              placeholder="Ingrese el número de documento"
              value={formData.documento}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.documento && touched.documento ? "red" : Colors.table.lines,
              }}
            />
            {errors.documento && touched.documento && (
              <span className="text-red-500 text-xs mt-1">{errors.documento}</span>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese el nombre completo"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.nombre && touched.nombre ? "red" : Colors.table.lines,
              }}
            />
            {errors.nombre && touched.nombre && (
              <span className="text-red-500 text-xs mt-1">{errors.nombre}</span>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              placeholder="Ingrese el número de teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.telefono && touched.telefono ? "red" : Colors.table.lines,
              }}
            />
            {errors.telefono && touched.telefono && (
              <span className="text-red-500 text-xs mt-1">{errors.telefono}</span>
            )}
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correoElectronico"
              placeholder="Ingrese el correo electrónico"
              value={formData.correoElectronico}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.correoElectronico && touched.correoElectronico ? "red" : Colors.table.lines,
              }}
            />
            {errors.correoElectronico && touched.correoElectronico && (
              <span className="text-red-500 text-xs mt-1">{errors.correoElectronico}</span>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Rol
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.rol && touched.rol ? "red" : Colors.table.lines,
              }}
            >
              <option value="">Seleccione el rol</option>
              <option value="Cliente">Cliente</option>
              <option value="Proveedor">Proveedor</option>
              <option value="Administrador">Administrador</option>
            </select>
            {errors.rol && touched.rol && (
              <span className="text-red-500 text-xs mt-1">{errors.rol}</span>
            )}
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
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.estado && touched.estado ? "red" : Colors.table.lines,
              }}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errors.estado && touched.estado && (
              <span className="text-red-500 text-xs mt-1">{errors.estado}</span>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
              style={{
                backgroundColor: Colors.buttons.tertiary,
                color: Colors.texts.quaternary,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white text-sm"
              style={{
                backgroundColor: Colors.buttons.quaternary,
                color: Colors.texts.quaternary,
              }}
            >
              Guardar
            </button>
          </div>
        </form>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
      </div>
    </div>,
    document.body
  );
};

export default CreateClientModal;