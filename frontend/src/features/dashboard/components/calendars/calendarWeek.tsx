// components/calendars/calendarWeek.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import './sytileWeek.css';
import { Appointment, AppointmentEvent, SlotDateTime } from '../../appointments/types/typeAppointment';
import { CustomEventComponent } from '../../appointments/components/events/CustomEventComponent';
import { CreateAppointmentModal } from '../../appointments/components/CreateAppointmentModal/createAppointment';
import { AppointmentDetailsModal } from '../../appointments/components/menuAppointmentModal/menuAppointment';
import { EditAppointmentModal } from '../../appointments/components/EditAppointmentModal/editAppointmente';
import { ViewAppointmentModal } from '../../appointments/components/ViewAppointmentModal/viewAppointment';
import { confirmCancelAppointment } from '../../../../shared/utils/confirmCancel/confirmCancel';



const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface WeeklyCalendarProps {
  selectedDate?: Date;
}

const WeeklyCalendar = ({ selectedDate }: WeeklyCalendarProps) => {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDateTime | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<AppointmentEvent | null>(null);

  // Calcular la semana basada en la fecha seleccionada
  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return { start, end: addDays(start, 6) };
  };

  const [dateRange, setDateRange] = useState(getWeekRange(new Date()));

  useEffect(() => {
    if (selectedDate) {
      setDateRange(getWeekRange(selectedDate));
    }
  }, [selectedDate]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const startDate = slotInfo.start;

    // Forzar la duración a 2 horas en lugar de usar el slot seleccionado
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

  const handleSelectEvent = (event: AppointmentEvent) => {
    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  };

  const handleSaveAppointment = (newEvent: Appointment) => {
    const fixedEvent: AppointmentEvent = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };

    setEvents(prev => {
      const exists = prev.some(
        ev =>
          ev.start.getTime() === fixedEvent.start.getTime() &&
          ev.end.getTime() === fixedEvent.end.getTime()
      );
      if (exists) return prev;
      return [...prev, fixedEvent];
    });
    setIsCreateModalOpen(false);
  };

  const handleEditAppointment = (appointment: AppointmentEvent) => {
    console.log("Editar cita:", appointment);
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
    await confirmCancelAppointment(appointment.title, async (reason) => {
      const cancelTime = new Date();

      // Actualizar el estado, motivo y hora de cancelación
      setEvents(prev =>
        prev.map(ev =>
          ev.id === appointment.id
            ? {
              ...ev,
              estado: "Cancelado",
              motivoCancelacion: reason,
              horaCancelacion: cancelTime,   // 👈 NUEVO
              title: `${ev.title} (Cancelada)`,
            }
            : ev
        )
      );

      setIsDetailsModalOpen(false);
      console.log("Motivo de cancelación:", reason, "Hora:", cancelTime);
    });
  };


  // 👉 Efecto para agregar eventos de hover a las celdas del calendario
  useEffect(() => {
    const addHoverEffects = () => {
      const calendarEl = calendarRef.current;
      if (!calendarEl) return;

      // Seleccionar todas las celdas de tiempo
      const timeSlots = calendarEl.querySelectorAll('.rbc-day-slot .rbc-time-slot');

      timeSlots.forEach(slot => {
        // Remover event listeners existentes para evitar duplicados
        slot.removeEventListener('mouseenter', handleMouseEnter);
        slot.removeEventListener('mouseleave', handleMouseLeave);

        // Agregar event listeners
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

    // Ejecutar después de que el calendario se renderice
    const timer = setTimeout(addHoverEffects, 100);

    // También agregar event listeners cuando cambien los eventos o la fecha
    const interval = setInterval(addHoverEffects, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);

      // Limpiar event listeners
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

  // 👉 Indicador de hora actual (línea verde)
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
    <>
      <div className="calendar-wrapper w-full">
        <div ref={calendarRef} className="w-full h-[85vh] min-h-[100px] bg-white rounded-xl">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="week"
            views={['week']}
            date={dateRange.start}
            culture="es"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
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
    </>
  );
};

export default WeeklyCalendar;