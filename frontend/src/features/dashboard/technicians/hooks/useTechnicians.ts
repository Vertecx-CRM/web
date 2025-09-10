"use client";

import { useState } from "react";
import { Technician, CreateTechnicianData, EditTechnicianData, TechnicianStatus } from "../types/typesTechnicians";
import { toast } from "react-toastify";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

// =================== VALIDACIONES ===================
const validateTechnician = (data: Omit<Technician, "id" | "status"> & { password?: string; confirmPassword?: string }) => {
  if (!data.name.trim()) { toast.warning("El nombre es obligatorio"); return false; }
  if (!data.lastName.trim()) { toast.warning("El apellido es obligatorio"); return false; }
  if (!data.documentType) { toast.warning("El tipo de documento es obligatorio"); return false; }
  if (!data.documentNumber.trim()) { toast.warning("El número de documento es obligatorio"); return false; }
  if (!data.phone.trim()) { toast.warning("El teléfono es obligatorio"); return false; }
  if (!data.email.trim()) { toast.warning("El correo es obligatorio"); return false; }
  if (data.password && data.password !== data.confirmPassword) { toast.warning("Las contraseñas no coinciden"); return false; }
  return true;
};

// =================== HOOK ===================
export const useTechnicians = (initialTechnicians: Technician[]) => {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const isEditModalOpen = editingTechnician !== null;

  const ACTIVE_STATUS: TechnicianStatus = "Activo";
  const INACTIVE_STATUS: TechnicianStatus = "Inactivo";

  // CREATE
  const handleCreateTechnician = (data: CreateTechnicianData) => {
    if (!validateTechnician(data)) return;

    const nextId = technicians.length ? Math.max(...technicians.map(t => t.id)) + 1 : 1;
    const { password, confirmPassword, ...rest } = data;
    const newTech: Technician = { id: nextId, status: ACTIVE_STATUS, ...rest };

    setTechnicians(prev => [...prev, newTech]);
    setIsCreateModalOpen(false);
    toast.success("Técnico creado exitosamente");
  };

  // EDIT
  const handleEditTechnician = (id: number, data: EditTechnicianData) => {
    if (!validateTechnician(data)) return;

    const { password, confirmPassword, ...rest } = data;
    setTechnicians(prev =>
      prev.map(t => t.id === id ? { ...t, ...rest } : t)
    );
    setEditingTechnician(null);
    toast.success("Técnico actualizado correctamente");
  };

  // DELETE
  const handleDeleteTechnician = async (tech: Technician): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: `${tech.name} ${tech.lastName}`,
        itemType: "técnico",
        successMessage: `El técnico "${tech.name} ${tech.lastName}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el técnico. Intenta nuevamente.",
      },
      () => {
        setTechnicians(prev => prev.filter(t => t.id !== tech.id));
      }
    );
  };

  return {
    technicians,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    editingTechnician,
    setEditingTechnician,
    handleCreateTechnician,
    handleEditTechnician,
    handleDeleteTechnician,
  };
};
