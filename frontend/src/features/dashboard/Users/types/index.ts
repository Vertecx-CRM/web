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