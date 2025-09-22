import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";
import DownloadXLSXButton from "../../../components/DownloadXLSXButton"; // <-- importamos el botón

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
            src={p.image instanceof File ? URL.createObjectURL(p.image) : p.image}
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
        <DownloadXLSXButton
          data={products}
          fileName="reporte_productos.xlsx"
        />
      }
    />
  );
};

export default ProductsTable;
