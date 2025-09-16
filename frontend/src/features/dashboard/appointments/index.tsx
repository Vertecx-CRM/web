"use client";

import { useState } from 'react';
import CalendarMonth from "../components/calendars/calendarMonth";
import WeeklyCalendar from "../components/calendars/calendarWeek";
import { Filtro } from "./filtro/filtro";
import { ToastContainer } from 'react-toastify';

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

return (
  <div className="flex flex-col lg:flex-row h-screen p-4 lg:p-6 gap-4 lg:gap-6">
    {/* ... (código existente de la columna izquierda) ... */}
    <div className="flex flex-col w-full lg:w-1/4 gap-4 lg:gap-6">
      <div className="flex-shrink-0 flex justify-center lg:justify-start">
        <CalendarMonth onDateSelect={handleDateSelect} selectedDate={selectedDate} />
      </div>
      <div className="flex-shrink-0 flex justify-center lg:justify-start">
        <Filtro />
      </div>
    </div>

    {/* Columna derecha - Calendario semanal */}
    <div className="flex-1 w-full lg:w-3/4 flex flex-col">
      <div className="flex-none h-[0px]">
        {/* Este div actúa como el espacio del encabezado del calendario mensual */}
      </div>
      <WeeklyCalendar selectedDate={selectedDate} />
    </div>
  </div>
);
}