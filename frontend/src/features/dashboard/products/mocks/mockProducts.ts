import { Product } from "../types/typesProducts";

export const initialProducts: Product[] = [
  { id: 1, name: "Cámara IP", description: "Cámara de seguridad", price: 350000, stock: 12, category: "Seguridad", status: "Activo" },
  { id: 2, name: "Router Wi-Fi", description: "Router de alta velocidad", price: 180000, stock: 0, category: "Redes", status: "Inactivo" },
  { id: 3, name: "Kit Herramientas", description: "Herramientas varias", price: 95000, stock: 8, category: "Accesorios", status: "Activo" },
];
