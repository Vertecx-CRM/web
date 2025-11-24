"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRoles } from "./hooks/useRoles";
import RolesTable from "./components/RolesTable";
import CreateRoleModal from "./components/CreateRoleModal/CreateRoleModal";
import EditRoleModal from "./components/EditRoleModal/EditRoleModal";
import ViewRoleModal from "./components/ViewRoleModal/ViewRole";

export default function Index() {
  const {
    roles,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewingRole,
    selectedRole,
    handleCreateRole,
    handleEditRole,
    handleView,
    handleEdit,
    handleDelete,
  } = useRoles();

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreateRoleModal
              open={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={(data) => handleCreateRole(data)}
              existingRoles={roles}
            />

            <EditRoleModal
              isOpen={isEditModalOpen}
              role={selectedRole}
              onClose={() => setIsEditModalOpen(false)}
              onSave={(id, data) => handleEditRole(id, data)}
              existingRoles={roles}
            />

            <ViewRoleModal
              open={isViewModalOpen}
              role={viewingRole} 
              onClose={() => setIsViewModalOpen(false)}
            />

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
