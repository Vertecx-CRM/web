import { Order, Technician } from "../types/typeAppointment";

export const technicians: Technician[] = [
  { id: 1, nombre: "Samuel Corboda", titulo: "Tec. Sistema" },
  { id: 2, nombre: "Joao Ortiz", titulo: "Tec. Redes" },
  { id: 3, nombre: "Darier Alvarez", titulo: "Electricista" }
];

export const orders: Order[] = [
  {
    id: "ORD-001",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    monto: 250000,
    cliente: "Carlos Ramírez",
    lugar: "Oficina Central - Bogotá"
  },
  {
    id: "ORD-002",
    tipoServicio: "instalacion",
    monto: 480000,
    cliente: "María Gómez",
    lugar: "Edificio Colpatria - Bogotá"
  },
  {
    id: "ORD-003",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "correctivo",
    monto: 320000,
    cliente: "Jorge Hernández",
    lugar: "Planta Industrial - Medellín"
  },
  {
    id: "ORD-004",
    tipoServicio: "instalacion",
    monto: 600000,
    cliente: "Ana Torres",
    lugar: "Centro Comercial Viva - Barranquilla"
  },
  {
    id: "ORD-005",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    monto: 280000,
    cliente: "Luis Pérez",
    lugar: "Sucursal Norte - Cali"
  }
];


// JSON de meses con número como clave
export const months: { [key: number]: string } = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre"
};

export const appointmentStates: { value: "Pendiente" | "Finalizado" | "Cancelado"; label: string }[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Finalizado", label: "Finalizado" },
  { value: "Cancelado", label: "Cancelado" }
];


// Array de nombres de meses para el select (opcional)
export const monthNames = Object.values(months);

