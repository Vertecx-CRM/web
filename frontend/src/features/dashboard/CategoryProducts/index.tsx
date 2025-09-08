"use client";
import Colors from "@/shared/theme/colors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataTable, Column } from "../components/DataTable";
import EditCategoryModal from "./components/EditCategoryModal/EditCategory";
import ViewCategoryModal from "./components/ViewCategoryModal/ViewCategory";
import CreateCategoryModal from "./components/CreateCategoryModal/CreateCategory";
import { useCategories } from "./hooks/useCategories";
import { Category, EditCategoryData } from "./types/typeCategoryProducts";

export default function CategoriesPage() {
  const {
    categories,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingCategory,
    viewingCategory,
    handleCreateCategory,
    handleEditCategory,
    handleView,
    handleEdit,
    handleDelete,
    closeModals
  } = useCategories();

  const columns: Column<Category>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "descripcion", header: "Descripción" },
    {
      key: "estado",
      header: "Estado",
      render: (row: Category) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: row.estado === "Activo" ? Colors.states.success : Colors.states.inactive,
          }}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="flex-1 px-6 py-6">
            
            {/* Modal de Crear Categoría */}
            <CreateCategoryModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateCategory}
            />

            {/* Modal de Editar Categoría */}
            <EditCategoryModal
              isOpen={!!editingCategory}
              category={editingCategory}
              onClose={closeModals}
              onSave={(categoryData: EditCategoryData) => {
                if (editingCategory) {
                  handleEditCategory(editingCategory.id, categoryData);
                }
              }}
            />

            {/* Modal de Ver Categoría */}
            <ViewCategoryModal
              isOpen={!!viewingCategory}
              category={viewingCategory}
              onClose={closeModals}
            />

            <DataTable<Category>
              data={categories}
              columns={columns}
              pageSize={10}
              searchableKeys={["id", "nombre", "descripcion", "estado"]}
              onCreate={() => setIsCreateModalOpen(true)}
              createButtonText="Crear Categoría"
              searchPlaceholder="Buscar categorías..."
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
    </div>
  );
}