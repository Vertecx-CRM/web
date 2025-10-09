import { ReactNode } from "react";

export interface SaleItem {
  id: string;        // 👈 agregado
  nombre: string;
  tipo: string;
  categoria: string; // 👈 agregado
  cantidad: number;
  precio: number;
  total: number;
}

export interface Sale {
  fecha: ReactNode;
  id: string;
  codigo: string;
  estado: string;
  cliente: string;
  fechaVenta: string; // 👈 renombrado
  items: SaleItem[];
  subtotal: number;
  iva: number;
  descuento?: number;   // 👈 agregado
  total: number;
  observaciones?: string;
  codigoVenta?: string; // 👈 agregado
}
