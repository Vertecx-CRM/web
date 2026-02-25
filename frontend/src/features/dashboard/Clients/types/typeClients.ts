// ================================
// UI MODEL (DATA TABLE)
// ================================

export interface Client {
  id: number;
  nombre: string;
  apellido: string;
  tipo: string; // En la tabla es string (CC, TI, CE...)
  documento: string;
  telefono: string;
  correoElectronico: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
}

// ================================
// CREATE FORM DATA (UI FORM STATE)
// ================================

export interface CreateClientData {
  nombre: string;
  apellido: string;
  tipo: number; // 👈 SIEMPRE number
  documento: string;
  telefono: string;
  correoElectronico: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
}

// ================================
// EDIT FORM DATA
// ================================

export interface EditClientData extends CreateClientData {
  id: number;
}

// ================================
// FORM STATE
// ================================

export type ClientFormErrors = Partial<
  Record<keyof CreateClientData, string>
>;

export type ClientFormTouched = Partial<
  Record<keyof CreateClientData, boolean>
>;

// ================================
// MODAL PROPS
// ================================

export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClientData) => Promise<void>;
}

export interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (data: EditClientData) => Promise<void>;
}

export interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}