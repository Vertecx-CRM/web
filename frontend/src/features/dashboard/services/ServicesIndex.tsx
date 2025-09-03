"use client";

import { useState } from "react";
import { Column, DataTable } from "@/features/dashboard/components/DataTable";
import { useLoader } from "@/shared/components/loader";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  status: "Activo" | "Inactivo";
};

const mockServices: Service[] = [
  {
    id: 1,
    name: "Mantenimiento preventivo",
    description: "Revisión periódica de equipos",
    price: "$80.000",
    category: "Mantenimiento Preventivo",
    status: "Inactivo",
  },
  {
    id: 2,
    name: "Mantenimiento correctivo",
    description: "Reparación de fallas o averías",
    price: "$100.000",
    category: "Mantenimiento Correctivo",
    status: "Activo",
  },
  {
    id: 3,
    name: "Instalación de cámaras",
    description: "Instalación completa de cámaras de seguridad",
    price: "$150.000",
    category: "Instalación",
    status: "Activo",
  },
];

export default function ServiciosIndex() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const { showLoader, hideLoader } = useLoader();

  const handleDelete = async (row: Service) => {
    if (!confirm(`¿Eliminar servicio "${row.name}"?`)) return;
    showLoader(); 
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simula petición
      setServices((prev) => prev.filter((p) => p.id !== row.id));
    } finally {
      hideLoader();
    }
  };


  const columns: Column<Service>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "description", header: "Descripción" },
    { key: "price", header: "Precio" },
    { key: "category", header: "Categoría" },
    {
      key: "image",
      header: "Imagen",
      render: () => (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-xs">📷</span>
        </div>
      ),
    },
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
      <DataTable<Service>
        data={services}
        columns={columns}
        searchableKeys={["name", "description", "category", "status"]}
        pageSize={10}
        onView={(row) => alert(`Ver servicio "${row.name}"`)}
        onEdit={(row) => alert(`Editar servicio "${row.name}"`)}
        onDelete={handleDelete}
        onCreate={() => alert("Abrir modal: crear servicio")}
        createButtonText="Crear servicio"
      />
    </div>
  );
}
