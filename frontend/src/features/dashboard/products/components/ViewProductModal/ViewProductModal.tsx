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

const cleanText = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  const lower = s.toLowerCase();
  if (lower === "null" || lower === "undefined") return "—";
  return s;
};

const moneyCO = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\./g, "").trim());
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("es-CO")}`;
};

const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, product, onClose }) => {
  if (!product) return null;

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
              {product.image ? (
                <img
                  src={product.image}
                  alt={cleanText(product.name)}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="text-gray-400 text-xs italic">Sin imagen</div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm break-words">
              {cleanText(product.name)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Código
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm break-words">
              {cleanText(product.code)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Stock
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm tabular-nums">
              {Number.isFinite(Number(product.stock)) ? Number(product.stock) : "—"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm break-words">
              {cleanText(product.categoryName)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm">
              {cleanText(product.state)}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría del proveedor
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm break-words">
              {cleanText(product.supplierCategory)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio proveedor
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm tabular-nums">
              {moneyCO(product.supplierPrice)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio venta
            </label>
            <div className="px-2 py-1 border rounded-md bg-gray-50 text-sm tabular-nums">
              {moneyCO(product.salePrice)}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Descripción
            </label>
            <div
              className="px-3 py-2 border rounded-md bg-gray-50 text-sm whitespace-pre-line break-words"
              style={{ maxHeight: "120px", minHeight: "80px", overflowY: "auto", overflowX: "hidden" }}
            >
              {cleanText(product.description) === "—" ? "Sin descripción" : cleanText(product.description)}
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
