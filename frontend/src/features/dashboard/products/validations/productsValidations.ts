import type { Product } from "@/features/dashboard/products/types/typesProducts";

export type ProductFormField =
  | "name"
  | "description"
  | "categoryId"
  | "supplierCategory"
  | "code"
  | "image";

export type ProductErrors = Partial<Record<ProductFormField, string>>;

export type ProductFormDraft = {
  name: string;
  description?: string | null;

  categoryId: number | string;

  supplierCategory: string;

  code?: string | null;

  image: File | string | null | undefined;
};

export const validateProductField = (
  field: ProductFormField,
  value: unknown,
  products: Product[],
  currentId?: number
): string | undefined => {
  switch (field) {
    case "name": {
      const v = String(value ?? "").trim();
      if (!v) return "El nombre es obligatorio";

      const duplicated = products.some(
        (p) => p.name.toLowerCase() === v.toLowerCase() && p.id !== currentId
      );
      if (duplicated) return "Ya existe un producto con este nombre";
      return;
    }

    case "categoryId": {
      const n = Number(value);
      if (!n || n < 1) return "La categoría es obligatoria";
      return;
    }

    case "supplierCategory": {
      const v = String(value ?? "").trim();
      if (!v) return "La categoría del proveedor es obligatoria";
      return;
    }

    case "code": {
      const v = String(value ?? "").trim();
      if (!v) return "El código es obligatorio";
      if (v.length > 20) return "El código no puede superar 20 caracteres";
      return;
    }

    case "image": {
      if (value instanceof File) return;
      const v = String(value ?? "").trim();
      if (!v) return "Debe seleccionar una imagen";
      return;
    }

    case "description":
      return;

    default:
      return;
  }
};

export const validateProductForm = (
  data: ProductFormDraft,
  products: Product[],
  currentId?: number
): ProductErrors => {
  const errors: ProductErrors = {};

  const fields: ProductFormField[] = [
    "name",
    "description",
    "categoryId",
    "supplierCategory",
    "code",
    "image",
  ];

  for (const field of fields) {
    const error = validateProductField(field, data[field], products, currentId);
    if (error) errors[field] = error;
  }

  return errors;
};
