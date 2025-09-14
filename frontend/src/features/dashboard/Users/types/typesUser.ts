export interface user {
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido?: string;
  telefono: string;
  email: string;
  rol: string;
  estado: "Activo" | "Inactivo";
  imagen?: File | null;
  password?: string;
  confirmPassword?: string;
}

export interface userBase {
  numeroDocumento: string;
  nombre: string;
  telefono: string;
  email: string;
  estado: "Activo" | "Inactivo";
  imagen?: File | null;
}

export interface createUserData extends userBase {
  tipoDocumento: string;
  apellido: string;
  rol: string;
  password: string;
  confirmPassword: string;
}

export interface editUser extends userBase {
  id: number;
  tipoDocumento: string;
  apellido: string;
  rol: string;
}

export interface formErrors {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  rol: string;
  estado?: string
  password: string;
  confirmPassword: string;
}

export interface formTouched {
  tipoDocumento: boolean;
  numeroDocumento: boolean;
  nombre: boolean;
  apellido: boolean;
  telefono: boolean;
  email: boolean;
  rol: boolean;
  estado: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export interface createUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: createUserData) => void;
}

export interface editUserModalProps {
  isOpen: boolean;
  user: editUser | null; 
  onClose: () => void;
  onSave: (userData: editUser ) => void;
}

export interface viewUserModalProps {
  isOpen: boolean;
  user: user | null;
  onClose: () => void;
}

export interface UsersTableProps {
  users: user[];
  onView: (user: user) => void;
  onEdit: (user: editUser) => void;
  onDelete: (user: user) => void;
  onCreate: () => void;
}

export interface userForTable extends Omit<user, 'id'> {
  id: number;
}