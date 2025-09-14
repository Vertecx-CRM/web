import { useEffect, useState } from "react";
import { createUserData, createUserModalProps, editUser, editUserModalProps, formErrors, formTouched, user } from "../types/typesUser";
import { initialUsers } from "../mocks/mockUser"
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { validateField, validateAllFields, hasErrors, validateSpecificFields, validateFormWithNotification } from "../Validations/UserValidations";


export const useUsers = () => {
  const [users, setUsers] = useState<user[]>(initialUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<editUser | null>(null);
  const [viewingUser, setViewingUser] = useState<user | null>(null);

  const handleCreateUser = (userData: createUserData) => {
    const existingIds = users.map(c => c.id).filter((id): id is number => id !== undefined);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

    // Combinar nombre y apellido para el nombre completo
    const nombreCompleto = `${userData.nombre} ${userData.apellido || ''}`.trim();

    const newUser: user = {
      id: maxId + 1,
      tipoDocumento: userData.tipoDocumento,
      numeroDocumento: userData.numeroDocumento,
      nombre: nombreCompleto,
      apellido: userData.apellido || '',
      telefono: userData.telefono,
      email: userData.email,
      rol: userData.rol,
      estado: "Activo",
      imagen: userData.imagen,
    };

    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);

    showSuccess('Usuario creado exitosamente!');
  };
  const handleEditUser = (userData: editUser) => {
    if (!userData.id) return;

    // Combinar nombre y apellido para el nombre completo
    const nombreCompleto = `${userData.nombre} ${userData.apellido || ''}`.trim();

    setUsers(prev =>
      prev.map(user =>
        user.id === userData.id ?
          {
            ...user,
            ...userData,
            nombre: nombreCompleto 
          }
          : user
      )
    );
    setEditingUser(null);
    showSuccess('Usuario actualizado exitosamente!');
  };

  const performDeleteUser = async (user: user): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: user.nombre,
        itemType: 'usuario',
        successMessage: `El usuario "${user.nombre}" ha sido eliminado correctamente.`,
        errorMessage: 'No se pudo eliminar el usuario. Por favor, intenta nuevamente.',
      },
      () => {
        // Esta es la función que se ejecuta si el usuario confirma la eliminación
        setUsers(prev => prev.filter(c => c.id !== user.id));
        return Promise.resolve(); 
      }
    );
  };

  const handleView = (user: user) => {
    setViewingUser(user);
  };

  const handleEdit = (user: editUser) => {
    setEditingUser(user);
  };

  const handleDelete = async (user: user) => {
    await performDeleteUser(user);
  };

  const closeModals = () => {
    setEditingUser(null);
    setViewingUser(null);
    setIsCreateModalOpen(false);
  };

  return {
    users,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingUser,
    viewingUser,
    handleCreateUser,
    handleEditUser,
    performDeleteUser,
    handleView,
    handleEdit,
    handleDelete,
    closeModals,
    setEditingUser,
    setViewingUser
  };
};

// Hook para el formulario de creación
export const useCreateUserForm = ({
  isOpen,
  onClose,
  onSave
}: createUserModalProps) => {
  const [formData, setFormData] = useState<createUserData>({
    tipoDocumento: '',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    estado: "Activo",
    imagen: null,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<formErrors>({
    tipoDocumento: '',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    estado: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<formTouched>({
    tipoDocumento: false,
    numeroDocumento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    email: false,
    rol: false,
    estado: false,
    password: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función segura para manejar campos que pueden no existir en formTouched
  const handleInputChange = (field: keyof createUserData, value: string | File | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Si el campo ha sido tocado y existe en touched, validarlo
    if (touched[field as keyof formTouched] && typeof value === 'string') {
      validateFieldOnChange(field, value);
    }
  };

  // Función segura para manejar blur
  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validar solo si el campo existe en formData y es string
    const formDataValue = formData[field as keyof createUserData];
    if (typeof formDataValue === 'string') {
      validateFieldOnChange(field as string, formDataValue);
    }
  };

  // Validar campo individual cuando cambia
  const validateFieldOnChange = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value, formData, false);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Validar todo el formulario
  const validateFormWithNotifications = (): boolean => {
    return validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      false
    );
  };

  // Manejar envío del formulario
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // ↓↓↓ USA LA NUEVA FUNCIÓN CON NOTIFICACIONES ↓↓↓
    if (validateFormWithNotifications()) {
      setIsSubmitting(true);
      try {
        const userData = {
          ...formData,
          rol: formData.rol || 'Usuario'
        };
        onSave(userData);
        onClose();
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        showWarning('Error al guardar el usuario. Por favor, intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoDocumento: '',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        rol: '',
        estado: "Activo",
        imagen: null,
        password: '',
        confirmPassword: '',
      });
      setErrors({
        tipoDocumento: '',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        rol: '',
        estado: '',
        password: '',
        confirmPassword: '',
      });
      setTouched({
        tipoDocumento: false,
        numeroDocumento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        email: false,
        rol: false,
        estado: false,
        password: false,
        confirmPassword: false,
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
    validateForm: validateFormWithNotifications
  };
};

// Hook para el formulario de edición
export const useEditUserForm = ({
  isOpen,
  onClose,
  onSave,
  user
}: editUserModalProps) => {
  const [formData, setFormData] = useState<editUser>({
    id: 0,
    tipoDocumento: '',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    estado: "Activo",
    imagen: null,
  });

  const [errors, setErrors] = useState<formErrors>({
    tipoDocumento: '',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    rol: '',
    estado: '',
    password: '', // Estos campos se mantienen pero no se usan en edición
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<formTouched>({
    tipoDocumento: false,
    numeroDocumento: false,
    nombre: false,
    apellido: false,
    telefono: false,
    email: false,
    rol: false,
    estado: false,
    password: false, // Estos campos se mantienen pero no se usan en edición
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para convertir editUser a user para las validaciones
  const convertToUserForValidation = (editUserData: editUser): user => {
    return {
      ...editUserData,
      password: '', // Campos de password vacíos para edición
      confirmPassword: ''
    };
  };

  // Función para manejar cambios en los campos
  const handleInputChange = (field: keyof editUser, value: string | File | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Si el campo ha sido tocado y es string, validarlo
    if (touched[field as keyof formTouched] && typeof value === 'string') {
      validateFieldOnChange(field, value);
    }
  };

  // Función para manejar blur
  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validar solo si el campo existe en formData y es string
    const formDataValue = formData[field as keyof editUser];
    if (typeof formDataValue === 'string') {
      validateFieldOnChange(field as string, formDataValue);
    }
  };

  // Validar campo individual cuando cambia
  const validateFieldOnChange = (fieldName: string, value: string) => {
    // Convertir a user para la validación
    const userData = convertToUserForValidation(formData);
    const error = validateField(fieldName, value, userData, true); // isEditMode = true
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Validar todo el formulario para edición
  const validateFormWithNotifications = (): boolean => {
    // Convertir a user para la validación
    const userData = convertToUserForValidation(formData);

    return validateFormWithNotification(
      userData,
      setErrors,
      setTouched,
      true // isEditMode = true
    );
  };

  // Manejar envío del formulario de edición
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (validateFormWithNotifications()) {
      setIsSubmitting(true);
      try {
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        showWarning('Error al actualizar el usuario. Por favor, intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Cargar datos del usuario cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (isOpen && user) {
      // Lógica mejorada para separar nombres y apellidos
      const nombreCompleto = user.nombre || '';

      // Dividir el nombre completo en partes
      const partesNombre = nombreCompleto.split(' ');

      // Casos especiales para diferentes cantidades de palabras
      let nombre = '';
      let apellido = '';

      if (partesNombre.length === 1) {
        // Solo una palabra: considerarla como nombre
        nombre = partesNombre[0];
      } else if (partesNombre.length === 2) {
        // Dos palabras: primera es nombre, segunda es apellido
        nombre = partesNombre[0];
        apellido = partesNombre[1];
      } else if (partesNombre.length === 3) {
        // Tres palabras: primera es nombre, las otras dos son apellidos
        nombre = partesNombre[0];
        apellido = partesNombre.slice(1).join(' ');
      } else {
        // Cuatro o más palabras: primeras dos son nombres, el resto apellidos
        nombre = partesNombre.slice(0, 2).join(' ');
        apellido = partesNombre.slice(2).join(' ');
      }

      // Cargar datos del usuario en el formulario
      setFormData({
        id: user.id,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        nombre: nombre,
        apellido: apellido,
        telefono: user.telefono,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
        imagen: user.imagen,
      });

      // Resetear errores y estados touched
      setErrors({
        tipoDocumento: '',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        rol: '',
        estado: '',
        password: '',
        confirmPassword: '',
      });

      setTouched({
        tipoDocumento: false,
        numeroDocumento: false,
        nombre: false,
        apellido: false,
        telefono: false,
        email: false,
        rol: false,
        estado: false,
        password: false,
        confirmPassword: false,
      });

      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
    validateForm: validateFormWithNotifications
  };
};

