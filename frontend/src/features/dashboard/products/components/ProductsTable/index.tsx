"use client";

import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";
import DownloadXLSXButton from "../../../components/DownloadXLSXButton";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";

interface ProductsTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const columns: Column<Product>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "category", header: "Categoría" },
    {
      key: "price",
      header: "Precio",
      render: (p) => `$${p.price.toLocaleString("es-CO")}`,
    },
    { key: "stock", header: "Stock" },
    {
      key: "image",
      header: "Imagen",
      render: (p) =>
        p.image ? (
          <img
            src={p.image}
            alt={p.name}
            className="w-10 h-10 object-cover rounded-md border border-gray-200"
          />
        ) : (
          <span className="text-gray-400 text-xs italic">Sin imagen</span>
        ),
    },
    {
      key: "state",
      header: "Estado",
      render: (p) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              p.state === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {p.state}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable<Product>
        data={products}
        columns={columns}
        pageSize={10}
        searchableKeys={["id", "name", "category", "state"]}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreate={onCreate}
        searchPlaceholder="Buscar productos..."
        createButtonText="Crear Producto"
        rightActions={
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <DownloadXLSXButton
                id="download-excel-btn"
                data={products as unknown as Record<string, unknown>[]}
                fileName="reporte_productos.xlsx"
              />
            </div>

            {/* Mobile Floating Button */}
            {/* Mobile Floating Button */}
            <button
              onClick={() =>
                document
                  .querySelector<HTMLButtonElement>("#download-excel-btn")
                  ?.click()
              }
              className="fixed bottom-20 right-6 z-50 flex md:hidden items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-transform hover:scale-105"
              style={{ background: "#B20000" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </button>
          </>
        }
      />
    </>
  );
};

export default ProductsTable;
