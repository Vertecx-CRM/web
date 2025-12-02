"use client";

import React, { useMemo } from "react";
import RequireAuth from "@/features/auth/requireauth";
import { useServiceRequest } from "../hooks/useServiceRequests";
import type { ServiceRequestDTO } from "@/features/dashboard/requests/services/servicerequests.service";

interface Props {
  requestId: number;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
};

const buildTechnicianLabel = (tech: { technicianid?: number; technicianId?: number; users?: { name?: string | null; lastname?: string | null }; title?: string | null } | null | undefined) => {
  if (!tech) return null;
  const parts = [
    tech.users?.name ?? "",
    tech.users?.lastname ?? "",
  ].filter(Boolean);
  const name = parts.length ? parts.join(" ").trim() : undefined;
  const id = tech.technicianid ?? tech.technicianId;
  if (name) return `${name}${id ? ` (${id})` : ""}`;
  if (id) return `Tecnico ${id}`;
  if (tech.title) return tech.title;
  return "Tecnico";
};

const ServiceRequestDetailContent = ({ data }: { data: ServiceRequestDTO }) => {
  const clientLabel = useMemo(() => {
    if (!data.customer) return "Cliente no asignado";
    const parts = [
      data.customer.users?.name ?? "",
      data.customer.users?.lastname ?? "",
      data.customer.customercity ?? "",
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : `Cliente ${data.customer.customerid ?? data.clientId ?? ""}`;
  }, [data]);

  const technicians = useMemo(() => {
    const sources = [
      data.technicians,
      data.serviceRequestTechnicians,
      data.assignedTechnicians,
      data.requestTechnicians,
    ];
    const list = sources.flatMap((set) => (Array.isArray(set) ? set : []));
    const uniques: Record<string, typeof list[number]> = {};
    list.forEach((tech) => {
      const key = `${tech?.technicianid ?? tech?.technicianId ?? "none"}-${tech?.users?.name ?? ""}-${tech?.users?.lastname ?? ""}`;
      if (key && !uniques[key]) {
        uniques[key] = tech;
      }
    });
    return Object.values(uniques);
  }, [data]);

  const scheduled = formatDateTime(data.scheduledAt);
  const created = formatDateTime(data.createdAt);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Solicitud de servicio</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              SRV-{String(data.serviceRequestId).padStart(6, "0")}
            </h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{data.service?.name ?? "Servicio sin nombre"}</p>
            <p>{data.serviceType ?? "-"}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{clientLabel}</p>
            <p className="text-xs text-slate-500">
              Ciudad: {data.customer?.customercity ?? "-"} · Codigo postal: {data.customer?.customerzipcode ?? "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Programada</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{scheduled}</p>
            <p className="text-xs text-slate-500">Estado actual: {data.state?.name ?? "-"}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Creada</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{created}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cliente ID</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{data.clientId ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Servicio ID</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{data.serviceId ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Descripcion y detalles</h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">{data.state?.description ?? "-"}</p>
        </div>
        <p className="mt-4 text-sm text-slate-700">{data.description || "Sin descripcion adicional."}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Direccion</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{data.direccion ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{data.state?.name ?? "-"}</p>
            <p className="text-xs text-slate-500">ID: {data.state?.stateid ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Tecnicos asignados</h2>
          <span className="text-xs uppercase tracking-wide text-slate-400">{technicians.length} registrado(s)</span>
        </div>
        {technicians.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {technicians.map((tech, index) => (
              <div key={index} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{buildTechnicianLabel(tech)}</p>
                <p className="text-xs text-slate-500">Titulo: {tech?.title ?? "-"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No hay tecnicos asignados.</p>
        )}
      </section>
    </div>
  );
};

const ServiceRequestDetail: React.FC<Props> = ({ requestId }) => {
  const { data, isLoading, isError, isFetching } = useServiceRequest(requestId, requestId > 0);
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
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-6">
          <p className="text-sm font-medium text-slate-500">Cargando solicitud...</p>
        </div>
      </RequireAuth>
    );
  }

  if (isError || !data) {
    return (
      <RequireAuth>
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-6">
          <p className="text-sm font-medium text-red-500">
            No se pudo obtener la informacion de la solicitud. Intenta recargar.
          </p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 py-6">
        <div
          className="mx-auto w-full max-w-6xl space-y-4 px-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 3rem)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Detalle de solicitud</p>
              <h1 className="text-base font-semibold text-slate-600">
                SRV-{String(requestId).padStart(6, "0")}
              </h1>
            </div>
            {isFetching && <p className="text-xs text-slate-500">Actualizando informacion...</p>}
          </div>
          <ServiceRequestDetailContent data={data} />
        </div>
      </div>
    </RequireAuth>
  );
};

export default ServiceRequestDetail;
