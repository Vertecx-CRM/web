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

export type CreateProductData = {
  name: string;
  description?: string | null;
  categoryId: number;
  supplierCategory: string;
  supplierPrice: number;
  salePrice?: number | null;
  code?: string | null;
  image: File;
};

export type EditProductData = {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number;
  supplierCategory: string;
  supplierPrice: number;
  salePrice?: number | null;
  code?: string | null;

  image: string | File | null;

  state: ProductState;
};
