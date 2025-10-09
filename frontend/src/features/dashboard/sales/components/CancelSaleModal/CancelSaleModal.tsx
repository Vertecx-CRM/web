import React, { useState } from "react";
import { Sale } from "../../types/typesSales";

interface CancelSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onCancel: (id: string, motivo: string) => void;
}

const CancelSaleModal: React.FC<CancelSaleModalProps> = ({
  isOpen,
  onClose,
  sale,
  onCancel,
}) => {
  const [motivo, setMotivo] = useState("");

  if (!isOpen || !sale) return null;

  const handleSubmit = () => {
    if (!motivo.trim()) return;
    onCancel(sale.id, motivo); // id es string
    onClose();
    setMotivo("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Anular Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p>
            <strong>Código Venta:</strong>{" "}
            {sale.codigo || sale.codigoVenta}
          </p>
          <p>
            <strong>Cliente:</strong> {sale.cliente}
          </p>
          <p>
            <strong>Fecha Venta:</strong>{" "}
            {sale.fechaVenta || sale.fecha}
          </p>

          <div>
            <label className="block font-medium mb-1">
              Motivo de anulación
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border rounded-md p-2"
              rows={3}
              placeholder="Escribe el motivo..."
            />
          </div>

          <p>
            <strong>Usuario que emite:</strong> Automático
          </p>
          <p>
            <strong>Fecha Anulación:</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
          >
            Anular Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSaleModal;

