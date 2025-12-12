// src/features/dashboard/Clients/hooks/useClients.ts

import { useState, useEffect } from "react";
import {
  Client,
  CreateClientData,
  EditClientData,
  FormErrors,
  FormTouched,
  EditClientModalProps,
  CreateClientModalProps,
  ClientBase,
} from "../types/typeClients";
import { initialClients } from "../mocks/mockClients";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import {
  validateFormWithNotification,
  validateSingleField,
} from "../validations/clientsValidations";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

// Para validaciones UX (no permitir caracteres inválidos)
const onlyLettersAndSpacesRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]*$/;

const VALIDATABLE_FIELDS: (keyof ClientBase)[] = [
  "tipo",
  "documento",
  "nombre",
  "apellido",
  "telefono",
  "correoElectronico",
  "rol",
  "estado",
];

// ======================================================
// HOOK PRINCIPAL PARA CRUD Y LISTADO
// ======================================================
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<EditClientData | null>(
    null
  );
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const handleCreateClient = (clientData: CreateClientData) => {
    const newClient: Client = {
      id: clients.length ? Math.max(...clients.map((c) => c.id)) + 1 : 1,
      tipo: clientData.tipo,
      documento: clientData.documento,
      nombre: clientData.nombre,
      apellido: clientData.apellido,
      telefono: clientData.telefono,
      correoElectronico: clientData.correoElectronico,
      rol: clientData.rol,
      estado: clientData.estado || "Activo",
    };

    setClients((prev) => [...prev, newClient]);
    setIsCreateModalOpen(false);
    showSuccess("Cliente creado exitosamente!");
  };

  const handleEditClient = (id: number, clientData: EditClientData) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...clientData } : client
      )
    );
    setEditingClient(null);
    showSuccess("Cliente actualizado exitosamente!");
  };

  const handleDeleteClient = async (client: Client): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: client.nombre,
        itemType: "cliente",
        successMessage: `El cliente "${client.nombre}" ha sido eliminado correctamente.`,
        errorMessage: "No se pudo eliminar el cliente. Por favor, intenta nuevamente.",
      },
      () => {
        setClients((prev) => prev.filter((c) => c.id !== client.id));
      }
    );
  };

  const handleView = (client: Client) => setViewingClient(client);

  // ======================================================
  // *** SOLUCIÓN DEL ERROR ***
  // DataTable pasa un Client → NO un EditClientData
  // ======================================================
  const handleEdit = (client: Client) => {
    setEditingClient({
      ...client,
      contrasena: "",
      confirmarContrasena: "",
    });
  };

  const handleDelete = async (client: Client) => {
    await handleDeleteClient(client);
  };

  const closeModals = () => {
    setEditingClient(null);
    setViewingClient(null);
    setIsCreateModalOpen(false);
  };

  return {
    clients,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingClient,
    viewingClient,
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
    handleView,
    handleEdit, // ← YA FUNCIONA CON DataTable
    handleDelete,
    closeModals,
    setEditingClient,
    setViewingClient,
  };
};

// ======================================================
// VALIDACIONES DE CONTRASEÑA (SOLO CREAR)
// ======================================================
const validatePassword = (pass: string): string => {
  if (!pass.trim()) return "La contraseña es obligatoria";
  if (pass.length < 6)
    return "La contraseña debe tener al menos 6 caracteres";
  return "";
};

const validatePasswordConfirmation = (
  pass: string,
  confirm: string
): string => {
  if (!confirm.trim()) return "Debe confirmar la contraseña";
  if (pass !== confirm) return "Las contraseñas no coinciden";
  return "";
};

// ======================================================
// FORMULARIO DE CREACIÓN
// ======================================================
export const useCreateClientForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateClientModalProps) => {
  const [formData, setFormData] = useState<CreateClientData>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    rol: "Cliente",
    estado: "Activo",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    rol: "",
    estado: "",
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipo: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correoElectronico: false,
    rol: false,
    estado: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        correoElectronico: "",
        rol: "Cliente",
        estado: "Activo",
        contrasena: "",
        confirmarContrasena: "",
      });

      setErrors({
        tipo: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        correoElectronico: "",
        rol: "",
        estado: "",
      });

      setTouched({
        tipo: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        correoElectronico: false,
        rol: false,
        estado: false,
      });
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (
      (name === "nombre" || name === "apellido") &&
      !onlyLettersAndSpacesRegex.test(value)
    ) {
      return;
    }

    if (
      (name === "documento" || name === "telefono") &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "contrasena") {
      const error = validatePassword(value);
      setErrors((prev) => ({ ...prev, contrasena: error }));
      if (error) showWarning(error);
      return;
    }

    if (name === "confirmarContrasena") {
      const error = validatePasswordConfirmation(
        formData.contrasena,
        value
      );
      setErrors((prev) => ({ ...prev, confirmarContrasena: error }));
      if (error) showWarning(error);
      return;
    }

    if (VALIDATABLE_FIELDS.includes(name as keyof ClientBase)) {
      validateSingleField(
        name as keyof ClientBase,
        value,
        setErrors,
        setTouched
      );
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "contrasena") {
      setErrors((prev) => ({
        ...prev,
        contrasena: validatePassword(value),
      }));
      return;
    }

    if (name === "confirmarContrasena") {
      setErrors((prev) => ({
        ...prev,
        confirmarContrasena: validatePasswordConfirmation(
          formData.contrasena,
          value
        ),
      }));
      return;
    }

    if (VALIDATABLE_FIELDS.includes(name as keyof ClientBase)) {
      validateSingleField(
        name as keyof ClientBase,
        value,
        setErrors,
        setTouched
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched
    );

    const passError = validatePassword(formData.contrasena);
    const confirmError = validatePasswordConfirmation(
      formData.contrasena,
      formData.confirmarContrasena
    );

    if (passError || confirmError) {
      setErrors((prev) => ({
        ...prev,
        contrasena: passError,
        confirmarContrasena: confirmError,
      }));
      showWarning("Debes corregir las contraseñas");
      return;
    }

    if (isValid) {
      onSave(formData);
      setTimeout(() => onClose(), 500);
    }
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
};

// ======================================================
// FORMULARIO DE EDICIÓN (SIN CONTRASEÑA)
// ======================================================
export const useEditClientForm = ({
  isOpen,
  client,
  onClose,
  onSave,
}: EditClientModalProps) => {
  const [formData, setFormData] = useState<EditClientData>({
    id: 0,
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    rol: "Cliente",
    estado: "Activo",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipo: "",
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    rol: "",
    estado: "",
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipo: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correoElectronico: false,
    rol: false,
    estado: false,
  });

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        ...client,
        contrasena: "",
        confirmarContrasena: "",
      });

      setErrors({
        tipo: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        correoElectronico: "",
        rol: "",
        estado: "",
      });

      setTouched({
        tipo: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        correoElectronico: false,
        rol: false,
        estado: false,
      });
    }
  }, [isOpen, client]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (
      (name === "nombre" || name === "apellido") &&
      !onlyLettersAndSpacesRegex.test(value)
    ) {
      return;
    }

    if (
      (name === "documento" || name === "telefono") &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (VALIDATABLE_FIELDS.includes(name as keyof ClientBase)) {
      validateSingleField(
        name as keyof ClientBase,
        value,
        setErrors,
        setTouched
      );
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (VALIDATABLE_FIELDS.includes(name as keyof ClientBase)) {
      validateSingleField(
        name as keyof ClientBase,
        value,
        setErrors,
        setTouched
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched
    );

    if (isValid) {
      onSave(formData);
      setTimeout(() => onClose(), 500);
    }
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
};
