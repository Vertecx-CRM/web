"use client";

import React, { useRef, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { useCategories } from "@/features/dashboard/CategoryProducts/hooks/useCategories";
import { Product } from "@/features/dashboard/products/types/typesProducts";
import {
  validateProductField,
  validateProductForm,
  ProductErrors,
} from "@/features/dashboard/products/validations/productsValidations";
import { showWarning } from "@/shared/utils/notifications";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Product, "id" | "state">) => void;
  products: Product[];
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products,
}) => {
  const { categories } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | string | undefined>(undefined);
  const [errors, setErrors] = useState<ProductErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCircleClick = () => fileInputRef.current?.click();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setPrice(formatted);
  };

  const validateField = (
    field: keyof Omit<Product, "id" | "state">,
    value: unknown
  ) => {
    if (field === "stock" && String(value).trim() === "") {
      setErrors((prev) => ({ ...prev, stock: "La cantidad es obligatoria" }));
      return;
    }

    const error = validateProductField(field, value, products);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
    setImage(undefined);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<Product, "id" | "state"> = {
      name,
      description,
      price: Number(price.replace(/\./g, "")),
      stock: stock === "" ? 0 : Number(stock),
      category,
      image: (image as unknown) as string,
    };

    const formErrors = validateProductForm(data, products);

    if (stock === "") {
      formErrors.stock = "La cantidad es obligatoria";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos");
      return;
    }

    onSave(data);
    resetForm();
    onClose();
  };

  const imageName = image instanceof File ? image.name : "";

  return (
    <Modal
      title="Crear Producto"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-gray-700 text-sm"
            style={{
              backgroundColor: Colors.buttons.tertiary,
              color: Colors.texts.quaternary,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-product-form"
            className="px-4 py-2 rounded-md font-medium text-white text-sm"
            style={{
              backgroundColor: Colors.buttons.quaternary,
              color: Colors.texts.quaternary,
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <form
        id="create-product-form"
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
      >
        <div className="flex-1 grid grid-cols-2 gap-3 p-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {/* Imagen */}
          <div className="col-span-2 flex flex-col items-center mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Imagen <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImage(file ?? undefined);
                validateField("image", file);
              }}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1 overflow-hidden"
              onClick={handleCircleClick}
              style={{ borderColor: errors.image ? "red" : Colors.table.lines }}
            >
              {image ? (
                <img
                  src={image instanceof File ? URL.createObjectURL(image) : image}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                Haga clic en el círculo para {image ? "cambiar" : "seleccionar"} la imagen
              </div>

              {image && (
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
                      validateField("image", undefined);
                    }}
                    className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                    style={{ borderColor: Colors.states?.nullable }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}

              {errors.image && (
                <span className="text-xs text-red-500 mt-1">{errors.image}</span>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ingrese nombre"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              onBlur={() => validateField("name", name)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.name ? "red" : Colors.table.lines }}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ingrese precio"
              value={price}
              onChange={handlePriceChange}
              onBlur={() => validateField("price", price)}
              inputMode="numeric"
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.price ? "red" : Colors.table.lines }}
            />
            {errors.price && (
              <span className="text-xs text-red-500">{errors.price}</span>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stock}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) setStock(value);
              }}
              onBlur={() => validateField("stock", stock)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.stock ? "red" : Colors.table.lines }}
            />
            {errors.stock && (
              <span className="text-xs text-red-500">{errors.stock}</span>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onBlur={() => validateField("category", category)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.category ? "red" : Colors.table.lines }}
            >
              <option value="">Seleccione categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-xs text-red-500">{errors.category}</span>
            )}
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
              className="w-full px-2 py-1 border rounded-md resize-none"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProductModal;