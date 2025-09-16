// types/typeAppointment.ts
export interface Technician {
  id: number;
  nombre: string;
  titulo: string;
}

export interface AppointmentFormData {
  horaInicio: string;
  minutoInicio: string;
  horaFin: string;
  minutoFin: string;
  dia: string;
  mes: string;
  año: string;
  tecnico: string;
  orden: string;
  observaciones: string;
  motivoCancelacion?: string;
  estado?: "Pendiente" | "Finalizado" | "Cancelado";
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
  horaInicio?: string;
  minutoInicio?: string;
  horaFin?: string;
  minutoFin?: string;
  dia?: string;
  mes?: string;
  año?: string;
  orden?: string;
  observaciones?: string;
  estado?: "Pendiente" | "Finalizado" | "Cancelado";      
  motivoCancelacion?: string;      
  evidencia?: File | null;
  horaCancelacion?: Date | string | null;     
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
  editingAppointment?: AppointmentEvent | null; // 🔹 Nuevo
}


export interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentEvent | null;
  onEdit: (appointment: AppointmentEvent) => void;
  onView: (appointment: AppointmentEvent) => void;
  onCancel: (appointment: AppointmentEvent) => void;
}

export interface UseAppointmentFormProps {
  selectedDateTime: SlotDateTime;
  onSave: (appointment: Appointment) => void;
  onClose: () => void;
}


export interface AppointmentErrors {
  horaInicio?: string;
  minutoInicio?: string;
  horaFin?: string;
  minutoFin?: string;
  timeRange?: string;
  dia?: string;
  mes?: string;
  año?: string;
  orden?: string;
  tecnico?: string;
  motivoCancelacion?: string; // 🔹 agregamos error de motivoCancelacion
}

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
  appointment: AppointmentEvent | null;
}

// types/typeAppointment.ts
export interface UseEditAppointmentFormProps {
  appointment: AppointmentEvent | null;
  onSave: (appointment: AppointmentEvent) => void;
  onClose: () => void;
}
