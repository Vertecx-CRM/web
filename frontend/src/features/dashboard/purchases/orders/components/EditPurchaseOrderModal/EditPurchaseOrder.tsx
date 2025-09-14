import React from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { editPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";
import { useEditPurchaseOrderForm } from "../../hooks/usePurchaseOrders";

export const EditPurchaseOrderModal: React.FC<editPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  purchaseOrder
}) => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit
  } = useEditPurchaseOrderForm({
    isOpen,
    onClose,
    onSave,
    purchaseOrder
  });

  // Función para manejar cambios en selects e inputs
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.type === 'number' ? 
      parseFloat(event.target.value) || 0 : 
      event.target.value;
    handleInputChange(event.target.name as keyof typeof formData, value);
  };

  // Calcular subtotal y total
  const subtotal = (formData.precioUnitario || 0) * (formData.cantidad || 0);
  const iva = subtotal * 0.19; // 19% IVA
  const descuento = 0; // Por ahora sin descuento
  const total = subtotal + iva - descuento;

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Orden de Compra
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Número de Orden */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Número de Orden*
              </label>
              <input
                type="text"
                name="numeroOrden"
                value={formData.numeroOrden}
                onChange={handleFieldChange}
                onBlur={() => handleBlur('numeroOrden')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                style={{
                  borderColor: errors.numeroOrden && touched.numeroOrden ? 'red' : Colors.table.lines,
                }}
                placeholder="Ej: ORD-001"
              />
              {errors.numeroOrden && touched.numeroOrden && (
                <span className="text-red-500 text-xs mt-1">{errors.numeroOrden}</span>
              )}
            </div>

            {/* Proveedor y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Proveedor*
                </label>
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('proveedor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  style={{
                    borderColor: errors.proveedor && touched.proveedor ? 'red' : Colors.table.lines,
                  }}
                >
                  <option value="">Seleccione proveedor</option>
                  <option value="Proveedor A">Proveedor A</option>
                  <option value="Proveedor B">Proveedor B</option>
                  <option value="Proveedor C">Proveedor C</option>
                  <option value="Diana Inguia">Diana Inguia</option>
                  <option value="Juliana Gómez">Juliana Gómez</option>
                  <option value="Wayne Perez">Wayne Perez</option>
                  <option value="Nataly Martinez">Nataly Martinez</option>
                </select>
                {errors.proveedor && touched.proveedor && (
                  <span className="text-red-500 text-xs mt-1">{errors.proveedor}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Estado*
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('estado')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </div>
            </div>

            {/* Fecha estimada de entrega */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Fecha estimada de entrega
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleFieldChange}
                onBlur={() => handleBlur('fecha')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                style={{
                  borderColor: errors.fecha && touched.fecha ? 'red' : Colors.table.lines,
                }}
              />
              {errors.fecha && touched.fecha && (
                <span className="text-red-500 text-xs mt-1">{errors.fecha}</span>
              )}
            </div>

            {/* Información del producto */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Producto</h3>
              
              {/* Cantidad y Precio Unitario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Cantidad*
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad || ''}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('cantidad')}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    style={{
                      borderColor: errors.cantidad && touched.cantidad ? 'red' : Colors.table.lines,
                    }}
                    placeholder="1"
                  />
                  {errors.cantidad && touched.cantidad && (
                    <span className="text-red-500 text-xs mt-1">{errors.cantidad}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="precioUnitario"
                    value={formData.precioUnitario || ''}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('precioUnitario')}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    style={{
                      borderColor: errors.precioUnitario && touched.precioUnitario ? 'red' : Colors.table.lines,
                    }}
                    placeholder="0.00"
                  />
                  {errors.precioUnitario && touched.precioUnitario && (
                    <span className="text-red-500 text-xs mt-1">{errors.precioUnitario}</span>
                  )}
                </div>
              </div>

              {/* Resumen de totales */}
              <div className="bg-white p-3 rounded border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span>${iva.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuento:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>TOTAL:</span>
                    <span>${total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción/Observaciones */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleFieldChange}
                onBlur={() => handleBlur('descripcion')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ingrese observaciones adicionales sobre la orden..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EditPurchaseOrderModal;