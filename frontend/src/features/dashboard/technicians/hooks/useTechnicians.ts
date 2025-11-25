"use client";

import { useEffect, useState } from "react";
import {
  Technician,
  CreateTechnicianData,
  EditTechnicianData,
} from "../types/typesTechnicians";
import { toast } from "react-toastify";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
} from "@/shared/utils/cloudinary";
import {
  getTechnicians as getTechniciansApi,
  getTechnicianTypes,
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

const normalizeTypeName = (name: string) => name.trim().toLowerCase();

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

const EXTRA_LOADER_DELAY_MS = 300;

export const useTechnicians = (_initialTechnicians: Technician[]) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [typeNameToId, setTypeNameToId] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(TECH_TYPE_MAP).map(([k, v]) => [normalizeTypeName(k), v])
    )
  );
  const [typeOptions, setTypeOptions] = useState<string[]>(
    Object.keys(TECH_TYPE_MAP)
  );
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

  const loadTechnicianTypes = async () => {
    try {
      const types = await getTechnicianTypes();
      if (types.length > 0) {
        setTypeNameToId(
          Object.fromEntries(
            types.map((t) => [normalizeTypeName(t.name), t.techniciantypeid])
          )
        );
        setTypeOptions(types.map((t) => t.name));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const mapTechTypesToIds = (types: string[]) =>
    types
      .map((name) => typeNameToId[normalizeTypeName(name)])
      .filter((id): id is number => typeof id === "number");

  useEffect(() => {
    loadTechnicians();
    loadTechnicianTypes();
  }, []);

  const handleCreateTechnician = async (data: CreateTechnicianData) => {
    const { resumePdf, typeid, ...rest } = data;

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
        typeid: typeid,
      };

      await createTechnicianApi(payload);
      await loadTechnicians();
      setIsCreateModalOpen(false);
      toast.success("Técnico creado exitosamente");
    } catch (error) {
      console.error(error);
      const apiMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "";
      toast.error(
        apiMessage
          ? `No se pudo crear el técnico: ${apiMessage}`
          : "No se pudo crear el técnico. Intenta nuevamente."
      );
    } finally {
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
      const stateid = rest.state === "Inactivo" ? 2 : 1;

      const body: UpdateTechnicianPayload = {
        name: rest.name,
        lastname: rest.lastName,
        documentnumber: rest.documentNumber,
        phone: rest.phone,
        stateid,
      };

      if (rest.email !== existing.email) {
        body.email = rest.email;
      }

      body.typeid = rest.typeid;

      if (imageUrl && imageUrl !== existing.image) body.image = imageUrl;
      if (resumeUrl && resumeUrl !== existing.resumeUrl) body.CV = resumeUrl;
      if (techniciantypeids && techniciantypeids.length > 0)
        body.techniciantypeids = techniciantypeids;
      // Si no cambian tipos, igual respetamos el estado actualizado

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
    typeOptions,
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
