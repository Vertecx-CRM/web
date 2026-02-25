import React from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { createPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";
import { useCreatePurchaseOrderForm } from "../../hooks/usePurchaseOrders";
import { getSuppliers, ISupplier } from "@/features/dashboard/suppliers/services/suppliers.service";

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
    isSubmitting,
    handleAddItem,
    handleRemoveItem,
    handleItemChange
  } = useCreatePurchaseOrderForm({
    isOpen,
    onClose,
    onSave
  });

  const [suppliers, setSuppliers] = React.useState<ISupplier[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      getSuppliers()
        .then((data) => setSuppliers(data))
        .catch((err) => console.error("Error fetching suppliers:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(event.target.name as keyof typeof formData, event.target.value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      event.target.type === "number"
        ? parseFloat(event.target.value) || 0
        : event.target.value;

    handleInputChange(event.target.name as keyof typeof formData, value);
  };

  const onItemChange = (index: number, field: string, value: string | number) => {
    handleItemChange(index, field as "producto" | "cantidad" | "precioUnitario", value);
  };

  const onItemTextChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name;
    const value =
      event.target.type === "number"
        ? parseFloat(event.target.value) || 0
        : event.target.value;

    onItemChange(index, field, value);
  };

  const subtotal = (formData.items || []).reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0
  );

  const iva = subtotal * 0.19;
  const descuento = 0;
  const total = subtotal + iva - descuento;

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative z-50 max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Orden de Compra
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* PROVEEDOR */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Proveedor*
                </label>
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleSelectChange}
                  onBlur={() => handleBlur("proveedor")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor:
                      errors.proveedor && touched.proveedor
                        ? "red"
                        : Colors.table.lines,
                  }}
                >
                  <option value="">Seleccione un proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplierid} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.proveedor && touched.proveedor && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.proveedor}
                  </span>
                )}
              </div>

              {/* FECHA */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Fecha estimada de entrega
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleTextChange}
                  onBlur={() => handleBlur("fecha")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor:
                      errors.fecha && touched.fecha
                        ? "red"
                        : Colors.table.lines,
                  }}
                />
              </div>

              {/* ESTADO FIJO */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Estado
                </label>
                <input
                  type="text"
                  value="Pendiente"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

            </div>

            {/* TABLA PRODUCTOS */}
            <div>
              <div className="border border-gray-300 rounded-md overflow-hidden">

                <div className="grid grid-cols-[2fr_80px_100px_120px_120px_40px] gap-2 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                  <div>Producto</div>
                  <div>Imagen</div>
                  <div className="text-center">Cant.</div>
                  <div className="text-right">Precio Unit.</div>
                  <div className="text-right">Total</div>
                  <div></div>
                </div>

                {formData.items?.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_80px_100px_120px_120px_40px] gap-2 p-3 items-center border-b hover:bg-gray-50"
                  >

                    {/* Producto */}
                    <div>
                      <input
                        type="text"
                        name="producto"
                        value={item.producto}
                        onChange={(e) => onItemTextChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Imagen dinámica */}
                    <div className="text-center text-xs text-gray-500">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt="producto"
                          className="h-10 w-10 object-cover mx-auto rounded"
                        />
                      ) : (
                        "N/A"
                      )}
                    </div>

                    {/* Cantidad */}
                    <div>
                      <input
                        type="number"
                        name="cantidad"
                        value={item.cantidad}
                        min="1"
                        onChange={(e) => onItemTextChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Precio */}
                    <div>
                      <input
                        type="number"
                        name="precioUnitario"
                        value={item.precioUnitario || ""}
                        min="0"
                        step="0.01"
                        onChange={(e) => onItemTextChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Total */}
                    <div className="text-sm font-medium text-right">
                      ${(item.cantidad * item.precioUnitario).toLocaleString("es-CO")}
                    </div>

                    {/* Eliminar */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                ))}

                {(!formData.items || formData.items.length === 0) && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No hay productos agregados.
                  </div>
                )}

                <div className="p-3 bg-gray-50 border-t">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Agregar Producto
                  </button>
                </div>

              </div>
            </div>

            {/* RESUMEN */}
            <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%):</span>
                <span>${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>TOTAL:</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={(e) =>
                  handleInputChange("descripcion", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
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