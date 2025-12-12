import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { createPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";
import { useCreatePurchaseOrderForm } from "../../hooks/usePurchaseOrders";
import { Upload, X } from "lucide-react";

type LocalProduct = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  categoria?: string;
  imagen?: File | null;
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
    isSubmitting,
  } = useCreatePurchaseOrderForm({
    isOpen,
    onClose,
    onSave,
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [products, setProducts] = useState<LocalProduct[]>([]);

  const [newProduct, setNewProduct] = useState<LocalProduct>({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    cantidad: 1,
    categoria: "",
    imagen: null,
    fileName: "",
  });

  if (!isOpen) return null;

  // === HANDLERS ===
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleInputChange(e.target.name as keyof typeof formData, e.target.value);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    handleInputChange(e.target.name as keyof typeof formData, value);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    handleInputChange(e.target.name as keyof typeof formData, e.target.value);

  // === CALCULOS ===
  const productsSubtotal = products.reduce(
    (s, p) => s + (p.precio || 0) * (p.cantidad || 0),
    0
  );
  const fallbackSubtotal =
    (formData.precioUnitario || 0) * (formData.cantidad || 0);
  const subtotal = products.length > 0 ? productsSubtotal : fallbackSubtotal;
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  // === PRODUCTOS ===
  const saveNewProduct = () => {
    if (!newProduct.nombre || newProduct.precio <= 0 || newProduct.cantidad <= 0) {
      toast.error("Ingrese nombre, precio (>0) y cantidad (>0) del producto.");
      return;
    }

    const p: LocalProduct = {
      ...newProduct,
      id: Date.now() + Math.floor(Math.random() * 999),
    };

    setProducts((prev) => [...prev, p]);
    toast.success(`Producto "${p.nombre}" agregado con éxito 🛒`);

    setNewProduct({
      id: 0,
      nombre: "",
      descripcion: "",
      precio: 0,
      cantidad: 1,
      categoria: "",
      imagen: null,
      fileName: "",
    });
    setIsProductModalOpen(false);
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Producto eliminado ❌");
  };

  // === SUBMIT ===
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.proveedor) {
      toast.error("Seleccione un proveedor antes de guardar.");
      return;
    }

    if (products.length === 0) {
      toast.error("Debe agregar al menos un producto.");
      return;
    }

    // Calcular precio unitario promedio o total/cantidad de productos
    const precioUnitarioPromedio = subtotal / products.reduce((sum, p) => sum + p.cantidad, 0);

    const orderData: any = {
      ...formData,
      productos: products,
      precioUnitario: precioUnitarioPromedio,
      subtotal,
      iva,
      total,
      estado: "Pendiente" as const,
    };

    onSave(orderData);
    setProducts([]);
    onClose();
    toast.success("Orden de compra creada con éxito ✅");
  };

  // === MODAL PRINCIPAL ===
  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Crear Orden de Compra
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor*
              </label>
              <select
                name="proveedor"
                value={formData.proveedor}
                onChange={handleSelectChange}
                onBlur={() => handleBlur("proveedor")}
                className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 ${
                  errors.proveedor && touched.proveedor
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-red-200"
                }`}
              >
                <option value="">Seleccione...</option>
                <option value="VivaSolar">VivaSolar</option>
                <option value="Proveedor B">Proveedor B</option>
                <option value="Proveedor C">Proveedor C</option>
              </select>
              {errors.proveedor && touched.proveedor && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.proveedor}
                </span>
              )}
            </div>

            {/* Fecha y estado */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  disabled
                  value="Pendiente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Tabla productos */}
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 text-sm font-medium text-gray-700">
                <div>Producto</div>
                <div>Imagen</div>
                <div className="text-center">Cantidad</div>
                <div className="text-right">Precio</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>

              {products.length > 0 ? (
                products.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-6 gap-2 p-3 items-center border-t text-sm"
                  >
                    <div>{p.nombre}</div>
                    <div className="flex items-center justify-center text-gray-400">
                      {p.fileName ? (
                        <span className="text-xs">{p.fileName}</span>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div className="text-center">{p.cantidad}</div>
                    <div className="text-right">
                      ${p.precio.toLocaleString("es-CO")}
                    </div>
                    <div className="text-right">
                      ${(p.precio * p.cantidad).toLocaleString("es-CO")}
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => removeProduct(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4h-6v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No hay productos agregados.
                </div>
              )}

              {/* Botón agregar */}
              <div className="p-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar Producto
                </button>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-200">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">IVA (19%)</span>
                <span>${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total a pagar</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={handleTextareaChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Ingrese observaciones..."
              />
            </div>

            {/* Botones */}
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

      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* === SUBMODAL PRODUCTO === */}
      {isProductModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Crear Producto
                </h3>
                <button
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setNewProduct({
                      id: 0,
                      nombre: "",
                      descripcion: "",
                      precio: 0,
                      cantidad: 1,
                      categoria: "",
                      imagen: null,
                      fileName: ""
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Nombre producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre producto
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese nombre"
                    value={newProduct.nombre}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, nombre: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Ingrese descripción"
                    value={newProduct.descripcion}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, descripcion: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Precio y Cantidad */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Precio
                    </label>
                    <input
                      type="number"
                      placeholder="Ingrese precio"
                      value={newProduct.precio || ""}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          precio: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      placeholder="Ingrese stock"
                      value={newProduct.cantidad || ""}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          cantidad: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={newProduct.categoria}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, categoria: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Hogar">Hogar</option>
                  </select>
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Imagen
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewProduct((p) => ({
                            ...p,
                            imagen: file,
                            fileName: file.name
                          }));
                        }
                      }}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between bg-white"
                    >
                      <span className={newProduct.fileName ? "text-gray-700" : "text-gray-400"}>
                        {newProduct.fileName || "Ingrese su imagen"}
                      </span>
                      <Upload size={18} className="text-gray-400" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setNewProduct({
                      id: 0,
                      nombre: "",
                      descripcion: "",
                      precio: 0,
                      cantidad: 1,
                      categoria: "",
                      imagen: null,
                      fileName: ""
                    });
                  }}
                  className="px-5 py-2.5 text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveNewProduct}
                  disabled={!newProduct.nombre || !newProduct.precio || !newProduct.categoria}
                  className="px-5 py-2.5 text-sm font-medium bg-gray-900 hover:bg-black text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
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
