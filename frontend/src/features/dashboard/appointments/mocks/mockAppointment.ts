import { Technician, TipoCita, SolicitudOrden, OrdenServicio, Material } from "../types/typeAppointment";

export const technicians: Technician[] = [
  { id: 1, nombre: "Samuel Corboda", titulo: "Tec. Sistema" },
  { id: 2, nombre: "Joao Ortiz", titulo: "Tec. Redes" },
  { id: 3, nombre: "Darier Alvarez", titulo: "Electricista" },
];


// Materiales disponibles (solo con nombre, sin precio)
export const materiales: Material[] = [
  { id: 1, nombre: "Cámara IP HD", cantidad: 0 },
  { id: 2, nombre: "Servidor Rack", cantidad: 0 },
  { id: 3, nombre: "Switch 24 puertos", cantidad: 0 },
  { id: 4, nombre: "Cable UTP Cat6", cantidad: 0 },
  { id: 5, nombre: "Fuente de poder", cantidad: 0 },
  { id: 6, nombre: "Router WiFi", cantidad: 0 },
  { id: 7, nombre: "Disco Duro 1TB", cantidad: 0 },
  { id: 8, nombre: "Memoria RAM 8GB", cantidad: 0 },
  { id: 9, nombre: "Conectores RJ45", cantidad: 0 },
  { id: 10, nombre: "Panel de parcheo", cantidad: 0 }
];

// Mock de solicitudes de orden
export const solicitudesOrden: SolicitudOrden[] = [
  {
    id: "SOL-001",
    cliente: "Carlos Ramírez",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    servicio: "Mantenimiento de cámaras de seguridad",
    descripcion: "Mantenimiento preventivo al sistema de cámaras del edificio principal",
    direccion: "Oficina Central - Bogotá, Carrera 15 # 88-25",
    monto: 100000
  },
  {
    id: "SOL-002",
    cliente: "María Gómez",
    tipoServicio: "instalacion",
    servicio: "Instalación de servidor",
    descripcion: "Instalación y configuración de servidor para sistema de nómina",
    direccion: "Edificio Colpatria - Bogotá, Calle 26 # 13-45",
    monto: 100000
  },
  {
    id: "SOL-003",
    cliente: "Jorge Hernández",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "correctivo",
    servicio: "Mantenimineto de sistema eléctrico",
    descripcion: "Reparación de falla en sistema eléctrico del data center",
    direccion: "Planta Industrial - Medellín, Calle 10 # 35-78",
    monto: 100000
  },
  {
    id: "SOL-004",
    cliente: "Ana Torres",
    tipoServicio: "instalacion",
    servicio: "Instalación de red LAN",
    descripcion: "",
    direccion: "Centro Comercial Viva - Barranquilla, Carrera 51B # 85-196",
    monto: 100000
  },
  {
    id: "SOL-005",
    cliente: "Luis Pérez",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    servicio: "Mantenimiento de sistema de red",
    descripcion: "Mantenimiento preventivo a switches y routers de la sucursal",
    direccion: "Sucursal Norte - Cali, Avenida 4N # 15-30",
    monto: 100000
  }
];

// Mock de órdenes de servicio (con materiales y cantidad)
export const ordenesServicio: OrdenServicio[] = [
  {
    id: "ORD-001",
    cliente: "Carlos Ramírez",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    servicio: "Mantenimiento de cámaras de seguridad",
    descripcion: "Mantenimiento preventivo al sistema de cámaras del edificio principal",
    direccion: "Oficina Central - Bogotá, Carrera 15 # 88-25",
    materiales: [
      { id: 1, nombre: "Cámara IP HD", cantidad: 2 },
      { id: 4, nombre: "Cable UTP Cat6", cantidad: 50 },
      { id: 9, nombre: "Conectores RJ45", cantidad: 20 }
    ],
    monto: 100000
  },
  {
    id: "ORD-002",
    cliente: "María Gómez",
    tipoServicio: "instalacion",
    servicio: "Instalación de servidor",
    descripcion: "Instalación y configuración de servidor para sistema de nómina",
    direccion: "Edificio Colpatria - Bogotá, Calle 26 # 13-45",
    materiales: [
      { id: 2, nombre: "Servidor Rack", cantidad: 1 },
      { id: 7, nombre: "Disco Duro 1TB", cantidad: 2 },
      { id: 8, nombre: "Memoria RAM 8GB", cantidad: 4 },
      { id: 5, nombre: "Fuente de poder", cantidad: 1 }
    ],
    monto: 100000
  },
  {
    id: "ORD-003",
    cliente: "Jorge Hernández",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "correctivo",
    servicio: "Reparación de sistema eléctrico",
    descripcion: "Reparación de falla en sistema eléctrico del data center",
    direccion: "Planta Industrial - Medellín, Calle 10 # 35-78",
    materiales: [
      { id: 5, nombre: "Fuente de poder", cantidad: 3 },
      { id: 4, nombre: "Cable UTP Cat6", cantidad: 10 }
    ],
    monto: 100000
  },
  {
    id: "ORD-004",
    cliente: "Ana Torres",
    tipoServicio: "instalacion",
    servicio: "Instalación de red LAN",
    descripcion: "",
    direccion: "Centro Comercial Viva - Barranquilla, Carrera 51B # 85-196",
    materiales: [
      { id: 3, nombre: "Switch 24 puertos", cantidad: 2 },
      { id: 4, nombre: "Cable UTP Cat6", cantidad: 100 },
      { id: 6, nombre: "Router WiFi", cantidad: 1 },
      { id: 10, nombre: "Panel de parcheo", cantidad: 1 }
    ],
    monto: 100000
  },
  {
    id: "ORD-005",
    cliente: "Luis Pérez",
    tipoServicio: "mantenimiento",
    tipoMantenimiento: "preventivo",
    servicio: "Mantenimiento de sistema de red",
    descripcion: "Mantenimiento preventivo a switches y routers de la sucursal",
    direccion: "Sucursal Norte - Cali, Avenida 4N # 15-30",
    materiales: [
      { id: 9, nombre: "Conectores RJ45", cantidad: 15 },
      { id: 4, nombre: "Cable UTP Cat6", cantidad: 30 }
    ],
    monto: 100000
  }
];

// Arrays existentes (se mantienen igual)
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

export const tiposCita: { value: TipoCita; label: string }[] = [
  { value: "solicitud", label: "Solicitud de Cita" },
  { value: "ejecucion", label: "Ejecución de Cita" },
  { value: "garantia", label: "Garantía de Cita" }
];

export const monthNames = Object.values(months);