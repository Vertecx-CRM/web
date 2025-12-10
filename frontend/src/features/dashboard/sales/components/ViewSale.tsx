"use client";

import { ISale } from "../types/Sales.type";

interface Props {
  sale: ISale;
}

export default function ViewSale({ sale }: Props) {
  // Usamos salesdetail del backend
  const items = sale.salesdetail ?? [];

  const formatCOP = (v: number) =>
    v.toLocaleString("es-CO", { style: "currency", currency: "COP" });

  return (
    <div className="space-y-6 text-gray-800">

      {/* Datos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Código Venta" value={sale.salecode} />
        <Field label="Estado Venta" value={sale.salestatus} />
        <Field
          label="Cliente"
          value={sale.customer?.customerid?.toString() ?? "N/A"}
        />
        <Field
          label="Fecha venta"
          value={new Date(sale.saledate).toLocaleDateString("es-CO")}
        />
      </div>

      {/* Tabla de productos */}
      <div>
        <h3 className="text-base font-semibold mt-4 mb-2">
          Productos / Servicios
        </h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Producto</th>
              <th className="py-2">Tipo</th>
              <th className="py-2 text-center">Cantidad</th>
              <th className="py-2 text-center">Precio</th>
              <th className="py-2 text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Esta venta no tiene productos registrados.
                </td>
              </tr>
            )}

            {items.map((i: any, idx: number) => (
              <tr key={idx} className="border-b">
                <td className="py-2">
                  {i.products?.productname ?? "Producto sin nombre"}
                </td>

                <td className="py-2">
                  {i.products?.categoryid
                    ? `Categoría ${i.products.categoryid}`
                    : "N/A"}
                </td>

                <td className="py-2 text-center">{i.quantity}</td>

                <td className="py-2 text-center">{formatCOP(i.unitprice)}</td>

                <td className="py-2 text-center">
                  {formatCOP(i.unitprice * i.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="flex justify-end mt-4">
        <div className="text-sm space-y-1">
          <div className="flex justify-between gap-10">
            <span>Subtotal</span>
            <span>{formatCOP(sale.subtotal ?? 0)}</span>
          </div>

          <div className="flex justify-between gap-10">
            <span>IVA</span>
            <span>{formatCOP(sale.taxamount ?? 0)}</span>
          </div>

          <div className="flex justify-between gap-10">
            <span>Descuento</span>
            <span>{formatCOP(sale.discountamount ?? 0)}</span>
          </div>

          <div className="flex justify-between gap-10 font-semibold text-lg mt-2">
            <span>TOTAL PAGADO</span>
            <span>{formatCOP(sale.totalamount)}</span>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          disabled
          value={sale.notes ?? ""}
          className="w-full border rounded-lg bg-gray-100 p-3 text-sm resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium block">{label}</label>
      <input
        disabled
        value={value}
        className="w-full bg-gray-100 border rounded-lg p-2 text-sm"
      />
    </div>
  );
}
