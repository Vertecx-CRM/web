export interface Technician {
  id: number;
  nombre: string;
  titulo: string;
}

export interface Material {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface SolicitudOrden {
  id: string;
  cliente: string;
  tipoServicio: "mantenimiento" | "instalacion";
  tipoMantenimiento?: "preventivo" | "correctivo";
  servicio: string;
  descripcion?: string;
  direccion: string;
  monto: number;
}

export interface OrdenServicio extends SolicitudOrden {
  materiales: Material[];
}

export interface Order {
  id: string;
  tipoServicio: "mantenimiento" | "instalacion";
  tipoMantenimiento?: "preventivo" | "correctivo"; 
  monto: number;
  cliente: string;
  lugar: string;
  materiales?: Material[] 
}

// Nuevo tipo para el tipo de cita
export type TipoCita = "solicitud" | "ejecucion" | "garantia";

export interface AppointmentFormData {
  horaInicio: string;
  minutoInicio: string;
  horaFin: string;
  minutoFin: string;
  dia: string;
  mes: string;
  año: string;
  tecnicos: Technician[];
  orden?: Order | null;
  observaciones: string;
  motivoCancelacion?: string;
  estado?: "Pendiente" | "Finalizado" | "Cancelado" | "En-proceso" | "Cerrado" | "Reprogramada";
  tipoCita: TipoCita;
  nombreCliente?: string;
  direccion?: string;
  tipoServicioSolicitud?: "mantenimiento" | "instalacion";
  tipoMantenimientoSolicitud?: "preventivo" | "correctivo";
  servicio?: string;
  descripcion?: string;
  comprobantePago?: File | string | null;
}

export interface Appointment extends AppointmentFormData {
  id: number;
  tecnicos: Technician[];
  start: Date;
  end: Date;
  title: string;
}

export interface AppointmentEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  tecnicos: Technician[];
  horaInicio: string;
  minutoInicio: string;
  horaFin: string;
  minutoFin: string;
  dia: string;
  mes: string;
  año: string;
  orden?: Order | null;
  observaciones: string;
  estado?: "Pendiente" | "Finalizado" | "Cancelado" | "En-proceso" | "Cerrado" | "Reprogramada";   
  subestado?: "Reprogramada" | "Normal";    
  motivoCancelacion?: string;      
  evidencia?: File | string | null;
  comprobantePago?: File | string | null;
  horaCancelacion?: Date | string | null;
  tipoCita: TipoCita;
  nombreCliente?: string;
  direccion?: string;
  tipoServicioSolicitud?: "mantenimiento" | "instalacion";
  tipoMantenimientoSolicitud?: "preventivo" | "correctivo";
  servicio?: string;
  descripcion?: string;
  materiales?: Material[]; 
}


export interface SlotDateTime {
  horaInicio: string;
  minutoInicio: string;
  horaFin: string;
  minutoFin: string;
  dia: string;
  mes: string;
  año: string;
  start?: Date;
  end?: Date;
}

export interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  selectedDateTime: SlotDateTime;
  editingAppointment?: AppointmentEvent | null; 
}

export interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentEvent | null;
  onEdit: (appointment: AppointmentEvent) => void;
  onView: (appointment: AppointmentEvent) => void;
  onCancel: (appointment: AppointmentEvent) => void;
  onReprogram?: (appointment: AppointmentEvent) => void;
}

export interface UseAppointmentFormProps {
  selectedDateTime: SlotDateTime;
  onSave: (appointment: Appointment) => void;
  onClose: () => void;
}

export type AppointmentErrors = {
  horaInicio?: string | undefined;
  horaFin?: string | undefined;
  minutoInicio?: string | undefined;
  minutoFin?: string | undefined;
  dia?: string | undefined;
  mes?: string | undefined;
  año?: string | undefined;
  orden?: string | undefined;
  tecnicos?: string | undefined;
  motivoCancelacion?: string | undefined;
  date?: string | undefined;
  timeRange?: string | undefined;
  tipoCita?: string | undefined; 
  nombreCliente?: string | undefined;
  direccion?: string | undefined;
  tipoServicioSolicitud?: string | undefined;
  tipoMantenimientoSolicitud?: string | undefined;
  servicio?: string | undefined;
  descripcion?: string | undefined;
};

export interface FormTouched {
  [key: string]: boolean;
}

export interface EditAppointmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (appointment: AppointmentEvent) => void;
  appointment: AppointmentEvent | null;            
}

export interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentEvent | null ;
}

export interface UseEditAppointmentFormProps {
  appointment: AppointmentEvent | null;
  onSave: (appointment: AppointmentEvent) => void;
  onClose: () => void;
}

export interface UseOrderSearchProps {
  orders: Order[];
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
  onOrderBlur?: () => void;
  validateOrder?: (order: Order | null) => string | undefined;
}

export interface OrderSearchComboboxProps {
  orders: Order[];
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  label?: string;
  validateOrder?: (order: Order | null) => string | undefined; 
}

// Nuevas interfaces para búsqueda de solicitudes y órdenes
export interface UseSolicitudSearchProps {
  solicitudes: SolicitudOrden[];
  selectedSolicitud: SolicitudOrden | null;
  onSolicitudSelect: (solicitud: SolicitudOrden | null) => void;
  onSolicitudBlur?: () => void;
  validateSolicitud?: (solicitud: SolicitudOrden | null) => string | undefined;
}

export interface UseOrdenServicioSearchProps {
  ordenesServicio: OrdenServicio[];
  selectedOrden: OrdenServicio | null;
  onOrdenSelect: (orden: OrdenServicio | null) => void;
  onOrdenBlur?: () => void;
  validateOrden?: (orden: OrdenServicio | null) => string | undefined;
}

export interface SolicitudSearchComboboxProps {
  solicitudes: SolicitudOrden[];
  selectedSolicitud: SolicitudOrden | null;
  onSolicitudSelect: (solicitud: SolicitudOrden | null) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  label?: string;
  validateSolicitud?: (solicitud: SolicitudOrden | null) => string | undefined;
}

export interface OrdenServicioSearchComboboxProps {
  ordenesServicio: OrdenServicio[];
  selectedOrden: OrdenServicio | null;
  onOrdenSelect: (orden: OrdenServicio | null) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  label?: string;
  validateOrden?: (orden: OrdenServicio | null) => string | undefined;
}

export interface ReprogramAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentEvent | null;
  onReprogramSave: (date: Date, end: Date) => void;
}


