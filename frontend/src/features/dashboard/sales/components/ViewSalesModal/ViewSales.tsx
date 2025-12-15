// components/ViewSalesModal/viewSales.tsx
import React from "react";
import { createPortal } from "react-dom";
import { Sale } from "../../types/typesSales";

// Definimos las props directamente aquí
interface ViewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const ViewSaleModal: React.FC<ViewSaleModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  if (!isOpen || !sale) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative z-50 max-h-[95vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button onClick={onClose} className="absolute top-3 right-3">
          <img src="/icons/X.svg" alt="Cerrar" className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-4">Detalle Venta</h2>
        <div className="border-b border-gray-300 mb-4"></div>

        {/* Datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Código Venta
            </label>
            <div className="border rounded-md px-3 py-2">{sale.codigo}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Estado Venta
            </label>
            <div className="border rounded-md px-3 py-2">{sale.estado}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Cliente
            </label>
            <div className="border rounded-md px-3 py-2">{sale.cliente}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Fecha Venta
            </label>
            <div className="border rounded-md px-3 py-2">{sale.fecha}</div>
          </div>
        </div>

        {/* Tabla productos/servicios */}
        <table className="w-full border border-gray-300 mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Producto/Servicio</th>
              <th className="border px-3 py-2">Tipo</th>
              <th className="border px-3 py-2">Cantidad</th>
              <th className="border px-3 py-2">Precio</th>
              <th className="border px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-2">{item.nombre}</td>
                <td className="border px-3 py-2">{item.tipo}</td>
                <td className="border px-3 py-2 text-center">
                  {item.cantidad}
                </td>
                <td className="border px-3 py-2 text-right">
                  ${item.precio.toLocaleString()}
                </td>
                <td className="border px-3 py-2 text-right">
                  ${item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex flex-col items-end space-y-1 mb-6">
          <div className="flex justify-between w-64">
            <span>Subtotal:</span>
            <span>${sale.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>IVA (20%):</span>
            <span>${sale.iva.toLocaleString()}</span>
          </div>
          <div className="flex justify-between w-64 font-semibold">
            <span>TOTAL PAGADO:</span>
            <span>${sale.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600">
            Observaciones
          </label>
          <div className="border rounded-md px-3 py-2 min-h-[60px]">
            {sale.observaciones || "Sin observaciones"}
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewSaleModal;
