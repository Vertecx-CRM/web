"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";
import { useCategories } from "@/features/dashboard/CategoryProducts/hooks/useCategories";

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (data: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
}) => {
  const { categories } = useCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | string | undefined>(undefined);
  const [state, setState] = useState<"Activo" | "Inactivo">("Activo");
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name);
      setDescription(product.description || "");
      setPrice(formatPrice(product.price));
      setStock(product.stock);
      setCategory(product.category);
      setImage(product.image ?? undefined);
      setState(product.state ?? "Activo");
      setIsImageDeleted(false);
    }
  }, [isOpen, product]);

  const handleCircleClick = () => {
    fileInputRef.current?.click();
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\./g, "").replace(/[^\d]/g, "");
    setPrice(formatPrice(Number(numericValue)));
  };

  const formatPrice = (num: number | string) => {
    if (!num && num !== 0) return "";
    return Number(num).toLocaleString("es-CO");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    if (!product) return;

    onSave({
      id: product.id,
      name,
      description,
      price: Number(price.replace(/\./g, "")),
      stock: Number(stock),
      category,
      image: isImageDeleted ? undefined : image,
      state,
    });

    onClose();
  };

  if (!isOpen || !product) return null;

  const imageName = image instanceof File ? image.name : "";

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-3 rounded-lg shadow-lg w-full max-w-2xl relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-2 right-2 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="text-black font-semibold text-2xl text-center mb-3">
          Editar Producto
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-1">
          {/* Imagen */}
          <div className="col-span-2 flex flex-col items-center mb-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                setImage(e.target.files?.[0] ?? undefined);
                setIsImageDeleted(false);
              }}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1"
              onClick={handleCircleClick}
              style={{ borderColor: Colors.table.lines }}
            >
              {!isImageDeleted && (image || product?.image) ? (
                <img
                  src={
                    image
                      ? image instanceof File
                        ? URL.createObjectURL(image)
                        : image
                      : product?.image instanceof File
                      ? URL.createObjectURL(product.image)
                      : (product?.image as string)
                  }
                  alt="Producto"
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

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                Haga clic en el círculo para{" "}
                {!isImageDeleted && (image || product?.image)
                  ? "cambiar"
                  : "seleccionar"}{" "}
                la imagen
              </div>

              {!isImageDeleted && (image || product?.image) && (
                <div className="flex flex-col items-center space-y-1">
                  {imageName && (
                    <div className="text-xs text-green-600 font-medium">
                      {imageName}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setImage(undefined);
                      setIsImageDeleted(true);
                    }}
                    className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                    style={{ borderColor: Colors.states.nullable }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ingrese nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio
            </label>
            <input
              type="text"
              placeholder="Ingrese precio"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Cantidad
            </label>
            <input
              type="number"
              value={stock}
              disabled
              className="w-full px-2 py-1 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              <option value="">Seleccione categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as "Activo" | "Inactivo")}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Descripción
            </label>
            <textarea
              placeholder="Ingrese descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
              style={{ backgroundColor: Colors.buttons.tertiary, color: Colors.texts.quaternary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white text-sm"
              style={{ backgroundColor: Colors.buttons.quaternary, color: Colors.texts.quaternary }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProductModal;
