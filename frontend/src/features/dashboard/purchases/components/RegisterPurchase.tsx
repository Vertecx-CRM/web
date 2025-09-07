"use client";

export default function RegisterPurchaseForm() {
  return (
    <form className="space-y-4">
      {/* Fecha */}
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="Día"
          className="border p-2 rounded-lg"
        />
        <select className="border p-2 rounded-lg">
          <option>Abril</option>
          <option>Mayo</option>
        </select>
        <input
          type="number"
          placeholder="Año"
          className="border p-2 rounded-lg"
        />
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm">Proveedor</label>
        <select className="w-full border p-2 rounded-lg">
          <option>Selecciona el proveedor</option>
        </select>
      </div>

      {/* Productos */}
      <div className="p-3 border rounded-lg bg-gray-100">
        <label className="block text-sm mb-2">Productos</label>
        <div className="flex items-center gap-2">
          <select className="flex-1 border p-2 rounded-lg">
            <option>Cámara hivision</option>
          </select>
          <input
            type="number"
            placeholder="00"
            className="w-16 border p-2 rounded-lg"
          />
        </div>
        <button
          type="button"
          className="mt-3 w-full px-3 py-2 bg-gray-500 text-white rounded-lg"
        >
          Añadir más productos +
        </button>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm">Descripción</label>
        <textarea className="w-full border p-2 rounded-lg" rows={3}></textarea>
      </div>

      {/* Total */}
      <div>
        <label className="block text-sm">Total</label>
        <input type="text" className="border p-2 rounded-lg w-28" />
      </div>
    </form>
  );
}
