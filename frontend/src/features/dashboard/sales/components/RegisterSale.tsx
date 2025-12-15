"use client";

import { useState } from "react";
import ProductSelectorModal from "./ProductSelectorModal";
import { UseSalesReturn } from "../hooks/useSales";

interface Props {
  hook: UseSalesReturn;
  onClose: () => void;
}

export default function RegisterSaleForm({ hook, onClose }: Props) {
export default function RegisterSale({ hook, onClose }: Props) {
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  const { errors } = hook;

  return (
    <div className="w-full max-h-[75vh] overflow-y-auto pr-2">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDE */}
        {/* ================= LEFT ================= */}
        <section className="flex-1">
          {/* DATOS VENTA */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Datos de la Venta</h2>

            {/* Código */}
            {/* CLIENTE */}
            <label className="block text-sm mb-1 font-medium">
              Código venta
            </label>
            <input
              type="text"
              name="salecode"
              value={hook.form.salecode}
              onChange={hook.handleChange}
              placeholder="Ej: VEN-001"
              className="w-full border rounded-lg px-3 py-2 mb-1"
            />
            {errors.salecode && (
              <p className="text-red-600 text-sm mb-2">{errors.salecode}</p>
            )}

            {/* CLIENTE */}
            <label className="block text-sm mb-1 font-medium">Cliente</label>
            <select
              type="number"
              name="customerid"
              value={hook.form.customerid}
              onChange={hook.handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-1"
            >
              <option value="">Seleccione un cliente</option>
              {hook.customers.map((c: any) => (
                <option key={c.customerid} value={c.customerid}>
                  {c.users.name} {c.users.lastname} — {c.users.documentnumber}
                </option>
              ))}
            </select>
            {errors.customerid && (
              <p className="text-red-600 text-sm mb-2">{errors.customerid}</p>
            )}

            {/* Fecha */}
            <label className="block text-sm font-medium mb-1">
              Fecha venta
            </label>
            <input
              type="date"
              name="saledate"
              value={hook.form.saledate}
              onChange={hook.handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-1"
            />
            {errors.saledate && (
              <p className="text-red-600 text-sm mb-2">{errors.saledate}</p>
            )}
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

            {/* Estado */}
            <label className="block text-sm font-medium mb-1">
              Estado Venta
            </label>
            <select
              disabled
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option>Pendiente</option>
            </select>
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
          {/* PRODUCTOS */}
          <div className="border rounded-xl p-6 bg-white shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>

            {errors.products && (
              <p className="text-red-600 text-sm font-medium mb-2">
                {errors.products}
              </p>
            )}
            <h2 className="text-lg font-semibold mb-4">Productos</h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-2 px-3 text-left">Producto</th>
                  <th className="py-2 px-3 text-left">Cantidad</th>
                  <th className="py-2 px-3 text-left">Precio</th>
                  <th className="py-2 px-3 text-left">Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {hook.cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No hay productos agregados.
                    </td>
                  </tr>
                )}

                {hook.cart.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-3">{item.productname}</td>
                    <td className="py-3 px-3">{item.quantity}</td>
                    <td className="py-3 px-3">
                      ${item.unitprice.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-3">
                      $
                      {(item.unitprice * item.quantity).toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-3">
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
              className="mt-4 border rounded-lg px-4 py-2 hover:bg-gray-100"
              onClick={() => setProductModalOpen(true)}
            >
              + Agregar Producto
            </button>
            <button
              type="button"
              className="mt-4 border rounded-lg px-4 py-2"
              onClick={() => setProductModalOpen(true)}
            >
              + Agregar Producto
            </button>
          </div>

          {/* Observaciones */}
          <div className="border rounded-xl p-6 bg-white shadow-sm mt-6">
            <label className="block text-sm font-medium mb-2">
              Observaciones
            </label>
            <textarea
              name="notes"
              value={hook.form.notes}
              onChange={hook.handleChange}
              placeholder="Ingrese su observación"
              className="w-full border rounded-lg px-3 py-2 h-32"
            />
            {errors.notes && (
              <p className="text-red-600 text-sm">{errors.notes}</p>
            )}
            />
          </div>
        </section>

        {/* RIGHT SIDE TOTAL */}
        {/* ================= RIGHT ================= */}
        <aside className="w-full lg:w-96 border rounded-xl p-6 bg-white shadow-sm h-fit">
          <h2 className="text-2xl font-semibold mb-6">Total</h2>

          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${hook.subtotal.toLocaleString("es-CO")}</span>
            <span>
              {hook.subtotal.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span>IVA (19%)</span>
            <span>${hook.taxamount.toLocaleString("es-CO")}</span>
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

          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>${hook.totalamount.toLocaleString("es-CO")}</span>
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
              className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              className="px-6 py-2 bg-gray-300 rounded-lg"
            >
              Cancelar
            </button>

            <button
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              type="button"
              disabled={hook.saving}
              onClick={async () => {
                try {
                  await hook.handleCreateSale();
                  onClose();
                } catch (err) {
                  alert("Hay errores en el formulario.");
                }
              }}
            >
              Guardar
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

      {/* MODAL DE PRODUCTOS */}

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
              productstock: product.productstock,
            },
          ]);
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
