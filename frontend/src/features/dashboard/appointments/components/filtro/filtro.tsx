// components/AppointmentFilters.tsx
import React from "react";
import { appointmentStates, technicians, tiposCita } from "../../mocks/mockAppointment";

export interface FiltersState {
  technicians: number[];
  tipoServicio: string;
  tipoMantenimiento: string;
  tipoCita: string;
  estado: string;
  cliente: string;
  fechaDesde: string;
  fechaHasta: string;
}

interface AppointmentFiltersProps {
  values: FiltersState;
  onChange: (values: FiltersState) => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  values,
  onChange,
}) => {
  // helper para actualizar
  const updateField = (field: keyof FiltersState, value: any) => {
    onChange({ ...values, [field]: value });
  };

  const toggleTechnician = (id: number) => {
    const current = values.technicians;
    updateField(
      "technicians",
      current.includes(id)
        ? current.filter((t) => t !== id)
        : [...current, id]
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">Filtros de Citas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Técnicos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Técnicos
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {technicians.map((tech) => (
              <label key={tech.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={values.technicians.includes(tech.id)}
                  onChange={() => toggleTechnician(tech.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{tech.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tipo de Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Servicio
          </label>
          <select
            value={values.tipoServicio}
            onChange={(e) => updateField("tipoServicio", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="instalacion">Instalación</option>
          </select>
        </div>

        {/* Tipo de Mantenimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Mantenimiento
          </label>
          <select
            value={values.tipoMantenimiento}
            onChange={(e) => updateField("tipoMantenimiento", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
          </select>
        </div>

        {/* Tipo de Cita */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cita
          </label>
          <select
            value={values.tipoCita}
            onChange={(e) => updateField("tipoCita", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {tiposCita.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={values.estado}
            onChange={(e) => updateField("estado", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {appointmentStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
