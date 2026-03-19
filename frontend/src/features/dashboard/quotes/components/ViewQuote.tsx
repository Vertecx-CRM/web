"use client";

import { IQuote } from "../types/Quote.type";

interface ViewQuoteProps {
  quote: IQuote;
  canCreateOrder?: boolean;
  onCreateOrder?: () => Promise<void> | void;
  canComplete?: boolean;
  isCompleting?: boolean;
  onComplete?: () => Promise<void> | void;
}

const formatCOP = (value: number | string | undefined | null) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString("es-CO");
};

export default function ViewQuote({
  quote,
  canCreateOrder = false,
  onCreateOrder,
  canComplete = false,
  isCompleting = false,
  onComplete,
}: ViewQuoteProps) {
  if (!quote) return null;

  const client = quote.customer?.users
    ? `${quote.customer.users.name ?? ""} ${quote.customer.users.lastname ?? ""}`.trim()
    : "-";

  const technician = quote.technician?.users
    ? `${quote.technician.users.name ?? ""} ${quote.technician.users.lastname ?? ""}`.trim()
    : "-";

  const orderId =
    quote.ordersservices?.ordersservicesid ?? quote.ordersservicesid ?? null;
  const orderState = quote.ordersservices?.state?.name ?? "-";
  const observation = quote.observationPlain ?? quote.observation ?? "";

  return (
    <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-4 text-sm text-gray-800">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="ID cotizacion" value={quote.quotesid} />
        <Field label="Solicitud de servicio" value={quote.serviceRequestId ?? "-"} />
        <Field label="Cliente" value={client || "-"} />
        <Field label="Tecnico" value={technician || "-"} />
        <Field label="Tipo de servicio" value={quote.servicetype ?? "-"} />
        <Field label="Estado" value={quote.state?.name ?? "-"} />
        <Field
          label="Respuesta del cliente"
          value={quote.clientAccepted ? "Aceptada" : "Pendiente"}
        />
        <Field
          label="Fecha de aceptacion"
          value={formatDateTime(quote.clientAcceptedAt)}
        />
        <Field label="Orden de servicio" value={orderId ? `#${orderId}` : "-"} />
        <Field label="Estado de la orden" value={orderState} />
        <Field label="Fecha creacion" value={formatDateTime(quote.createdat)} />
        <Field label="Ultima actualizacion" value={formatDateTime(quote.updatedat)} />
      </div>

      <div>
        <label className="mb-1 block font-medium">Observacion</label>
        <textarea
          disabled
          value={observation}
          rows={3}
          className="w-full resize-none rounded-md border bg-gray-100 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Detalles de la cotizacion</label>
        <div className="divide-y rounded-md border bg-gray-50">
          {quote.details?.length ? (
            quote.details.map((detail: any, index: number) => (
              <div
                key={detail.quotedetailid ?? index}
                className="flex flex-col gap-2 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-900">
                    {detail.description}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      detail.availability === "DISPONIBLE"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {detail.availability}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 sm:grid-cols-4">
                  <Info label="Producto ID" value={detail.productid ?? "Manual"} />
                  <Info label="Cantidad" value={detail.quantity} />
                  <Info
                    label="Precio unitario"
                    value={formatCOP(detail.unitprice)}
                  />
                  <Info label="Subtotal" value={formatCOP(detail.subtotal)} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No hay detalles registrados.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t pt-4 text-sm">
        <Row label="Subtotal" value={formatCOP(quote.subtotal)} />
        <Row label="IVA (19%)" value={formatCOP(quote.tax)} />
        <Row label="Total" value={formatCOP(quote.total)} bold />
      </div>

      {(canCreateOrder && onCreateOrder) || (canComplete && onComplete) ? (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          {canCreateOrder && onCreateOrder && (
            <button
              type="button"
              onClick={onCreateOrder}
              className="rounded-md bg-sky-600 px-5 py-2 text-white shadow-sm transition hover:bg-sky-700"
            >
              Crear orden de servicio
            </button>
          )}
          {canComplete && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              disabled={isCompleting}
              className="rounded-md bg-emerald-600 px-5 py-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCompleting ? "Generando venta..." : "Generar venta"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <input
        disabled
        value={value ?? "-"}
        className="w-full rounded-md border bg-gray-100 px-3 py-2 text-gray-800"
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
