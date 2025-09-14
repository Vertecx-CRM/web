import React from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { createPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";
import { useCreatePurchaseOrderForm } from "../../hooks/usePurchaseOrders";

export const CreatePurchaseOrderModal: React.FC<createPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useCreatePurchaseOrderForm({
    isOpen,
    onClose,
    onSave
  });

  if (!isOpen) return null;

  // Función para manejar cambios en selects
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(event.target.name as keyof typeof formData, event.target.value);
  };

  // Función para manejar cambios en inputs de texto
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Orden Compra
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
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Proveedor*
              </label>
              <select
                name="proveedor"
                value={formData.proveedor}
                onChange={handleSelectChange}
                onBlur={() => handleBlur('proveedor')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                style={{
                  borderColor: errors.proveedor && touched.proveedor ? 'red' : Colors.table.lines,
                }}
              >
                <option value="">Vendedor</option>
                <option value="Proveedor A">Proveedor A</option>
                <option value="Proveedor B">Proveedor B</option>
                <option value="Proveedor C">Proveedor C</option>
              </select>
              {errors.proveedor && touched.proveedor && (
                <span className="text-red-500 text-xs mt-1">{errors.proveedor}</span>
              )}
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
                onChange={handleTextChange}
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

            {/* Estado de la Orden */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Estado de la Orden
              </label>
              <select
                name="estado"
                value="Pendiente"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              >
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            {/* Tabla de productos */}
            <div>
              <div className="border border-gray-300 rounded-md">
                {/* Header de tabla */}
                <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                  <div>Productos</div>
                  <div>Imagen</div>
                  <div>Cantidad</div>
                  <div>Precio</div>
                  <div>Total</div>
                  <div></div>
                </div>

                {/* Fila de producto */}
                <div className="grid grid-cols-6 gap-2 p-3 items-center">
                  {/* Número de orden (como producto) */}
                  <div>
                    <input
                      type="text"
                      name="numeroOrden"
                      placeholder="Número LS"
                      value={formData.numeroOrden}
                      onChange={handleTextChange}
                      onBlur={() => handleBlur('numeroOrden')}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                      style={{
                        borderColor: errors.numeroOrden && touched.numeroOrden ? 'red' : Colors.table.lines,
                      }}
                    />
                    {errors.numeroOrden && touched.numeroOrden && (
                      <span className="text-red-500 text-xs">{errors.numeroOrden}</span>
                    )}
                  </div>

                  {/* Imagen placeholder */}
                  <div className="text-center text-gray-400">
                    -
                  </div>

                  {/* Cantidad */}
                  <div>
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleTextChange}
                      onBlur={() => handleBlur('cantidad')}
                      min="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-red-500"
                      style={{
                        borderColor: errors.cantidad && touched.cantidad ? 'red' : Colors.table.lines,
                      }}
                    />
                    {errors.cantidad && touched.cantidad && (
                      <span className="text-red-500 text-xs">{errors.cantidad}</span>
                    )}
                  </div>

                  {/* Precio */}
                  <div>
                    <input
                      type="number"
                      name="precioUnitario"
                      placeholder="$500,000"
                      value={formData.precioUnitario || ''}
                      onChange={handleTextChange}
                      onBlur={() => handleBlur('precioUnitario')}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                      style={{
                        borderColor: errors.precioUnitario && touched.precioUnitario ? 'red' : Colors.table.lines,
                      }}
                    />
                    {errors.precioUnitario && touched.precioUnitario && (
                      <span className="text-red-500 text-xs">{errors.precioUnitario}</span>
                    )}
                  </div>

                  {/* Total de línea */}
                  <div className="text-sm font-medium">
                    ${subtotal.toLocaleString('es-CO')}
                  </div>

                  {/* Botón eliminar */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Botón agregar producto */}
                <div className="p-3 border-t">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Producto
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Iva (19%):</span>
                  <span>${iva.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>TOTAL a pagar:</span>
                  <span>${total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                onBlur={() => handleBlur('descripcion')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ingrese observaciones adicionales..."
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

export default CreatePurchaseOrderModal;