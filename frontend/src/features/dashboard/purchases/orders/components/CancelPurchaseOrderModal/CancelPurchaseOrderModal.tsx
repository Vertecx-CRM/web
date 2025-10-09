import React, { useState } from "react";
import { createPortal } from "react-dom";
import { purchaseOrder } from "../../types/typesPurchaseOrder";

interface CancelPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (order: purchaseOrder, reason: string) => void;
  purchaseOrder: purchaseOrder | null;
}

export const CancelPurchaseOrderModal: React.FC<CancelPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  purchaseOrder
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchaseOrder || !reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Llamar a la función onCancel pasando la orden y el motivo
      await onCancel(purchaseOrder, reason);
      
      // Resetear formulario y cerrar modal
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error al anular la orden:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen || !purchaseOrder) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-base font-semibold text-gray-900">
              Anular Orden De Compra
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Información de la orden */}
            <div className="space-y-3">
              {/* N° Orden */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  N° Orden
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
                  {purchaseOrder.numeroOrden}
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Proveedor
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
                  {purchaseOrder.proveedor}
                </div>
              </div>

              {/* Fecha emisión */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Fecha emisión
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
                  {formatDate(purchaseOrder.fecha)}
                </div>
              </div>
            </div>

            {/* Motivo de anulación */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                Motivo de anulación
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Error de proveedor"
                required
              />
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Usuario que anula
                </span>
                <div className="text-gray-900">Automática</div>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha emisión
                </span>
                <div className="text-gray-900">
                  {new Date().toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm text-white bg-gray-500 hover:bg-gray-600 rounded font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="px-6 py-2 text-sm bg-gray-900 hover:bg-black text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Anulando...' : 'Anular Orden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CancelPurchaseOrderModal;