import { useState } from "react";
import { User, CreateUserData, EditUserData } from "../types";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const handleEditUser = (userData: EditUserData) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userData.id 
          ? {
              ...user,
              documento: userData.tipoDocumento,
              numeroDocumento: userData.documento,
              nombre: `${userData.nombre} ${userData.apellido}`,
              telefono: userData.telefono,
              email: userData.email,
              estado: userData.estado
            }
          : user
      )
    );
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleView = (user: User) => {
    console.log("Ver usuario:", user);
    // Aquí puedes implementar la lógica para ver el usuario
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    console.log("Eliminar usuario:", user);
    // Aquí puedes implementar la lógica para eliminar el usuario
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  return {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    setSelectedUser,
    handleCreateUser,
    handleEditUser,
    handleView,
    handleEdit,
    handleDelete
  };
};