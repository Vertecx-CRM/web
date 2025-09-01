import { useState } from "react";
import { User, CreateUserData } from "../types";

// Datos mock iniciales
const initialUsers: User[] = [
  {
    id: 1,
    documento: "CC",
    numeroDocumento: "1021805280",
    nombre: "Joaica Estad Grita Cuello",
    telefono: "30082328274",
    email: "joaicestd@gmail.com",
    rol: "Administrador",
    estado: "Inactivo",
  },
  {
    id: 2,
    documento: "PPT",
    numeroDocumento: "1221006289",
    nombre: "Samuel Condesa",
    telefono: "3113286848",
    email: "sam16208@gmail.com",
    rol: "Citrate",
    estado: "Activo",
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateUser = (userData: CreateUserData) => {
    const newUser: User = {
      id: users.length + 1,
      documento: userData.tipoDocumento,
      numeroDocumento: userData.documento,
      nombre: `${userData.nombre} ${userData.apellido}`,
      telefono: userData.telefono,
      email: userData.email,
      rol: "Usuario",
      estado: "Activo",
    };

    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
  };

  const handleView = (user: User) => {
    console.log("Ver usuario:", user);
    // Aquí puedes implementar la lógica para ver el usuario
  };

  const handleEdit = (user: User) => {
    console.log("Editar usuario:", user);
    // Aquí puedes implementar la lógica para editar el usuario
  };

  const handleDelete = (user: User) => {
    console.log("Eliminar usuario:", user);
    // Aquí puedes implementar la lógica para eliminar el usuario
  };

  return {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateUser,
    handleView,
    handleEdit,
    handleDelete
  };
};