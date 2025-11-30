// components/AppointmentFilters.tsx
import React, { useEffect, useState } from "react";
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
      <h3 className="text-lg font-semibold mb-4">Filtrar por Tecnicos</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tecnicos
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {loadingTechs && (
            <div className="text-xs text-gray-500 col-span-2">
              Cargando tecnicos...
            </div>
          )}
          {!loadingTechs && techOptions.length === 0 && (
            <div className="text-xs text-gray-500 col-span-2">
              Sin tecnicos disponibles
            </div>
          )}
          {techOptions.map((tech) => (
            <label
              key={tech.id}
              className="flex items-center space-x-2 rounded-md border border-transparent px-2 py-1 hover:border-stone-200 transition"
            >
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
    </div>
  );
};

