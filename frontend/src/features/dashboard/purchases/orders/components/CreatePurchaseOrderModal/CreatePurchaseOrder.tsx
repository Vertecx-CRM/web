import React, { useState } from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { createPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";
import { useCreatePurchaseOrderForm } from "../../hooks/usePurchaseOrders";

type LocalProduct = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  categoria?: string;
  fileName?: string;
};

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
  } = useCreatePurchaseOrderForm({
    isOpen,
    onClose,
    onSave,
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [products, setProducts] = useState<LocalProduct[]>([]);

  // Estado del formulario dentro del sub-modal de producto
  const [newProduct, setNewProduct] = useState<LocalProduct>({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    cantidad: 1,
    categoria: "",
    fileName: "",
  });

  if (!isOpen) return null;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // wrapper para tu hook (acepta (name, value))
    handleInputChange(event.target.name as keyof typeof formData, event.target.value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      event.target.type === "number"
        ? parseFloat(event.target.value) || 0
        : event.target.value;
    handleInputChange(event.target.name as keyof typeof formData, value);
  };

  // Totales basados en la lista de productos; si no hay productos, cae en el template.
  const productsSubtotal = products.reduce((s, p) => s + (p.precio || 0) * (p.cantidad || 0), 0);
  const fallbackSubtotal = (formData.precioUnitario || 0) * (formData.cantidad || 0);
  const subtotal = products.length > 0 ? productsSubtotal : fallbackSubtotal;
  const iva = subtotal * 0.19;
  const descuento = 0;
  const total = subtotal + iva - descuento;

  // Añadir producto desde el sub-modal
  const saveNewProduct = () => {
    if (!newProduct.nombre || newProduct.precio <= 0 || newProduct.cantidad <= 0) {
      // Simple validación mínima — puedes reemplazar por tus notificaciones
      alert("Ingrese nombre, precio (>0) y cantidad (>0) del producto.");
      return;
    }
    const p: LocalProduct = {
      ...newProduct,
      id: Date.now() + Math.floor(Math.random() * 999),
    };
    setProducts(prev => [...prev, p]);
    // limpiar y cerrar
    setNewProduct({
      id: 0,
      nombre: "",
      descripcion: "",
      precio: 0,
      cantidad: 1,
      categoria: "",
      fileName: ""
    });
    setIsProductModalOpen(false);
  };

  const removeProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Envío del formulario: inyectamos products en formData antes de delegar a handleSubmit
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // pasar productos al formData (tu hook debería aceptar un campo productos, si no, lo recibes en onSave)
    handleInputChange("productos" as any, products); // cast para evitar TS si tu type no lo incluye
    // llamar al submit real (tu hook validará)
    handleSubmit(e);
  };

  return createPortal(
    <>
      {/* MODAL PRINCIPAL */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative z-50 max-h-[95vh] overflow-y-auto">
          {/* Encabezado: título a la izquierda, X a la derecha y línea */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-base font-medium text-gray-900">Crear Orden Compra</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="w-full border-t border-gray-300" />

          {/* FORMULARIO */}
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            {/* FILA 1: PROVEEDOR (fila completa arriba) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor*</label>
              <select
                name="proveedor"
                value={formData.proveedor}
                onChange={handleSelectChange}
                onBlur={() => handleBlur("proveedor")}
                className={`w-full max-w-xs px-3 py-2 border rounded-md outline-none focus:ring-2 ${
                  errors.proveedor && touched.proveedor
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-red-200"
                }`}
              >
                <option value="">VivaSolar</option>
                <option value="Proveedor B">Proveedor B</option>
                <option value="Proveedor C">Proveedor C</option>
              </select>
            </div>

            {/* FILA 2: Fecha y Estado (misma fila) */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha estimada de entrega
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleTextChange}
                  onBlur={() => handleBlur("fecha")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Orden</label>
                <select
                  name="estado"
                  value="Pendiente"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                >
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            {/* TABLA PRODUCTOS */}
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 text-sm font-medium text-gray-700">
                <div>Productos</div>
                <div>Imagen</div>
                <div className="text-center">Cantidad</div>
                <div className="text-right">Precio</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>

              {/* Si hay productos guardados, los listamos; si no, mostramos la fila temporal editable */}
              {products.length > 0 ? (
                products.map((p) => (
                  <div key={p.id} className="grid grid-cols-6 gap-2 p-3 items-center border-t text-sm">
                    <div>{p.nombre}</div>
                    <div className="flex items-center justify-center text-gray-400">
                      {p.fileName ? <span className="text-xs">{p.fileName}</span> : "-"}
                    </div>
                    <div className="text-center">{p.cantidad}</div>
                    <div className="text-right">${p.precio.toLocaleString("es-CO")}</div>
                    <div className="text-right">${(p.precio * p.cantidad).toLocaleString("es-CO")}</div>
                    <div className="text-center">
                      <button type="button" onClick={() => removeProduct(p.id)} className="text-red-500 hover:text-red-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4h-6v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-6 gap-2 p-3 items-center border-t">
                  <input
                    type="text"
                    name="numeroOrden"
                    placeholder="Nombre producto"
                    value={formData.numeroOrden}
                    onChange={handleTextChange}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <div className="flex justify-center text-gray-400">-</div>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleTextChange}
                    min={1}
                    className="px-2 py-1 border rounded text-sm text-center"
                  />
                  <input
                    type="number"
                    name="precioUnitario"
                    placeholder="0"
                    value={formData.precioUnitario || ""}
                    onChange={handleTextChange}
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                  <div className="text-sm font-medium text-right">${fallbackSubtotal.toLocaleString("es-CO")}</div>
                  <div />
                </div>
              )}

              {/* Botón Agregar Producto */}
              <div className="p-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Producto
                </button>
              </div>
            </div>

            {/* RESUMEN */}
            <div className="bg-white p-4 rounded-md text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">IVA (19%)</span>
                <span className="text-gray-800">${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Descuento</span>
                <span className="text-gray-800">$0</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total a pagar</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* OBSERVACIONES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={(e) => handleInputChange("descripcion" as any, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Ingrese observaciones..."
              />
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-md font-medium text-white"
                style={{ backgroundColor: Colors.buttons.quaternary }}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL CREAR PRODUCTO */}
      {isProductModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Producto</h3>

              <div className="space-y-3 text-sm">
                <input
                  type="text"
                  placeholder="Nombre producto"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <textarea
                  placeholder="Descripción"
                  value={newProduct.descripcion}
                  onChange={(e) => setNewProduct(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct(p => ({ ...p, precio: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={newProduct.cantidad}
                    onChange={(e) => setNewProduct(p => ({ ...p, cantidad: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <select
                  value={newProduct.categoria}
                  onChange={(e) => setNewProduct(p => ({ ...p, categoria: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccione categoría</option>
                  <option value="Electrónicos">Electrónicos</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
                <input
                  type="file"
                  onChange={(e) => setNewProduct(p => ({ ...p, fileName: e.target.files?.[0]?.name || "" }))}
                  className="w-full px-3 py-2 border rounded-md"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveNewProduct}
                    className="px-4 py-2 text-white rounded-md"
                    style={{ backgroundColor: Colors.buttons.quaternary }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>,
    document.body
  );
};

export default CreatePurchaseOrderModal;
