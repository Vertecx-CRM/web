"use client";

import { ISale, ISaleCustomer } from "../types/Sales.type";
import { formatSaleCustomerLabel } from "../helpers/saleCustomerHelpers";
import { translateSaleStatus } from "../helpers/saleStatusHelpers";

interface Props {
  sale: ISale;
  customers?: ISaleCustomer[];
}

const formatCOP = (value: number) =>
  value.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const formatDateTime = (value: string | number | Date) =>
  new Date(value).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusClasses = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "completed") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (normalized === "cancelled") {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  return "bg-amber-100 text-amber-700 border-amber-200";
};

export default function ViewSale({ sale, customers }: Props) {
  const customerLabel = formatSaleCustomerLabel(sale, customers);
  const items = sale.salesdetail ?? [];

  return (
    <div className="space-y-6 text-gray-900">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide">
          Detalle de venta
        </p>
        <h2 className="text-lg font-semibold">{sale.salecode}</h2>
        <p className="text-sm text-gray-500">
          Registrada el {formatDateTime(sale.createddate)}
        </p>
        <p
          className={`text-sm ${customerLabel.isMissing ? "text-gray-500 italic" : "text-gray-700"
            }`}
        >
          Cliente: {customerLabel.label}
        </p>
      </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
              sale.salestatus
            )}`}
          >
            {translateSaleStatus(sale.salestatus)}
          </span>
          <span className="text-gray-500">
            Fecha de la venta: {formatDateTime(sale.saledate)}
          </span>
          <span className="text-gray-500">
            Método: {sale.paymentmethod ?? "Sin método asignado"}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField label="Cliente" value={customerLabel.label} highlight={customerLabel.isMissing} />
        <DetailField label="Creado por" value={sale.createdby ?? "Sin usuario"} />
        <DetailField label="Subtotal" value={formatCOP(sale.subtotal ?? 0)} />
        <DetailField label="Total" value={formatCOP(sale.totalamount)} />
      </section>

      <section>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <h3 className="font-semibold text-slate-900">Productos / servicios</h3>
          <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-xs text-gray-500">
              Esta venta no tiene productos ni servicios asociados.
            </p>
          ) : (
            items.map((item) => (
              <article
                key={item.saledetailid}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row"
              >
                <div className="w-full md:w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {item.products?.image ? (
                    <img
                      src={item.products.image}
                      alt={item.products?.productname ?? "Producto"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.products?.productname ??
                      `Producto #${item.productid}`}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.products?.productdescription ??
                      item.products?.suppliercategory ??
                      "Sin descripción disponible"}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {!!item.products?.productcode && (
                      <span>Código: {item.products.productcode}</span>
                    )}
                    {!!item.products?.categoryid && (
                      <span>Categoría {item.products.categoryid}</span>
                    )}
                    <span>Cantidad: {item.quantity}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right text-sm text-gray-600">
                  <span>Unitario</span>
                  <span className="text-slate-900 font-semibold">
                    {formatCOP(item.unitprice)}
                  </span>
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="text-slate-900 font-semibold">
                    {formatCOP(item.linetotal)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Subtotal" value={formatCOP(sale.subtotal ?? 0)} />
        <SummaryCard label="IVA" value={formatCOP(sale.taxamount ?? 0)} />
        <SummaryCard label="Descuento" value={formatCOP(sale.discountamount ?? 0)} />
        <SummaryCard label="Total pagado" value={formatCOP(sale.totalamount)} emphasized />
      </section>

      <section>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Observaciones
        </label>
        <textarea
          disabled
          value={sale.notes ?? "Sin observaciones"}
          className="w-full rounded-2xl border border-slate-200 bg-gray-50 p-3 text-sm text-gray-700 resize-none"
          rows={4}
        />
      </section>
    </div>
  );
}

function DetailField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-400 tracking-wide">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-gray-500 italic" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${
        emphasized
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
