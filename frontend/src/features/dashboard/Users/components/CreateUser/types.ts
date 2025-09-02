export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export interface UserFormData {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  imagen: File | null;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormTouched {
  tipoDocumento: boolean;
  documento: boolean;
  nombre: boolean;
  apellido: boolean;
  telefono: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}