import { useState, useEffect } from "react";
import {
  Client,
  CreateClientData,
  EditClientData,
  FormErrors,
  FormTouched,
  EditClientModalProps,
  CreateClientModalProps
} from "../types/typeClients";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from "../api/clients.api";
import { showSuccess, showError } from "@/shared/utils/notifications";
import { validateFormWithNotification } from "../validations/clientsValidations";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

//
// ==============================
// CREATE CLIENT FORM HOOK
// ==============================
//
export const useCreateClientForm = ({
  isOpen,
  onClose,
  onSave
}: CreateClientModalProps) => {
  const [formData, setFormData] = useState<CreateClientData>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    estado: "Activo"
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: ""
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipo: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correoElectronico: false
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tipo: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        correoElectronico: "",
        estado: "Activo"
      });
      setErrors({
        tipo: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        correoElectronico: ""
      });
      setTouched({
        tipo: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        correoElectronico: false
      });
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched
    );

    if (!isValid) return;

    onSave(formData);
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit
  };
};

//
// ==============================
// EDIT CLIENT FORM HOOK
// ==============================
//
export const useEditClientForm = ({
  isOpen,
  onClose,
  onSave,
  client
}: EditClientModalProps) => {
  const [formData, setFormData] = useState<CreateClientData>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    estado: "Activo"
  });

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        tipo: client.tipo ?? "",
        documento: client.documento ?? "",
        nombre: client.nombre ?? "",
        apellido: client.apellido ?? "",
        telefono: client.telefono ?? "",
        correoElectronico: client.correoElectronico ?? "",
        estado: client.estado ?? "Activo"
      });
    }
  }, [isOpen, client]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.id) return;
    onSave({ ...formData, id: client.id });
  };

  return {
    formData,
    handleInputChange,
    handleSubmit
  };
};

//
// ==============================
// VIEW CLIENT FORM HOOK
// ==============================
//
export const useViewClientForm = (client: Client | null) => {
  return {
    clientData: {
      nombre: client?.nombre ?? "",
      apellido: client?.apellido ?? "",
      tipo: client?.tipo ?? "",
      documento: client?.documento ?? "",
      telefono: client?.telefono ?? "",
      correoElectronico: client?.correoElectronico ?? "",
      estado: client?.estado ?? ""
    }
  };
};

//
// ==============================
// MAIN CLIENTS HOOK
// ==============================
//
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<EditClientData | null>(null);
  const [viewingClient, setViewingClient] =
    useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClients("all");
      setClients(data);
    } catch (error) {
      showError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (form: CreateClientData) => {
    try {
      await createClient({
        tipo: form.tipo,
        documento: form.documento,
        fullName: `${form.nombre} ${form.apellido}`,
        telefono: form.telefono,
        correo: form.correoElectronico,
        estado: form.estado === "Activo"
      });

      showSuccess("Cliente creado correctamente");
      setIsCreateModalOpen(false);
      fetchClients();
    } catch (error: any) {
      showError(error?.message ?? "Error al crear cliente");
    }
  };

  const handleEditClient = async (form: EditClientData) => {
    try {
      await updateClient(form.id, {
        tipo: form.tipo,
        documento: form.documento,
        fullName: `${form.nombre} ${form.apellido}`,
        telefono: form.telefono,
        correo: form.correoElectronico,
        estado: form.estado === "Activo"
      });

      showSuccess("Cliente actualizado correctamente");
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      showError(error?.message ?? "Error al actualizar cliente");
    }
  };

  const handleDeleteClient = async (client: Client) => {
    return confirmDelete(
      {
        itemName: `${client.nombre} ${client.apellido}`,
        itemType: "cliente",
        successMessage: "Cliente eliminado correctamente",
        errorMessage: "No se pudo eliminar el cliente"
      },
      async () => {
        await deleteClient(client.id);
        fetchClients();
      }
    );
  };

  const closeModals = () => {
    setEditingClient(null);
    setViewingClient(null);
    setIsCreateModalOpen(false);
  };

  return {
    clients,
    loading,
    isCreateModalOpen,
    editingClient,
    viewingClient,
    setIsCreateModalOpen,
    setEditingClient,
    setViewingClient,
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
    closeModals
  };
};