"use client";

import { useState } from "react";
import ProductSelectorModal from "./ProductSelectorModal";
import { UseSalesReturn } from "../hooks/useSales";

interface Props {
  hook: UseSalesReturn;
  onClose: () => void;
}

export default function RegisterSale({ hook, onClose }: Props) {
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  return (
    <div className="w-full max-h-[75vh] overflow-y-auto pr-2">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ================= LEFT ================= */}
        <section className="flex-1">
          {/* DATOS VENTA */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Datos de la Venta</h2>

            {/* CLIENTE */}
            <label className="block text-sm mb-1 font-medium">
              Cliente (ID)
            </label>
            <input
              type="number"
              name="customerid"
              value={hook.form.customerid}
              onChange={hook.handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            {/* FECHA / ESTADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha venta
                </label>
                <input
                  type="date"
                  name="saledate"
                  value={hook.form.saledate}
                  onChange={hook.handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

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

          {/* PRODUCTOS */}
          <div className="border rounded-xl p-6 bg-white shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>

            <table className="w-full text-sm border-collapse">
              <tbody>
                {hook.cart.map((item) => (
                  <tr key={item.productid} className="border-b">
                    <td className="py-3">{item.productname}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">
                      {(item.unitprice * item.quantity).toLocaleString(
                        "es-CO",
                        { style: "currency", currency: "COP" }
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() =>
                          hook.setCart((prev) =>
                            prev.filter((p) => p.productid !== item.productid)
                          )
                        }
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}

                {hook.cart.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-gray-500"
                    >
                      No hay productos agregados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <button
              type="button"
              className="mt-4 border rounded-lg px-4 py-2"
              onClick={() => setProductModalOpen(true)}
            >
              + Agregar Producto
            </button>
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
              className="w-full border rounded-lg px-3 py-2 h-32"
            />
          </div>
        </section>

        {/* ================= RIGHT ================= */}
        <aside className="w-full lg:w-96 border rounded-xl p-6 bg-white shadow-sm h-fit">
          <h2 className="text-2xl font-semibold mb-6">Total</h2>

          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>
              {hook.subtotal.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </span>
          </div>

          <div className="flex justify-between mb-2">
            <span>IVA</span>
            <span>
              {hook.taxamount.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              {hook.totalamount.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </span>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={hook.saving}
              onClick={async () => {
                await hook.handleCreateSale();
                if (!hook.saving) onClose();
              }}
              className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-50"
            >
              {hook.saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </aside>
      </div>

      {/* MODAL PRODUCTOS */}
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        products={hook.products}
        onSelect={(product, qty) => {
          if (hook.cart.some((p) => p.productid === product.productid)) {
            alert("Este producto ya fue agregado");
            return;
          }

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
        onCreate={() => {
          alert("Los productos deben crearse en el módulo de productos.");
        }}
      />
    </div>
  );
}
