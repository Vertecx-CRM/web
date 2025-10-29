import { useState, useEffect } from "react";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import {
  User,
  EditUser,
  CreateUserData,
} from "../types/typesUser";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../connection/userApi";

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUser | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers();

        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (Array.isArray(response)) {
          setUsers(response);
        } else {
          console.warn("⚠️ Estructura de respuesta inesperada:", response);
          setUsers([]);
        }
      } catch (error) {
        console.error(error);
        showWarning("Error al cargar usuarios desde el servidor");
      }
    };

    loadUsers();
  }, []);


  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const payload = {
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        documentnumber: userData.documentnumber,
        typeid: userData.typeid,
        image: userData.image || null,
        stateid: userData.stateid,
      };

      const newUser = await createUser(payload);
      showSuccess("Usuario creado exitosamente");

      // Actualiza el estado local sin esperar al backend
      setUsers((prev) => [...prev, newUser]);

      // (opcional) vuelve a cargar en segundo plano
      fetchUsers().then((fresh) => {
        if (Array.isArray(fresh.data)) setUsers(fresh.data);
      });

      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al crear usuario");
    }
  };


  const handleEditUser = async (userData: EditUser) => {
    if (!userData.userid) return;

    try {
      const payload = {
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        documentnumber: userData.documentnumber,
        typeid: userData.typeid,
        image: userData.image || null,
        stateid: userData.stateid,
      };

      const updatedUser = await updateUser(userData.userid, payload);
      showSuccess("Usuario actualizado exitosamente");

      // Actualiza el estado local sin esperar a recargar todo
      setUsers((prev) =>
        prev.map((u) => (u.userid === userData.userid ? updatedUser : u))
      );

      // (opcional) vuelve a cargar en segundo plano para sincronizar
      fetchUsers().then((fresh) => {
        if (Array.isArray(fresh.data)) setUsers(fresh.data);
      });

      setEditingUser(null);
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al actualizar usuario");
    }
  };


  const handleDelete = async (userToDelete: User) => {
    return confirmDelete(
      {
        itemName: userToDelete.name,
        itemType: "usuario",
        successMessage: `El usuario "${userToDelete.name}" ha sido eliminado.`,
        errorMessage: "Error al eliminar usuario",
      },
      async () => {
        try {
          if (!userToDelete.userid) return;

          setUsers((prev) => prev.filter((u) => u.userid !== userToDelete.userid));

          await deleteUser(userToDelete.userid);

          showSuccess(`Usuario "${userToDelete.name}" eliminado exitosamente`);

          fetchUsers().then((fresh) => {
            if (fresh.success && Array.isArray(fresh.data)) {
              setUsers(fresh.data);
            }
          });
        } catch (error) {
          console.error(error);
          showWarning("Error al eliminar usuario");
        }
      }
    );
  };


  const handleView = (u: User) => setViewingUser(u);

  const handleEdit = (u: EditUser) => setEditingUser(u);

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    setViewingUser(null);
  };

  return {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingUser,
    viewingUser,
    handleCreateUser,
    handleEditUser,
    handleDelete,
    handleEdit,
    handleView,
    closeModals,
  };
};
