"use client";

import React, { useEffect, useRef, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";

import { useCategories } from "@/features/dashboard/CategoryProducts/hooks/useCategories";
import type { Category } from "@/features/dashboard/CategoryProducts/types/typeCategoryProducts";

import type {
  Product,
  EditProductData,
  ProductState,
} from "@/features/dashboard/products/types/typesProducts";
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

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (data: EditProductData) => void | Promise<void>;
  products: Product[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
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

  const [image, setImage] = useState<string | File | null>(null);
  const [state, setState] = useState<ProductState>("Activo");

  const [errors, setErrors] = useState<ProductErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatMoney = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "";
    return Number(num).toLocaleString("es-CO");
  };

  const handleMoneyChange = (setter: (v: string) => void) => (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setter(formatted);
  };

  const validateField = (field: ProductFormField, value: unknown) => {
    const error = validateProductField(field, value, products, product?.id);

    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name);
      setDescription(product.description ?? "");

      setSupplierCategory(product.supplierCategory ?? "");
      setSupplierPrice(formatMoney(product.supplierPrice));

      setSalePrice(
        product.salePrice === null || product.salePrice === undefined
          ? ""
          : formatMoney(product.salePrice)
      );
      setCode(product.code ?? "");

      setCategoryId(String(product.categoryId));

      setImage(product.image ?? null);
      setState(product.state ?? "Activo");

      setErrors({});
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

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

    const filteredProducts = products.filter((p) => p.id !== product.id);
    const formErrors = validateProductForm(draft, filteredProducts, product.id);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos");
      return;
    }

    if (image === null) {
      showWarning("No se puede guardar un producto sin imagen. Debes subir otra.");
      return;
    }

    const payload: EditProductData = {
      id: product.id,
      name: name.trim(),
      description: description ?? null,

      supplierCategory: supplierCategory.trim(),
      supplierPrice: Number(String(supplierPrice).replace(/\./g, "")),

      salePrice: Number(String(salePrice).replace(/\./g, "")),
      code: code.trim(),

      categoryId: Number(categoryId),

      image,
      state,
    };

    await onSave(payload);
    onClose();
  };

  if (!product) return null;

  const imageSrc =
    image instanceof File ? URL.createObjectURL(image) : typeof image === "string" ? image : "";

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
      <form id="edit-product-form" onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 grid grid-cols-2 gap-3 p-1">
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

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Precio proveedor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={supplierPrice}
              onChange={(e) => handleMoneyChange(setSupplierPrice)(e.target.value)}
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
              <option value="">Seleccione categoría</option>
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
              onChange={(e) => handleMoneyChange(setSalePrice)(e.target.value)}
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
              >
                {imageSrc ? (
                  <img src={imageSrc} alt="Producto" className="h-full w-full object-cover" />
                ) : (
                  <Upload size={24} />
                )}
              </div>

              {(image instanceof File || typeof image === "string") && (
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

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as ProductState)}
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
