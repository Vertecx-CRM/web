"use client";

import React, { useState } from "react";
import { Calendar, dateFnsLocalizer, ToolbarProps } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { CustomEventDashboard } from "./CustomEventDashboard";
import "./sytileWeekDashboard.css";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DashboardEvent {
  title: string;
  start: Date;
  end: Date;
  estado?: string;
}

const DnDCalendar = withDragAndDrop<DashboardEvent>(Calendar);

const eventPropGetter = (event: DashboardEvent) => {
  let backgroundColor = "#B20000";
  if (event.estado === "Finalizado") backgroundColor = "#198754";
  if (event.estado === "Cancelado") backgroundColor = "#dc3545";

  return {
    style: {
      backgroundColor,
      borderRadius: "8px",
      color: "white",
      border: "none",
      padding: "4px 8px",
    },
  };
};

// ✅ Toolbar sin botones
const CustomToolbar: React.FC<ToolbarProps<DashboardEvent>> = ({ label }) => {
  return (
    <div className="flex items-center justify-center bg-[#B20000] text-white px-4 py-2 rounded-t-lg">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <CalendarDays className="w-5 h-5 text-white" />
        <span>{label}</span>
      </div>
    </div>
  );
};

export const WeeklyCalendarDashboard = () => {
  const [events] = useState<DashboardEvent[]>([
    {
      title: "Mantenimiento Servidor A",
      start: new Date(2025, 9, 6, 10, 0),
      end: new Date(2025, 9, 6, 12, 0),
      estado: "Pendiente",
    },
    {
      title: "Instalación Panel Solar",
      start: new Date(2025, 9, 7, 9, 0),
      end: new Date(2025, 9, 7, 11, 0),
      estado: "Finalizado",
    },
  ]);

  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return { start, end: addDays(start, 6) };
  };

  const [dateRange] = useState(getWeekRange(new Date()));

  const CustomHeader = ({ label }: { label: string }) => (
    <div className="custom-header font-semibold text-gray-700">{label}</div>
  );

  return (
    <div className="p-4 w-full">
      <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h2 className="text-2xl font-bold text-[#B20000] mb-4 px-6 pt-4">
            Calendario semanal de citas
          </h2>

          <DndProvider backend={HTML5Backend}>
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="week"
              views={["week"]}
              culture="es"
              step={30}
              timeslots={2}
              components={{
                week: { header: CustomHeader },
                event: CustomEventDashboard,
                toolbar: CustomToolbar,
              }}
              messages={{
                week: "Semana",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay eventos en este rango.",
              }}
              eventPropGetter={eventPropGetter}
              className="rounded-b-xl unified-header-calendar h-[700px]"
              min={new Date(1970, 1, 1, 7, 0)}
              max={new Date(1970, 1, 1, 18, 0)}
              selectable={false}
              resizable={false}
              draggableAccessor={() => false}
            />
          </DndProvider>
        </div>
      </div>
    </div>
  );
};
