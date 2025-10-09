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
            <h2 className="text-lg font-semibold text-gray-900">
              Editar Orden Compra
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Primera fila: Número de Orden y Proveedor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  N° Orden
                </label>
                <input
                  type="text"
                  name="numeroOrden"
                  value={formData.numeroOrden}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('numeroOrden')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  style={{
                    borderColor: errors.numeroOrden && touched.numeroOrden ? 'red' : Colors.table.lines,
                  }}
                  placeholder="001"
                />
                {errors.numeroOrden && touched.numeroOrden && (
                  <span className="text-red-500 text-xs mt-1">{errors.numeroOrden}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Proveedor
                </label>
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('proveedor')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
            </div>

            {/* Segunda fila: Fecha estimada y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Fecha estimada de entrega
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('fecha')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  style={{
                    borderColor: errors.fecha && touched.fecha ? 'red' : Colors.table.lines,
                  }}
                />
                {errors.fecha && touched.fecha && (
                  <span className="text-red-500 text-xs mt-1">{errors.fecha}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Estado de Ordn
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('estado')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </div>
            </div>

            {/* Tabla de productos */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-600">
                Productos
              </label>
              <div className="border border-gray-300 rounded overflow-hidden">
                {/* Header de tabla */}
                <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
                  <div className="px-3 py-2 text-xs font-medium text-gray-600">Productos</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center">Cantidad</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Precio Unitario</div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Total</div>
                </div>
                
                {/* Fila de datos (editable) */}
                <div className="grid grid-cols-4 border-b border-gray-200">
                  <div className="px-3 py-3 text-sm text-gray-700">
                    Producto
                  </div>
                  <div className="px-3 py-2 flex items-center justify-center">
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad || ''}
                      onChange={handleFieldChange}
                      onBlur={() => handleBlur('cantidad')}
                      min="1"
                      className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      style={{
                        borderColor: errors.cantidad && touched.cantidad ? 'red' : Colors.table.lines,
                      }}
                    />
                  </div>
                  <div className="px-3 py-2 flex items-center justify-end">
                    <input
                      type="number"
                      name="precioUnitario"
                      value={formData.precioUnitario || ''}
                      onChange={handleFieldChange}
                      onBlur={() => handleBlur('precioUnitario')}
                      min="0"
                      step="0.01"
                      className="w-28 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      style={{
                        borderColor: errors.precioUnitario && touched.precioUnitario ? 'red' : Colors.table.lines,
                      }}
                    />
                  </div>
                  <div className="px-3 py-3 text-sm text-gray-700 text-right">
                    ${subtotal.toLocaleString('es-CO')}
                  </div>
                </div>
              </div>
              {errors.cantidad && touched.cantidad && (
                <span className="text-red-500 text-xs mt-1 block">{errors.cantidad}</span>
              )}
              {errors.precioUnitario && touched.precioUnitario && (
                <span className="text-red-500 text-xs mt-1 block">{errors.precioUnitario}</span>
              )}
            </div>

            {/* Resumen de totales - alineado a la derecha */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="text-gray-900">${iva.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Descuento</span>
                  <span className="text-gray-900">$0</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300 font-semibold">
                  <span className="text-gray-900">TOTAL a pagar</span>
                  <span className="text-gray-900">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleFieldChange}
                onBlur={() => handleBlur('descripcion')}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Ingrese observaciones adicionales sobre la orden..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm bg-gray-900 hover:bg-black text-white rounded font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
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