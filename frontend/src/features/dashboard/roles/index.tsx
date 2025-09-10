// src/features/dashboard/roles/index.tsx
"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRoles } from "./hooks/useRoles";
import RolesTable from "./components/RolesTable";
import CreateRoleModal from "./components/CreateRoleModal/CreateRoleModal";
import EditRoleModal from "./components/EditRoleModal/EditRoleModal";
// import ViewRoleModal from "./components/ViewRoleModal";

export default function Index() {
  const {
    roles,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedRole,
    handleCreateRole,
    handleEditRole,
    handleView,
    handleEdit,
    handleDelete,
    closeModals,
  } = useRoles();

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            {/* Modales */}
            <CreateRoleModal
              open={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={(data) => handleCreateRole(data)}
            />

            <EditRoleModal
              isOpen={isEditModalOpen}
              role={selectedRole}
              onClose={() => setIsEditModalOpen(false)}
              onSave={(id, data) => handleEditRole(id, data)}
            />

            {/* <ViewRoleModal
              isOpen={isViewModalOpen}
              role={selectedRole}
              onClose={() => setIsViewModalOpen(false)}
            /> */}

            {/* Tabla */}
            <RolesTable
              roles={roles}
              onView={(r) => { handleView(r); setIsViewModalOpen(true); }}
              onEdit={(r) => { handleEdit(r); setIsEditModalOpen(true); }}
              onDelete={handleDelete}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
