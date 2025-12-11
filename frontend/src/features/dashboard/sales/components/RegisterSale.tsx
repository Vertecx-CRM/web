"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import ProductSelectorModal from "./ProductSelectorModal";

interface Props {
  hook: any;
  onClose: () => void;
}

export default function RegisterSaleForm({ hook, onClose }: Props) {
  const [saleStatus] = useState("Pendiente");
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  const [form, setForm] = useState({
    salecode: "",
    customerid: "",
    saledate: "",
    salestatus: "Pending",
    notes: "",
    paymentmethod: "Efectivo",
  });

  return (
    <div className="w-full max-h-[75vh] overflow-y-auto pr-2">
      {/* ===================== LAYOUT: IZQUIERDA + DERECHA ===================== */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ========================= LEFT SIDE ========================= */}
        <section className="flex-1">
          {/* DATOS DE LA VENTA */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Datos de la Venta</h2>

            {/* Cliente */}
            <label className="block text-sm mb-1 font-medium">
              Cliente (ID)
            </label>
            <input
              type="text"
              name="customerid"
              value={hook.form.customerid}
              placeholder="Ingrese ID del cliente"
              onChange={hook.handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            {/* Fecha + Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha venta
                </label>
                <input
                  type="date"
                  name="saledate"
                  value={hook.form.saledate}
                  onChange={(e) =>
                    hook.setForm((prev) => ({
                      ...prev,
                      saledate: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Estado Venta
                </label>
                <select
                  name="salestatus"
                  value={hook.form.salestatus}
                  onChange={hook.handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Pending">Pendiente</option>
                  <option value="Completed">Completada</option>
                  <option value="Cancelled">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTOS / SERVICIOS */}
          <div className="border rounded-xl p-6 bg-white shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-4">
              Detalles de Productos y Servicios
            </h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-2 px-3 text-left">Productos</th>
                  <th className="py-2 px-3 text-left">Categoria</th>
                  <th className="py-2 px-3 text-left">Imagen</th>
                  <th className="py-2 px-3 text-left">Cantidad</th>
                  <th className="py-2 px-3 text-left">Precio</th>
                  <th className="py-2 px-3 text-left">Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {hook.cart.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-3">{item.productname}</td>
                    <td className="py-3 px-3">Producto</td>
                    <td className="py-3 px-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        👤
                      </div>
                    </td>
                    <td className="py-3 px-3">{item.quantity}</td>
                    <td className="py-3 px-3">
                      ${item.unitprice.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-3">
                      $
                      {(item.unitprice * item.quantity).toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        className="hover:opacity-70 transition"
                        onClick={() =>
                          hook.setCart((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <img src="/icons/delete.svg" className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {hook.cart.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No hay productos agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Botones */}
            <div className="flex gap-4 mt-4">
              <button
                className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-100"
                onClick={() => setProductModalOpen(true)}
              >
                <span className="text-xl">+</span> Agregar Producto
              </button>

              <button className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-100">
                <span className="text-xl">+</span> Agregar Servicio
              </button>
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div className="border rounded-xl p-6 bg-white shadow-sm mt-6">
            <label className="block text-sm font-medium mb-2">
              Observaciones
            </label>
            <textarea
              name="notes"
              value={hook.form.notes}
              onChange={hook.handleChange}
              placeholder="Ingrese su Observación"
              className="w-full border rounded-lg px-3 py-2 h-32"
            ></textarea>
          </div>
        </section>

        {/* ========================= RIGHT SIDE (TOTAL) ========================= */}
        <aside className="w-full lg:w-96 border rounded-xl p-6 bg-white shadow-sm h-fit">
          <h2 className="text-2xl font-semibold mb-6">Total</h2>

          <div className="flex justify-between text-sm mb-3">
            <span>Subtotal</span>
            <span>$1,100,000</span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span>IVA (19%)</span>
            <span>$209,000</span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span>Descuento</span>
            <span>$0</span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total Cotizado</span>
            <span>$1,309,000</span>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="cursor-pointer px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
            >
              Cancelar
            </button>

            <button
              className="cursor-pointer bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              onClick={async () => {
                try {
                  await hook.handleCreateSale();
                  onClose();
                } catch (err) {
                  console.error(err);
                  alert("Error al crear la venta.");
                }
              }}
            >
              Guardar
            </button>
          </div>
        </aside>
      </div>
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        products={hook.products}
        onSelect={(product, qty) => {
          hook.setCart((prev) => [
            ...prev,
            {
              productid: product.productid,
              productname: product.productname,
              quantity: qty,
              unitprice: product.productpriceofsale,
            },
          ]);
        }}
        onCreate={(newProd) => {
          hook.setCart((prev) => [
            ...prev,
            {
              productid: null,
              productname: newProd.name,
              quantity: 1,
              unitprice: newProd.price,
            },
          ]);
        }}
      />
    </div>
  );
}
