export interface User {
  userid?: number;           
  createat?: string | Date;  
  updateat?: string | Date;  
  stateid: number;           
  typeid: number;            
  phone: string;             
  documentnumber: string;    
  image?: string | null;     
  name: string;              
  lastname: string;          
  email: string;             
  password?: string;         
  confirmPassword?: string;  
  states?: any;              
  typeofdocuments?: any;     
}

export interface UserForTable extends User {
  id: number; 
}

export interface CreateUserData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  typeid: number;
  documentnumber: string;
  image?: string | File | null;
  stateid: number;
}

export interface EditUser {
  userid: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  documentnumber: string;
  typeid: number;
  image?: string | File | null;
  stateid: number;
}

export interface FormErrors {
  userid: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  documentnumber: string;
  typeid: string;
  stateid: string;
  image: string;
}

export interface FormTouched {
  userid: boolean;
  name: boolean;
  lastname: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  phone: boolean;
  documentnumber: boolean;
  typeid: boolean;
  stateid: boolean;
  image: boolean;
}


export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData) => void;
}

export interface EditUserModalProps {
  isOpen: boolean;
  user: EditUser | null;
  onClose: () => void;
  onSave: (userData: EditUser) => void;
}

export interface ViewUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export interface UsersTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: EditUser) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
}

export interface UserForTable extends Omit<User, "userid"> {
  userid: number;
}
