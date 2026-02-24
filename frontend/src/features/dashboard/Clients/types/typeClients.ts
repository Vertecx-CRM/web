// =============================
// Base para formularios
// =============================
export interface ClientFormBase {
  tipo: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correoElectronico: string;
  estado: string;
}

// =============================
// Crear cliente (formulario)
// =============================
export interface CreateClientData extends ClientFormBase {}

// =============================
// Editar cliente (formulario)
// Incluye id porque el formulario de edición
// ya trabaja con el objeto completo
// =============================
export interface EditClientData extends ClientFormBase {
  id: number;
  userId?: number; // referencia al user en el módulo users, útil para edición
}

// =============================
// Cliente completo (modelo frontend normalizado)
// =============================
export interface Client extends ClientFormBase {
  id: number;
  userId?: number; // referencia al user en el módulo users
}

// =============================
// Cliente para tabla
// =============================
export interface ClientForTable {
  id: number;
  tipo: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correoElectronico: string;
  estado: string;
}

// =============================
// Errores del formulario
// =============================
export interface FormErrors {
  tipo: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correoElectronico: string;
}

// =============================
// Campos tocados
// =============================
export interface FormTouched {
  tipo: boolean;
  documento: boolean;
  nombre: boolean;
  apellido: boolean;
  telefono: boolean;
  correoElectronico: boolean;
}

// =============================
// Props del modal de creación
// =============================
export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClientData) => void;
}

// =============================
// Props del modal de edición
// =============================
export interface EditClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (data: EditClientData) => void;
}

// =============================
// Props del modal de visualización
// =============================
export interface ViewClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
}