"use client";

import { useState } from "react";
import CalendarMonth from "../components/calendars/calendarMonth";
import WeeklyCalendar from "../components/calendars/calendarWeek";
import { Filtro } from "./filtro/filtro";
import { ToastContainer } from "react-toastify";

// Reutilizamos el SearchIcon de DataTable
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3-3" />
  </svg>
);

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState(""); // 🔎 estado para el buscador

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 lg:p-6 gap-4 lg:gap-6">
      {/* Columna izquierda */}
      <div className="flex flex-col w-full lg:w-1/4 gap-4 lg:gap-6">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar citas..."
            className="w-full rounded-full bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex-shrink-0 flex justify-center lg:justify-start">
          <CalendarMonth onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>

        <div className="flex-shrink-0 flex justify-center lg:justify-start">
          <Filtro />
        </div>

      </div>

      {/* Columna derecha - Calendario semanal */}
      <div className="flex-1 w-full lg:w-3/4 flex flex-col">
        <div className="flex-none h-[0px]" />
        {/* ✅ Ahora WeeklyCalendar recibe la prop search */}
        <WeeklyCalendar selectedDate={selectedDate} search={search} />
      </div>
    </div>
  );
}
