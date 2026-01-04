"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDays } from "lucide-react";

import AppointmentDetailModal from "./components/AppointmentDetailCard";
import EditRequestModal, {
  type EditRequestPayload,
} from "@/features/dashboard/requests/components/EditRequestModal";
import { useLookups } from "@/features/dashboard/requests/hooks/useLookups";
import {
  updateServiceRequest,
  type ServiceRequestDTO,
} from "@/features/dashboard/requests/services/servicerequests.service";
import { useUpdateServiceRequest } from "@/features/dashboard/requests/hooks/useServiceRequests";
import { buildScheduledAt, splitDateTime } from "@/features/dashboard/requests/utils/schedule";
import { showError } from "@/shared/utils/notifications";
import Swal from "sweetalert2";
import { updateOrderService } from "@/features/dashboard/OrdersServices/api/ordersServices.api";
import { useAuth } from "@/features/auth/authcontext";

import type { AppointmentEvent } from "./types/typeAppointment";
import {
  buildAppointmentEvents,
  getStatePalette,
  normalizeStateKey,
} from "./types/typeAppointment";

import {
  CALENDAR_MESSAGES,
  LEGEND_ITEMS,
  SERVICE_TYPE_FILTERS,
  STATE_LEGEND_ITEMS,
  calendarMaxTime,
  calendarMinTime,
  upcomingFormatter,
} from "./types/calendar.constants";

import { CalendarToolbar } from "./components/CalendarToolbar";
import { StatCard } from "./components/StatCard";

import { useAppointmentsQuery } from "./hooks/useAppointmentsQuery";
import { useResponsiveCalendarViews } from "./hooks/useResponsiveCalendarViews";
import { useRoleScope } from "./hooks/useRoleScope";

import {
  getEventCustomerIds,
  getEventServiceTypeKey,
  getEventTechnicianUserIds,
  getEventTechnicians,
  getOrderServiceRequestId,
  type ServiceTypeFilterKey,
} from "./helpers/appointment.helpers";

import { parseMaybeNumber, toPositiveNumber } from "./helpers/string.helpers";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const tipoToBackend = (tipo?: string | null) => {
  const value = tipo?.toLowerCase() ?? "";
  if (value.includes("instal")) return "INSTALACION";
  return "MANTENIMIENTO";
};

export default function IndexAppointment() {
  const { profile, user } = useAuth(); 
  const { tokenRole, clientProfileId, technicianProfileUserId } = useRoleScope();
  const { data, isLoading, isError, refetch } = useAppointmentsQuery();
  const { serviceOptions, customerOptions } = useLookups();
  const updateRequestMutation = useUpdateServiceRequest();
  const { calendarView, setCalendarView, availableViews } = useResponsiveCalendarViews();

  const events = useMemo(() => buildAppointmentEvents(data ?? {}), [data]);

  const [editingRequest, setEditingRequest] = useState<ServiceRequestDTO | null>(null);

  const [sourceFilter, setSourceFilter] = useState<"all" | "order" | "request">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilterKey | "all">("all");
  const [technicianFilter, setTechnicianFilter] = useState<"all" | string>("all");
  const [clientFilter, setClientFilter] = useState<"all" | string>("all");
  const [showLegend, setShowLegend] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);
  const [modalEvent, setModalEvent] = useState<AppointmentEvent | null>(null);
  const [finalizingEventId, setFinalizingEventId] = useState<number | null>(null);

  const stateOptions = useMemo(() => {
    const entries: Map<string, string> = new Map();
    events.forEach((event) => {
      const label = (event.stateLabel ?? "").trim();
      if (!label) return;
      const key = normalizeStateKey(label);
      if (!key) return;
      if (!entries.has(key)) entries.set(key, label);
    });

    return Array.from(entries.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  const technicianOptions = useMemo(() => {
    const entries = new Map<number, string>();
    events.forEach((event) => {
      getEventTechnicians(event).forEach((tech) => {
        const techId = Number(tech?.technicianid ?? tech?.technicianId);
        if (!Number.isFinite(techId) || techId <= 0) return;
        if (entries.has(techId)) return;

        const parts = [tech.users?.name, tech.users?.lastname].filter(Boolean);
        const name = parts.length ? parts.join(" ").trim() : null;
        entries.set(techId, name ? `${name} (${techId})` : `Técnico #${techId}`);
      });
    });

    return Array.from(entries.entries()).map(([value, label]) => ({ value, label }));
  }, [events]);

  const clientOptions = useMemo(() => {
    const entries = new Map<string, string>();
    events.forEach((event) => {
      const label = event.clientLabel?.trim();
      if (!label) return;
      if (!entries.has(label)) entries.set(label, label);
    });

    return Array.from(entries.entries()).map(([value, label]) => ({ value, label }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const techFilterId = technicianFilter === "all" ? null : Number(technicianFilter);

    return events.filter((event) => {
      // Scope por rol
      if (clientProfileId != null) {
        const eventCustomerIds = getEventCustomerIds(event);
        if (!eventCustomerIds.includes(clientProfileId)) return false;
      }

      if (technicianProfileUserId != null) {
        const techIds = getEventTechnicianUserIds(event);
        if (!techIds.includes(technicianProfileUserId)) return false;
      }

      // filtros UI
      if (sourceFilter !== "all" && event.source !== sourceFilter) return false;

      if (stateFilter !== "all" && normalizeStateKey(event.stateLabel) !== stateFilter) {
        return false;
      }

      if (serviceTypeFilter !== "all") {
        const serviceKey = getEventServiceTypeKey(event);
        if (serviceKey !== serviceTypeFilter) return false;
      }

      if (clientFilter !== "all") {
        const label = event.clientLabel?.trim();
        if (!label || label !== clientFilter) return false;
      }

      if (techFilterId !== null && !Number.isNaN(techFilterId)) {
        const eventTechIds = new Set<number>();
        getEventTechnicians(event).forEach((tech) => {
          const id = Number(tech?.technicianid ?? tech?.technicianId);
          if (Number.isFinite(id) && id > 0) eventTechIds.add(id);
        });
        if (!eventTechIds.has(techFilterId)) return false;
      }

      if (!term) return true;

      const haystack = `${event.title} ${event.clientLabel} ${event.stateLabel}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [
    events,
    searchTerm,
    sourceFilter,
    stateFilter,
    serviceTypeFilter,
    technicianFilter,
    clientFilter,
    clientProfileId,
    technicianProfileUserId,
  ]);

  const filteredCount = filteredEvents.length;

  const hasActiveFilters =
    sourceFilter !== "all" ||
    stateFilter !== "all" ||
    serviceTypeFilter !== "all" ||
    technicianFilter !== "all" ||
    clientFilter !== "all" ||
    searchTerm.trim().length > 0;

  const clearFilters = () => {
    setSourceFilter("all");
    setStateFilter("all");
    setSearchTerm("");
    setServiceTypeFilter("all");
    setTechnicianFilter("all");
    setClientFilter("all");
  };

  useEffect(() => {
    if (!filteredEvents.length) {
      setSelectedEvent(null);
      return;
    }

    if (selectedEvent && filteredEvents.some((e) => e.id === selectedEvent.id)) return;
    setSelectedEvent(filteredEvents[0]);
  }, [filteredEvents, selectedEvent]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return filteredEvents.filter((e) => e.start.getTime() >= now).slice(0, 4);
  }, [filteredEvents]);

  const statsSource = tokenRole === "Cliente" || tokenRole === "Técnico" ? filteredEvents : events;

  const stats = useMemo(
    () => [
      {
        label: "Citas visibles",
        value: statsSource.length,
        helper:
          tokenRole === "Cliente"
            ? hasActiveFilters
              ? "Filtradas según los filtros"
              : "Eventos del cliente"
            : tokenRole === "Técnico"
            ? hasActiveFilters
              ? "Filtradas según los filtros"
              : "Eventos del técnico"
            : hasActiveFilters
            ? "Filtradas según los filtros"
            : "Eventos sincronizados",
      },
      {
        label: "Citas próximas",
        value: statsSource.filter((e) => e.start.getTime() >= Date.now()).length,
        helper: "Ordenadas por fecha",
      },
      {
        label: "Técnicos en agenda",
        value: new Set(
          statsSource.flatMap((event) =>
            getEventTechnicians(event)
              .map((tech) => Number(tech?.technicianid ?? tech?.technicianId))
              .filter((id) => Number.isFinite(id) && id > 0)
          )
        ).size,
        helper: "Asignaciones únicas",
      },
    ],
    [statsSource, tokenRole, hasActiveFilters]
  );

  const requestEditInitial = useMemo<EditRequestPayload | null>(() => {
    if (!editingRequest) return null;

    const start = splitDateTime(editingRequest.scheduledAt ?? null);
    const end = splitDateTime(editingRequest.scheduledEndAt ?? null);

    const serviceId = editingRequest.service?.serviceid ?? editingRequest.serviceId;
    const clienteId = editingRequest.customer?.customerid ?? editingRequest.clientId;

    const tipoLabel =
      editingRequest.serviceType ??
      editingRequest.service?.category ??
      editingRequest.service?.name ??
      "";

    const tipoNormalized = tipoLabel.toLowerCase().includes("instal") ? "Instalacion" : "Mantenimiento";

    return {
      tipos: [tipoNormalized] as ("Mantenimiento" | "Instalacion")[],
      servicio: serviceId ? String(serviceId) : "",
      cliente: clienteId ? String(clienteId) : "",
      descripcion: editingRequest.description ?? "",
      direccion: editingRequest.direccion ?? "",
      programada: start.date,
      horaProgramada: start.time,
      horaFinal: end.time,
      estado: editingRequest.state?.stateid ? String(editingRequest.state.stateid) : undefined,
    };
  }, [editingRequest]);

  const handleRequestSave = async (payload: EditRequestPayload) => {
    if (!editingRequest) return;

    const scheduledAt = buildScheduledAt(
      payload.programada ?? null,
      payload.horaProgramada ?? null,
      editingRequest.scheduledAt ? new Date(editingRequest.scheduledAt) : null
    );

    const scheduledEndAt = buildScheduledAt(
      payload.programada ?? null,
      payload.horaFinal ?? null,
      editingRequest.scheduledEndAt ? new Date(editingRequest.scheduledEndAt) : null
    );

    const serviceId = parseMaybeNumber(payload.servicio);
    const clientId = parseMaybeNumber(payload.cliente);
    const stateId = parseMaybeNumber(payload.estado);

    const payloadBody: Record<string, unknown> = {
      serviceType: tipoToBackend(payload.tipos?.[0] ?? editingRequest.serviceType),
      description: payload.descripcion?.trim() ?? "",
      direccion: payload.direccion?.trim() ?? "",
      scheduledAt,
      scheduledEndAt,
    };

    if (!Number.isNaN(serviceId) && serviceId > 0) payloadBody.serviceId = serviceId;
    if (!Number.isNaN(clientId) && clientId > 0) payloadBody.clientId = clientId;
    if (!Number.isNaN(stateId) && stateId > 0) payloadBody.stateId = stateId;

    try {
      await updateRequestMutation.mutateAsync({
        id: editingRequest.serviceRequestId,
        payload: payloadBody,
      });
      await refetch();
    } catch (err) {
      showError("No se pudo actualizar la solicitud.");
      throw err;
    }
  };

  const handleRequestEdit = (request: ServiceRequestDTO) => setEditingRequest(request);

  const handleFinalizeEvent = useCallback(
    async (event: AppointmentEvent) => {
      if (!event) return;

      const orderId =
        event.source === "order" ? toPositiveNumber(event.order?.ordersservicesid) : null;

      const serviceRequestId =
        event.source === "request"
          ? toPositiveNumber(event.request?.serviceRequestId)
          : getOrderServiceRequestId(event.order);

      if (!serviceRequestId && !orderId) {
        Swal.fire("Sin registros relacionados", "La cita no tiene orden ni solicitud asociada.", "warning");
        return;
      }

      const targets = [
        serviceRequestId ? "solicitud de servicio" : null,
        orderId ? "orden de servicio" : null,
      ].filter(Boolean) as string[];

      const verb = targets.length > 1 ? "marcarán" : "marcará";
      const suffix = targets.length > 1 ? "finalizados" : "finalizado";

      const confirm = await Swal.fire({
        title: "¿Finalizar cita?",
        text: `Se ${verb} ${targets.join(" y ")} como ${suffix}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Finalizar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      setFinalizingEventId(event.id);

      try {
        const promises: Promise<any>[] = [];

        if (serviceRequestId) {
          promises.push(updateServiceRequest(serviceRequestId, { stateId: 6 }));
        }

        if (orderId) {
          promises.push(updateOrderService(orderId, { stateid: 6 }));
        }

        if (promises.length) await Promise.all(promises);

        await refetch();

        Swal.fire("Finalizado", `Se ${verb} ${targets.join(" y ")} como ${suffix}`, "success");
      } catch (err: any) {
        console.error("Error al finalizar cita:", err);
        Swal.fire(
          "Error",
          err?.response?.data?.message ?? err?.message ?? "No se pudieron actualizar los registros.",
          "error"
        );
      } finally {
        setFinalizingEventId(null);
      }
    },
    [refetch]
  );

  const eventStyleGetter = (event: AppointmentEvent) => {
    const sourcePalette =
      event.source === "order"
        ? { background: "#2B2B2B", border: "#1F1F1F", text: "#F5F5F0" }
        : { background: "#F5F5F0", border: "#d1d5db", text: "#111827" };

    return {
      style: {
        backgroundColor: sourcePalette.background,
        color: sourcePalette.text,
        border: `1px solid ${sourcePalette.border}`,
        borderRadius: 10,
        padding: "4px 8px",
        fontSize: "12px",
        lineHeight: 1.2,
      },
    };
  };

  const CalendarEvent = ({ event }: { event: AppointmentEvent }) => {
    const palette = getStatePalette(event.stateLabel);
    const isOrder = event.source === "order";
    const textColor = isOrder ? "#ffffff" : palette.text;

    return (
      <div className="flex flex-col gap-1 truncate">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: palette.border }} />
          <span className="truncate text-[11px] font-semibold" style={{ color: textColor }}>
            {event.title}
          </span>
        </div>
        <span className="truncate text-[10px] tracking-wide uppercase" style={{ color: textColor }}>
          {event.stateLabel}
        </span>
      </div>
    );
  };

  const calendarHeight = "h-[calc(100vh-420px)]";

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-red-100 p-2 text-red-600">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Agenda</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Calendario de órdenes y servicios
              </h1>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .hide-sunday .rbc-header.rbc-week-header.rbc-time-header-cell:nth-child(7),
          .hide-sunday .rbc-day-slot:nth-child(7),
          .hide-sunday .rbc-day-slot:nth-child(7) > .rbc-day-slot-toolbar,
          .hide-sunday .rbc-row-content > .rbc-day-slot:nth-child(7),
          .hide-sunday .rbc-time-column .rbc-day-slot:nth-child(7) {
            display: none;
          }
          .hide-sunday .rbc-time-view {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
          .app-calendar .rbc-calendar {
            border-radius: 10px;
            overflow: hidden;
          }
          .app-calendar .rbc-calendar > * {
            border-radius: inherit;
          }
        `}</style>

        <AppointmentDetailModal
          open={!!modalEvent}
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onEditRequest={handleRequestEdit}
          onFinalize={handleFinalizeEvent}
          isFinalizing={Boolean(modalEvent) && finalizingEventId === modalEvent?.id}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Filtros de citas</p>
              <p className="text-xs text-slate-500">
                Mostrando {filteredCount} de {events.length} citas.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-xs font-semibold text-slate-500">
              Tipo de evento
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
              >
                <option value="all">Todas las citas</option>
                <option value="order">Órdenes de servicio</option>
                <option value="request">Solicitudes de servicio</option>
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-slate-500">
              Estado
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
              >
                <option value="all">Todos los estados</option>
                {stateOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-slate-500">
              Buscar
              <input
                type="search"
                placeholder="Cliente, código o estado"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-xs font-semibold text-slate-500">
              Tipo de servicio
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
              >
                <option value="all">Todos los tipos</option>
                {SERVICE_TYPE_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-slate-500">
              Técnico asignado
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
              >
                <option value="all">Todos los técnicos</option>
                {technicianOptions.map((item) => (
                  <option key={item.value} value={String(item.value)}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {tokenRole !== "Cliente" && (
              <label className="space-y-1 text-xs font-semibold text-slate-500">
                Cliente
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none"
                >
                  <option value="all">Todos los clientes</option>
                  {clientOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          {isError && (
            <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              Error al cargar las citas.
            </div>
          )}

          {isLoading ? (
            <div className="flex h-96 items-center justify-center text-sm text-slate-500">
              Cargando citas…
            </div>
          ) : (
            <div
              className={`relative ${calendarHeight} min-h-[420px] max-h-[75vh] overflow-hidden ${
                calendarView === "week" ? "hide-sunday" : ""
              } app-calendar`}
            >
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                messages={CALENDAR_MESSAGES}
                culture="es"
                view={calendarView}
                views={availableViews}
                components={{
                  toolbar: CalendarToolbar,
                  event: CalendarEvent,
                }}
                onView={(v) => setCalendarView(v)}
                onSelectEvent={(e) => {
                  const evt = e as AppointmentEvent;
                  setSelectedEvent(evt);
                  setModalEvent(evt);
                }}
                eventPropGetter={(e) => eventStyleGetter(e as AppointmentEvent)}
                min={calendarMinTime}
                max={calendarMaxTime}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Próximas citas</p>
              <p className="text-xs text-slate-500">Ordenadas por fecha de inicio</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingEvents.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">
                No hay citas próximas registradas.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={`w-full px-5 py-3 text-left transition hover:bg-slate-50 ${
                    selectedEvent?.id === event.id ? "bg-slate-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedEvent(event);
                    setModalEvent(event);
                  }}
                >
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {upcomingFormatter.format(event.start)} • {event.clientLabel}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {editingRequest && (
          <EditRequestModal
            key={`edit-request-${editingRequest.serviceRequestId}`}
            isOpen={Boolean(editingRequest)}
            onClose={() => setEditingRequest(null)}
            onSave={handleRequestSave}
            initial={requestEditInitial}
            servicios={serviceOptions}
            clientes={customerOptions}
            title="Editar Solicitud"
          />
        )}
      </div>

      {showLegend && (
        <div
          className="fixed bottom-20 right-4 z-50 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl"
          role="dialog"
          aria-label="Leyenda de eventos"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Leyenda</p>
              <p className="text-xs text-slate-500">Colores según origen del evento</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLegend(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {LEGEND_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
              >
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estados</p>
            <div className="mt-2 space-y-2">
              {STATE_LEGEND_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full border"
                    style={{
                      backgroundColor: item.palette.background,
                      borderColor: item.palette.border,
                    }}
                  />
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowLegend((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        aria-pressed={showLegend}
        aria-label="Mostrar leyenda de eventos"
      >
        Leyenda
      </button>
    </>
  );
}
