"use client";
import Colors from "@/shared/theme/colors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataTable } from "../components/datatable/DataTable";
import EditCategoryModal from "./components/EditCategoryModal/EditCategory";
import ViewCategoryModal from "./components/ViewCategoryModal/ViewCategory";
import CreateCategoryModal from "./components/CreateCategoryModal/CreateCategory";
import { useCategories } from "./hooks/useCategories";
import { Category, EditCategoryData } from "./types/typeCategoryProducts";
import { Column } from "../components/datatable/types/column.types";

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
    handleDeleteCategory,
    closeModals,
  } = useCategories();

  const columns: Column<Category>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    {
      key: "description",
      header: "Descripción",
      render: (row: Category) => {
        const desc =
          row.description && row.description.trim() !== ""
            ? row.description
            : "No hay descripción";

        const maxLength = 60;
        const truncated =
          desc.length > maxLength ? desc.substring(0, maxLength) + "..." : desc;

        return (
          <div
            title={desc}
            className="flex justify-center items-center text-center w-full h-full"
          >
            <span
              className={`block max-w-[250px] truncate ${desc === "No hay descripción"
                  ? "text-gray-400 italic"
                  : "text-gray-700"
                }`}
            >
              {truncated}
            </span>
          </div>
        );
      },
    },

    {
      key: "status",
      header: "Estado",
      render: (row: Category) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: row.status
              ? Colors.states.success
              : Colors.states.inactive,
          }}
        >
          {row.status ? "Activo" : "Inactivo"}
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
              categories={categories}
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
              categories={categories}
            />

            {/* Modal de Ver Categoría */}
            <ViewCategoryModal
              isOpen={!!viewingCategory}
              category={viewingCategory}
              onClose={closeModals}
            />

            <DataTable<Category>
              module="categories"
              data={categories}
              columns={columns}
              pageSize={10}
              searchableKeys={["id", "name", "description", "status"]}
              onCreate={() => setIsCreateModalOpen(true)}
              createButtonText="Crear Categoría"
              searchPlaceholder="Buscar categorías..."
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteCategory}
            />
          </div>
        </main>
      </div>
    </div>
  );
}