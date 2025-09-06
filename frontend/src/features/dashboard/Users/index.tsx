"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUsers } from "./hooks/useUsers";
import CreateUserModal from "./components/CreateUser";
import UsersTable from "./components/UsersTable";
import EditUserModal from "./components/UpdateUser";
import ViewUserModal from "./components/ViewUserModal";
import DeleteConfirmation from "./components/DeleteUser/DeleteConfirmation";


export default function UsersPage() {
  const {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedUser,
    userToDelete, // Obtener usuario a eliminar
    handleCreateUser,
    handleEditUser,
    handleView,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete
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

            <ViewUserModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              user={selectedUser}
            />

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmation
              user={userToDelete}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
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