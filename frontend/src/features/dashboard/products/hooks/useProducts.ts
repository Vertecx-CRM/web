import { useState } from "react";
import { Product, CreateProductData, EditProductData } from "../types/typesProducts";
import { initialProducts } from "../mocks/mockProducts";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

const validateProductWithNotification = (
  productData: CreateProductData | EditProductData,
  existingProducts: Product[],
  editingId?: number
): boolean => {
  if (!productData.name.trim()) {
    showWarning("El nombre del producto es obligatorio");
    return false;
  }

  if (!productData.category) {
    showWarning("Debe seleccionar una categoría");
    return false;
  }

  if (productData.price <= 0) {
    showWarning("El precio debe ser mayor a cero");
    return false;
  }

  if (productData.stock < 0) {
    showWarning("El stock no puede ser negativo");
    return false;
  }

  return true;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const isEditModalOpen = editingProduct !== null;
  const isViewModalOpen = viewingProduct !== null;

  const selectedProduct = editingProduct ?? viewingProduct ?? null;

  const handleCreateProduct = (payload: CreateProductData) => {
    if (!validateProductWithNotification(payload, products)) return;

    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: nextId,
      name: payload.name.trim(),
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      state: "Activo",
      image: payload.image,
      description: payload.description || "",
    };
    setProducts(prev => [...prev, newProduct]);
    setIsCreateModalOpen(false);
    showSuccess("Producto creado exitosamente!");
  };

  const handleEditProduct = (id: number, payload: EditProductData) => {
    if (!validateProductWithNotification(payload, products, id)) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...payload, name: payload.name.trim() }
          : p
      )
    );
    setEditingProduct(null);
    showSuccess("Producto actualizado exitosamente!");
  };

  const handleDeleteProduct = async (product: Product): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: product.name,
        itemType: "producto",
        successMessage: `El producto "${product.name}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el producto. Intenta nuevamente.",
      },
      () => {
        setProducts(prev => prev.filter(p => p.id !== product.id));
      }
    );
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      state: product.state,
      image: product.image,
      description: product.description,
    });
  };

  const handleDelete = async (product: Product) => {
    await handleDeleteProduct(product);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  return {
    products,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen: (v: boolean) => { if (!v) setEditingProduct(null); },
    isViewModalOpen,
    setIsViewModalOpen: (v: boolean) => { if (!v) setViewingProduct(null); },
    selectedProduct,
    handleCreateProduct,
    handleEditProduct,
    handleView,
    handleEdit,
    handleDelete,
    closeModals,
    editingProduct,
    viewingProduct,
    setEditingProduct,
    setViewingProduct,
  };
};
