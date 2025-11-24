import { useEffect, useState } from "react";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { showSuccess } from "@/shared/utils/notifications";
import { useLoader } from "@/shared/components/loader";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../connection/categoryApi";
import {
  Category,
  CreateCategoryData,
  EditCategoryData,
} from "../types/typeCategoryProducts";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<EditCategoryData | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const applyCategoriesResponse = (data: any) => {
    if (Array.isArray(data)) {
      setCategories(data);
    } else if (data?.data && Array.isArray(data.data)) {
      setCategories(data.data);
    } else {
      console.warn("El backend no devolvio un array valido:", data);
    }
  };

  const refreshCategories = async () => {
    const data = await fetchCategories();
    applyCategoriesResponse(data);
  };

  // Cargar todas las categorias al iniciar
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      showLoader();
      try {
        const data = await fetchCategories();
        applyCategoriesResponse(data);
      } catch (error) {
        console.error("Error al cargar categorias:", error);
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    load();
  }, []);

  // Crear categoria
  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    try {
      showLoader();
      const newCategory = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon || "",
        status: true,
      };

      const response = await createCategory(newCategory);
      const created = response.data ?? response;

      setCategories((prev) => [...prev, created]);
      showSuccess("Categoria creada exitosamente!");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear categoria:", error);
    } finally {
      hideLoader();
    }
  };

  // Editar categoria
  const handleEditCategory = async (
    id: number,
    categoryData: EditCategoryData
  ) => {
    try {
      showLoader();
      const updatedCategory = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        status: categoryData.status,
      };

      const response = await updateCategory(id, updatedCategory);
      const updated = response.data ?? response;

      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );

      showSuccess("Categoria actualizada exitosamente!");
      setEditingCategory(null);
    } catch (error) {
      console.error("Error al actualizar categoria:", error);
    } finally {
      hideLoader();
    }
  };

  // Eliminar categoria
  const handleDeleteCategory = async (
    category: Category
  ): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: category.name,
        itemType: "categoria",
        successMessage: `La categoria "${category.name}" ha sido eliminada correctamente.`,
        errorMessage:
          "No se pudo eliminar la categoria. Por favor, intenta nuevamente.",
      },
      async () => {
        try {
          showLoader();
          await deleteCategory(category.id);
          await refreshCategories();
        } catch (error) {
          console.error("Error al eliminar categoria:", error);
        } finally {
          hideLoader();
        }
      }
    );
  };

  // Acciones de vista y edicion
  const handleView = (category: Category) => setViewingCategory(category);
  const handleEdit = (category: Category) => {
    const editData: EditCategoryData = {
      id: category.id,
      name: category.name,
      description: category.description,
      status: category.status,
      icon: category.icon,
    };
    setEditingCategory(editData);
  };

  const closeModals = () => {
    setEditingCategory(null);
    setViewingCategory(null);
    setIsCreateModalOpen(false);
  };

  return {
    categories,
    loading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingCategory,
    viewingCategory,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleView,
    handleEdit,
    closeModals,
  };
};
