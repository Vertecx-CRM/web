"use client";

import Image from "next/image";
import { useMemo } from "react";
import Modal from "@/features/dashboard/components/Modal";
import { useServiceRequest } from "@/features/dashboard/requests/hooks/useServiceRequests";
import {
  formatRequestAvailabilityLabel,
  parseRequestDescriptionWithAvailability,
  type RequestAvailabilityOption,
  type RequestPurchasedMaterial,
  type RequestSiteChecklist,
} from "@/features/dashboard/requests/utils/requestAvailability";
import {
  getRequestStageLabel,
  getTechnicalReviewStatusHelp,
  getTechnicalReviewStatusLabel,
  isInstallationServiceType,
} from "@/shared/utils/requestFlow";

type Tipo = "Mantenimiento" | "Instalacion";

type ViewRequestData = {
  tipos: Tipo[];
  servicio: string;
  descripcion: string;
  direccion: string;
  cliente: string;
  fecha: string;
  estado: string;
  codigo: string;
  programada: string | null;
  programadaEnd: string | null;
  requestMode?: "ASSESSMENT" | "DIRECT_INSTALLATION";
  technicalReviewStatus?:
    | "NOT_APPLICABLE"
    | "PENDING_REVIEW"
    | "ASSESSMENT_REQUIRED"
    | "READY_TO_QUOTE";
  alreadyHasMaterials?: boolean;
  linkedSaleId?: number | null;
  linkedSaleCode?: string | null;
  purchasedMaterials?: RequestPurchasedMaterial[];
  availabilityOptions?: RequestAvailabilityOption[];
  siteChecklist?: RequestSiteChecklist | null;
  tecnicos?: string[] | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  requestId?: number | null;
  data: ViewRequestData;
};

function estadoClass(v: string) {
  const s = (v || "").toLowerCase();
  if (s.includes("aprob")) return "text-green-600 bg-green-50 border-green-200";
  if (s.includes("anul") || s.includes("cancel")) return "text-red-600 bg-red-50 border-red-200";
  if (s.includes("pend")) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  if (s.includes("activo")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
}

function splitDateTime(value: string | null | undefined) {
  if (!value) return { date: "", time: "" };
  const trimmed = String(value).trim();
  if (!trimmed) return { date: "", time: "" };

  if (trimmed.includes("T")) {
    const [d, t] = trimmed.split("T");
    return { date: d, time: (t || "").slice(0, 5) };
  }

  if (trimmed.includes(" ")) {
    const [d, t] = trimmed.split(" ");
    return { date: d, time: (t || "").slice(0, 5) };
  }

  return { date: trimmed, time: "" };
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function textOrDash(value: unknown) {
  const text = String(value ?? "").trim();
  return text || "—";
}

function normalizeEvidenceImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

export default function ViewRequestModal({
  isOpen,
  onClose,
  title = "Detalle de la Solicitud",
  requestId = null,
  data,
}: Props) {
  const detailQuery = useServiceRequest(
    Number(requestId ?? 0),
    isOpen && Number(requestId ?? 0) > 0,
  );
  const detail = detailQuery.data;

  const tipoPrincipal = useMemo(
    () => (Array.isArray(data.tipos) && data.tipos.length ? data.tipos[0] : null),
    [data.tipos],
  );

  const parsedDescription = useMemo(
    () =>
      parseRequestDescriptionWithAvailability(
        detail?.descriptionPlain ?? detail?.description ?? data.descripcion ?? "",
      ),
    [data.descripcion, detail?.description, detail?.descriptionPlain],
  );

  const requestMode =
    detail?.requestMode ??
    parsedDescription.flowMetadata?.requestMode ??
    data.requestMode;
  const technicalReviewStatus =
    detail?.technicalReviewStatus ??
    parsedDescription.flowMetadata?.technicalReviewStatus ??
    data.technicalReviewStatus;
  const availabilityOptions =
    detail?.clientAvailabilityOptions ??
    parsedDescription.availabilityOptions ??
    data.availabilityOptions ??
    [];
  const siteChecklist =
    detail?.siteChecklist ??
    parsedDescription.flowMetadata?.siteChecklist ??
    data.siteChecklist ??
    null;
  const purchasedMaterials =
    detail?.purchasedMaterials ??
    parsedDescription.flowMetadata?.purchasedMaterials ??
    data.purchasedMaterials ??
    [];
  const alreadyHasMaterials =
    detail?.alreadyHasMaterials ??
    parsedDescription.flowMetadata?.alreadyHasMaterials ??
    data.alreadyHasMaterials;
  const linkedSaleId =
    detail?.linkedSaleId ??
    parsedDescription.flowMetadata?.linkedSaleId ??
    data.linkedSaleId;
  const linkedSaleCode =
    detail?.linkedSaleCode ??
    parsedDescription.flowMetadata?.linkedSaleCode ??
    data.linkedSaleCode;
  const evidenceImages = useMemo(
    () => normalizeEvidenceImages(siteChecklist?.evidenceImages),
    [siteChecklist?.evidenceImages],
  );

  const serviceTypeValue =
    detail?.serviceType ??
    detail?.servicetype ??
    tipoPrincipal ??
    "";
  const stageLabel = useMemo(
    () => getRequestStageLabel(serviceTypeValue, requestMode),
    [requestMode, serviceTypeValue],
  );
  const isInstallationFlow = isInstallationServiceType(serviceTypeValue);
  const hasClientChecklist = Boolean(
    siteChecklist?.installationArea ||
      siteChecklist?.installationHeight ||
      siteChecklist?.estimatedCableMeters ||
      siteChecklist?.materialsSummary ||
      siteChecklist?.additionalContext ||
      siteChecklist?.evidenceNotes ||
      evidenceImages.length,
  );
  const isDirectInstallation =
    isInstallationFlow &&
    (requestMode === "DIRECT_INSTALLATION" || hasClientChecklist);

  const { date: programadaDate, time: programadaTime } = useMemo(
    () => splitDateTime(detail?.scheduledAt ?? data.programada),
    [data.programada, detail?.scheduledAt],
  );
  const { date: programadaEndDate, time: programadaEndTime } = useMemo(
    () => splitDateTime(detail?.scheduledEndAt ?? data.programadaEnd),
    [data.programadaEnd, detail?.scheduledEndAt],
  );

  const codigoMostrar = (data.codigo || "").trim() || "—";
  const createdLabel =
    detail?.createdAt != null ? formatDateTime(detail.createdAt) : data.fecha || "—";
  const stateLabel = String(detail?.state?.name ?? data.estado ?? "").trim() || "—";
  const serviceLabel = String(detail?.service?.name ?? data.servicio ?? "").trim() || "—";
  const addressLabel = String(detail?.direccion ?? data.direccion ?? "").trim() || "—";
  const descriptionLabel = parsedDescription.descriptionPlain || data.descripcion || "—";

  const clientLabel = useMemo(() => {
    const customer = detail?.customer;
    const user = customer?.users;
    const fullName = [user?.name, user?.lastname].filter(Boolean).join(" ").trim();
    const city = String(customer?.customercity ?? "").trim();
    const fallback = String(data.cliente ?? "").trim();
    return [fullName || fallback, city].filter(Boolean).join(" · ") || "—";
  }, [data.cliente, detail?.customer]);

  const clientEmail = String(detail?.customer?.users?.email ?? "").trim();
  const clientPhone = String(detail?.customer?.users?.phone ?? "").trim();
  const clientDocument = String(
    detail?.customer?.users?.documentnumber ?? "",
  ).trim();

  const tecnicos = useMemo(() => {
    const fromDetail = Array.isArray(detail?.techniciansMap)
      ? detail.techniciansMap
          .map((entry) => {
            const tech = entry?.technician;
            const name = String(tech?.users?.name ?? "").trim();
            const last = String(tech?.users?.lastname ?? "").trim();
            return [name, last].filter(Boolean).join(" ").trim();
          })
          .filter(Boolean)
      : [];
    const fallback = Array.isArray(data.tecnicos) ? data.tecnicos : [];
    const list = fromDetail.length ? fromDetail : fallback;
    return list.map((item) => String(item ?? "").trim()).filter(Boolean);
  }, [data.tecnicos, detail?.techniciansMap]);

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full max-w-6xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Codigo: <span className="font-bold">{codigoMostrar}</span>
            </h3>
            <p className="mt-1 text-xs text-gray-500">{serviceLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium",
                estadoClass(stateLabel),
              ].join(" ")}
            >
              Estado: {stateLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-800 px-3 py-1 text-[11px] font-medium text-white">
              {serviceTypeValue ? `Tipo: ${stageLabel}` : "Sin tipo asignado"}
            </span>
            {technicalReviewStatus ? (
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-800">
                Revision: {getTechnicalReviewStatusLabel(technicalReviewStatus)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Cliente</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <p className="font-medium">{clientLabel}</p>
              {(clientEmail || clientPhone || clientDocument) && (
                <p className="mt-1 text-xs text-gray-500">
                  {[clientEmail, clientPhone, clientDocument].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Servicio</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <p className="font-medium">{serviceLabel}</p>
              <p className="mt-1 text-xs text-gray-500">{stageLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Fecha de creacion</label>
            <div className="flex min-h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>{createdLabel}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">
              Fecha y hora confirmada por Vertecx
            </label>
            <div className="flex min-h-10 items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>{programadaDate || "—"}</span>
              <span className="text-xs text-gray-500">
                {programadaTime ? `Hora: ${programadaTime}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Fecha y hora final</label>
            <div className="flex min-h-10 items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>{programadaEndDate || "—"}</span>
              <span className="text-xs text-gray-500">
                {programadaEndTime ? `Hora: ${programadaEndTime}` : ""}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Direccion</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>{addressLabel}</span>
            </div>
          </div>
        </div>

        {isInstallationFlow && (
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
              Flujo de instalacion
            </p>
            <p className="mt-1 text-sm text-slate-800">{stageLabel}</p>
            {technicalReviewStatus ? (
              <p className="mt-1 text-xs text-slate-600">
                {getTechnicalReviewStatusHelp(technicalReviewStatus) ||
                  `Estado de revision: ${getTechnicalReviewStatusLabel(technicalReviewStatus)}.`}
              </p>
            ) : null}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">Tecnicos</label>
          {tecnicos.length ? (
            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              {tecnicos.map((tech, index) => (
                <span
                  key={`${tech}-${index}`}
                  className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-900"
                >
                  {tech}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex min-h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>—</span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">Descripcion</label>
          <div className="min-h-[80px] whitespace-pre-line rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
            {descriptionLabel}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">
            Horarios propuestos por el cliente
          </label>
          {availabilityOptions.length ? (
            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              {availabilityOptions.map((option) => (
                <span
                  key={`${option.date}-${option.startTime}-${option.endTime}`}
                  className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-900"
                >
                  {formatRequestAvailabilityLabel(option)}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex min-h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              <span>—</span>
            </div>
          )}
        </div>

        {isDirectInstallation && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/60 to-sky-100/40 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Checklist del cliente
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Informacion del sitio y adjuntos enviados para validar la instalacion.
                  </p>
                </div>
                <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold text-sky-700">
                  {technicalReviewStatus
                    ? getTechnicalReviewStatusLabel(technicalReviewStatus)
                    : "Sin revision"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ["Zona", textOrDash(siteChecklist?.installationArea)],
                  ["Altura", textOrDash(siteChecklist?.installationHeight)],
                  ["Cable estimado", textOrDash(siteChecklist?.estimatedCableMeters)],
                  ["Escalera", textOrDash(siteChecklist?.needsLadder)],
                  ["Energia", textOrDash(siteChecklist?.hasPowerPoint)],
                  ["Internet/red", textOrDash(siteChecklist?.hasInternetPoint)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Contexto adicional
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {textOrDash(siteChecklist?.additionalContext)}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Notas del cliente
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {textOrDash(siteChecklist?.evidenceNotes)}
                  </p>
                </div>
              </div>

              {evidenceImages.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Evidencias adjuntas
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {evidenceImages.length} imagen(es)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {evidenceImages.map((url, index) => (
                      <a
                        key={`${url}-${index}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`Evidencia ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, 160px"
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="border-t border-sky-100 px-3 py-2 text-[11px] font-medium text-sky-700">
                          Abrir imagen {index + 1}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Materiales y venta
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Resumen comercial y materiales reportados en la solicitud.
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold",
                    alreadyHasMaterials
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {alreadyHasMaterials ? "Con materiales" : "Sin confirmar"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Codigo de venta
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{textOrDash(linkedSaleCode)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    ID venta
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{textOrDash(linkedSaleId)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Resumen manual
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {textOrDash(siteChecklist?.materialsSummary)}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {purchasedMaterials.length ? (
                  purchasedMaterials.map((item, index) => (
                    <div
                      key={`${item.productId ?? item.name}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.productId ? `Producto #${item.productId}` : "Material manual"}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
                          x{item.quantity}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Cantidad: {item.quantity}
                        {item.unitPrice != null
                          ? ` - $${item.unitPrice.toLocaleString("es-CO")}`
                          : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No hay materiales registrados en la solicitud.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
