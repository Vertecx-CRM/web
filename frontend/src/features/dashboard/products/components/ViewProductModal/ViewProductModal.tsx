"use client";

import React from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";

interface ViewProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  product,
  onClose,
}) => {
  if (!product) return null;

  const imageSrc =
    product.image instanceof File
      ? URL.createObjectURL(product.image)
      : product.image;

  return (
    <Modal
      title="Detalle del Producto"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3 p-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="overflow-hidden">
        <div className="grid grid-cols-2 gap-3 p-1">
          <div className="col-span-2 flex flex-col items-center mb-3">
            <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-50 overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Nombre
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {product.name}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Precio
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {Number(product.price).toLocaleString("es-CO")}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Cantidad
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {product.stock}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Categoría
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {product.category}
            </div>
          </div>

          <div className="col-span-2">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Descripción
            </label>
            <div
              className="px-3 py-2 border rounded-md bg-gray-50 text-sm whitespace-pre-line break-words"
              style={{
                maxHeight: "100px",
                minHeight: "80px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {product.description || "Sin descripción"}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Estado
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {product.state}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .fixed.inset-0.overflow-y-auto {
          overflow: hidden !important;
        }
      `}</style>
    </Modal>
  );
};

export default ViewProductModal;
