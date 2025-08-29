"use client";

import { Eye, FileDown, CheckCircle2, XCircle } from "lucide-react";
import { Column, DataTable } from "./components/DataTable";

// Tipo de datos de cada compra
type Purchase = {
  id: number;
  orderNumber: string;
  supplier: string;
  date: string;
  amount: number;
  status: "Pendiente" | "Aprobada" | "Rechazada";
};

// Mock data temporal
const purchases: Purchase[] = [
  {
    id: 1,
    orderNumber: "OC-2025-001",
    supplier: "Proveedor A",
    date: "2025-08-20",
    amount: 1200.5,
    status: "Pendiente",
  },
  {
    id: 2,
    orderNumber: "OC-2025-002",
    supplier: "Proveedor B",
    date: "2025-08-21",
    amount: 530.0,
    status: "Aprobada",
  },
  {
    id: 3,
    orderNumber: "OC-2025-003",
    supplier: "Proveedor C",
    date: "2025-08-22",
    amount: 890.75,
    status: "Rechazada",
  },
];

export default function Purchases() {
  // Definición de columnas de la tabla
  const columns: Column<Purchase>[] = [
    { key: "orderNumber", header: "N° Orden" },
    { key: "supplier", header: "Proveedor" },
    { key: "date", header: "Fecha" },
    {
      key: "amount",
      header: "Monto",
      render: (row) => (
        <span className="font-medium text-gray-700">
          ${row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <span
          className={
            row.status === "Aprobada"
              ? "text-green-600 font-medium"
              : row.status === "Pendiente"
              ? "text-yellow-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Listado de Compras</h1>

      <DataTable
        data={purchases}
        columns={columns}
        searchableKeys={["orderNumber", "supplier", "status"]}
        pageSize={5}
        onView={(row) => alert(`Ver detalle de ${row.orderNumber}`)}
        onEdit={(row) => alert(`Editar ${row.orderNumber}`)}
        onDelete={(row) => alert(`Eliminar ${row.orderNumber}`)}
      />
    </div>
  );
}
