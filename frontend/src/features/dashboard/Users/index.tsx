"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUsers } from "./hooks/useUsers";
import CreateUserModal from "./components/CreateUser";
import UsersTable from "./components/UsersTable";

export default function UsersPage() {
  const {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateUser,
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
        <main
          className="flex-1 flex flex-col"
          style={{ backgroundColor: "#E8E8E8" }}
        >
          <div className="px-6 pt-6">
            <CreateUserModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateUser}
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