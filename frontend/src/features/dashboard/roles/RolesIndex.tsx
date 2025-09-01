"use client";

import { useState } from "react";
import { Column, DataTable } from "@/features/dashboard/components/DataTable";
import { Plus } from "lucide-react";

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

    const columns: Column<Role>[] =  [
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
]

    return (
    <div className="flex flex-col gap-4">
      {/* Aquí arriba va tu header con el botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestión de Roles</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white"
          style={{ backgroundColor: "#CC0000" }}
          onClick={() => alert("Abrir modal: crear rol")}
        >
          Crear rol
        </button>
      </div>

      <DataTable<Role>
        data={roles}
        columns={columns}
        searchableKeys={["name", "status"]}
        pageSize={10}
        onDelete={(row) => {
          if (!confirm(`Eliminar rol "${row.name}"?`)) return;
          setRoles((prev) => prev.filter((r) => r.id !== row.id));
        }}
      />
    </div>
    
    )
}