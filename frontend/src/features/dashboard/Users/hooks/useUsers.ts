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
import { useLoader } from "@/shared/components/loader";

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUser | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const { showLoader, hideLoader } = useLoader();

  const applyUsersResponse = (response: any) => {
    if (response?.success && Array.isArray(response.data)) {
      setUsers(response.data);
    } else if (Array.isArray(response)) {
      setUsers(response);
    } else {
      console.warn("Estructura de respuesta inesperada:", response);
      setUsers([]);
    }
  };

  const refreshUsers = async () => {
    const response = await fetchUsers();
    applyUsersResponse(response);
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        showLoader();
        const response = await fetchUsers();
        applyUsersResponse(response);
      } catch (error) {
        console.error(error);
        showWarning("Error al cargar usuarios desde el servidor");
      } finally {
        hideLoader();
      }
    };

    loadUsers();
  }, []);


  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      showLoader();
      const payload = {
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        documentnumber: userData.documentnumber,
        typeid: userData.typeid,
        image: userData.image || null,
        stateid: userData.stateid,
        roleid: userData.roleid,
        // Campos condicionales
        ...(userData.CV !== undefined && { CV: userData.CV }),
        ...(userData.techniciantypeids && userData.techniciantypeids.length > 0 && { techniciantypeids: userData.techniciantypeids }),
        ...(userData.customercity !== undefined && { customercity: userData.customercity }),
        ...(userData.customerzipcode !== undefined && { customerzipcode: userData.customerzipcode }),
      };

      const newUser = await createUser(payload);
      showSuccess("Usuario creado exitosamente");

      // Actualiza el estado local sin esperar al backend
      setUsers((prev) => [...prev, newUser]);

      await refreshUsers();

      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al crear usuario");
    } finally {
      hideLoader();
    }
  };


  const handleEditUser = async (userData: EditUser) => {
    if (!userData.userid) return;

    try {
      showLoader();
      const payload = {
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        documentnumber: userData.documentnumber,
        typeid: userData.typeid,
        image: userData.image || null,
        stateid: userData.stateid,
        roleid: userData.roleid,
        ...(userData.CV !== undefined && { CV: userData.CV }),
        ...(userData.techniciantypeids && userData.techniciantypeids.length > 0 && { techniciantypeids: userData.techniciantypeids }),
        ...(userData.customercity !== undefined && { customercity: userData.customercity }),
        ...(userData.customerzipcode !== undefined && { customerzipcode: userData.customerzipcode }),
      };

      const updatedUser = await updateUser(userData.userid, payload);
      showSuccess("Usuario actualizado exitosamente");

      setUsers((prev) =>
        prev.map((u) => (u.userid === userData.userid ? updatedUser : u))
      );

      await refreshUsers();

      setEditingUser(null);
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al actualizar usuario");
    } finally {
      hideLoader();
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
          showLoader();
          if (!userToDelete.userid) return;

          setUsers((prev) => prev.filter((u) => u.userid !== userToDelete.userid));

          await deleteUser(userToDelete.userid);

          await refreshUsers();
        } catch (error) {
          console.error(error);
          showWarning("Error al eliminar usuario");
        } finally {
          hideLoader();
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

