export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: File | string;
  state: "Activo" | "Inactivo"; // 👈 cambiado
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: File | string;
}

export interface EditProductData {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: File | string;
  state: "Activo" | "Inactivo"; // 👈 cambiado
}
