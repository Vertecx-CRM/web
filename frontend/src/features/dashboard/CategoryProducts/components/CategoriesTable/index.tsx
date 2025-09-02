
import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import { Category } from "../../types";
import Colors from "@/shared/theme/colors";

interface CategoriesTableProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onCreate: () => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onView,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Definición de columnas para el DataTable
  const columns: Column<Category>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "descripcion", header: "Descripción" },
    { 
      key: "estado", 
      header: "Estado",
      render: (category: Category) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: category.estado === "Activo" 
              ? Colors.states.success 
              : Colors.states.inactive
          }}
        >
          {category.estado}
        </span>
      )
    },
  ];

  return (
    <DataTable<Category>
      data={categories}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "nombre", "descripcion", "estado"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar categorías..."
      createButtonText="Crear Categoría"
    />
  );
};

export default CategoriesTable;