import type { Product } from "@/features/dashboard/products/types/typesProducts";

export type ProductFormField =
  | "name"
  | "description"
  | "categoryId"
  | "supplierCategory"
  | "supplierPrice"
  | "salePrice"
  | "code"
  | "image";

export type ProductErrors = Partial<Record<ProductFormField, string>>;

export type ProductFormDraft = {
  name: string;
  description?: string | null;

  categoryId: number | string;

  supplierCategory: string;

  supplierPrice: number | string;
  salePrice?: number | string | null;

  code?: string | null;

  image: File | string | null | undefined;
};

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").replace(/\./g, "").trim();
  const n = Number(s);
  return Number.isNaN(n) ? NaN : n;
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

    case "supplierPrice": {
      if (value === "" || value === undefined || value === null) return "El precio es obligatorio";
      const n = toNumber(value);
      if (Number.isNaN(n) || n <= 0) return "El precio debe ser mayor que 0";
      return;
    }

    // CAMBIO: ahora es obligatorio
    case "salePrice": {
      if (value === "" || value === undefined || value === null)
        return "El precio de venta es obligatorio";
      const n = toNumber(value);
      if (Number.isNaN(n) || n <= 0) return "El precio de venta debe ser mayor que 0";
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

    // CAMBIO: ahora es obligatorio
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
    "supplierPrice",
    "salePrice",
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
