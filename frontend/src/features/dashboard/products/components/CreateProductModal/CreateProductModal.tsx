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
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";
import { Upload } from "lucide-react";

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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setPrice(formatted);
  };

  const validateField = (
    field: keyof Omit<Product, "id" | "state">,
    value: unknown
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<Product, "id" | "state"> = {
      name,
      description,
      price: Number(price.replace(/\./g, "")),
      stock: stock === "" ? 0 : Number(stock),
      category,
      image: image as unknown as string,
    };

    const formErrors = validateProductForm(data, products);
    if (stock === "") formErrors.stock = "La cantidad es obligatoria";

    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos", { autoClose: 5000 });
      return;
    }

    let imageString = "";
    if (image instanceof File) {
      imageString = await uploadImageToCloudinary(image);
    } else if (typeof image === "string") {
      imageString = image;
    }

    onSave({ ...data, image: imageString });
    resetForm();
    onClose();
  };

  return (
    <Modal
      title="Crear Producto"
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
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
            form="create-product-form"
            className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
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
        <div className="flex-1 grid grid-cols-2 gap-3 p-1">
          {/* Nombre */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
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
              style={{
                borderColor: errors.name ? "red" : Colors.table.lines,
              }}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Precio */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
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
              style={{
                borderColor: errors.price ? "red" : Colors.table.lines,
              }}
            />
            {errors.price && (
              <span className="text-xs text-red-500">{errors.price}</span>
            )}
          </div>

          {/* Stock */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stock}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setStock(e.target.value);
              }}
              onBlur={() => validateField("stock", stock)}
              className="w-full px-2 py-1 border rounded-md"
              style={{
                borderColor: errors.stock ? "red" : Colors.table.lines,
              }}
            />
            {errors.stock && (
              <span className="text-xs text-red-500">{errors.stock}</span>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onBlur={() => validateField("category", category)}
              className="w-full px-2 py-1 border rounded-md"
              style={{
                borderColor: errors.category ? "red" : Colors.table.lines,
              }}
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

          {/* Descripción + Imagen */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            {/* Descripción */}
            <div className="col-span-2 flex flex-col">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Descripción
              </label>
              <textarea
                placeholder="Ingrese descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full flex-1 px-2 py-1 border rounded-md resize-none"
                style={{ borderColor: Colors.table.lines }}
              />
            </div>

            {/* Imagen */}
            <div className="col-span-1 flex flex-col">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Imagen
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 w-full items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-600 cursor-pointer overflow-hidden"
              >
                {image ? (
                  <img
                    src={
                      image instanceof File
                        ? URL.createObjectURL(image)
                        : (image as string)
                    }
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
                  validateField("image", file);
                }}
              />
              {errors.image && (
                <p className="mt-1 text-xs text-red-600">{errors.image}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProductModal;
