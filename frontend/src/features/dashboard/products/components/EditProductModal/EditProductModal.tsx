"use client";

import React, { useRef, useEffect, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Product } from "@/features/dashboard/products/types/typesProducts";
import { useCategories } from "@/features/dashboard/CategoryProducts/hooks/useCategories";
import {
  validateProductField,
  validateProductForm,
  ProductErrors,
} from "@/features/dashboard/products/validations/productsValidations";
import { showWarning } from "@/shared/utils/notifications";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";
import { Upload } from "lucide-react";

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (data: Product) => void;
  products: Product[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
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
  const [state, setState] = useState<"Activo" | "Inactivo">("Activo");
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [errors, setErrors] = useState<ProductErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (num: number | string) => {
    if (!num && num !== 0) return "";
    return Number(num).toLocaleString("es-CO");
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setPrice(formatPrice(Number(numericValue)));
  };

  const validateField = (
    field: keyof Omit<Product, "id" | "state">,
    value: string | number | File | undefined
  ) => {
    let filteredProducts = products;
    if (product && field === "name") {
      filteredProducts = products.filter((p) => p.id !== product.id);
    }
    const error = validateProductField(field, value, filteredProducts);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error;
      else delete newErrors[field];
      return newErrors;
    });
  };

  useEffect(() => {
    if (isOpen && product) {
      const stored = localStorage.getItem(`product-${product.id}`);
      const data: Product = stored ? JSON.parse(stored) : product;

      setName(data.name);
      setDescription(data.description || "");
      setPrice(formatPrice(data.price));
      setStock(data.stock.toString());
      setCategory(data.category);
      setImage(typeof data.image === "string" ? data.image : undefined);
      setState(data.state ?? "Activo");
      setIsImageDeleted(false);
      setErrors({});
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      showWarning("Por favor completa los campos obligatorios");
      return;
    }
    if (!product) return;

    let imageString = "";

    if (image instanceof File) {
      imageString = await uploadImageToCloudinary(image);
    } else if (typeof image === "string") {
      imageString = image;
    }

    const payload: Product = {
      id: product.id,
      name,
      description,
      price: Number(price.replace(/\./g, "")),
      stock: Number(stock),
      category,
      image: isImageDeleted ? undefined : imageString,
      state,
    };

    const filteredProducts = products.filter((p) => p.id !== product.id);
    const formErrors = validateProductForm(payload, filteredProducts);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos");
      return;
    }

    localStorage.setItem(`product-${payload.id}`, JSON.stringify(payload));
    onSave(payload);
    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      title="Editar Producto"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-product-form"
            className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
          >
            Guardar
          </button>
        </div>
      }
    >
      <form
        id="edit-product-form"
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
      >
        <div className="flex-1 grid grid-cols-2 gap-3 p-1">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.name ? "red" : Colors.table.lines }}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              onBlur={() => validateField("price", price)}
              inputMode="numeric"
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.price ? "red" : Colors.table.lines }}
            />
            {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Stock
            </label>
            <input
              type="number"
              value={stock}
              disabled
              className="w-full px-2 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                validateField("category", e.target.value);
              }}
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
            {errors.category && <span className="text-xs text-red-500">{errors.category}</span>}
          </div>

          {/* Descripción + Imagen */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full flex-1 px-2 py-1 border rounded-md resize-none"
                style={{ borderColor: Colors.table.lines }}
              />
            </div>

            {/* Imagen */}
            <div className="col-span-1 flex flex-col">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Imagen
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 w-full items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-600 cursor-pointer overflow-hidden"
              >
                {image ? (
                  <img
                    src={image instanceof File ? URL.createObjectURL(image) : (image as string)}
                    alt="Producto"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(undefined);
                    setIsImageDeleted(true);
                    validateField("image", undefined);
                  }}
                  className="mt-2 text-xs text-red-500 border border-red-300 rounded-md px-2 py-1 hover:bg-red-50 hover:text-red-700"
                >
                  Eliminar
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImage(file ?? undefined);
                  setIsImageDeleted(false);
                  validateField("image", file);
                }}
              />
              {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
            </div>
          </div>

          {/* Estado */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as "Activo" | "Inactivo")}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: Colors.table.lines }}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
