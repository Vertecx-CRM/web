export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: File | string;
  status: "Activo" | "Inactivo";
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
  status: "Activo" | "Inactivo";
}

