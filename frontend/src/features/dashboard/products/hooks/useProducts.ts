import { useState } from "react";
import { Product, CreateProductData, EditProductData } from "../types/typesProducts";
import { initialProducts } from "../mocks/mockProducts";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

const convertImageToString = (image?: File | string | null): string => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return URL.createObjectURL(image);
};

const validateProductWithNotification = (
  productData: CreateProductData | EditProductData
): boolean => {
  if (!productData.name.trim()) { showWarning("El nombre del producto es obligatorio"); return false; }
  if (!productData.category) { showWarning("Debe seleccionar una categoría"); return false; }
  if (productData.price <= 0) { showWarning("El precio debe ser mayor a cero"); return false; }
  if (productData.stock < 0) { showWarning("El stock no puede ser negativo"); return false; }
  return true;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem("landingProducts");
    if (!stored) return initialProducts.map(p => ({ ...p, image: convertImageToString(p.image) }));

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return initialProducts.map(p => ({ ...p, image: convertImageToString(p.image) }));
      return parsed.map((p: Product) => ({
        ...p,
        image: convertImageToString(p.image),
      }));
    } catch {
      return initialProducts.map(p => ({ ...p, image: convertImageToString(p.image) }));
    }
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const isEditModalOpen = !!editingProduct;
  const isViewModalOpen = !!viewingProduct;
  const selectedProduct = editingProduct ?? viewingProduct ?? null;

  const updateLocalStorage = (updated: Product[]) => {
    try {
      localStorage.setItem("landingProducts", JSON.stringify(updated));
    } catch {
      showWarning("No se pudo guardar en localStorage, espacio excedido");
    }
  };

  const handleCreateProduct = (payload: CreateProductData) => {
    if (!validateProductWithNotification(payload)) return;

    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: nextId,
      name: payload.name.trim(),
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      state: "Activo",
      image: convertImageToString(payload.image),
      description: payload.description ?? "",
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    updateLocalStorage(updated);
    setIsCreateModalOpen(false);
    showSuccess("Producto creado exitosamente!");
  };

  const handleEditProduct = (id: number, payload: EditProductData) => {
    if (!validateProductWithNotification(payload)) return;

    const updated = products.map(p =>
      p.id === id ? { ...p, ...payload, name: payload.name.trim(), image: convertImageToString(payload.image) } : p
    );
    setProducts(updated);
    updateLocalStorage(updated);
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
        const updated = products.filter(p => p.id !== product.id);
        setProducts(updated);
        updateLocalStorage(updated);
      }
    );
  };

  const handleView = (product: Product) => setViewingProduct(product);
  const handleEdit = (product: Product) => setEditingProduct({ ...product });
  const handleDelete = async (product: Product) => await handleDeleteProduct(product);
  const closeModals = () => { setIsCreateModalOpen(false); setEditingProduct(null); setViewingProduct(null); };

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
