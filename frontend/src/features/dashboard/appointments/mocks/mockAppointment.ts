import { Technician } from "../types/typeAppointment";

export const technicians: Technician[] = [
  { id: 1, nombre: "Samuel Corboda", titulo: "Tec. Sistema" },
  { id: 2, nombre: "Joao Ortiz", titulo: "Tec. Redes" },
  { id: 3, nombre: "Darier Alvarez", titulo: "Electricista" }
];

export const orders = ["ORD-001", "ORD-002", "ORD-003", "ORD-004", "ORD-005"];

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

