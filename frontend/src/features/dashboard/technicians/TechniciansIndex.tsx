"use client";

import { useState } from "react";
import { Column, DataTable } from "@/features/dashboard/components/DataTable";
import { useLoader } from "@/shared/components/loader";

type Technician = {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  status: "Activo" | "Inactivo";
};

const mockTechnicians: Technician[] = [
  {
    id: 1,
    name: "Carlos Ramírez",
    specialty: "Electricista",
    phone: "3001234567",
    status: "Activo",
  },
  {
    id: 2,
    name: "Ana López",
    specialty: "Redes",
    phone: "3019876543",
    status: "Inactivo",
  },
  {
    id: 3,
    name: "Miguel Torres",
    specialty: "CCTV",
    phone: "3024567890",
    status: "Activo",
  },
];

export default function TechniciansIndex() {
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const { showLoader, hideLoader } = useLoader();

  const handleDelete = async (row: Technician) => {
    if (!confirm(`¿Eliminar técnico "${row.name}"?`)) return;
    showLoader();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simula petición
      setTechnicians((prev) => prev.filter((p) => p.id !== row.id));
    } finally {
      hideLoader();
    }
  };

  const columns: Column<Technician>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "specialty", header: "Especialidad" },
    { key: "phone", header: "Teléfono" },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <span
          className={
            row.status === "Activo"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable<Technician>
        data={technicians}
        columns={columns}
        searchableKeys={["name", "specialty", "phone", "status"]}
        pageSize={10}
        onView={(row) => alert(`Ver técnico "${row.name}"`)}
        onEdit={(row) => alert(`Editar técnico "${row.name}"`)}
        onDelete={handleDelete}
        onCreate={() => alert("Abrir modal: crear técnico")}
        createButtonText="Crear técnico"
      />
    </div>
  );
}
