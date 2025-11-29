"use client";

import React, { useRef, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";

import { useCategories } from "@/features/dashboard/CategoryProducts/hooks/useCategories";
import type { Category } from "@/features/dashboard/CategoryProducts/types/typeCategoryProducts";

import type { Product, CreateProductData } from "@/features/dashboard/products/types/typesProducts";
import {
  validateProductField,
  validateProductForm,
  type ProductErrors,
  type ProductFormField,
  type ProductFormDraft,
} from "@/features/dashboard/products/validations/productsValidations";

import { showWarning } from "@/shared/utils/notifications";
import { Upload } from "lucide-react";

type CategoryOption = Pick<Category, "id" | "name">;

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProductData) => void | Promise<void>;
  products: Product[];
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products,
}) => {
  const { categories } = useCategories() as { categories: CategoryOption[] };

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [supplierCategory, setSupplierCategory] = useState("");
  const [supplierPrice, setSupplierPrice] = useState<string>("");

  const [salePrice, setSalePrice] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [categoryId, setCategoryId] = useState<string>("");

  const [image, setImage] = useState<File | null>(null);

  const [errors, setErrors] = useState<ProductErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMoneyChange =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setter(formatted);
    };

  const validateField = (field: ProductFormField, value: unknown) => {
    const error = validateProductField(field, value, products);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSupplierCategory("");
    setSupplierPrice("");
    setSalePrice("");
    setCode("");
    setCategoryId("");
    setImage(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const draft: ProductFormDraft = {
      name,
      description: description ?? null,
      supplierCategory,
      supplierPrice,
      salePrice, 
      code,
      categoryId,
      image,
    };

    const formErrors = validateProductForm(draft, products);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos", { autoClose: 5000 });
      return;
    }

    if (!image) {
      setErrors((prev) => ({ ...prev, image: "Debe seleccionar una imagen" }));
      showWarning("Debe seleccionar una imagen", { autoClose: 5000 });
      return;
    }

    const payload: CreateProductData = {
      name: name.trim(),
      description: description ?? null,
      supplierCategory: supplierCategory.trim(),
      supplierPrice: Number(supplierPrice.replace(/\./g, "")),
      salePrice: Number(salePrice.replace(/\./g, "")), // <- OBLIGATORIO
      code: code.trim(), // <- OBLIGATORIO
      categoryId: Number(categoryId),
      image,
    };

    await onSave(payload);
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
      <form id="create-product-form" onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 grid grid-cols-2 gap-3 p-1">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              placeholder="Panel solar 550W"
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              onBlur={() => validateField("name", name)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.name ? "red" : Colors.table.lines }}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio proveedor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={supplierPrice}
              placeholder="350.000"
              onChange={handleMoneyChange(setSupplierPrice)}
              onBlur={() => validateField("supplierPrice", supplierPrice)}
              inputMode="numeric"
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.supplierPrice ? "red" : Colors.table.lines }}
            />
            {errors.supplierPrice && (
              <span className="text-xs text-red-500">{errors.supplierPrice}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría del proveedor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={supplierCategory}
              placeholder="Paneles solares ahorrativos"
              onChange={(e) => {
                setSupplierCategory(e.target.value);
                validateField("supplierCategory", e.target.value);
              }}
              onBlur={() => validateField("supplierCategory", supplierCategory)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.supplierCategory ? "red" : Colors.table.lines }}
            />
            {errors.supplierCategory && (
              <span className="text-xs text-red-500">{errors.supplierCategory}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                validateField("categoryId", e.target.value);
              }}
              onBlur={() => validateField("categoryId", categoryId)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.categoryId ? "red" : Colors.table.lines }}
            >
              <option value="" disabled>
                Seleccione una categoría...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="text-xs text-red-500">{errors.categoryId}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio venta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={salePrice}
              placeholder="420.000"
              onChange={handleMoneyChange((v) => {
                setSalePrice(v);
              })}
              onBlur={() => validateField("salePrice", salePrice)}
              inputMode="numeric"
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.salePrice ? "red" : Colors.table.lines }}
            />
            {errors.salePrice && <span className="text-xs text-red-500">{errors.salePrice}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              placeholder="PROD-001"
              onChange={(e) => {
                setCode(e.target.value);
                validateField("code", e.target.value);
              }}
              onBlur={() => validateField("code", code)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.code ? "red" : Colors.table.lines }}
            />
            {errors.code && <span className="text-xs text-red-500">{errors.code}</span>}
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Descripción
              </label>
              <textarea
                value={description}
                placeholder="Panel solar monocristalino, alta eficiencia, ideal para hogares..."
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full flex-1 px-2 py-1 border rounded-md resize-none"
                style={{ borderColor: Colors.table.lines }}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Imagen <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 w-full items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-600 cursor-pointer overflow-hidden"
                title={image ? "Cambiar imagen" : "Subir imagen"}
              >
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
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
                    setImage(null);
                    validateField("image", null);
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
                  const file = e.target.files?.[0] ?? null;
                  setImage(file);
                  validateField("image", file);
                }}
              />

              {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProductModal;
