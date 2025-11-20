"use client";

import { useEffect, useState } from "react";
import {
  Technician,
  CreateTechnicianData,
  EditTechnicianData,
  TechnicianState,
} from "../types/typesTechnicians";
import { toast } from "react-toastify";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
} from "@/shared/utils/cloudinary";
import {
  getTechnicians as getTechniciansApi,
  createTechnician as createTechnicianApi,
  updateTechnician as updateTechnicianApi,
  deleteTechnician as deleteTechnicianApi,
  CreateTechnicianPayload,
  UpdateTechnicianPayload,
} from "../api/technicians.api";
import { useLoader } from "@/shared/components/loader";

type MinimalTechForValidate = Pick<
  Technician,
  "name" | "lastName" | "documentType" | "documentNumber" | "phone" | "email"
>;

const TECH_TYPE_MAP: Record<string, number> = {
  "Cableado estructurado": 1,
  Electricista: 2,
  Redes: 3,
};

const TECHNICIAN_ROLECONFIG_ID = 3;

const mapTechTypesToIds = (types: string[]) =>
  types
    .map((name) => TECH_TYPE_MAP[name])
    .filter((id): id is number => typeof id === "number");

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

// Tiempo extra para dejar el loader mientras React pinta el cierre del modal, tabla, toast, etc.
const EXTRA_LOADER_DELAY_MS = 300;

export const useTechnicians = (_initialTechnicians: Technician[]) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] =
    useState<Technician | null>(null);

  const isEditModalOpen = editingTechnician !== null;

  const { showLoader, hideLoader } = useLoader();

  const loadTechnicians = async () => {
    try {
      const list = await getTechniciansApi();
      setTechnicians(list);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los técnicos.");
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleCreateTechnician = async (data: CreateTechnicianData) => {
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

    try {
      showLoader();

      const imageUrl = rest.image
        ? await uploadImageToCloudinary(rest.image)
        : undefined;
      const resumeUrl = resumePdf
        ? await uploadPdfToCloudinary(resumePdf)
        : undefined;
      const techniciantypeids = mapTechTypesToIds(rest.types);

      const payload: CreateTechnicianPayload = {
        name: rest.name,
        lastname: rest.lastName,
        email: rest.email,
        documentnumber: rest.documentNumber,
        phone: rest.phone,
        techniciantypeids,
        CV: resumeUrl ?? null,
        image: imageUrl ?? null,
        roleconfigurationid: TECHNICIAN_ROLECONFIG_ID,
      };

      await createTechnicianApi(payload);

      await loadTechnicians();
      setIsCreateModalOpen(false);
      toast.success("Técnico creado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el técnico. Intenta nuevamente.");
    } finally {
      // Dejamos un pequeño margen para que React cierre el modal,
      // actualice la tabla y muestre la alerta mientras el loader sigue visible.
      await new Promise((resolve) =>
        setTimeout(resolve, EXTRA_LOADER_DELAY_MS)
      );
      hideLoader();
    }
  };

  const handleEditTechnician = async (id: number, data: EditTechnicianData) => {
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

    const existing = technicians.find((t) => t.id === id);
    if (!existing) {
      toast.error("No se encontró el técnico en la lista local.");
      return;
    }

    try {
      showLoader();

      const imageUrl = rest.image
        ? await uploadImageToCloudinary(rest.image)
        : existing.image;
      const resumeUrl = resumePdf
        ? await uploadPdfToCloudinary(resumePdf)
        : existing.resumeUrl;
      const techniciantypeids = rest.types
        ? mapTechTypesToIds(rest.types)
        : undefined;

      const body: UpdateTechnicianPayload = {
        name: rest.name,
        lastname: rest.lastName,
        email: rest.email,
        documentnumber: rest.documentNumber,
        phone: rest.phone,
      };

      if (imageUrl && imageUrl !== existing.image) body.image = imageUrl;
      if (resumeUrl && resumeUrl !== existing.resumeUrl) body.CV = resumeUrl;
      if (techniciantypeids && techniciantypeids.length > 0)
        body.techniciantypeids = techniciantypeids;

      await updateTechnicianApi(id, body);

      await loadTechnicians();
      setEditingTechnician(null);
      toast.success("Técnico actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el técnico. Intenta nuevamente.");
    } finally {
      await new Promise((resolve) =>
        setTimeout(resolve, EXTRA_LOADER_DELAY_MS)
      );
      hideLoader();
    }
  };

  const handleDeleteTechnician = async (
    tech: Technician
  ): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: `${tech.name} ${tech.lastName}`,
        itemType: "técnico",
        successMessage: `El técnico "${tech.name} ${tech.lastName}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el técnico. Intenta nuevamente.",
      },
      async () => {
        try {
          showLoader();
          await deleteTechnicianApi(tech.id);
          setTechnicians((prev) => prev.filter((t) => t.id !== tech.id));
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          await new Promise((resolve) =>
            setTimeout(resolve, EXTRA_LOADER_DELAY_MS)
          );
          hideLoader();
        }
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
