"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";
import { useServiceRequest } from "../hooks/useServiceRequests";
import type { ServiceRequestDTO } from "@/features/dashboard/requests/services/servicerequests.service";
import { ArrowLeft } from "lucide-react";
import {
  formatRequestAvailabilityLabel,
  parseRequestDescriptionWithAvailability,
} from "@/features/dashboard/requests/utils/requestAvailability";
import {
  getTechnicalReviewStatusHelp,
  getTechnicalReviewStatusLabel,
  getInstallationAssessmentExplainer,
  getDirectInstallationExplainer,
  getRequestStageLabel,
  isInstallationServiceType,
} from "@/shared/utils/requestFlow";

interface Props {
  requestId: number;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const RequestLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
  </div>
);

const buildTechnicianLabel = (
  tech:
    | {
        technicianid?: number;
        technicianId?: number;
        users?: { name?: string | null; lastname?: string | null };
        title?: string | null;
      }
    | null
    | undefined
) => {
  if (!tech) return null;
  const parts = [tech.users?.name ?? "", tech.users?.lastname ?? ""].filter(Boolean);
  const name = parts.length ? parts.join(" ").trim() : undefined;
  const id = tech.technicianid ?? tech.technicianId;
  if (name) return `${name}${id ? ` (${id})` : ""}`;
  if (id) return `Tecnico ${id}`;
  if (tech.title) return tech.title;
  return "Tecnico";
};

const ServiceRequestDetailContent = ({ data }: { data: ServiceRequestDTO }) => {
  const router = useRouter();

  const clientLabel = useMemo(() => {
    if (!data.customer) return "Cliente no asignado";
    const parts = [
      data.customer.users?.name ?? "",
      data.customer.users?.lastname ?? "",
      data.customer.customercity ?? "",
    ].filter(Boolean);
    return parts.length
      ? parts.join(" · ")
      : `Cliente ${data.customer.customerid ?? data.clientId ?? ""}`;
  }, [data]);

  const technicians = useMemo(() => {
    const sources = [
      data.technicians,
      data.serviceRequestTechnicians,
      data.assignedTechnicians,
      data.requestTechnicians,
      data.techniciansMap?.map((entry) => entry?.technician),
    ];
    const list = sources.flatMap((set) => (Array.isArray(set) ? set : []));
    const uniques: Record<string, typeof list[number]> = {};
    list.forEach((tech) => {
      const key = `${tech?.technicianid ?? tech?.technicianId ?? "none"}-${
        tech?.users?.name ?? ""
      }-${tech?.users?.lastname ?? ""}`;
      if (key && !uniques[key]) uniques[key] = tech;
    });
    return Object.values(uniques);
  }, [data]);

  const scheduled = formatDateTime(data.scheduledAt);
  const scheduledEnd = formatDateTime(data.scheduledEndAt);
  const created = formatDateTime(data.createdAt);
  const parsedDescription = useMemo(
    () =>
      parseRequestDescriptionWithAvailability(
        data.descriptionPlain ?? data.description ?? ""
      ),
    [data.descriptionPlain, data.description]
  );
  const flowMetadata = parsedDescription.flowMetadata;
  const availabilityOptions =
    data.clientAvailabilityOptions ??
    parsedDescription.availabilityOptions ??
    [];

  const customerUser = data.customer?.users;
  const customerFullName = [customerUser?.name, customerUser?.lastname]
    .filter(Boolean)
    .join(" ");
  const customerDocument = customerUser?.documentnumber;
  const customerEmail = customerUser?.email;
  const customerPhone = customerUser?.phone;
  const customerCity = data.customer?.customercity ?? "-";
  const customerZip = data.customer?.customerzipcode ?? "-";

  const stateLabel = data.state?.name ?? "-";
  const stateDescription = data.state?.description ?? "Sin descripcion del estado.";
  const requestStageLabel = getRequestStageLabel(
    data.serviceType ?? data.servicetype ?? "",
    data.requestMode ?? flowMetadata?.requestMode,
  );
  const isInstallationAssessment = isInstallationServiceType(
    data.serviceType ?? data.servicetype ?? "",
  );
  const isDirectInstallation =
    isInstallationAssessment &&
    (data.requestMode ?? flowMetadata?.requestMode) === "DIRECT_INSTALLATION";

  const serviceDescription = data.service?.description;
  const serviceImage = data.service?.image;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {requestStageLabel}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              SRV-{String(data.serviceRequestId).padStart(6, "0")}
            </h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              {data.service?.name ?? "Servicio sin nombre"}
            </p>
            <p>{requestStageLabel}</p>
            <p className="text-xs text-slate-500">Estado actual: {stateLabel}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{clientLabel}</p>
            <p className="text-xs text-slate-500">
              Ciudad: {customerCity} · Codigo postal: {customerZip}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Programada por Vertecx</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{scheduled}</p>
            <p className="text-xs text-slate-500">Fin estimado: {scheduledEnd}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Creada</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{created}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Servicio</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {data.service?.name ?? "-"}
            </p>
            <p className="text-xs text-slate-500">Tipo: {requestStageLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{stateLabel}</p>
            <p className="text-xs text-slate-500">{stateDescription}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Descripcion y detalles
        </h2>
        <p className="mt-4 text-sm text-slate-700">
          {parsedDescription.descriptionPlain || "Sin descripcion adicional."}
        </p>
        {isInstallationAssessment && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Flujo previo a instalacion
            </p>
            <p className="mt-2 text-sm text-amber-900">
              {isDirectInstallation
                ? getDirectInstallationExplainer()
                : getInstallationAssessmentExplainer()}
            </p>
          </div>
        )}
        {isDirectInstallation && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                Revision tecnica
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {getTechnicalReviewStatusLabel(
                  data.technicalReviewStatus ?? flowMetadata?.technicalReviewStatus
                )}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {getTechnicalReviewStatusHelp(
                  data.technicalReviewStatus ?? flowMetadata?.technicalReviewStatus
                ) || "Sin observaciones adicionales."}
              </p>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                Venta vinculada
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {data.linkedSaleCode ?? flowMetadata?.linkedSaleCode ?? "Sin codigo de venta"}
              </p>
              <p className="text-xs text-slate-500">
                ID: {data.linkedSaleId ?? flowMetadata?.linkedSaleId ?? "-"}
              </p>
            </div>
          </div>
        )}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Horarios propuestos por el cliente
          </p>
          {availabilityOptions.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {availabilityOptions.map((option) => (
                <span
                  key={`${option.date}-${option.startTime}-${option.endTime}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800"
                >
                  {formatRequestAvailabilityLabel(option)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              El cliente no dejo horarios propuestos.
            </p>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Direccion</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {data.direccion ?? "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{stateLabel}</p>
            <p className="text-xs text-slate-500">{stateDescription}</p>
          </div>
        </div>
          {isDirectInstallation && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/60 to-sky-100/40 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Checklist tecnico
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Resumen visual del sitio y condiciones reportadas por el cliente.
                    </p>
                  </div>
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold text-sky-700">
                    Sitio
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    [
                      "Zona",
                      data.siteChecklist?.installationArea ??
                        flowMetadata?.siteChecklist?.installationArea ??
                        "-",
                    ],
                    [
                      "Altura",
                      data.siteChecklist?.installationHeight ??
                        flowMetadata?.siteChecklist?.installationHeight ??
                        "-",
                    ],
                    [
                      "Cable",
                      data.siteChecklist?.estimatedCableMeters ??
                        flowMetadata?.siteChecklist?.estimatedCableMeters ??
                        "-",
                    ],
                    [
                      "Escalera",
                      data.siteChecklist?.needsLadder ??
                        flowMetadata?.siteChecklist?.needsLadder ??
                        "-",
                    ],
                    [
                      "Energia",
                      data.siteChecklist?.hasPowerPoint ??
                        flowMetadata?.siteChecklist?.hasPowerPoint ??
                        "-",
                    ],
                    [
                      "Internet/red",
                      data.siteChecklist?.hasInternetPoint ??
                        flowMetadata?.siteChecklist?.hasInternetPoint ??
                        "-",
                    ],
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

                {(
                  data.siteChecklist?.evidenceImages ??
                  flowMetadata?.siteChecklist?.evidenceImages ??
                  []
                ).length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Evidencias adjuntas
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {(
                          data.siteChecklist?.evidenceImages ??
                          flowMetadata?.siteChecklist?.evidenceImages ??
                          []
                        ).length}{" "}
                        imagen(es)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {(
                        data.siteChecklist?.evidenceImages ??
                        flowMetadata?.siteChecklist?.evidenceImages ??
                        []
                      ).map((url, index) => (
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
                      Materiales comprados / reportados
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Insumos declarados por el cliente o vinculados a la compra.
                    </p>
                  </div>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      (data.alreadyHasMaterials ?? flowMetadata?.alreadyHasMaterials)
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    {(data.alreadyHasMaterials ?? flowMetadata?.alreadyHasMaterials)
                      ? "Con materiales"
                      : "Sin confirmar"}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Resumen manual
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {data.siteChecklist?.materialsSummary ??
                      flowMetadata?.siteChecklist?.materialsSummary ??
                      "Sin resumen manual de materiales."}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  {(
                    data.purchasedMaterials ??
                    flowMetadata?.purchasedMaterials ??
                    []
                  ).length ? (
                    (data.purchasedMaterials ??
                      flowMetadata?.purchasedMaterials ??
                      []
                    ).map((item, index) => (
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
                      No hay materiales vinculados en la solicitud.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tecnicos asignados</h2>
        {technicians.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {technicians.map((tech, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {buildTechnicianLabel(tech)}
                </p>
                <p className="text-xs text-slate-500">
                  Titulo: {tech?.title ?? "-"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No hay tecnicos asignados.
          </p>
        )}
      </section>
    </div>
  );
};

const ServiceRequestDetail: React.FC<Props> = ({ requestId }) => {
  const { data, isLoading, isError } = useServiceRequest(requestId, requestId > 0);
  const invalidId = !Number.isFinite(requestId) || requestId <= 0;

  if (invalidId) {
    return (
      <RequireAuth>
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-600">Identificador invalido</p>
            <p className="mt-2 text-sm text-red-800">No se puede cargar la solicitud.</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (isLoading) {
    return (
      <RequireAuth>
        <RequestLoader />
      </RequireAuth>
    );
  }

  if (isError || !data) {
    return (
      <RequireAuth>
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-6">
          <p className="text-sm font-medium text-red-500">
            No se pudo obtener la informacion de la solicitud.
          </p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <ServiceRequestDetailContent data={data} />
    </RequireAuth>
  );
};

export default ServiceRequestDetail;
