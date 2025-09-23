"use client";

import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useProducts } from "./hooks/useProducts";
import ProductsTable from "./components/ProductsTable";
import CreateProductModal from "./components/CreateProductModal/CreateProductModal";
import EditProductModal from "./components/EditProductModal/EditProductModal";
import ViewProductModal from "./components/ViewProductModal/ViewProductModal";

export default function Index() {
  const {
    products,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedProduct,
    handleCreateProduct,
    handleEditProduct,
    handleView,
    handleEdit,
    handleDelete,
  } = useProducts();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreateProductModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateProduct}
              products={products}
            />

            <EditProductModal
              isOpen={isEditModalOpen}
              product={selectedProduct}
              onClose={() => setIsEditModalOpen(false)}
              onSave={(data) => handleEditProduct(data.id, data)}
              products={products}
            />

            <ViewProductModal
              isOpen={isViewModalOpen}
              product={selectedProduct}
              onClose={() => setIsViewModalOpen(false)}
            />

            <ProductsTable
              products={products} // ✅ ahora sí usa el estado de productos del padre
              onView={(p) => {
                handleView(p);
                setIsViewModalOpen(true);
              }}
              onEdit={(p) => {
                handleEdit(p);
                setIsEditModalOpen(true);
              }}
              onDelete={handleDelete}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
