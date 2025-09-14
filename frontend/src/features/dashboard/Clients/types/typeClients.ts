// types/typeClients.ts

export interface Client {
  id: number;
  tipo: string; // CC, TI, PPT, etc.
  documento: string;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  rol: "Cliente" | "Administrador" | "Empleado";
  estado: "Activo" | "Inactivo" | string; // ← string para permitir valores iniciales como ''
}

// Tipo base para crear y editar
export interface ClientBase {
  tipo: string;
  documento: string;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  rol: "Cliente" | "Administrador" | "Empleado";
  estado: "Activo" | "Inactivo" | string; // ← string para permitir valores iniciales como ''
}

// Crear
export interface CreateClientData extends ClientBase {}

// Editar
export interface EditClientData extends ClientBase {
  id: number;
}

export interface FormErrors {
  tipo: string;
  documento: string;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  rol: string;
  estado?: string;
}

export interface FormTouched {
  tipo: boolean;
  documento: boolean;
  nombre: boolean;
  telefono: boolean;
  correoElectronico: boolean;
  rol: boolean;
  estado?: boolean;
}

export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: CreateClientData) => void;
}

export interface EditClientModalProps {
  isOpen: boolean;
  client: EditClientData | null;
  onClose: () => void;
  onSave: (clientData: EditClientData) => void;
}

export interface ViewClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
}

