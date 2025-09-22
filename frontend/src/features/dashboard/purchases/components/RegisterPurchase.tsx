"use client";
import { IPurchase } from "../Types/Purchase.type";
import { usePurchases, months } from "../hooks/usePurchases";

interface Props {
  onSave: (purchase: IPurchase) => void;
  purchases: IPurchase[];
}


export default function RegisterPurchaseForm({ onSave, purchases }: Props) {
  const {
    form,
    error,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-2">
      {/* Fecha */}
      <div>
        <div className="flex justify-around mb-1">
          <label className="text-sm">Día</label>
          <label className="text-sm">Mes</label>
          <label className="text-sm">Año</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            name="day"
            onChange={handleChange}
            required
            className="rounded-md border px-2 py-2 text-sm"
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
            className="rounded-md border px-2 py-2 text-sm"
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
            className="rounded-md border px-2 py-2 text-sm"
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

      {/* Orden */}
      <div>
        <label className="block text-sm mb-1">N° de Orden</label>
        <input
          type="text"
          name="orderNumber"
          value={form.orderNumber}
          readOnly
          className="w-full rounded-md border px-2 py-2 text-sm bg-gray-100"
        />
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm mb-1">Proveedor</label>
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

      {/* Productos */}
      <div className="p-3 border rounded-lg bg-gray-100">
        <label className="block text-sm mb-2">Productos</label>
        <div className="flex items-center gap-2">
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
            max={selectedProduct ? products[selectedProduct].stock : undefined}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (selectedProduct && val > products[selectedProduct].stock) {
                setQuantity(products[selectedProduct].stock);
              } else {
                setQuantity(val);
              }
            }}
            className="w-20 rounded-md border px-2 py-2 text-center text-sm"
          />
        </div>
        {selectedProduct && (
          <p className="text-xs text-gray-600 mt-1">
            Stock disponible: {products[selectedProduct].stock}
          </p>
        )}
        <button
          type="button"
          onClick={handleAddProduct}
          className="mt-3 w-full px-3 py-2 rounded-md bg-gray-500 text-white text-sm"
        >
          Añadir más productos +
        </button>
        <ul className="mt-3 text-sm space-y-1">
          {cart.map((item) => (
            <li key={item.name} className="flex justify-between">
              <span>
                {item.name} x {item.qty}
              </span>
              <span>${item.qty * item.price}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Factura */}
      <div>
        <label className="block text-sm mb-1">Número de factura</label>
        <input
          type="text"
          placeholder="FAC-2025-1001"
          pattern="^FAC-\d{4}-\d{4}$"
          name="invoiceNumber"
          onChange={handleChange}
          required
          className="w-full rounded-md border px-2 py-2 text-sm"
          title="El formato debe ser FAC-AAAA-NNNN (ej: FAC-2025-1001)"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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

      {/* Total */}
      <div>
        <label className="block text-sm mb-1">Total</label>
        <input
          type="text"
          value={`$${total}`}
          readOnly
          className="w-28 rounded-md border px-2 py-2 text-sm"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
