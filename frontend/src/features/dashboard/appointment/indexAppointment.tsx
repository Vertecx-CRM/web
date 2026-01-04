"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDays } from "lucide-react";

import AppointmentDetailModal from "./components/AppointmentDetailCard";
import AppointmentFilters from "./components/AppointmentFilters";
import AppointmentLegend from "./components/AppointmentLegend";
import AppointmentStats from "./components/AppointmentStats";
import AppointmentUpcomingList from "./components/AppointmentUpcomingList";
import { AppointmentToolbar, type AppointmentToolbarProps } from "./components/AppointmentToolbar";
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

import type { AppointmentEvent } from "./types/typeAppointment";
import { buildAppointmentEvents } from "./types/typeAppointment";

import {
  CALENDAR_MESSAGES,
  SERVICE_TYPE_FILTERS,
  calendarMaxTime,
  calendarMinTime,
} from "./types/calendar.constants";

import { useAppointmentsQuery } from "./hooks/useAppointmentsQuery";
import { useAppointmentFilters } from "./hooks/useAppointmentFilters";
import { useAppointmentStats } from "./hooks/useAppointmentStats";
import { useAppointmentResponsive } from "./hooks/useAppointmentResponsive";
import { useRoleScope } from "./hooks/useRoleScope";

import { getOrderServiceRequestId } from "./helpers/appointment.helpers";
import { getStatePalette } from "./helpers/appointmentState.helpers";
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

const periodFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

type AppointmentToolbarRendererProps = Omit<AppointmentToolbarProps, "isFullscreen" | "onToggleFullscreen">;

export default function IndexAppointment() {
  const { tokenRole, tokenRoleNormalized, clientProfileId, technicianProfileUserId } = useRoleScope();
  const { data, isLoading, isError, refetch } = useAppointmentsQuery();
  const { serviceOptions, customerOptions } = useLookups();
  const updateRequestMutation = useUpdateServiceRequest();
  const {
    calendarView,
    setCalendarView,
    availableViews,
    handleNavigate,
    currentDate,
    isFullscreen,
    toggleFullscreen,
  } = useAppointmentResponsive();

  const events = useMemo(() => buildAppointmentEvents(data ?? {}), [data]);

  const {
    filteredEvents,
    filteredCount,
    hasActiveFilters,
    stateOptions,
    technicianOptions,
    clientOptions,
    filters,
    handlers,
    clearFilters,
  } = useAppointmentFilters({
    events,
    clientProfileId,
    technicianProfileUserId,
  });

  const {
    sourceFilter,
    stateFilter,
    searchTerm,
    serviceTypeFilter,
    technicianFilter,
    clientFilter,
  } = filters;

  const {
    setSourceFilter,
    setStateFilter,
    setSearchTerm,
    setServiceTypeFilter,
    setTechnicianFilter,
    setClientFilter,
  } = handlers;

  const stats = useAppointmentStats({
    events,
    filteredEvents,
    tokenRole,
    tokenRoleNormalized,
    hasActiveFilters,
  });

  const toolbarComponent = useCallback(
    (props: AppointmentToolbarRendererProps) => (
      <AppointmentToolbar
        {...props}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    ),
    [isFullscreen, toggleFullscreen]
  );

  const periodLabel = useMemo(() => periodFormatter.format(currentDate), [currentDate]);

  const [editingRequest, setEditingRequest] = useState<ServiceRequestDTO | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);
  const [modalEvent, setModalEvent] = useState<AppointmentEvent | null>(null);
  const [finalizingEventId, setFinalizingEventId] = useState<number | null>(null);

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

  const calendarHeight = isFullscreen ? "h-[calc(100vh-160px)]" : "h-[calc(100vh-420px)]";

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
              <p className="text-xs text-slate-500">Mes actual: {periodLabel}</p>
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

        <AppointmentStats stats={stats} />

        <AppointmentFilters
          eventsLength={events.length}
          filteredCount={filteredCount}
          hasActiveFilters={hasActiveFilters}
          showClientFilter={tokenRole !== "Cliente"}
          stateOptions={stateOptions}
          technicianOptions={technicianOptions}
          clientOptions={clientOptions}
          sourceFilter={sourceFilter}
          stateFilter={stateFilter}
          searchTerm={searchTerm}
          serviceTypeFilter={serviceTypeFilter}
          technicianFilter={technicianFilter}
          clientFilter={clientFilter}
          onSourceChange={setSourceFilter}
          onStateChange={setStateFilter}
          onSearchChange={setSearchTerm}
          onServiceTypeChange={setServiceTypeFilter}
          onTechnicianChange={setTechnicianFilter}
          onClientChange={setClientFilter}
          onClearFilters={clearFilters}
        />

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
                  toolbar: toolbarComponent,
                  event: CalendarEvent,
                }}
                onView={(v) => setCalendarView(v)}
                onNavigate={handleNavigate}
                date={currentDate}
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

        <AppointmentUpcomingList
          events={upcomingEvents}
          selectedEventId={selectedEvent?.id ?? null}
          onSelect={(event) => {
            setSelectedEvent(event);
            setModalEvent(event);
          }}
        />

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

      <AppointmentLegend
        open={showLegend}
        onClose={() => setShowLegend(false)}
        onToggle={() => setShowLegend((prev) => !prev)}
      />

    </>
  );
}
