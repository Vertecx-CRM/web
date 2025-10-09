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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        {/* Título */}
        <div className="px-1 py-2 text-black font-semibold text-lg">
          Editar Cliente
        </div>

        <div className="w-full h-0 outline outline-1 outline-black"></div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[500px] overflow-y-auto">

          {/* Documento y Número */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Documento</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  borderColor: errors.tipo && touched.tipo ? "red" : Colors.table.lines,
                }}
              >
                <option value="">Seleccione</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PPN">PPN</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de Documento</label>
              <input
                type="text"
                name="documento"
                placeholder="Ingrese su documento"
                value={formData.documento}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  borderColor: errors.documento && touched.documento ? "red" : Colors.table.lines,
                }}
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido || ""}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <input
                type="email"
                name="correoElectronico"
                placeholder="Correo Electrónico"
                value={formData.correoElectronico}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              style={{
                borderColor: Colors.table.lines,
              }}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Contraseña y Confirmar */}
          <div>
            <input
              type="password"
              name="contrasena"
              placeholder="Ingrese una contraseña"
              value={formData.contrasena || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md mb-3"
            />
            <input
              type="password"
              name="confirmarContrasena"
              placeholder="Confirme la contraseña"
              value={formData.confirmarContrasena || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white"
              style={{ backgroundColor: Colors.buttons.quaternary }}
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

export default EditClientModal;