'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  addHours,
  differenceInMinutes
} from 'date-fns';
import { es } from 'date-fns/locale';
import './sytileWeek.css';
import { AppointmentEvent, SlotDateTime } from '../../appointments/types/typeAppointment';
import { CustomEventComponent } from '../../appointments/components/events/CustomEventComponent';
import { AppointmentDetailsModal } from '../../appointments/components/menuAppointmentModal/menuAppointment';
import { confirmCancelAppointment } from '../../../../shared/utils/confirmCancel/confirmCancel';
import { GroupedAppointmentsModal } from '../../appointments/components/GroupedAppointmentsModal/GroupedAppointments';
import { showWarning } from '@/shared/utils/notifications';
import 'react-toastify/dist/ReactToastify.css';
import { FiltersState } from '../../appointments/components/filtro/filtro';
import { ReprogramAppointmentModal } from '../../appointments/components/rescheduleModal/rescheduleModal';
import { useAppointments } from '../../appointments/hooks/useAppointment';
import CreateRequestModal, { type CreateRequestPayload } from '../../requests/components/CreateRequestModal';
import EditRequestModal, { type EditRequestPayload } from '../../requests/components/EditRequestModal';
import ViewRequestModal from '../../requests/components/ViewRequestModal';
import { useLookups } from '../../requests/hooks/useLookups';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { routes } from '@/shared/routes';

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Extender el tipo de evento para incluir la lógica de agrupación
interface GroupedEvent extends AppointmentEvent {
  isGrouped?: boolean;
  count?: number;
  groupedEvents?: AppointmentEvent[];
}

const DnDCalendar = withDragAndDrop<GroupedEvent>(Calendar);

interface WeeklyCalendarProps {
  selectedDate?: Date;
  search?: string;
  filters: FiltersState;
}

const eventPropGetter = (event: AppointmentEvent) => {
  if (event.estado === "Finalizado" || event.estado === "Cancelado" || event.estado === "Cerrado") {
    return {
      isDraggable: false,
      isResizable: false,
      className: event.estado === "Finalizado" ? "event-finalizado" : "event-cancelado",
    };
  }
  return {};
};


const WeeklyCalendar = ({ selectedDate, search, filters }: WeeklyCalendarProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGroupedModalOpen, setIsGroupedModalOpen] = useState(false);
  const [groupedAppointments, setGroupedAppointments] = useState<AppointmentEvent[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotDateTime | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<AppointmentEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReprogramModalOpen, setIsReprogramModalOpen] = useState(false);
  const [appointmentToReprogram, setAppointmentToReprogram] = useState<AppointmentEvent | null>(null);

  const formatDate = (value?: Date | string | null) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatTime = (value?: Date | string | null) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getWeekRange = useCallback((date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return { start, end: addDays(start, 6) };
  }, []);

  const [dateRange, setDateRange] = useState(getWeekRange(new Date()));

  useEffect(() => {
    if (selectedDate) {
      setDateRange(getWeekRange(selectedDate));
    }
  }, [selectedDate, getWeekRange]);

  const {
    events,
    handleReprogramAppointment,
    handleCancelAppointment,
    handleCreateAppointment: createAppointmentInHook,
    handleUpdateAppointment: updateAppointmentInHook,
    handleUpdateRequest,
    isLoading,
  } = useAppointments();
  const { serviceOptions, customerOptions } = useLookups();
  const router = useRouter();
  const pathname = usePathname();

  const filteredAppointments = useMemo(() => {
    return events.filter((a) => {
      const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());

      // Técnicos
      const matchTech =
        filters.technicians.length === 0 ||
        a.tecnicos.some(t => filters.technicians.includes(t.id));

      // Tipo de servicio (puede venir en tipoServicioSolicitud o en la orden)
      const appointmentTipoServicio = a.tipoServicioSolicitud ?? a.orden?.tipoServicio ?? "";
      const matchTipoServicio = !filters.tipoServicio || appointmentTipoServicio === filters.tipoServicio;

      // Tipo de mantenimiento (puede venir en tipoMantenimientoSolicitud o en la orden)
      const appointmentTipoMantenimiento = a.tipoMantenimientoSolicitud ?? a.orden?.tipoMantenimiento ?? "";
      const matchTipoMantenimiento = !filters.tipoMantenimiento || appointmentTipoMantenimiento === filters.tipoMantenimiento;

      // Tipo de cita
      const matchTipoCita = !filters.tipoCita || a.tipoCita === filters.tipoCita;

      // Estado
      let matchEstado = true;

      if (filters.estado) {
        if (filters.estado === "Reprogramada") {
          matchEstado = a.subestado === "Reprogramada";
        } else {
          matchEstado = a.estado === filters.estado;
        }
      }

      // Cliente (nombreCliente o cliente de la orden)
      const clienteCita = a.nombreCliente ?? a.orden?.cliente ?? "";
      const matchCliente =
        !filters.cliente ||
        clienteCita.toLowerCase().includes(filters.cliente.toLowerCase());

      return (
        matchSearch &&
        matchTech &&
        matchTipoServicio &&
        matchTipoMantenimiento &&
        matchTipoCita &&
        matchEstado &&
        matchCliente
      );
    });
  }, [events, search, filters]);


  // 2. Agrupar y filtrar eventos visibles (memoizado para evitar loops)
  const displayEvents = useMemo(() => {
    let filtered = [...filteredAppointments];

    filtered = filtered.filter(
      ev => ev.start >= dateRange.start && ev.start <= dateRange.end
    );

    const sortedEvents = [...filtered].sort((a, b) => a.start.getTime() - b.start.getTime());
    const newDisplayEvents: GroupedEvent[] = [];
    let i = 0;
    while (i < sortedEvents.length) {
      const currentEvent = sortedEvents[i];
      const overlappingEvents = [currentEvent];
      let j = i + 1;
      while (j < sortedEvents.length && sortedEvents[j].start.getTime() < currentEvent.end.getTime()) {
        overlappingEvents.push(sortedEvents[j]);
        j++;
      }
      if (overlappingEvents.length > 1) {
        newDisplayEvents.push({
          ...currentEvent,
          isGrouped: true,
          count: overlappingEvents.length,
          groupedEvents: overlappingEvents,
          title: `${overlappingEvents.length} Citas`,
        });
        i = j;
      } else {
        newDisplayEvents.push(currentEvent);
        i++;
      }
    }

    return newDisplayEvents;
  }, [filteredAppointments, dateRange]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (isDragging) return;

    const startDate = slotInfo.start;
    const endDate = addHours(startDate, 2);

    setSelectedSlot({
      horaInicio: startDate.getHours().toString().padStart(2, '0'),
      minutoInicio: startDate.getMinutes().toString().padStart(2, '0'),
      horaFin: endDate.getHours().toString().padStart(2, '0'),
      minutoFin: endDate.getMinutes().toString().padStart(2, '0'),
      dia: startDate.getDate().toString(),
      mes: (startDate.getMonth() + 1).toString(),
      año: startDate.getFullYear().toString(),
      start: startDate,
      end: endDate,
    });

    setIsCreateModalOpen(true);
  };
  // En WeeklyCalendar.tsx
  const handleSelectEvent = (event: GroupedEvent) => {
    if (event.isGrouped && event.groupedEvents) {
      setGroupedAppointments(event.groupedEvents);
      setIsGroupedModalOpen(true);
      return;
    }

    if (event.estado === "Cancelado" || event.estado === "Cerrado" || event.estado === "Finalizado") {
      setSelectedAppointment(event);
      setIsDetailsModalOpen(true);
      return;
    }

    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  };

  const handleSelectGroupedAppointment = (appointment: AppointmentEvent) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<AppointmentEvent>) => {
    if (event.estado === "Finalizado" || event.estado === "Cancelado" || event.estado === "Cerrado") {
      showWarning("No se puede editar ni mover una cita finalizada o cancelada.");
      return;
    }

    setIsDragging(true);
    const newStart = new Date(start);
    const newEnd = new Date(end);

    const originalDuration = differenceInMinutes(
      new Date(event.end),
      new Date(event.start)
    );

    const newEndWithDuration = new Date(newStart.getTime() + originalDuration * 60000);

    const updatedEvent: AppointmentEvent = {
      ...event,
      start: newStart,
      end: newEndWithDuration,
      dia: newStart.getDate().toString(),
      mes: (newStart.getMonth() + 1).toString(),
      año: newStart.getFullYear().toString(),
      horaInicio: newStart.getHours().toString().padStart(2, '0'),
      minutoInicio: newStart.getMinutes().toString().padStart(2, '0'),
      horaFin: newEndWithDuration.getHours().toString().padStart(2, '0'),
      minutoFin: newEndWithDuration.getMinutes().toString().padStart(2, '0'),
    };

    handleUpdateAppointment(updatedEvent);

    setTimeout(() => setIsDragging(false), 100);
  };

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<AppointmentEvent>) => {
    if (event.estado === "Finalizado" || event.estado === "Cancelado" || event.estado === "Cerrado") {
      showWarning("No se puede editar ni mover una cita finalizada, cancelada o cerrado.");
      return;
    }
    const newStart = new Date(start);
    const newEnd = new Date(end);

    const updatedEvent: AppointmentEvent = {
      ...event,
      start: newStart,
      end: newEnd,
      horaInicio: newStart.getHours().toString().padStart(2, '0'),
      minutoInicio: newStart.getMinutes().toString().padStart(2, '0'),
      horaFin: newEnd.getHours().toString().padStart(2, '0'),
      minutoFin: newEnd.getMinutes().toString().padStart(2, '0'),
    };

    handleUpdateAppointment(updatedEvent);
  };

  const handleSaveRequest = async (data: CreateRequestPayload) => {
    const slot = selectedSlot || defaultSlot;
    await createAppointmentInHook(data, slot);
    setIsCreateModalOpen(false);
  };

  const handleEditAppointment = (appointment: AppointmentEvent) => {
    setIsDetailsModalOpen(false);
    if (appointment.serviceOrderId) {
      const returnTo = encodeURIComponent(pathname ?? routes.dashboard.appointments);
      router.push(
        `${routes.dashboard.ordersServices}/edit?id=${appointment.serviceOrderId}&returnTo=${returnTo}`
      );
      return;
    }

    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = (updated: AppointmentEvent) => {
    const fixedEvent: AppointmentEvent = {
      ...updated,
      start: updated.start instanceof Date ? updated.start : new Date(updated.start),
      end: updated.end instanceof Date ? updated.end : new Date(updated.end),
    };

    updateAppointmentInHook(fixedEvent);
  };

  const handleSaveEditRequest = async (values: EditRequestPayload) => {
    if (!editingAppointment) return;
    await handleUpdateRequest(Number(editingAppointment.id), values, editingAppointment);
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  const handleViewAppointment = (appointment: AppointmentEvent) => {
    setViewingAppointment(appointment);
    setIsDetailsModalOpen(false);
    setIsViewModalOpen(true);
  };

  const handleCancel = async (appointment: AppointmentEvent) => {
    const appointmentLabel = appointment.servicio
      ? `${appointment.servicio} - ${appointment.nombreCliente ?? ""}`
      : appointment.title || "Solicitud";

    await confirmCancelAppointment(appointmentLabel, async () => {
      await handleCancelAppointment(appointment);
      setIsDetailsModalOpen(false);
    });
  };



  useEffect(() => {
    const addHoverEffects = () => {
      const calendarEl = calendarRef.current;
      if (!calendarEl) return;
      const timeSlots = calendarEl.querySelectorAll('.rbc-day-slot .rbc-time-slot');
      timeSlots.forEach(slot => {
        slot.removeEventListener('mouseenter', handleMouseEnter);
        slot.removeEventListener('mouseleave', handleMouseLeave);
        slot.addEventListener('mouseenter', handleMouseEnter);
        slot.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      target.classList.add('time-slot-hovered');
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      target.classList.remove('time-slot-hovered');
    };

    const timer = setTimeout(addHoverEffects, 100);
    const interval = setInterval(addHoverEffects, 2000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const timeSlots = calendarEl.querySelectorAll('.rbc-day-slot .rbc-time-slot');
        timeSlots.forEach(slot => {
          slot.removeEventListener('mouseenter', handleMouseEnter);
          slot.removeEventListener('mouseleave', handleMouseLeave);
        });
      }
    };
  }, [events, dateRange]);

  useEffect(() => {
    const updateIndicator = () => {
      const calendarEl = calendarRef.current;
      if (!calendarEl) return;
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const percent = (minutes / (24 * 60)) * 100;
      const dayIndex = now.getDay() === 0 ? 7 : now.getDay();
      const todayCol = calendarEl.querySelector(
        `.rbc-time-content .rbc-day-slot:nth-child(${dayIndex})`
      ) as HTMLElement;

      if (todayCol) {
        let indicator = todayCol.querySelector(".custom-time-indicator") as HTMLElement;
        if (!indicator) {
          indicator = document.createElement("div");
          indicator.className = "custom-time-indicator";
          todayCol.appendChild(indicator);
        }
        indicator.style.top = `${percent}%`;
      }
    };

    updateIndicator();
    const interval = setInterval(updateIndicator, 60000);
    return () => clearInterval(interval);
  }, []);



  const CustomHeader = ({ label }: { label: string }) => (
    <div className="custom-header">
      <span>{label}</span>
    </div>
  );

  if (isLoading) {
    return <Loader />;
  }

  const defaultSlot: SlotDateTime = {
    horaInicio: '00',
    minutoInicio: '00',
    horaFin: '02',
    minutoFin: '00',
    dia: '01',
    mes: '11',
    año: '2025',
  };

  const isViewingOrder = Boolean(viewingAppointment?.serviceOrderId);
  const viewCodigo = isViewingOrder
    ? `OS-${String(viewingAppointment?.serviceOrderId ?? 0).padStart(6, "0")}`
    : `SRV-${String(viewingAppointment?.id ?? 0).padStart(6, "0")}`;
  const viewTitle = isViewingOrder
    ? `Detalle de la orden ${viewingAppointment?.orden?.id ?? viewCodigo}`
    : "Detalle de la Solicitud";
  const viewCliente = viewingAppointment?.nombreCliente || viewingAppointment?.orden?.cliente || "";
  const viewDireccion = viewingAppointment?.direccion || viewingAppointment?.orden?.lugar || "";
  const viewServicio = viewingAppointment?.servicio || viewingAppointment?.orden?.tipoServicio || "Servicio";
  const viewDescripcion = viewingAppointment?.descripcion || viewingAppointment?.orden?.tipoServicio || "";
  const viewProgramada = viewingAppointment?.start ? new Date(viewingAppointment.start).toISOString() : null;
  const viewTipos = viewingAppointment?.tipoServicioSolicitud
    ? [
        viewingAppointment.tipoServicioSolicitud === "instalacion"
          ? "Instalacion"
          : "Mantenimiento",
      ]
    : [];

  return (
    <div id="calendar-pdf" className="calendar-wrapper w-full">
      <div ref={calendarRef} className="w-full h-full min-h-[100px] bg-white rounded-xl">
        <DndProvider backend={HTML5Backend}>
          <div className="calendar-wrapper w-full">
            <div ref={calendarRef} className="w-full h-full min-h-[100px] bg-white rounded-xl">
              <DnDCalendar
                localizer={localizer}
                events={displayEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={["week"]}
                dayPropGetter={(date) => {
                  if (date.getDay() === 0) {
                    return {
                      style: {
                        display: "none",
                      },
                    };
                  }
                  return {};
                }}
                date={dateRange.start}
                culture="es"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventPropGetter}
                step={30}
                timeslots={2}
                components={{
                  week: { header: CustomHeader },
                  event: CustomEventComponent,
                }}
                messages={{
                  next: 'Siguiente',
                  previous: 'Anterior',
                  today: 'Hoy',
                  week: 'Semana',
                  date: 'Fecha',
                  time: 'Hora',
                  event: 'Evento',
                  noEventsInRange: 'No hay eventos en este rango.',
                }}
                className="rounded-xl unified-header-calendar h-full"

                min={new Date(1970, 1, 1, 7, 0)}
                max={new Date(1970, 1, 1, 18, 0)}
              />
            </div>
          </div>

          <CreateRequestModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingAppointment(null);
            }}
            onSave={handleSaveRequest}
            initialDate={formatDate(selectedSlot?.start ?? null)}
            initialTime={formatTime(selectedSlot?.start ?? null)}
            servicios={serviceOptions}
            clientes={customerOptions}
          />

          {isEditModalOpen && editingAppointment && (
            <EditRequestModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingAppointment(null);
              }}
              initial={{
                tipos: editingAppointment.tipoServicioSolicitud === "instalacion" ? ["Instalacion"] : ["Mantenimiento"],
                servicio: editingAppointment.serviceId ? String(editingAppointment.serviceId) : "",
                descripcion: editingAppointment.descripcion ?? "",
                direccion: editingAppointment.direccion ?? "",
                cliente: editingAppointment.clientId ? String(editingAppointment.clientId) : "",
                programada: formatDate(editingAppointment.start),
                horaProgramada: formatTime(editingAppointment.start),
                estado: editingAppointment.stateId ? String(editingAppointment.stateId) : "",
              }}
              servicios={serviceOptions}
              clientes={customerOptions}
              onSave={handleSaveEditRequest}
              title="Editar Solicitud"
            />
          )}

          <ReprogramAppointmentModal
            isOpen={isReprogramModalOpen}
            onClose={() => setIsReprogramModalOpen(false)}
            appointment={appointmentToReprogram}
            onReprogramSave={(start, end) => {
              if (appointmentToReprogram) {
                // ✅ Pasar directamente los objetos Date al hook
                handleReprogramAppointment(appointmentToReprogram, { start, end });
              }
              setIsReprogramModalOpen(false);
            }}

          />

          {isViewModalOpen && viewingAppointment && (
            <ViewRequestModal
              isOpen={isViewModalOpen}
              onClose={() => {
                setIsViewModalOpen(false);
                setViewingAppointment(null);
              }}
              data={{
                tipos: viewTipos,
                servicio: viewServicio,
                descripcion: viewDescripcion,
                direccion: viewDireccion,
                cliente: viewCliente,
                fecha: viewingAppointment.start,
                estado: viewingAppointment.estado,
                codigo: viewCodigo,
                programada: viewProgramada,
              }}
              title={viewTitle}
            />
          )}

          <AppointmentDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            appointment={selectedAppointment}
            onReprogram={(appointment) => {
              setAppointmentToReprogram(appointment);
              setIsReprogramModalOpen(true);
            }}
            onEdit={handleEditAppointment}
            onView={handleViewAppointment}
            onCancel={handleCancel}
          />


          <GroupedAppointmentsModal
            isOpen={isGroupedModalOpen}
            onClose={() => setIsGroupedModalOpen(false)}
            appointments={groupedAppointments}
            onSelectAppointment={handleSelectGroupedAppointment}
            onCreateAppointment={() => {
              setIsGroupedModalOpen(false);
              setIsCreateModalOpen(true);
            }}
          />

        </DndProvider>
      </div>
    </div>
  );
};

export default WeeklyCalendar;


