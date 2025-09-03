"use client";

import { useState } from "react";
import { Column, DataTable } from "@/features/dashboard/components/DataTable";
import { useLoader } from "@/shared/components/loader";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Activo" | "Inactivo";
};

const mockProducts: Product[] = [
  { id: 1, name: "Cámara IP", category: "Seguridad", price: 350000, stock: 12, status: "Activo" },
  { id: 2, name: "Router Wi-Fi", category: "Redes", price: 180000, stock: 0, status: "Inactivo" },
  { id: 3, name: "Kit Herramientas", category: "Accesorios", price: 95000, stock: 8, status: "Activo" },
];

export default function ProductsIndex() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { showLoader, hideLoader } = useLoader();

  const handleDelete = async (row: Product) => {
    if (!confirm(`¿Eliminar producto "${row.name}"?`)) return;
    showLoader(); 
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simula petición
      setProducts((prev) => prev.filter((p) => p.id !== row.id));
    } finally {
      hideLoader();
    }
  };

  const columns: Column<Product>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "category", header: "Categoría" },
    {
      key: "price",
      header: "Precio",
      render: (row) => `$${row.price.toLocaleString("es-CO")}`,
    },
    { key: "stock", header: "Stock" },
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
      <DataTable<Product>
        data={products}
        columns={columns}
        searchableKeys={["name", "category", "status"]}
        pageSize={10}
        onView={(row) => alert(`Ver producto "${row.name}"`)}
        onEdit={(row) => alert(`Editar producto "${row.name}"`)}
        onDelete={handleDelete}
        onCreate={() => alert("Abrir modal: crear producto")}
        createButtonText="Crear producto"
      />
    </div>
  );
}
