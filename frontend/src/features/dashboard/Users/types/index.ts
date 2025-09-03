export interface User {
  id: number;
  documento: string;
  numeroDocumento: string;
  nombre: string;
  telefono: string;
  email: string;
  rol: string;
  estado: "Activo" | "Inactivo";
}

export interface CreateUserData {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  imagen: File | null;
  rol: string; // Mantener como requerido para creación
  password: string;
  confirmPassword: string;
}

export interface EditUserData {
  id: number;
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  rol: string; // Mantener como requerido para edición
  estado: "Activo" | "Inactivo";
}

// Cambia la extensión para hacer rol opcional en UserFormData
export interface UserFormData extends Omit<CreateUserData, 'password' | 'confirmPassword' | 'rol'> {
  id?: number;
  estado?: "Activo" | "Inactivo";
  rol?: string; // Ahora es opcional
  password?: string;
  confirmPassword?: string;
}

export interface FormErrors {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  rol: string;
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
  rol: boolean;
  password: boolean;
  confirmPassword: boolean;
}