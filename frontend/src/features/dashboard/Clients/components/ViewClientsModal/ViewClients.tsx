import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewClientModalProps } from "../../types/typeClients";

export const ViewClientModal: React.FC<ViewClientModalProps> = ({
  isOpen,
  client,
  onClose,
}) => {
  if (!isOpen || !client) return null;

  // Función para generar iniciales del cliente
  const getInitials = (name: string, apellido: string) => {
    const first = name?.charAt(0).toUpperCase() || "";
    const last = apellido?.charAt(0).toUpperCase() || "";
    return first + last;
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50 mx-auto">
        {/* Botón cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-left font-semibold text-lg mb-2 text-black">
          Detalle Cliente
        </h2>
        <div className="w-full h-px bg-gray-300 mb-4"></div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: Colors.buttons.primary }}
          >
            {getInitials(client.nombre, client.apellido)}
          </div>
        </div>

        {/* Datos en grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Documento */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Documento
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.tipo}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Número de Documento
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.documento}</span>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Nombre
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.nombre}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Apellido
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.apellido}</span>
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Teléfono
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.telefono}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Correo Electrónico
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.correoElectronico}</span>
            </div>
          </div>

          {/* Rol */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Rol
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-700">{client.rol}</span>
            </div>
          </div>

          {/* Estado */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Estado
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    client.estado === "Activo" ? "#e8f5e8" : "#f5e8e8",
                  color:
                    client.estado === "Activo"
                      ? Colors.states.success
                      : Colors.states.inactive,
                }}
              >
                {client.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-white text-sm"
            style={{
              backgroundColor: Colors.buttons.quaternary,
              color: Colors.texts.quaternary,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewClientModal;