"use client";

import React from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Technician } from "../../types/typesTechnicians";

interface ViewTechnicianModalProps {
  isOpen: boolean;
  technician: Technician | null;
  onClose: () => void;
}

const ViewTechnicianModal: React.FC<ViewTechnicianModalProps> = ({
  isOpen,
  technician,
  onClose,
}) => {
  if (!technician) return null;

  const getInitials = (name: string, lastName: string) => {
    const firstInitial = name?.charAt(0)?.toUpperCase() ?? "";
    const lastInitial = lastName?.charAt(0)?.toUpperCase() ?? "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <Modal
      title="Detalle del Técnico"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3 p-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 p-1">
        {/* Imagen */}
        <div className="col-span-2 flex flex-col items-center mb-3">
          <div
            className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-50 overflow-hidden text-gray-600 font-bold text-lg"
            style={{
              backgroundColor: technician.image ? "transparent" : "#f3f4f6",
            }}
          >
            {technician.image ? (
              <img
                src={technician.image}
                alt={`${technician.name} ${technician.lastName}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(technician.name, technician.lastName)
            )}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Nombre
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.name}
          </div>
        </div>

        {/* Apellido */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Apellido
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.lastName}
          </div>
        </div>

        {/* Tipo de Documento */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Tipo de Documento
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.documentType}
          </div>
        </div>

        {/* Número de Documento */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Número de Documento
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.documentNumber}
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Teléfono
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.phone}
          </div>
        </div>

        {/* Correo */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Correo Electrónico
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.email}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Estado
          </label>
          <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
            {technician.state}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewTechnicianModal;
 