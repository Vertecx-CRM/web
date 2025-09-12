import { purchaseOrder } from "../types/typesPurchaseOrder";

export const initialPurchaseOrders: purchaseOrder[] = [
  {
    id: 1,
    numeroOrden: "VEN-001",
    proveedor: "Diana Inguia",
    precioUnitario: 310000,
    fecha: "2025-05-02",
    estado: "Completada",
    descripcion: "Instalación de sistema electrónico",
    cantidad: 1,
    total: 368900, // 310000 * 1 * 1.19 (con IVA)
  },
  {
    id: 2,
    numeroOrden: "VEN-002",
    proveedor: "Juliana Gómez",
    precioUnitario: 2567500,
    fecha: "2025-05-02",
    estado: "Cancelada",
    descripcion: "Compra de equipo industrial cancelada por falta de presupuesto",
    cantidad: 1,
    total: 3055325, // 2567500 * 1 * 1.19 (con IVA)
  },
  {
    id: 3,
    numeroOrden: "VEN-003",
    proveedor: "Wayne Perez",
    precioUnitario: 2250,
    fecha: "2025-04-01",
    estado: "Cancelada",
    descripcion: "Servicio de mantenimiento preventivo",
    cantidad: 1,
    total: 2677.5, // 2250 * 1 * 1.19 (con IVA)
  },
  {
    id: 4,
    numeroOrden: "VEN-004",
    proveedor: "Nataly Martinez",
    precioUnitario: 850000,
    fecha: "2025-03-28",
    estado: "Completada",
    descripción: "Adquisición de componentes electrónicos",
    cantidad: 1,
    total: 1011500, // 850000 * 1 * 1.19 (con IVA)
  },
  {
    id: 5,
    numeroOrden: "ORD-005",
    proveedor: "Tecnología Avanzada S.A.S",
    precioUnitario: 1250000,
    fecha: "2025-09-15",
    estado: "Pendiente",
    descripcion: "Equipos de computación para oficinas",
    cantidad: 3,
    total: 4462500, // 1250000 * 3 * 1.19 (con IVA)
  },
  {
    id: 6,
    numeroOrden: "ORD-006",
    proveedor: "Suministros Industriales Ltda",
    precioUnitario: 75000,
    fecha: "2025-09-20",
    estado: "En Proceso",
    descripcion: "Materiales de construcción y herramientas",
    cantidad: 10,
    total: 892500, // 75000 * 10 * 1.19 (con IVA)
  },
  {
    id: 7,
    numeroOrden: "ORD-007",
    proveedor: "Servicios Logísticos Colombia",
    precioUnitario: 500000,
    fecha: "2025-10-01",
    estado: "Pendiente",
    descripcion: "Servicio de transporte especializado",
    cantidad: 2,
    total: 1190000, // 500000 * 2 * 1.19 (con IVA)
  },
  {
    id: 8,
    numeroOrden: "ORD-008",
    proveedor: "Diana Inguia",
    precioUnitario: 180000,
    fecha: "2025-09-25",
    estado: "Completada",
    descripcion: "Mantenimiento de equipos de seguridad",
    cantidad: 5,
    total: 1071000, // 180000 * 5 * 1.19 (con IVA)
  },
];