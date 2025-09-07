"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUsers } from "./hooks/useUsers";
import CreateUserModal from "./components/CreateUserModal/CreateUser";
import UsersTable from "./components/UsersTable/Usertable";
import EditUserModal from "./components/EditUserModal/EditUser";
import ViewUserModal from "./components/ViewUserModal/viewUser";

export default function UsersPage() {
  const {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingUser,
    viewingUser,
    handleCreateUser,
    handleEditUser,
    handleView,
    handleEdit,
    handleDelete, 
    closeModals
  } = useUsers();

  // Determinar si los modales están abiertos basado en el estado
  const isEditModalOpen = !!editingUser;
  const isViewModalOpen = !!viewingUser;

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
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreateUserModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateUser}
            />

            <EditUserModal
              isOpen={isEditModalOpen}
              onClose={closeModals}
              onSave={handleEditUser}
              user={editingUser}
            />

            <ViewUserModal
              isOpen={isViewModalOpen}
              onClose={closeModals}
              user={viewingUser}
            />

            {/* NO necesitas DeleteConfirmation modal aquí */}
            {/* SweetAlert2 se encargará del modal de confirmación */}

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