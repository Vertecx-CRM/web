import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { purchaseOrder, viewPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";

export const ViewPurchaseOrderModal: React.FC<viewPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
}) => {
  if (!isOpen || !purchaseOrder) return null;

  const cantidad = purchaseOrder.cantidad || 1;
  const precioUnitario = purchaseOrder.precioUnitario || 0;
  const subtotal = cantidad * precioUnitario;
  const iva = subtotal * 0.19; // 19% IVA
  const descuento = 0;
  const total = subtotal + iva - descuento;

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Mapeo explícito estado => color. Evita el uso inseguro de índices dinámicos.
  const getStateColor = (estado: purchaseOrder["estado"]) => {
    switch (estado) {
      case "Completada":
        return Colors.states.success;
      case "Pendiente":
        return Colors.states.warning;
      case "Anulada":
        return Colors.states.error;
      case "En Proceso":
        // Si no tienes info, usa info o inactive según tu palette
        return (Colors.states as any).info ?? Colors.states.inactive;
      default:
        return Colors.states.inactive;
    }
  };

  const stateColor = getStateColor(purchaseOrder.estado);

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Detalle Orden Compra</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">N° Orden</label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                  {purchaseOrder.numeroOrden}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Estado</label>
                <div
                  className="w-full px-3 py-2 border rounded text-sm font-medium"
                  style={{ color: stateColor }}
                >
                  {purchaseOrder.estado}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Proveedor</label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                  {purchaseOrder.proveedor}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Fecha</label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                  {formatDate(purchaseOrder.fecha)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-gray-600">Productos</label>
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
                  <div className="px-3 py-2 text-xs font-medium text-gray-600">Producto</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center">Cantidad</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Precio Unitario</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Total</div>
                </div>

                <div className="grid grid-cols-4 bg-white">
                  <div className="px-3 py-3 text-sm text-gray-700">—</div>
                  <div className="px-3 py-3 text-sm text-gray-700 text-center">{cantidad}</div>
                  <div className="px-3 py-3 text-sm text-gray-700 text-right">
                    ${precioUnitario.toLocaleString("es-CO")}
                  </div>
                  <div className="px-3 py-3 text-sm text-gray-700 text-right">
                    ${subtotal.toLocaleString("es-CO")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="text-gray-800">${iva.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between py-2 border-t font-semibold">
                  <span className="text-gray-900">TOTAL a pagar</span>
                  <span className="text-gray-900">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Observaciones</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm min-h-[60px]">
                {purchaseOrder.descripcion || ""}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm text-white bg-gray-500 hover:bg-gray-600 rounded font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ViewPurchaseOrderModal;