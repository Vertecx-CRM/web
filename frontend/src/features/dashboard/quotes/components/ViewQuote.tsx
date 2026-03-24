"use client";

import { ReactNode } from "react";
import {
  IQuote,
  QuoteDetail,
  ServiceRequest,
} from "../types/Quote.type";
import {
  getRequestStageLabel,
  getTechnicalReviewStatusLabel,
} from "@/shared/utils/requestFlow";

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

const formatNumber = (value: number | string | undefined | null) => {
  const numeric = Number(value ?? 0);
  return numeric.toLocaleString("es-CO", {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 1,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString("es-CO");
};

const parseLaborBreakdown = (detail: QuoteDetail) => {
  const raw = String(detail.description ?? "");
  const match = raw.match(
    /\(([\d.,]+)\s+tecnico\(s\)\s+x\s+([\d.,]+)\s+hora\(s\)\)$/i,
  );

  if (!match) return null;

  const technicianCount = Number(match[1].replace(",", "."));
  const laborHours = Number(match[2].replace(",", "."));
  if (!Number.isFinite(technicianCount) || !Number.isFinite(laborHours)) {
    return null;
  }

  return {
    technicianCount,
    laborHours,
    billedHours: Number(detail.quantity ?? 0),
    baseDescription: raw.replace(match[0], "").trim(),
  };
};

const getRequestSummary = (request?: ServiceRequest | null) => {
  if (!request) return "-";
  return getRequestStageLabel(
    request.serviceType ?? "",
    request.requestMode ?? undefined,
  );
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
  const clientEmail = quote.customer?.users?.email ?? "-";
  const clientPhone = quote.customer?.users?.phone ?? "-";

  const technician = quote.technician?.users
    ? `${quote.technician.users.name ?? ""} ${quote.technician.users.lastname ?? ""}`.trim()
    : "-";
  const technicianEmail = quote.technician?.users?.email ?? "-";
  const technicianPhone = quote.technician?.users?.phone ?? "-";

  const request = quote.serviceRequest;
  const orderId =
    quote.ordersservices?.ordersservicesid ?? quote.ordersservicesid ?? null;
  const orderState = quote.ordersservices?.state?.name ?? "-";
  const observation = quote.observationPlain ?? quote.observation ?? "";
  const requestDescription =
    request?.descriptionPlain ?? request?.description ?? "-";
  const requestSummary = getRequestSummary(request);
  const technicalReview = request?.technicalReviewStatus
    ? getTechnicalReviewStatusLabel(request.technicalReviewStatus)
    : "-";

  const showActions =
    (canCreateOrder && onCreateOrder) || (canComplete && onComplete);

  return (
    <div className="flex max-h-[85vh] flex-col gap-6 overflow-y-auto bg-slate-50 p-4 text-sm text-slate-800">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
            Cotizacion
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">
                COT-{String(quote.quotesid).padStart(6, "0")}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Solicitud base #{quote.serviceRequestId ?? "-"} |{" "}
                {quote.servicetype ?? "Sin tipo"}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Total cotizado
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {formatCOP(quote.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Estado cotizacion" value={quote.state?.name ?? "-"} />
          <Field label="Orden vinculada" value={orderId ? `#${orderId}` : "-"} />
          <Field label="Estado orden" value={orderState} />
          <Field
            label="Respuesta del cliente"
            value={quote.clientAccepted ? "Aceptada" : "Pendiente"}
          />
          <Field
            label="Fecha aceptacion"
            value={formatDateTime(quote.clientAcceptedAt)}
          />
          <Field label="Creada" value={formatDateTime(quote.createdat)} />
          <Field
            label="Ultima actualizacion"
            value={formatDateTime(quote.updatedat)}
          />
          <Field
            label="Resumen solicitud"
            value={requestSummary}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card title="Detalle de la Cotizacion">
            {quote.details?.length ? (
              <div className="space-y-4">
                {quote.details.map((detail, index) => {
                  const labor = parseLaborBreakdown(detail);

                  return (
                    <div
                      key={detail.quotedetailid ?? index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {labor?.baseDescription || detail.description}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {detail.productid
                              ? `Producto #${detail.productid}`
                              : labor
                                ? "Linea de mano de obra"
                                : "Linea manual"}
                          </p>
                        </div>
                        <StatusPill value={detail.availability ?? "DISPONIBLE"} />
                      </div>

                      {labor && (
                        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 md:grid-cols-3">
                          <MiniStat
                            label="Tecnicos estimados"
                            value={formatNumber(labor.technicianCount)}
                          />
                          <MiniStat
                            label="Horas por tecnico"
                            value={formatNumber(labor.laborHours)}
                          />
                          <MiniStat
                            label="Horas-tecnico facturadas"
                            value={formatNumber(labor.billedHours)}
                          />
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <MiniStat
                          label={labor ? "Tarifa por hora" : "Precio unitario"}
                          value={formatCOP(detail.unitprice)}
                        />
                        <MiniStat
                          label={labor ? "Cantidad facturable" : "Cantidad"}
                          value={formatNumber(detail.quantity)}
                        />
                        <MiniStat label="Subtotal" value={formatCOP(detail.subtotal)} />
                        <MiniStat
                          label="Tipo de linea"
                          value={
                            labor
                              ? "Mano de obra"
                              : detail.productid
                                ? "Catalogo"
                                : "Manual"
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="No hay detalles registrados en esta cotizacion." />
            )}
          </Card>

          <Card title="Solicitud Asociada">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Solicitud de servicio"
                value={request?.serviceRequestId ?? quote.serviceRequestId ?? "-"}
              />
              <Field label="Tipo de flujo" value={requestSummary} />
              <Field label="Tipo de servicio" value={request?.serviceType ?? quote.servicetype ?? "-"} />
              <Field label="Revision tecnica" value={technicalReview} />
              <Field label="Fecha programada" value={formatDateTime(request?.scheduledAt)} />
              <Field
                label="Fecha fin programada"
                value={formatDateTime(request?.scheduledEndAt)}
              />
              <Field label="Direccion" value={request?.direccion ?? "-"} />
              <Field
                label="Materiales del cliente"
                value={
                  request?.alreadyHasMaterials == null
                    ? "-"
                    : request.alreadyHasMaterials
                      ? "Si"
                      : "No"
                }
              />
              <Field
                label="Venta vinculada"
                value={
                  request?.linkedSaleCode
                    ? `${request.linkedSaleCode}`
                    : request?.linkedSaleId
                      ? `#${request.linkedSaleId}`
                      : "-"
                }
              />
              <Field
                label="Creacion solicitud"
                value={formatDateTime(request?.createdAt)}
              />
            </div>

            <TextBlock
              label="Descripcion de la solicitud"
              value={requestDescription}
            />

            {!!request?.clientAvailabilityOptions?.length && (
              <TagGroup
                label="Disponibilidad del cliente"
                values={request.clientAvailabilityOptions}
              />
            )}

            {!!request?.purchasedMaterials?.length && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Materiales reportados por el cliente
                </p>
                <div className="space-y-2">
                  {request.purchasedMaterials.map((material, index) => (
                    <div
                      key={`${material.name}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="font-medium text-slate-800">
                        {material.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Cantidad: {formatNumber(material.quantity)}
                        {material.unitPrice != null
                          ? ` | ${formatCOP(material.unitPrice)}`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {request?.siteChecklist && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MiniStat
                  label="Area de instalacion"
                  value={request.siteChecklist.installationArea ?? "-"}
                />
                <MiniStat
                  label="Altura de instalacion"
                  value={request.siteChecklist.installationHeight ?? "-"}
                />
                <MiniStat
                  label="Metros estimados de cable"
                  value={request.siteChecklist.estimatedCableMeters ?? "-"}
                />
                <MiniStat
                  label="Resumen materiales"
                  value={request.siteChecklist.materialsSummary ?? "-"}
                />
                <MiniStat
                  label="Contexto adicional"
                  value={request.siteChecklist.additionalContext ?? "-"}
                />
                <MiniStat
                  label="Notas de evidencia"
                  value={request.siteChecklist.evidenceNotes ?? "-"}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Participantes">
            <div className="space-y-4">
              <ParticipantCard
                role="Cliente"
                name={client || "-"}
                email={clientEmail}
                phone={clientPhone}
              />
              <ParticipantCard
                role="Tecnico asignado"
                name={technician || "-"}
                email={technicianEmail}
                phone={technicianPhone}
              />
            </div>
          </Card>

          <Card title="Resumen Financiero">
            <div className="space-y-3">
              <Row label="Subtotal" value={formatCOP(quote.subtotal)} />
              <Row label="IVA (19%)" value={formatCOP(quote.tax)} />
              <Row label="Total" value={formatCOP(quote.total)} bold />
            </div>
          </Card>

          <Card title="Observaciones">
            <TextBlock
              label="Observacion de la cotizacion"
              value={observation || "Sin observaciones registradas"}
              muted={!observation}
            />
          </Card>
        </div>
      </section>

      {showActions && (
        <div className="mt-1 flex flex-wrap justify-end gap-2">
          {canCreateOrder && onCreateOrder && (
            <button
              type="button"
              onClick={onCreateOrder}
              className="rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Crear orden de servicio
            </button>
          )}
          {canComplete && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              disabled={isCompleting}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCompleting ? "Generando venta..." : "Generar venta"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800">
        {value ?? "-"}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function TextBlock({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div
        className={`whitespace-pre-wrap rounded-xl border px-4 py-3 text-sm ${
          muted
            ? "border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TagGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function ParticipantCard({
  role,
  name,
  email,
  phone,
}: {
  role: string;
  name: string;
  email: string;
  phone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {role}
      </p>
      <p className="mt-2 text-base font-bold text-slate-900">{name}</p>
      <p className="mt-1 text-sm text-slate-600">{email}</p>
      <p className="text-sm text-slate-600">{phone}</p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const palette =
    value === "DISPONIBLE"
      ? "bg-emerald-100 text-emerald-700"
      : value === "SOLICITAR"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${palette}`}
    >
      {value}
    </span>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-bold text-slate-900" : "text-slate-600"}>
        {label}
      </span>
      <span className={bold ? "text-lg font-black text-slate-900" : "font-semibold text-slate-800"}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-500">
      {text}
    </div>
  );
}
