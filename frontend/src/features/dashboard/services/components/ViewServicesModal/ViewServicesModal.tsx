"use client";

import React from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";

interface ViewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const ViewServiceModal: React.FC<ViewServiceModalProps> = ({
  isOpen,
  onClose,
  service,
}) => {
  if (!service) return null;

  return (
    <Modal
      title="Detalle del Servicio"
      isOpen={isOpen}
      onClose={onClose}
      footer={null}
    >
      <div className="grid grid-cols-2 gap-3 p-1">
        {/* Imagen */}
        <div className="col-span-2 flex flex-col items-center mb-3">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Imagen
          </label>
          <div
            className="w-20 h-20 rounded-full border-2 flex items-center justify-center bg-gray-50 mb-1 overflow-hidden"
            style={{ borderColor: Colors.table.lines }}
          >
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover rounded-full"
            />
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
          <input
            type="text"
            value={service.name}
            disabled
            className="w-full px-2 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
            style={{ borderColor: Colors.table.lines }}
          />
        </div>

        {/* Categoría */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Categoría
          </label>
          <input
            type="text"
            value={service.category}
            disabled
            className="w-full px-2 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
            style={{ borderColor: Colors.table.lines }}
          />
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Descripción
          </label>
          <textarea
            value={service.description}
            disabled
            rows={3}
            className="w-full px-2 py-1 border rounded-md resize-none bg-gray-100 cursor-not-allowed"
            style={{ borderColor: Colors.table.lines }}
          />
        </div>

        {/* Botón cerrar */}
        <div className="col-span-2 flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
            style={{
              backgroundColor: Colors.buttons.tertiary,
              color: Colors.texts.quaternary,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewServiceModal;
