export type ProductState = "Activo" | "Inactivo";

export interface Product {
  id: number;
  name: string;
  description?: string | null;

  categoryId: number;
  categoryName: string;

  supplierCategory: string;

  supplierPrice: number;
  salePrice?: number | null;

  stock: number;
  code?: string | null;

  image: string;
  state: ProductState;
}

// Crear producto DESDE PRODUCTOS: sin precios (los pone Compras)
export type CreateProductData = {
  name: string;
  description?: string | null;
  categoryId: number;
  supplierCategory: string;
  code?: string | null;
  image: File;
};

// Editar producto DESDE PRODUCTOS: tampoco toca precios
export type EditProductData = {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number;
  supplierCategory: string;
  code?: string | null;

  image: string | File | null;

  state: ProductState;
};
