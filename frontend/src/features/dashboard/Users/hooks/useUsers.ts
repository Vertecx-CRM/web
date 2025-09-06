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
    imagen: "/icons/Eye.svg",
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
    imagen: "/icons/Plus.svg",
    estado: "Activo",
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null); 

  const handleCreateUser = (userData: CreateUserData) => {
    const newUser: User = {
      id: users.length + 1,
      documento: userData.tipoDocumento,
      numeroDocumento: userData.documento,
      nombre: `${userData.nombre} ${userData.apellido}`,
      telefono: userData.telefono,
      email: userData.email,
      rol: userData.rol || "Usuario",
      estado: "Activo",
      imagen: userData.imagen ? URL.createObjectURL(userData.imagen) : undefined,
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
            rol: userData.rol,
            email: userData.email,
            estado: userData.estado,
            imagen: userData.imagen 
              ? URL.createObjectURL(userData.imagen) 
              : user.imagen
          }
          : user
      )
    );
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    // Solo guardamos el usuario a eliminar, la confirmación se maneja en el componente
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null); // Limpiar después de eliminar
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null); // Cancelar eliminación
  };

  return {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedUser,
    setSelectedUser,
    userToDelete, // Exportar el usuario a eliminar
    handleCreateUser,
    handleEditUser,
    handleView,
    handleEdit,
    handleDelete: handleDeleteClick, // Cambiar nombre para claridad
    confirmDelete, // Nueva función para confirmar eliminación
    cancelDelete // Nueva función para cancelar eliminación
  };
};