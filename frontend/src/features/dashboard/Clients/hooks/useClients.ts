"use client";

import { useEffect, useRef, useState } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  CreateClientPayload,
  UpdateClientPayload,
} from "../api/clients.api";

import {
  Client,
  CreateClientData,
  EditClientData,
  ClientFormErrors,
  ClientFormTouched,
} from "../types/typeClients";

const MIN_LOADER_MS = 450;

// =============================
// MAP ESTADOS (solo usado en UPDATE)
// =============================
const stateMap: Record<string, number> = {
  Activo: 1,
  Inactivo: 2,
};

// =====================================================
// MAIN HOOK
// =====================================================
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const busyRef = useRef(false);
  const startRef = useRef(0);

  const startLoading = () => {
    busyRef.current = true;
    startRef.current = Date.now();
    setLoading(true);
  };

  const stopLoading = () => {
    const elapsed = Date.now() - startRef.current;
    const remaining = MIN_LOADER_MS - elapsed;

    if (remaining > 0) {
      setTimeout(() => {
        busyRef.current = false;
        setLoading(false);
      }, remaining);
    } else {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const withLoading = async (fn: () => Promise<void>) => {
    if (busyRef.current) return;
    startLoading();
    try {
      await fn();
    } finally {
      stopLoading();
    }
  };

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useEffect(() => {
    withLoading(loadClients);
  }, []);

  // =============================
  // CREATE CLIENT (ALINEADO BACKEND)
  // =============================
  const handleCreateClient = async (form: CreateClientData) => {
    const payload: CreateClientPayload = {
      name: form.nombre.trim(),
      lastname: form.apellido.trim(),
      email: form.correoElectronico.trim(),
      documentnumber: form.documento.trim(),
      phone: form.telefono.trim(),
      typeid: Number(form.tipo),
      customercity: form.ciudad.trim(),
      customerzipcode: form.codigoPostal.trim(),
    };

    await withLoading(async () => {
      await createClient(payload);
    });

    await loadClients();
  };

  // =============================
  // EDIT CLIENT
  // =============================
  const handleEditClient = async (form: EditClientData) => {
    const payload: UpdateClientPayload = {
      name: form.nombre.trim(),
      lastname: form.apellido.trim(),
      email: form.correoElectronico.trim(),
      documentnumber: form.documento.trim(),
      phone: form.telefono.trim(),
      typeid: Number(form.tipo),
      stateid: stateMap[form.estado] ?? 1,
      customercity: form.ciudad.trim(),
      customerzipcode: form.codigoPostal.trim(),
    };

    await withLoading(async () => {
      await updateClient(form.id, payload);
    });

    await loadClients();
  };

  // =============================
  // DELETE CLIENT
  // =============================
  const handleDeleteClient = async (id: number) => {
    await withLoading(async () => {
      await deleteClient(id);
    });

    await loadClients();
  };

  return {
    clients,
    loading,
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
  };
}

// =====================================================
// CREATE CLIENT FORM HOOK
// =====================================================
interface UseCreateClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClientData) => Promise<void>;
}

export function useCreateClientForm({
  isOpen,
  onClose,
  onSave,
}: UseCreateClientFormProps) {
  const initialState: CreateClientData = {
    tipo: 0,
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correoElectronico: "",
    ciudad: "",
    codigoPostal: "",
    estado: ""
  };

  const [formData, setFormData] =
    useState<CreateClientData>(initialState);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [touched, setTouched] = useState<ClientFormTouched>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  const validate = (data: CreateClientData) => {
    const newErrors: ClientFormErrors = {};

    if (!data.tipo) newErrors.tipo = "Seleccione tipo de documento";
    if (!data.documento.trim()) newErrors.documento = "Documento obligatorio";
    if (!data.nombre.trim()) newErrors.nombre = "Nombre obligatorio";
    if (!data.apellido.trim()) newErrors.apellido = "Apellido obligatorio";
    if (!data.telefono.trim()) newErrors.telefono = "Teléfono obligatorio";
    if (!data.correoElectronico.trim())
      newErrors.correoElectronico = "Correo obligatorio";
    if (!data.ciudad.trim()) newErrors.ciudad = "Ciudad obligatoria";
    if (!data.codigoPostal.trim())
      newErrors.codigoPostal = "Código postal obligatorio";

    return newErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "tipo" ? Number(value) : value,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors(validate(formData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await onSave(formData);
    onClose();
  };

  return {
    formData,
    setFormData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
}

// =====================================================
// EDIT CLIENT FORM HOOK
// =====================================================
interface UseEditClientFormProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (data: EditClientData) => Promise<void>;
}

export function useEditClientForm({
  isOpen,
  client,
  onClose,
  onSave,
}: UseEditClientFormProps) {
  const [formData, setFormData] =
    useState<EditClientData | null>(null);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [touched, setTouched] = useState<ClientFormTouched>({});

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        id: client.id,
        nombre: client.nombre,
        apellido: client.apellido,
        tipo: Number(client.tipo) || 0,
        documento: client.documento,
        telefono: client.telefono,
        correoElectronico: client.correoElectronico,
        estado: client.estado,
        ciudad: client.ciudad,
        codigoPostal: client.codigoPostal,
      });

      setErrors({});
      setTouched({});
    }
  }, [isOpen, client]);

  const validate = (data: EditClientData) => {
    const newErrors: ClientFormErrors = {};

    if (!data.tipo) newErrors.tipo = "Seleccione tipo de documento";
    if (!data.documento.trim()) newErrors.documento = "Documento obligatorio";
    if (!data.nombre.trim()) newErrors.nombre = "Nombre obligatorio";
    if (!data.apellido.trim()) newErrors.apellido = "Apellido obligatorio";

    return newErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "tipo" ? Number(value) : value,
    });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await onSave(formData);
    onClose();
  };

  return {
    formData,
    setFormData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
}