"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServicesTable from "./components/ServicesTable";
import CreateServiceModal from "./components/CreateServicesModal/CreateServicesModal";
import EditServiceModal from "./components/EditServicesModal/EditServicesModal";
import { Service } from "./types/typesServices";
import { useServices } from "./hooks/useServices";

// Mocks de 20 servicios
const mockServices: Service[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Servicio ${i + 1}`,
  description: `Descripción del servicio ${i + 1}`,
  price: 50000 + i * 1000,
  category:
    i % 3 === 0
      ? "Mantenimiento Preventivo"
      : i % 3 === 1
      ? "Mantenimiento Correctivo"
      : "Instalación",
  status: i % 2 === 0 ? "Activo" : "Inactivo",
  image: undefined,
}));

export default function ServiciosIndex() {
  const {
    services,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    editingService,
    setEditingService,
    handleCreateService,
    handleEditService,
    handleDeleteService,
  } = useServices(mockServices);

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="bottom-right" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreateServiceModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateService}
            />

            <EditServiceModal
              isOpen={isEditModalOpen}
              service={editingService}
              onClose={() => setEditingService(null)}
              onSave={(data) => handleEditService(data.id, data)}
            />

            <ServicesTable
              services={services}
              onView={(s) => alert(`Ver servicio "${s.name}"`)}
              onEdit={(s) => setEditingService(s)}
              onDelete={handleDeleteService}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
