"use client";

import { useState } from "react";
import CalendarMonth from "../components/calendars/calendarMonth";
import WeeklyCalendar from "../components/calendars/calendarWeek";
import { ToastContainer } from "react-toastify";

import { AppointmentFilters, FiltersState } from "./components/filtro/filtro";
import { Legend } from "./components/LegendCard/Legend";
import DownloadCalendarPDF from "./components/buttonDownloadPDF/buttonDownloand";
import { appointmentStates } from "./mocks/mockAppointment";

const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3-3" />
  </svg>
);

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    technicians: [],
    tipoServicio: "",
    tipoMantenimiento: "",
    tipoCita: "",
    estado: "",
    cliente: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFilterField = (field: keyof FiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row h-screen max-h-screen overflow-auto p-4 lg:p-6 gap-4 lg:gap-6">
        {/* Columna izquierda */}
        <div className="flex flex-col w-full lg:w-1/4 gap-4 lg:gap-6 overflow-y-auto">
          {/* Buscar */}
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar citas..."
              className="w-full rounded-full bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Calendario mensual */}
          <div className="flex justify-center lg:justify-start">
            <CalendarMonth
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>

          {/* Filtros */}
          <div className="flex justify-center lg:justify-start">
            <AppointmentFilters values={filters} onChange={setFilters} />
          </div>

          {/* Leyenda */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-[320px] rounded-3xl bg-white p-4 shadow-inner shadow-stone-100 border border-stone-200">
              <Legend />
            </div>
          </div>
        </div>

        {/* Columna derecha - Calendario semanal */}
        <div className="flex-1 w-full lg:w-3/4 flex flex-col overflow-hidden">
          <div className="flex justify-end mb-2">
            <DownloadCalendarPDF />
          </div>

          <div className="flex flex-col gap-2 px-1 sm:px-0 mb-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-xs font-semibold text-stone-600">
                Tipo de Servicio
                <select
                  value={filters.tipoServicio}
                  onChange={(e) => handleFilterField("tipoServicio", e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="">Todos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="instalacion">Instalación</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-stone-600">
                Tipo de Mantenimiento
                <select
                  value={filters.tipoMantenimiento}
                  onChange={(e) => handleFilterField("tipoMantenimiento", e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="">Todos</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-stone-600">
                Tipo de Registro
                <select
                  value={filters.tipoCita}
                  onChange={(e) => handleFilterField("tipoCita", e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="">Todos</option>
                  <option value="solicitud">Solicitud</option>
                  <option value="orden">Orden</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-stone-600">
                Estado
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterField("estado", e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="">Todos</option>
                  {appointmentStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Calendario con scroll */}
          <div className="flex-1 overflow-auto">
            <WeeklyCalendar
              selectedDate={selectedDate}
              search={search}
              filters={filters}
            />
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}
