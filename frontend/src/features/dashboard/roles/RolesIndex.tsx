"use client";

import { useState } from "react";
import { Column, DataTable } from "@/features/dashboard/components/DataTable";
import { Plus } from "lucide-react";
import { useLoader } from "@/shared/components/loader";


type Role = {
  id: number,
  name: string,
  status: "Activo" | "Inactivo";
}

const mockRoles: Role[] = [
  { id: 1, name: "Admin", status: "Inactivo" },
  { id: 2, name: "Técnico", status: "Activo" },
]

export default function RolesIndex() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
    const { showLoader, hideLoader } = useLoader();

  const handleDelete = async (row: Role) => {
    if (!confirm(`¿Eliminar rol "${row.name}"?`)) return;
    showLoader(); 
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simula petición
      setRoles((prev) => prev.filter((p) => p.id !== row.id));
    } finally {
      hideLoader();
    }
  };

  const columns: Column<Role>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <span className={row.status === "Activo" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {row.status}
        </span>
      )
    }    
  ];

  return(
    <div className="flex flex-col gap-4">
        <DataTable<Role>
          data={roles}
          columns={columns}
          searchableKeys={["name", "status"]}
          pageSize={10}
          onView={(row) => alert(`Ver rol "${row.name}"`)}
          onEdit={(row) => alert(`Editar rol "${row.name}"`)}
          onDelete={handleDelete}
          onCreate={() => alert("Abrir modal: crear rol")}
          createButtonText="Crear rol"
        />

    </div>
  )
}
