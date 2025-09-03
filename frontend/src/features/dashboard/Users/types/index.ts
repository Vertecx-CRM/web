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
  estado: "Activo" | "Inactivo";
}

export interface UserFormData extends Omit<CreateUserData, 'password' | 'confirmPassword'> {
  id?: number;
  estado?: "Activo" | "Inactivo";
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