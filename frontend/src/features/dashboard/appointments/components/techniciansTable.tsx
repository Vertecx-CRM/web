import React from "react";
import Colors from "@/shared/theme/colors";
import { Technician } from "../types/typeAppointment";

interface TechniciansTableProps {
  technicians: Technician[];
  onRemoveTechnician: (id: number) => void;
}

export const TechniciansTable: React.FC<TechniciansTableProps> = ({
  technicians,
  onRemoveTechnician
}) => {
  if (technicians.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border" style={{ borderColor: Colors.table.lines }}>
        <thead>
          <tr style={{ backgroundColor: Colors.table.header }}>
            <th className="px-4 py-2 text-left" style={{ borderColor: Colors.table.lines, color: Colors.texts.primary }}>
              Nombre
            </th>
            <th className="px-4 py-2 text-left" style={{ borderColor: Colors.table.lines, color: Colors.texts.primary }}>
              Título
            </th>
            <th className="px-4 py-2 text-left" style={{ borderColor: Colors.table.lines, color: Colors.texts.primary }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {technicians.map(tech => (
            <tr key={tech.id} style={{ backgroundColor: Colors.table.primary }}>
              <td className="px-4 py-2" style={{ borderColor: Colors.table.lines, color: Colors.texts.primary }}>
                {tech.nombre}
              </td>
              <td className="px-4 py-2" style={{ borderColor: Colors.table.lines, color: Colors.texts.primary }}>
                {tech.titulo}
              </td>
              <td className="px-4 py-2" style={{ borderColor: Colors.table.lines }}>
                <button
                  type="button"
                  onClick={() => onRemoveTechnician(tech.id)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <img src="/icons/delete.svg" className="h-4 w-4" alt="Eliminar" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};