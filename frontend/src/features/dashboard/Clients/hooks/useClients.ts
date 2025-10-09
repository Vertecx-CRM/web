import { useState, useEffect } from "react";
import { Client, CreateClientData, EditClientData, FormErrors, FormTouched, EditClientModalProps, CreateClientModalProps } from "../types/typeClients";
import { initialClients } from "../mocks/mockClients";
import { showSuccess } from "@/shared/utils/notifications";
import { 
  hasNumbers, 
  hasSpecialChars,
  validateFormWithNotification,
  validateNombreWithNotification,
  validateDocumentoWithNotification,
  validateTelefonoWithNotification,
  validateCorreoWithNotification,
  validateTipoWithNotification,
  validateRolWithNotification
} from "../validations/clientsValidations";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<EditClientData | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const handleCreateClient = (clientData: CreateClientData) => {
    const newClient: Client = {
      id: Math.max(...clients.map(c => c.id)) + 1,
      tipo: clientData.tipo,
      documento: clientData.documento,
      nombre: clientData.nombre,
      apellido: clientData.apellido,
      telefono: clientData.telefono,
      correoElectronico: clientData.correoElectronico,
      rol: clientData.rol,
      estado: clientData.estado || "Activo"
    };

    setClients(prev => [...prev, newClient]);
    setIsCreateModalOpen(false);

    showSuccess('Cliente creado exitosamente!');
  };

  const handleEditClient = (id: number, clientData: EditClientData) => {
    setClients(prev =>
      prev.map(client =>
        client.id === id
          ? { ...client, ...clientData }
          : client
      )
    );
    setEditingClient(null);

    showSuccess('Cliente actualizado exitosamente!');
  };

  const handleDeleteClient = async (client: Client): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: client.nombre,
        itemType: 'cliente',
        successMessage: `El cliente "${client.nombre}" ha sido eliminado correctamente.`,
        errorMessage: 'No se pudo eliminar el cliente. Por favor, intenta nuevamente.',
      },
      () => {
        setClients(prev => prev.filter(c => c.id !== client.id));
      }
    );
  };

  const handleView = (client: Client) => {
    setViewingClient(client);
  };

  const handleEdit = (client: EditClientData) => {
    setEditingClient(client);
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
    handleEdit,
    handleDelete,
    closeModals,
    setEditingClient,
    setViewingClient
  };
};

// Hook para el formulario de creación
export const useCreateClientForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateClientModalProps) => {
  const [formData, setFormData] = useState<CreateClientData>({
    tipo: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correoElectronico: '',
    rol: 'Cliente',
    estado: 'Activo',
    contrasena: '',
    confirmarContrasena: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipo: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correoElectronico: '',
    rol: ''
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipo: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correoElectronico: false,
    rol: false
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: '',
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correoElectronico: '',
        rol: 'Cliente',
        estado: 'Activo',
        contrasena: '',
        confirmarContrasena: ''
      });
      setErrors({
        tipo: '',
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correoElectronico: '',
        rol: ''
      });
      setTouched({
        tipo: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        correoElectronico: false,
        rol: false
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validaciones específicas por campo
    if (name === 'nombre') {
      if (hasSpecialChars(value) || hasNumbers(value)) return;
    }
    
    if (name === 'documento' || name === 'telefono') {
      if (!/^\d*$/.test(value)) return; // Solo números
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación en tiempo real con notificaciones
    switch (name) {
      case 'tipo':
        validateTipoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'documento':
        validateDocumentoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'nombre':
        validateNombreWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'telefono':
        validateTelefonoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'correoElectronico':
        validateCorreoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'rol':
        validateRolWithNotification({ 
          ...formData, 
          [name]: value as "Cliente" | "Administrador" | "Empleado" 
        }, setErrors, setTouched);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validación al perder el foco
    switch (name) {
      case 'tipo':
        validateTipoWithNotification(formData, setErrors, setTouched);
        break;
      case 'documento':
        validateDocumentoWithNotification(formData, setErrors, setTouched);
        break;
      case 'nombre':
        validateNombreWithNotification(formData, setErrors, setTouched);
        break;
      case 'apellido':
        validateTelefonoWithNotification(formData, setErrors, setTouched);
        break;
      case 'telefono':
        validateTelefonoWithNotification(formData, setErrors, setTouched);
        break;
      case 'correoElectronico':
        validateCorreoWithNotification(formData, setErrors, setTouched);
        break;
      case 'rol':
        validateRolWithNotification(formData, setErrors, setTouched);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Usar la nueva función de validación con notificaciones
    const isValid = validateFormWithNotification(formData, setErrors, setTouched);

    if (isValid) {
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
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

// Hook para el formulario de Editar 
export const useEditClientForm = ({
  isOpen,
  client,
  onClose,
  onSave,
}: EditClientModalProps) => {
  const [formData, setFormData] = useState<EditClientData>({
    id: 0,
    tipo: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correoElectronico: '',
    rol: 'Cliente',
    estado: 'Activo',
    contrasena: '',
    confirmarContrasena: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    tipo: '',
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correoElectronico: '',
    rol: ''
  });

  const [touched, setTouched] = useState<FormTouched>({
    tipo: false,
    documento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correoElectronico: false,
    rol: false
  });

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        id: client.id,
        tipo: client.tipo,
        documento: client.documento,
        nombre: client.nombre,
        apellido: client.apellido,
        telefono: client.telefono,
        correoElectronico: client.correoElectronico,
        rol: client.rol,
        estado: client.estado,
        contrasena: '',
        confirmarContrasena: ''
      });
      setErrors({
        tipo: '',
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correoElectronico: '',
        rol: ''
      });
      setTouched({
        tipo: false,
        documento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        correoElectronico: false,
        rol: false
      });
    }
  }, [isOpen, client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validaciones específicas por campo
    if (name === 'nombre') {
      if (hasSpecialChars(value) || hasNumbers(value)) return;
    }
    
    if (name === 'documento' || name === 'telefono') {
      if (!/^\d*$/.test(value)) return; // Solo números
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación en tiempo real con notificaciones
    switch (name) {
      case 'tipo':
        validateTipoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'documento':
        validateDocumentoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'nombre':
        validateNombreWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'apellido':
        validateNombreWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'telefono':
        validateTelefonoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'correoElectronico':
        validateCorreoWithNotification({ ...formData, [name]: value }, setErrors, setTouched);
        break;
      case 'rol':
        validateRolWithNotification({ ...formData, [name]: value as "Cliente" | "Administrador" | "Empleado" }, setErrors, setTouched);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación al perder el foco
    switch (name) {
      case 'tipo':
        validateTipoWithNotification(formData, setErrors, setTouched);
        break;
      case 'documento':
        validateDocumentoWithNotification(formData, setErrors, setTouched);
        break;
      case 'nombre':
        validateNombreWithNotification(formData, setErrors, setTouched);
        break;
      case 'apellido':
        validateNombreWithNotification(formData, setErrors, setTouched);
        break;
      case 'telefono':
        validateTelefonoWithNotification(formData, setErrors, setTouched);
        break;
      case 'correoElectronico':
        validateCorreoWithNotification(formData, setErrors, setTouched);
        break;
      case 'rol':
        validateRolWithNotification(formData, setErrors, setTouched);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Usar la nueva función de validación con notificaciones
    const isValid = validateFormWithNotification(formData, setErrors, setTouched);

    if (isValid) {
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
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