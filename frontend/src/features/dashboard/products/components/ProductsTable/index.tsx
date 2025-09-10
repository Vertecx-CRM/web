import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";

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
      key: "status",
      header: "Estado",
      render: (p) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              p.status === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {p.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Product>
      data={products}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "name", "category", "status"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar productos..."
      createButtonText="Crear Producto"
    />
  );
};

export default ProductsTable;
