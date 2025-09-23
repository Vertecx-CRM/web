"use client";
import Colors from "@/shared/theme/colors";
import { IPurchase } from "../Types/Purchase.type";
import { usePurchases, months } from "../hooks/usePurchases";
import {
  showSuccess,
  showError,
  showWarning,
} from "@/shared/utils/notifications";

interface Props {
  onSave: (purchase: IPurchase) => void;
  purchases: IPurchase[];
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export default function RegisterPurchaseForm({ onSave, purchases }: Props) {
  const {
    form,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    cart,
    years,
    daysInMonth,
    total,
    handleChange,
    handleAddProduct,
    handleSubmit,
    products,
    suppliers,
  } = usePurchases(purchases, onSave);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showWarning("⚠️ Agrega al menos un producto al carrito.");
      return;
    }

    if (!form.supplier) {
      showError("Debes seleccionar un proveedor.");
      return;
    }

    try {
      handleSubmit(e);
      showSuccess("✅ Compra registrada correctamente.");
    } catch {
      showError("❌ Error al registrar la compra. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto px-2 sm:px-4">
      <form
        onSubmit={handleFormSubmit}
        className="space-y-5 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-sm"
      >
        {/* Fecha */}
        <div>
          <div className="flex justify-between mb-1 text-xs sm:text-sm">
            <label>
              Día <span className="text-red-500">*</span>
            </label>
            <label>
              Mes <span className="text-red-500">*</span>
            </label>
            <label>
              Año <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="day"
              onChange={handleChange}
              required
              className="rounded-md border px-2 py-2 text-sm w-full"
            >
              <option value="">Día</option>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              name="month"
              onChange={handleChange}
              required
              className="rounded-md border px-2 py-2 text-sm w-full"
            >
              <option value="">Mes</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="year"
              onChange={handleChange}
              required
              className="rounded-md border px-2 py-2 text-sm w-full"
            >
              <option value="">Año</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orden y Proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">
              N° de Orden <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="orderNumber"
              value={form.orderNumber}
              readOnly
              className="w-full rounded-md border px-2 py-2 text-sm bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <select
              name="supplier"
              onChange={handleChange}
              required
              className="w-full rounded-md border px-2 py-2 text-sm"
            >
              <option value="">Selecciona el proveedor</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Productos */}
        <div className="p-3 border rounded-lg bg-gray-50">
          <label className="block text-sm mb-2">
            Productos <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 rounded-md border px-2 py-2 text-sm"
            >
              <option value="">Selecciona un producto</option>
              {Object.keys(products).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full sm:w-28 rounded-md border px-2 py-2 text-center text-sm"
            />
          </div>

          {selectedProduct && (
            <p className="text-xs text-gray-600 mt-1">
              Stock disponible: {products[selectedProduct].stock}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              if (!selectedProduct) return;

              const alreadyInCart =
                cart.find((item) => item.name === selectedProduct)?.qty || 0;

              const stock = products[selectedProduct].stock;

              if (alreadyInCart + quantity > stock + alreadyInCart) {
                showWarning("⚠️ No puedes superar el stock disponible.");
                return;
              }

              handleAddProduct();
              showSuccess("Producto agregado al carrito 🛒");
            }}
            style={{ backgroundColor: Colors.buttons.primary }}
            className="cursor-pointer mt-3 w-full px-3 py-2 rounded-md text-white text-sm hover:bg-opacity-90 transition hover:scale-103"
          >
            Añadir más productos +
          </button>

          {/* Lista de productos en el carrito */}
          <ul className="mt-3 text-sm space-y-1">
            {cart.map((item) => (
              <li
                key={item.name}
                className="flex justify-between border-b pb-1 text-gray-700"
              >
                <span>
                  {item.name} x {item.qty} ({formatCOP(item.price)} c/u)
                </span>
                <span>= {formatCOP(item.qty * item.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Factura y Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">
              Número de factura <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="FAC-2025-1001"
              pattern="^FAC-\\d{4}-\\d{4}$"
              name="invoiceNumber"
              onChange={handleChange}
              required
              className="w-full rounded-md border px-2 py-2 text-sm"
              title="El formato debe ser FAC-AAAA-NNNN (ej: FAC-2025-1001)"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Total <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formatCOP(total)}
              readOnly
              className="w-full sm:w-32 rounded-md border px-2 py-2 text-sm bg-gray-100"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            name="description"
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border px-2 py-2 text-sm"
            placeholder="Ingrese sus observaciones"
          ></textarea>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
