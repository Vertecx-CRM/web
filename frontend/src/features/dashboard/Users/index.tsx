// index.tsx principal
"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUsers } from "./hooks/useUsers";
import CreateUserModal from "./components/CreateUser";
import UsersTable from "./components/UsersTable";
import EditUserModal from "./components/UpdateUser";
import ViewUserModal from "./components/ViewUserModal"; // Importar el nuevo modal

export default function UsersPage() {
  const {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen, // Obtener el nuevo estado
    setIsViewModalOpen, // Obtener el setter del nuevo estado
    selectedUser,
    handleCreateUser,
    handleEditUser,
    handleView,
    handleEdit,
    handleDelete
  } = useUsers();

  return (
    <div className="min-h-screen flex">
      {/* Toast Container para mostrar notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Contenido */}
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreateUserModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateUser}
            />

            <EditUserModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleEditUser}
              user={selectedUser}
            />

            {/* Nuevo modal para visualizar usuario */}
            <ViewUserModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              user={selectedUser}
            />

            <UsersTable
              users={users}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}