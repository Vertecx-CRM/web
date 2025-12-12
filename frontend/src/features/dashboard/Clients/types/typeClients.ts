// types/typeClients.ts

export interface Client {
  id: number;
  tipo: string; // CC, TI, PPT, etc.
  documento: string;
  nombre: string;
  apellido: string; // 👈 ahora sí como propiedad string
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
  apellido: string; // 👈 agregado para que siempre esté presente
  telefono: string;
  correoElectronico: string;
  rol: "Cliente" | "Administrador" | "Empleado";
  estado: "Activo" | "Inactivo" | string;
}

// Crear
export interface CreateClientData extends ClientBase {
  contrasena: string;
  confirmarContrasena: string;
}


// Editar
export interface EditClientData extends Client {
  contrasena: string;
  confirmarContrasena: string;
}

export interface FormErrors {
  tipo: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correoElectronico: string;
  rol: string;
  estado?: string;
}

export interface FormTouched {
  tipo: boolean;
  documento: boolean;
  nombre: boolean;
  apellido: boolean;
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