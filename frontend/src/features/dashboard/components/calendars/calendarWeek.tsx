'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Appointment, AppointmentEvent, SlotDateTime } from '../../appointments/types/typeAppointment';
import { CustomEventComponent } from '../../appointments/components/events/CustomEventComponent';
import { CreateAppointmentModal } from '../../appointments/components/CreateAppointmentModal/createAppointment';
import { AppointmentDetailsModal } from '../../appointments/components/menuAppointmentModal/menuAppointment';
import { EditAppointmentModal } from '../../appointments/components/EditAppointmentModal/editAppointmente';
import { ViewAppointmentModal } from '../../appointments/components/ViewAppointmentModal/viewAppointment';
import { confirmCancelAppointment } from '../../../../shared/utils/confirmCancel/confirmCancel';
import { GroupedAppointmentsModal } from '../../appointments/components/GroupedAppointmentsModal/GroupedAppointments';
import { showWarning } from '@/shared/utils/notifications';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";


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
}

const eventPropGetter = (event: AppointmentEvent) => {
  if (event.estado === 'Finalizado') {
    return {
      isDraggable: false,
      isResizable: false,
      className: 'event-finalizado',
    };
  }
  return {};
};

const WeeklyCalendar = ({ selectedDate }: WeeklyCalendarProps) => {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
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

  const [displayEvents, setDisplayEvents] = useState<GroupedEvent[]>([]);

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

  useEffect(() => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
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

    setDisplayEvents(newDisplayEvents);
  }, [events]);

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
    // 1. Si es un evento agrupado, mostrar el modal de agrupados y salir
    if (event.isGrouped && event.groupedEvents) {
      setGroupedAppointments(event.groupedEvents);
      setIsGroupedModalOpen(true);
      return;
    }

    // 2. Si es un evento individual finalizado, mostrar advertencia
    if (event.estado === 'Finalizado') {
      showWarning('Esta cita ha sido finalizada.');
      return;
    }

    // 3. Si es un evento normal, abrir detalles
    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  };


  const handleSelectGroupedAppointment = (appointment: AppointmentEvent) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<AppointmentEvent>) => {
    if (event.estado === 'Finalizado') {
      showWarning('No se puede editar ni mover una cita finalizada.');
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

    setEvents(prev =>
      prev.map(ev => (ev.id === event.id ? updatedEvent : ev))
    );

    setTimeout(() => setIsDragging(false), 100);
  };

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<AppointmentEvent>) => {
    if (event.estado === 'Finalizado') {
      showWarning('No se puede editar ni mover una cita finalizada.');
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

    setEvents(prev =>
      prev.map(ev => (ev.id === event.id ? updatedEvent : ev))
    );
  };

  const handleSaveAppointment = (newEvent: Appointment) => {
    const fixedEvent: AppointmentEvent = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };
    setEvents(prev => [...prev, fixedEvent]);
    setIsCreateModalOpen(false);
  };

  const handleEditAppointment = (appointment: AppointmentEvent) => {
    setIsDetailsModalOpen(false);
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = (updated: AppointmentEvent) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === updated.id ? updated : ev))
    );
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  const handleViewAppointment = (appointment: AppointmentEvent) => {
    setViewingAppointment(appointment);
    setIsDetailsModalOpen(false);
    setIsViewModalOpen(true);
  };

  const handleCancelAppointment = async (appointment: AppointmentEvent) => {
    // Si la cita tiene orden, construimos un título legible
    const appointmentLabel = appointment.orden
      ? `Orden: ${appointment.orden.tipoServicio} - Cliente: ${appointment.orden.cliente}`
      : appointment.title || "Cita sin título";

    await confirmCancelAppointment(appointmentLabel, async (reason) => {
      const cancelTime = new Date();

      setEvents(prev =>
        prev.map(ev =>
          ev.id === appointment.id
            ? {
              ...ev,
              estado: "Cancelado",
              motivoCancelacion: reason,
              horaCancelacion: cancelTime,
              title: `${ev.orden?.tipoServicio} (Cancelada)`,
            }
            : ev
        )
      );

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

  const defaultSlot: SlotDateTime = {
    horaInicio: '00',
    minutoInicio: '00',
    horaFin: '02',
    minutoFin: '00',
    dia: '01',
    mes: '11',
    año: '2025',
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-wrapper w-full">
        <div ref={calendarRef} className="w-full h-full min-h-[100px] bg-white rounded-xl">
          <DnDCalendar
            localizer={localizer}
            events={displayEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView="week"
            views={['week']}
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
          />
        </div>
      </div>

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        selectedDateTime={selectedSlot || defaultSlot}
        editingAppointment={editingAppointment}
      />

      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
        onSave={handleUpdateAppointment}
      />

      <ViewAppointmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingAppointment(null);
        }}
        appointment={viewingAppointment}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onView={handleViewAppointment}
        onCancel={handleCancelAppointment}
      />

      <GroupedAppointmentsModal
        isOpen={isGroupedModalOpen}
        onClose={() => setIsGroupedModalOpen(false)}
        appointments={groupedAppointments}
        onSelectAppointment={handleSelectGroupedAppointment}
      />
      <ToastContainer />
    </DndProvider>
  );
};

export default WeeklyCalendar;