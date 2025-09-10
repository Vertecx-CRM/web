"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableTechnicians from "./components/tableTechnicians/tableTechnicians";
import CreateTechnicianModal from "./components/createTechniciansModal/createTechniciansModal";
import EditTechnicianModal from "./components/editTechniciansModal/editTechniciansModal";
import { Technician, CreateTechnicianData } from "./types/typesTechnicians";
import { useTechnicians } from "./hooks/useTechnicians";

// Mocks de 20 técnicos
const mockTechnicians: Technician[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Técnico ${i + 1}`,
  lastName: `Apellido ${i + 1}`,
  documentType:
    i % 5 === 0
      ? "Cédula de ciudadanía"
      : i % 5 === 1
      ? "Cédula de extranjería"
      : i % 5 === 2
      ? "Tarjeta de identidad"
      : i % 5 === 3
      ? "Pasaporte"
      : "Otro",
  documentNumber: `${10000000 + i}`,
  phone: `30012345${String(i).padStart(2, "0")}`,
  email: `tecnico${i + 1}@correo.com`,
  specialty: i % 3 === 0 ? "Electricista" : i % 3 === 1 ? "Mecánico" : "Plomero",
  status: i % 2 === 0 ? "Activo" : "Inactivo",
}));

export default function TechniciansIndex() {
  const {
    technicians,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTechnician,
    setEditingTechnician,
    handleCreateTechnician,
    handleEditTechnician,
    handleDeleteTechnician,
  } = useTechnicians(mockTechnicians);

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            {/* Modal Crear */}
            <CreateTechnicianModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateTechnician as (data: CreateTechnicianData) => void}
            />

            {/* Modal Editar */}
            {editingTechnician && (
              <EditTechnicianModal
                isOpen={true}
                technician={editingTechnician}
                onClose={() => setEditingTechnician(null)}
                onUpdate={(data) => handleEditTechnician(data.id, data)}
              />
            )}

            {/* Tabla de técnicos */}
            <TableTechnicians
              technicians={technicians}
              onView={(t) => alert(`Ver técnico "${t.name} ${t.lastName}"`)}
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
