"use client";

import { useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: any; // objeto de venta seleccionado
  onConfirm: (observation?: string) => void;
}

export default function RevokeSaleModal({
  isOpen,
  onClose,
  sale,
  onConfirm,
}: Props) {
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (isOpen) {
      setObservation("");
    }
  }, [isOpen]);

  if (!sale) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO");
  };

  const handleConfirm = () => {
    onConfirm(observation);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anular Venta"
      widthClass="max-w-lg"
      footer={null}
    >
      <div className="space-y-4 px-1">
        {/* Línea separadora */}
        <div className="border-b my-2" />

        {/* Código venta */}
        <div className="flex justify-between text-sm">
          <span className="font-medium">Código Venta</span>
          <span>{sale.salecode}</span>
        </div>

        {/* Cliente */}
        <div className="flex justify-between text-sm">
          <span className="font-medium">Cliente</span>
          <span>
            {sale.customer?.users?.name} {sale.customer?.users?.lastname}
          </span>
        </div>

        {/* Fecha Venta */}
        <div className="flex justify-between text-sm">
          <span className="font-medium">Fecha Venta</span>
          <span>{formatDate(sale.saledate)}</span>
        </div>

        {/* Motivo */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Motivo de anulación
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 h-28"
            placeholder="Ingrese motivo..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>

        {/* Usuario que anula */}
        <div className="flex justify-between text-sm mt-4">
          <span className="font-medium">Usuario que anula</span>
          <span>Automático</span>
        </div>

        {/* Fecha de anulación */}
        <div className="flex justify-between text-sm">
          <span className="font-medium">Fecha Anulación</span>
          <span>{formatDate(new Date().toISOString())}</span>
        </div>

        {/* Línea inferior */}
        <div className="border-b my-4" />

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            className="px-6 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
            onClick={handleConfirm}
          >
            Anular Venta
          </button>
        </div>
      </div>
    </Modal>
  );
}
