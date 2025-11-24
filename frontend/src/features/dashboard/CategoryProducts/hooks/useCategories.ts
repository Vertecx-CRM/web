import { useState, useEffect } from "react";
import { Category, CreateCategoryData, EditCategoryData } from "../types/typeCategoryProducts";
import { showSuccess } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../connection/categoryApi";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditCategoryData | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar todas las categorías al iniciar
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();

        // Aseguramos que data sea un arreglo y tenga las claves correctas
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.warn("⚠️ El backend no devolvió un array válido:", data);
        }

      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Crear categoría
  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    try {
      const newCategory = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon || "",
        status: true,
      };

      const response = await createCategory(newCategory);

      // Si el backend devuelve la categoría directamente o dentro de .data
      const created = response.data ?? response;

      setCategories((prev) => [...prev, created]);
      showSuccess("Categoría creada exitosamente!");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };

  // Editar categoría
  const handleEditCategory = async (id: number, categoryData: EditCategoryData) => {
    try {
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

      showSuccess("Categoría actualizada exitosamente!");
      setEditingCategory(null);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (category: Category): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: category.name,
        itemType: "categoría",
        successMessage: `La categoría "${category.name}" ha sido eliminada correctamente.`,
        errorMessage: "No se pudo eliminar la categoría. Por favor, intenta nuevamente.",
      },
      async () => {
        try {
          await deleteCategory(category.id);
          setCategories((prev) => prev.filter((c) => c.id !== category.id));
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
        }
      }
    );
  };

  // Acciones de vista y edición
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
