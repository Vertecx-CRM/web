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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Columna izquierda - Calendarios y Filtro */}
      <div className="flex flex-col w-full lg:w-1/4 gap-4 lg:gap-6">
        {/* Calendario de mes */}
        <div className="flex-shrink-0 flex justify-center lg:justify-start">
          <CalendarMonth onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>

        {/* Filtro debajo del calendario de mes */}
        <div className="flex-shrink-0 flex justify-center lg:justify-start">
          <Filtro />
        </div>
      </div>

      {/* Columna derecha - Calendario semanal */}
      <div className="flex-1 w-full lg:w-3/4 min-h-[600px] lg:min-h-auto">
        <WeeklyCalendar selectedDate={selectedDate} />
      </div>
    </div>
  );
}