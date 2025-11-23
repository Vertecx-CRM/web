"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableTechnicians from "./components/tableTechnicians/tableTechnicians";
import CreateTechnicianModal from "./components/createTechniciansModal/createTechniciansModal";
import EditTechnicianModal from "./components/editTechniciansModal/editTechniciansModal";
import ViewTechnicianModal from "./components/viewTechniciansModal/viewTechniciansModal"; // ✅ import agregado
import { Technician, CreateTechnicianData } from "./types/typesTechnicians";
import { useTechnicians } from "./hooks/useTechnicians";
import { mockTechnicians } from "./mocks/mocksTechnicians";
import { useState } from "react";

export default function TechniciansIndex() {
  const {
    technicians,
    typeOptions,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTechnician,
    setEditingTechnician,
    handleCreateTechnician,
    handleEditTechnician,
    handleDeleteTechnician,
  } = useTechnicians(mockTechnicians);

  const [viewingTechnician, setViewingTechnician] = useState<Technician | null>(null);

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            
            <CreateTechnicianModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateTechnician as (data: CreateTechnicianData) => void}
              technicians={technicians}
              typeOptions={typeOptions}
            />

            {editingTechnician && (
              <EditTechnicianModal
                isOpen={true}
                technician={editingTechnician}
                onClose={() => setEditingTechnician(null)}
                onUpdate={(data) => handleEditTechnician(data.id, data)}
                technicians={technicians}
                typeOptions={typeOptions}
              />
            )}

            <ViewTechnicianModal
              isOpen={!!viewingTechnician}
              technician={viewingTechnician}
              onClose={() => setViewingTechnician(null)}
            />

            <TableTechnicians
              technicians={technicians}
              onView={(t) => setViewingTechnician(t)} 
              onEdit={(t) => setEditingTechnician(t)}
              onDelete={handleDeleteTechnician}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
