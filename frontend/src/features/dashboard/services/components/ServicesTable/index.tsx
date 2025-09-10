"use client";

import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";

interface ServicesTableProps {
  services: Service[];
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onCreate: () => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const columns: Column<Service>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "category", header: "Categoría" },
    {
      key: "price",
      header: "Precio",
      render: (s) => `$${s.price.toLocaleString("es-CO")}`,
    },
    {
      key: "status",
      header: "Estado",
      render: (s) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: s.status === "Activo" ? Colors.states.success : Colors.states.inactive,
          }}
        >
          {s.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Service>
      data={services}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "name", "category", "status"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar servicios..."
      createButtonText="Crear Servicio"
    />
  );
};

export default ServicesTable;
