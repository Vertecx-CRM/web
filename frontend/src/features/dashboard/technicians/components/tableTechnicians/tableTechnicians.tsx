"use client";

import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";
import { Technician } from "../../types/typesTechnicians";

interface TechniciansTableProps {
  technicians: Technician[];
  onView: (t: Technician) => void;
  onEdit: (t: Technician) => void;
  onDelete: (t: Technician) => void;
  onCreate: () => void;
}

const TechniciansTable: React.FC<TechniciansTableProps> = ({
  technicians,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const columns: Column<Technician>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Nombre",
      render: (t) => `${t.name} ${t.lastName}`,
    },
    {
      key: "documentType",
      header: `Tipo
Documento`,
    },
    {
      key: "documentNumber",
      header: `Número
Documento`,
    },
    { key: "phone", header: "Teléfono" },
    {
      key: "email",
      header: `Correo
Electrónico`,
    },
    {
      key: "status",
      header: "Estado",
      render: (t) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              t.status === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {t.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Technician>
      data={technicians}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "name",
        "lastName",
        "documentNumber",
        "phone",
        "email",
        "status",
      ]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar técnicos..."
      createButtonText="Crear Técnico"
    />
  );
};

export default TechniciansTable;
