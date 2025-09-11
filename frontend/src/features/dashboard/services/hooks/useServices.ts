"use client";

import { useState } from "react";
import { Service } from "../types/typesServices";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

// =================== VALIDACIONES DE SERVICIOS ===================
const validateServiceWithNotification = (serviceData: Omit<Service, "id">): boolean => {
  if (!serviceData.name.trim()) {
    showWarning("El nombre del servicio es obligatorio");
    return false;
  }

  if (!serviceData.category) {
    showWarning("Debe seleccionar una categoría");
    return false;
  }

  if (serviceData.price <= 0) {
    showWarning("El precio debe ser mayor a cero");
    return false;
  }

  return true;
};

// =================== HOOK ===================
export const useServices = (initialServices: Service[]) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const isEditModalOpen = editingService !== null;
  const isViewModalOpen = viewingService !== null;

  // CREATE
  const handleCreateService = (payload: Omit<Service, "id">) => {
    if (!validateServiceWithNotification(payload)) return;

    const nextId = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
    const newService: Service = { id: nextId, ...payload };

    setServices(prev => [...prev, newService]);
    setIsCreateModalOpen(false);
    showSuccess("Servicio creado exitosamente!");
  };

  // EDIT
  const handleEditService = (id: number, payload: Service) => {
    if (!validateServiceWithNotification(payload)) return;

    setServices(prev =>
      prev.map(s =>
        s.id === id ? { ...payload, id } : s
      )
    );
    setEditingService(null);
    showSuccess("Servicio actualizado exitosamente!");
  };

  // DELETE
  const handleDeleteService = async (service: Service): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: service.name,
        itemType: "servicio",
        successMessage: `El servicio "${service.name}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el servicio. Intenta nuevamente.",
      },
      () => {
        setServices(prev => prev.filter(s => s.id !== service.id));
      }
    );
  };

  return {
    services,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    editingService,
    viewingService,
    setEditingService,
    setViewingService,
    handleCreateService,
    handleEditService,
    handleDeleteService,
  };
};
