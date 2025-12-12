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
  purchaseOrder,
}) => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
  } = useEditPurchaseOrderForm({
    isOpen,
    onClose,
    onSave,
    purchaseOrder,
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    handleInputChange(e.target.name as keyof typeof formData, value);
  };

  const subtotal = (formData.precioUnitario || 0) * (formData.cantidad || 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Editar Orden de Compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">N° Orden</label>
              <input
                type="text"
                name="numeroOrden"
                value={formData.numeroOrden}
                onChange={handleChange}
                onBlur={() => handleBlur("numeroOrden")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              />
              {errors.numeroOrden && touched.numeroOrden && (
                <span className="text-red-500 text-xs mt-1">{errors.numeroOrden}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Proveedor</label>
              <select
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                onBlur={() => handleBlur("proveedor")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              >
                <option value="">Seleccione proveedor</option>
                <option value="VivaSolar">VivaSolar</option>
                <option value="Proveedor B">Proveedor B</option>
                <option value="Proveedor C">Proveedor C</option>
              </select>
              {errors.proveedor && touched.proveedor && (
                <span className="text-red-500 text-xs mt-1">{errors.proveedor}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                Fecha estimada de entrega
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                onBlur={() => handleBlur("fecha")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              />
              {errors.fecha && touched.fecha && (
                <span className="text-red-500 text-xs mt-1">{errors.fecha}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Estado de Orden</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
              <option value="Pendiente">Pendiente</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="En Proceso">En Proceso</option>
              </select>

            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
              <div className="px-3 py-2 text-xs font-medium text-gray-600">Producto</div>
              <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center">Cantidad</div>
              <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Precio</div>
              <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Total</div>
            </div>

            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="px-3 py-3 text-sm text-gray-700">—</div>
              <div className="px-3 py-2 flex items-center justify-center">
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad || ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur("cantidad")}
                  min="1"
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                />
              </div>
              <div className="px-3 py-2 flex items-center justify-end">
                <input
                  type="number"
                  name="precioUnitario"
                  value={formData.precioUnitario || ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur("precioUnitario")}
                  className="w-28 px-2 py-1 text-sm text-right border border-gray-300 rounded"
                />
              </div>
              <div className="px-3 py-3 text-sm text-gray-700 text-right">
                ${subtotal.toLocaleString("es-CO")}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>IVA (19%)</span>
                <span>${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 font-semibold">
                <span>Total</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Observaciones
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
            />
          </div>

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
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditPurchaseOrderModal;