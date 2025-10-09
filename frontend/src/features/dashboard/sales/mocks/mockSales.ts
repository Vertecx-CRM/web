import { Sale } from "../types/typesSales";

 export const mockSales: Sale[] = [
  {
    id: "1",
    codigo: "VEN-001",
    cliente: "Diana Higuita",
    fechaVenta: "2025-06-02", // 👈 corregido
    estado: "Finalizado",
    items: [
      {
        id: "i1",
        tipo: "Producto",
        nombre: "Monitor LG",
        categoria: "Electrónica",
        cantidad: 2,
        precio: 500000,
        total: 1000000,
      },
    ],
    subtotal: 1000000,
    iva: 190000,
    total: 1190000,
    observaciones: "Entregado sin problemas",
  },
];