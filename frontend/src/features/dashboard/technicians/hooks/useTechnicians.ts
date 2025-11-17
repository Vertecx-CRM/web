"use client";

import { useState } from "react";
import {
  Technician,
  CreateTechnicianData,
  EditTechnicianData,
  TechnicianState,
} from "../types/typesTechnicians";
import { toast } from "react-toastify";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

type MinimalTechForValidate = Pick<
  Technician,
  "name" | "lastName" | "documentType" | "documentNumber" | "phone" | "email"
>;

const validateTechnician = (data: MinimalTechForValidate) => {
  if (!data.name.trim()) {
    toast.warning("El nombre es obligatorio");
    return false;
  }
  if (!data.lastName.trim()) {
    toast.warning("El apellido es obligatorio");
    return false;
  }
  if (!data.documentType) {
    toast.warning("El tipo de documento es obligatorio");
    return false;
  }
  if (!data.documentNumber.trim()) {
    toast.warning("El número de documento es obligatorio");
    return false;
  }
  if (!data.phone.trim()) {
    toast.warning("El teléfono es obligatorio");
    return false;
  }
  if (!data.email.trim()) {
    toast.warning("El correo es obligatorio");
    return false;
  }
  return true;
};

export const useTechnicians = (initialTechnicians: Technician[]) => {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const isEditModalOpen = editingTechnician !== null;
  const ACTIVE_STATE: TechnicianState = "Activo";

  const handleCreateTechnician = (data: CreateTechnicianData) => {
    const { resumePdf, ...rest } = data;

    if (
      !validateTechnician({
        name: rest.name,
        lastName: rest.lastName,
        documentType: rest.documentType,
        documentNumber: rest.documentNumber,
        phone: rest.phone,
        email: rest.email,
      })
    )
      return;

    const nextId = technicians.length
      ? Math.max(...technicians.map((t) => t.id)) + 1
      : 1;

    const resumeUrl = resumePdf ? URL.createObjectURL(resumePdf) : undefined;

    const newTech: Technician = {
      id: nextId,
      state: ACTIVE_STATE,
      name: rest.name,
      lastName: rest.lastName,
      documentType: rest.documentType,
      documentNumber: rest.documentNumber,
      phone: rest.phone,
      email: rest.email,
      image: rest.image,
      types: rest.types,
      // ❌ sin startedAt
      resumeUrl,
    };

    setTechnicians((prev) => [...prev, newTech]);
    setIsCreateModalOpen(false);
    toast.success("Técnico creado exitosamente");
  };

  const handleEditTechnician = (id: number, data: EditTechnicianData) => {
    const { resumePdf, ...rest } = data;

    if (
      !validateTechnician({
        name: rest.name,
        lastName: rest.lastName,
        documentType: rest.documentType,
        documentNumber: rest.documentNumber,
        phone: rest.phone,
        email: rest.email,
      })
    )
      return;

    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const updatedResumeUrl = resumePdf
          ? URL.createObjectURL(resumePdf)
          : t.resumeUrl;

        return {
          ...t,
          name: rest.name,
          lastName: rest.lastName,
          documentType: rest.documentType,
          documentNumber: rest.documentNumber,
          phone: rest.phone,
          email: rest.email,
          image: rest.image ?? t.image,
          state: rest.state ?? t.state,
          types: rest.types ?? t.types,
          // ❌ sin startedAt
          resumeUrl: updatedResumeUrl,
        };
      })
    );

    setEditingTechnician(null);
    toast.success("Técnico actualizado correctamente");
  };

  const handleDeleteTechnician = async (tech: Technician): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: `${tech.name} ${tech.lastName}`,
        itemType: "técnico",
        successMessage: `El técnico "${tech.name} ${tech.lastName}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el técnico. Intenta nuevamente.",
      },
      () => setTechnicians((prev) => prev.filter((t) => t.id !== tech.id))
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
