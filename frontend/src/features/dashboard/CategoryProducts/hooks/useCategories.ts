import { useEffect, useRef, useState } from "react";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { showSuccess } from "@/shared/utils/notifications";
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
  const [loading, setLoading] = useState(true);

  const waitForRender = async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  };

  const applyCategoriesResponse = async (response: any) => {
    const payload = response?.data ?? response;
    const sortCategories = (list: Category[]) =>
      [...list].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

    if (Array.isArray(payload)) {
      setCategories(sortCategories(payload));
    } else if (payload?.data && Array.isArray(payload.data)) {
      setCategories(sortCategories(payload.data));
    } else {
      console.warn("El backend no devolvio un array valido:", response);
      return;
    }
    await waitForRender();
  };

  const refreshCategories = async () => {
    const response = await fetchCategories();
    await applyCategoriesResponse(response);
    return response?.status ?? (Array.isArray(response) ? 200 : undefined);
  };

  // Cargar todas las categorias al iniciar
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const status = await refreshCategories();
        if (status !== 200) {
          throw new Error(`Refresh categorias devolvio status ${status}`);
        }
      } catch (error) {
        console.error("Error al cargar categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      load();
    }
  }, []);

  // Crear categoria
  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    setLoading(true);
    try {
      setIsCreateModalOpen(false);
      const newCategory = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon || "",
        status: true,
      };

      const createdResp = await createCategory(newCategory);
      const created = createdResp?.data ?? createdResp;
      if (created) {
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
        );
      }
      const status = await refreshCategories();
      if (status !== 200) {
        throw new Error(`Refresh categorias devolvio status ${status}`);
      }
      showSuccess("Categoria creada exitosamente!");
      await waitForRender();
    } catch (error) {
      console.error("Error al crear categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  // Editar categoria
  const handleEditCategory = async (
    id: number,
    categoryData: EditCategoryData
  ) => {
    setLoading(true);
    try {
      const updatedCategory = {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        status: categoryData.status,
      };

      const updatedResp = await updateCategory(id, updatedCategory);
      const updated = updatedResp?.data ?? updatedResp;
      if (updated) {
        setCategories((prev) =>
          prev
            .map((cat) => (cat.id === id ? updated : cat))
            .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
        );
      }
      const status = await refreshCategories();
      if (status !== 200) {
        throw new Error(`Refresh categorias devolvio status ${status}`);
      }

      showSuccess("Categoria actualizada exitosamente!");
      await waitForRender();
      setEditingCategory(null);
    } catch (error) {
      console.error("Error al actualizar categoria:", error);
    } finally {
      setLoading(false);
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
        setLoading(true);
        try {
          await deleteCategory(category.id);
          setCategories((prev) =>
            prev
              .filter((cat) => cat.id !== category.id)
              .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
          );
          const status = await refreshCategories();
          if (status !== 200) {
            throw new Error(`Refresh categorias devolvio status ${status}`);
          }
          await waitForRender();
        } catch (error) {
          console.error("Error al eliminar categoria:", error);
        } finally {
          setLoading(false);
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
