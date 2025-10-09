// productsValidations.ts
import { Product } from "@/features/dashboard/products/types/typesProducts";

export interface ProductErrors {
  name?: string;
  description?: string; // <-- agregado para evitar el error al indexar
  price?: string;
  stock?: string;
  category?: string;
  image?: string;
}

export const validateProductField = (
  field: keyof Omit<Product, "id" | "state">,
  value: any,
  products: Product[],
  currentId?: number
): string | undefined => {
  switch (field) {
    case "name":
      if (!String(value).trim()) return "El nombre es obligatorio";
      if (
        products.some(
          (p) =>
            p.name.toLowerCase() === String(value).trim().toLowerCase() &&
            p.id !== currentId
        )
      ) {
        return "Ya existe un producto con este nombre";
      }
      return;

    case "price":
      if (!value) return "El precio es obligatorio";
      const numericPrice = Number(String(value).replace(/\./g, ""));
      if (isNaN(numericPrice) || numericPrice <= 0)
        return "El precio debe ser mayor que 0";
      return;

    case "stock":
      // stock puede ser "" (vacío) mientras el campo no sea obligatorio en tiempo real;
      // la validación final de formulario puede exigirlo. Aquí validamos formato/negativos.
      if (value === "" || value === undefined) return;
      if (isNaN(Number(value)) || Number(value) < 0)
        return "La cantidad debe ser mayor o igual a 0";
      return;

    case "category":
      if (!value) return "La categoría es obligatoria";
      return;

    case "image":
      if (!value) return "Debe seleccionar una imagen";
      return;

    case "description":
      // Según lo conversado: descripción NO lleva validación.
      return;

    default:
      return;
  }
};

export const validateProductForm = (
  data: Omit<Product, "id" | "state">,
  products: Product[],
  currentId?: number
): ProductErrors => {
  const errors: ProductErrors = {};

  const fields: (keyof Omit<Product, "id" | "state">)[] = [
    "name",
    "description", // incluimos para mantener consistencia, aunque no valida
    "price",
    "stock",
    "category",
    "image",
  ];

  fields.forEach((field) => {
    const error = validateProductField(
      field,
      (data as any)[field],
      products,
      currentId
    );
    if (error) errors[field] = error;
  });

  return errors;
};
