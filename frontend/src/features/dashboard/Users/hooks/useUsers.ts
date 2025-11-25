import { useState, useEffect, useRef } from "react";
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
  const [loading, setLoading] = useState(true);

  const waitForRender = async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  };

  const applyUsersResponse = async (response: any) => {
    const payload = response?.data ?? response;
    const sortUsers = (list: User[]) =>
      [...list].sort((a, b) =>
        `${a.name ?? ""} ${a.lastname ?? ""}`.localeCompare(
          `${b.name ?? ""} ${b.lastname ?? ""}`,
          "es",
          { sensitivity: "base" }
        )
      );

    if (Array.isArray(payload)) {
      setUsers(sortUsers(payload));
    } else if (payload?.data && Array.isArray(payload.data)) {
      setUsers(sortUsers(payload.data));
    } else {
      console.warn("Estructura de respuesta inesperada:", response);
      return;
    }
    await waitForRender();
  };

  const refreshUsers = async () => {
    const response = await fetchUsers();
    await applyUsersResponse(response);
    const payload = response?.data ?? response;
    if (typeof response?.status === "number") return response.status;
    if (response?.success) return 200;
    if (Array.isArray(payload)) return 200;
    if (payload?.data && Array.isArray(payload.data)) return 200;
    return undefined;
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const status = await refreshUsers();
        if (status !== 200) {
          throw new Error(`Refresh usuarios devolvio status ${status}`);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        showWarning("Error al cargar usuarios desde el servidor");
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadUsers();
    }
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    setLoading(true);
    try {
      setIsCreateModalOpen(false);
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
      setUsers((prev) => [...prev, newUser]);
      const status = await refreshUsers();
      if (status !== 200) {
        throw new Error(`Refresh usuarios devolvio status ${status}`);
      }

      showSuccess("Usuario creado exitosamente");
      await waitForRender();
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userData: EditUser) => {
    if (!userData.userid) return;

    setLoading(true);
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
        roleid: userData.roleid,
        ...(userData.CV !== undefined && { CV: userData.CV }),
        ...(userData.techniciantypeids && userData.techniciantypeids.length > 0 && { techniciantypeids: userData.techniciantypeids }),
        ...(userData.customercity !== undefined && { customercity: userData.customercity }),
        ...(userData.customerzipcode !== undefined && { customerzipcode: userData.customerzipcode }),
      };

      const updatedUser = await updateUser(userData.userid, payload);
      setUsers((prev) =>
        prev.map((u) => (u.userid === userData.userid ? updatedUser : u))
      );
      const status = await refreshUsers();
      if (status !== 200) {
        throw new Error(`Refresh usuarios devolvio status ${status}`);
      }

      showSuccess("Usuario actualizado exitosamente");
      await waitForRender();
      setEditingUser(null);
    } catch (error: any) {
      console.error(error);
      showWarning(error.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
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
        setLoading(true);
        try {
          if (!userToDelete.userid) return;

          setUsers((prev) => prev.filter((u) => u.userid !== userToDelete.userid));

          await deleteUser(userToDelete.userid);
          const status = await refreshUsers();
          if (status !== 200) {
            throw new Error(`Refresh usuarios devolvio status ${status}`);
          }
          await waitForRender();
        } catch (error) {
          console.error(error);
          showWarning("Error al eliminar usuario");
        } finally {
          setLoading(false);
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
    loading,
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
