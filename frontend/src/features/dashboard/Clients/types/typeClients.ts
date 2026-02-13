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
export interface CreateClientData extends ClientFormBase {
  rol: string;
}

// =============================
// Editar cliente (formulario)
// =============================
export interface EditClientData extends ClientFormBase {
  id: number;
  rol: string;
}

// =============================
// Cliente completo (modelo backend)
// =============================
export interface Client extends ClientFormBase {
  id: number;
  rol: string;
}

// =============================
// Cliente para tabla
// =============================
export interface ClientForTable {
  id: number;
  tipo: string;
  documento: string;
  nombreCompleto: string;
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
  rol: string;
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
  rol: boolean;
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
  onSave: (id: number, data: EditClientData) => void;
}
