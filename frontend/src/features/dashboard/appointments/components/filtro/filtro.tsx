// components/AppointmentFilters.tsx
import React, { useEffect, useState } from "react";
import { appointmentStates, tiposCita } from "../../mocks/mockAppointment";
import { api } from "@/lib/api";
import { Technician } from "../../types/typeAppointment";

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
  const [techOptions, setTechOptions] = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);

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

  useEffect(() => {
    const loadTechnicians = async () => {
      setLoadingTechs(true);
      try {
        const { data } = await api.get("/technicians");
        if (Array.isArray(data)) {
          const mapped = data.map((t: any) => {
            const id = t?.technicianid ?? t?.id ?? 0;
            const nombre = [t?.users?.name, t?.users?.lastname].filter(Boolean).join(" ").trim() || `Tecnico ${id}`;
            const titulo =
              t?.technicianTypeMaps?.[0]?.techniciantype?.name ??
              t?.users?.roles?.name ??
              "Tecnico";
            return { id: Number(id), nombre, titulo } as Technician;
          });
          setTechOptions(mapped.filter((t) => Number.isFinite(t.id) && t.id > 0));
        } else {
          setTechOptions([]);
        }
      } catch (err) {
        console.error("No se pudieron cargar los tecnicos", err);
        setTechOptions([]);
      } finally {
        setLoadingTechs(false);
      }
    };

    loadTechnicians();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">Filtros de Citas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tcnicos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tecnicos
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {loadingTechs && (
              <div className="text-xs text-gray-500">Cargando tecnicos...</div>
            )}
            {!loadingTechs && techOptions.length === 0 && (
              <div className="text-xs text-gray-500">Sin tecnicos disponibles</div>
            )}
            {techOptions.map((tech) => (
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
            <option value="instalacion">Instalacion</option>
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

