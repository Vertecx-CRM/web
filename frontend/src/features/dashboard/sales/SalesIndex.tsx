"use client";

import { useState } from "react";
import {
  Column,
  DataTable,
} from "@/features/dashboard/components/datatable/DataTable";
import { useLoader } from "@/shared/components/loader";

type Sale = {
  id: number;
  codigo: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: "Finalizada" | "Anulada";
};

const mockSales: Sale[] = [
  {
    id: 1,
    codigo: "VEN-001",
    cliente: "Diana Inguia",
    fecha: "02/05/2025",
    total: 310000,
    estado: "Finalizada",
  },
  {
    id: 2,
    codigo: "VEN-002",
    cliente: "Juliana Gómez",
    fecha: "02/05/2025",
    total: 2567500,
    estado: "Anulada",
  },
  {
    id: 3,
    codigo: "VEN-003",
    cliente: "Wayne Perez",
    fecha: "01/04/2025",
    total: 2250.0,
    estado: "Anulada",
  },
  {
    id: 4,
    codigo: "VEN-004",
    cliente: "Nataly Martinez",
    fecha: "28/03/2025",
    total: 850000,
    estado: "Finalizada",
  },
];

export default function SalesIndex() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const { showLoader, hideLoader } = useLoader();

  const handleDelete = async (row: Sale) => {
    if (!confirm(`¿Eliminar venta "${row.codigo}"?`)) return;
    showLoader();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simula petición
      setSales((prev) => prev.filter((s) => s.id !== row.id));
    } finally {
      hideLoader();
    }
  };

  const columns: Column<Sale>[] = [
    {
      key: "id",
      header: "#",
      render: (row) => row.id.toString(),
    },
    {
      key: "codigo",
      header: "Código Venta",
    },
    {
      key: "cliente",
      header: "Cliente",
    },
    {
      key: "fecha",
      header: "Fecha",
    },
    {
      key: "total",
      header: "Total",
      render: (row) => `$${row.total.toLocaleString("es-CO")}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <span
          className={
            row.estado === "Finalizada"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable<Sale>
        data={sales}
        columns={columns}
        searchableKeys={["codigo", "cliente", "estado"]}
        pageSize={10}
        onView={(row) => alert(`Ver venta "${row.codigo}"`)}
        onEdit={(row) => alert(`Editar venta "${row.codigo}"`)}
        onDelete={handleDelete}
        onCreate={() => alert("Abrir modal: crear venta")}
        createButtonText="Nueva Venta"
      />
    </div>
  );
}
