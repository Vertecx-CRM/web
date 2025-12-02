"use client";

import React, { useMemo } from "react";
import RequireAuth from "@/features/auth/requireauth";
import { OrderServiceDTO, useOrderServiceDetail, useOrderServiceHistory } from "../hooks/useOrderServices";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const stateStyles: Record<string, string> = {
  Activo: "bg-emerald-500 text-white",
  Pendiente: "bg-yellow-400 text-slate-900",
  Anulada: "bg-red-500 text-white",
  Garantia: "bg-blue-500 text-white",
  GarantiaReportada: "bg-blue-600 text-white",
};

interface OrderServiceDetailProps {
  orderId: number;
}

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0);
const buildDateTime = (date?: string, time?: string) => {
  if (!date) return null;
  const normalizedTime = time?.trim() || "00:00:00";
  return new Date(`${date}T${normalizedTime}`);
};
const formatDateTime = (value?: Date | null) =>
  value ? value.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "-";
const formatHistoryDate = (value?: string) => formatDateTime(value ? new Date(value) : null);

const isImageFile = (value: string) =>
  /\.(jpe?g|png|gif|webp|bmp)$/i.test(value);

const FilesGrid: React.FC<{ files: string[] }> = ({ files }) => {
  if (!files.length) {
    return <p className="text-sm font-medium text-slate-500">No hay archivos adjuntos.</p>;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {files.map((file, index) => (
        <div
          key={`${file}-${index}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm"
        >
          {isImageFile(file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file}
              alt={`Archivo ${index + 1}`}
              className="h-48 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-center text-sm text-slate-500">
              <p className="px-2">Archivo adjunto</p>
            </div>
          )}
          <a
            href={file}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block rounded-md bg-white px-3 py-1 text-center text-xs font-semibold text-slate-700 shadow"
          >
            Abrir archivo #{index + 1}
          </a>
        </div>
      ))}
    </div>
  );
};

const TechnicianCard: React.FC<{ tech: OrderServiceDTO["technicians"][0] }> = ({ tech }) => {
  const name = tech?.users
    ? [tech.users.name ?? "", tech.users.lastname ?? ""].filter(Boolean).join(" ").trim()
    : `Tecnico ${tech?.technicianid ?? "N/A"}`;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">{name || "Tecnico"}</p>
        {(tech as any)?.CV && (
          <a
            href={(tech as any).CV}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold uppercase text-amber-600 hover:underline"
          >
            Ver CV
          </a>
        )}
      </div>
      {tech?.technicianid && (
        <p className="text-xs text-slate-500">ID: {tech.technicianid}</p>
      )}
      {tech?.userid && <p className="text-xs text-slate-500">Usuario: {tech.userid}</p>}
    </div>
  );
};

const OrderServiceDetailContent: React.FC<{ order: OrderServiceDTO }> = ({ order }) => {
  const scheduleStart = buildDateTime(order.fechainicio, order.horainicio);
  const scheduleEnd = buildDateTime(order.fechafin, order.horafin);
  const created = order.createdat ? new Date(order.createdat) : null;
  const updated = order.updatedat ? new Date(order.updatedat) : null;
  const stateLabel = order.state?.name ?? "Sin estado";
  const formattedFiles = (order.files ?? []).filter(Boolean);
  const headerStateColor = stateStyles[stateLabel] ?? "bg-slate-200 text-slate-900";
  const { data: history, isLoading: isHistoryLoading } = useOrderServiceHistory(order.ordersservicesid);
  const historyEntries = history ?? [];

  const clientLabel = useMemo(() => {
    if (!order.client) return "Cliente no asignado";
    const parts = [
      order.client.users?.name ?? "",
      order.client.users?.lastname ?? "",
      order.client.customercity ?? "",
    ]
      .filter(Boolean)
      .join(" - ");
    return parts || `Cliente ${order.client.customerid ?? order.client.userid ?? ""}`;
  }, [order.client]);

  const totalProducts = order.products?.reduce((sum, item) => sum + (item.subtotal ?? 0), 0) ?? 0;
  const totalProductsLabel = formatCurrency(totalProducts);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Orden de servicio</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              OS-{String(order.ordersservicesid).padStart(6, "0")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              {order.description || "Sin descripcion adicional del servicio."}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-right text-sm md:items-end">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${headerStateColor}`}>
              {stateLabel}
            </span>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(order.total)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Horario</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{formatDateTime(scheduleStart)}</p>
            <p className="text-xs text-slate-500">Inicio programado</p>
            <p className="mt-3 text-sm font-medium text-slate-800">{formatDateTime(scheduleEnd)}</p>
            <p className="text-xs text-slate-500">Fin programado</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{clientLabel}</p>
            <p className="text-xs text-slate-500">
              Ciudad: {order.client?.customercity ?? "Sin ciudad registrada"}
            </p>
            <p className="text-xs text-slate-500">
              Codigo postal: {order.client?.customerzipcode ?? "-"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Productos y materiales</h2>
              <p className="text-sm font-medium text-slate-500">Total productos: {totalProductsLabel}</p>
            </div>
            {order.products && order.products.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {order.products.map((item) => (
                      <tr key={item.ordersservicesproductsid}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">
                            {item.product?.productname ?? "Producto sin nombre"}
                          </p>
                          {item.product?.productcode && (
                            <p className="text-xs text-slate-500">Codigo: {item.product.productcode}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No se registraron productos en esta orden.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Tecnicos asignados</h2>
              <p className="text-xs uppercase tracking-wide text-slate-400">Roles</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(order.technicians ?? []).map((tech) => (
                <TechnicianCard key={tech.technicianid ?? `${tech.userid}`} tech={tech} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Medios de soporte</h2>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {formattedFiles.length} archivo(s)
              </span>
            </div>
            <div className="mt-4">
              <FilesGrid files={formattedFiles} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Registro y estado</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Creado</p>
                <p className="text-sm font-medium text-slate-800">{formatDateTime(created)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Ultima actualizacion</p>
                <p className="text-sm font-medium text-slate-800">{formatDateTime(updated)}</p>
              </div>
            </div>
            {order.state?.description && (
              <p className="mt-4 text-sm text-slate-600">{order.state.description}</p>
            )}
          </section>
        </div>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Historial de actividad</h2>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {isHistoryLoading
              ? "Cargando..."
              : `${historyEntries.length} evento${historyEntries.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {isHistoryLoading ? (
            <p className="text-sm text-slate-500">Cargando historial...</p>
          ) : historyEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No hay registros para esta orden.</p>
          ) : (
            historyEntries.map((entry) => (
              <div
                key={entry.ordersserviceshistoryid}
                className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  <span>{formatHistoryDate(entry.createdat)}</span>
                  <span>{entry.action}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{entry.actionlabel}</p>
                {entry.description && <p className="text-sm text-slate-600">{entry.description}</p>}
                {entry.actoruserid != null && (
                  <p className="text-xs text-slate-500">Actor ID: {entry.actoruserid}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const OrderServiceDetail: React.FC<OrderServiceDetailProps> = ({ orderId }) => {
  const { data, isLoading, isError, isFetching } = useOrderServiceDetail(orderId);
  const invalidId = !Number.isFinite(orderId) || orderId <= 0;

  if (invalidId) {
    return (
      <RequireAuth>
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-600">Identificador invalido</p>
            <p className="mt-2 text-sm text-red-800">No se puede cargar esta orden.</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-6">
          <p className="text-sm font-medium text-slate-500">Cargando orden de servicio...</p>
        </div>
      </RequireAuth>
    );
  }

  if (isError || !data) {
    return (
      <RequireAuth>
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-6">
          <p className="text-sm font-medium text-red-500">
            No se pudo obtener la informacion de la orden. Intenta recargar.
          </p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
          <OrderServiceDetailContent order={data} />

    </RequireAuth>
  );
};

export default OrderServiceDetail;
