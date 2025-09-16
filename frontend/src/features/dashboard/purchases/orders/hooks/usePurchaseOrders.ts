import { useEffect, useState } from "react";
import { createPurchaseOrderData, createPurchaseOrderModalProps, editPurchaseOrder, editPurchaseOrderModalProps, formErrors, formTouched, purchaseOrder } from "../types/typesPurchaseOrder";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { validateField, validateAllFields, hasErrors, validateSpecificFields, validateFormWithNotification } from "../Validations/UserValidations";
import { initialPurchaseOrders } from "../mocks/mockUser";

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<purchaseOrder[]>(initialPurchaseOrders);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<editPurchaseOrder | null>(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState<purchaseOrder | null>(null);

  const handleCreatePurchaseOrder = (purchaseOrderData: createPurchaseOrderData) => {
    const existingIds = purchaseOrders.map(po => po.id).filter((id): id is number => id !== undefined);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

    const newPurchaseOrder: purchaseOrder = {
      id: maxId + 1,
      numeroOrden: purchaseOrderData.numeroOrden,
      proveedor: purchaseOrderData.proveedor,
      precioUnitario: purchaseOrderData.precioUnitario,
      fecha: purchaseOrderData.fecha,
      estado: "Pendiente",
      descripcion: purchaseOrderData.descripcion || '',
      cantidad: purchaseOrderData.cantidad || 1,
      total: (purchaseOrderData.precioUnitario || 0) * (purchaseOrderData.cantidad || 1),
    };

    setPurchaseOrders(prev => [...prev, newPurchaseOrder]);
    setIsCreateModalOpen(false);

    showSuccess('Orden de compra creada exitosamente!');
  };

  const handleEditPurchaseOrder = (purchaseOrderData: editPurchaseOrder) => {
    if (!purchaseOrderData.id) return;

    setPurchaseOrders(prev =>
      prev.map(purchaseOrder =>
        purchaseOrder.id === purchaseOrderData.id ?
          {
            ...purchaseOrder,
            ...purchaseOrderData,
            total: (purchaseOrderData.precioUnitario || purchaseOrder.precioUnitario) * 
                   (purchaseOrderData.cantidad || purchaseOrder.cantidad),
          }
          : purchaseOrder
      )
    );
    setEditingPurchaseOrder(null);
    showSuccess('Orden de compra actualizada exitosamente!');
  };

  const performDeletePurchaseOrder = async (purchaseOrder: purchaseOrder): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: purchaseOrder.numeroOrden,
        itemType: 'orden de compra',
        successMessage: `La orden de compra "${purchaseOrder.numeroOrden}" ha sido eliminada correctamente.`,
        errorMessage: 'No se pudo eliminar la orden de compra. Por favor, intenta nuevamente.',
      },
      () => {
        setPurchaseOrders(prev => prev.filter(po => po.id !== purchaseOrder.id));
        return Promise.resolve(); 
      }
    );
  };

  const handleView = (purchaseOrder: purchaseOrder) => {
    setViewingPurchaseOrder(purchaseOrder);
  };

  const handleEdit = (purchaseOrder: editPurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
  };

  const handleDelete = async (purchaseOrder: purchaseOrder) => {
    await performDeletePurchaseOrder(purchaseOrder);
  };

  const closeModals = () => {
    setEditingPurchaseOrder(null);
    setViewingPurchaseOrder(null);
    setIsCreateModalOpen(false);
  };

  return {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPurchaseOrder,
    viewingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleEditPurchaseOrder,
    performDeletePurchaseOrder,
    handleView,
    handleEdit,
    handleDelete,
    closeModals,
    setEditingPurchaseOrder,
    setViewingPurchaseOrder
  };
};

// Hook para el formulario de creación
export const useCreatePurchaseOrderForm = ({
  isOpen,
  onClose,
  onSave
}: createPurchaseOrderModalProps) => {
  const [formData, setFormData] = useState<createPurchaseOrderData>({
    numeroOrden: '',
    proveedor: '',
    precioUnitario: 0,
    fecha: '',
    descripcion: '',
    cantidad: 1,
  });

  const [errors, setErrors] = useState<formErrors>({
    numeroOrden: '',
    proveedor: '',
    precioUnitario: '',
    fecha: '',
    descripcion: '',
    cantidad: '',
  });

  const [touched, setTouched] = useState<formTouched>({
    numeroOrden: false,
    proveedor: false,
    precioUnitario: false,
    fecha: false,
    descripcion: false,
    cantidad: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof createPurchaseOrderData, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field as keyof formTouched]) {
      validateFieldOnChange(field, value);
    }
  };

  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const formDataValue = formData[field as keyof createPurchaseOrderData];
    validateFieldOnChange(field as string, formDataValue);
  };

  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const error = validateField(fieldName, value, formData, false);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateFormWithNotifications = (): boolean => {
    return validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      false
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (validateFormWithNotifications()) {
      setIsSubmitting(true);
      try {
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error al guardar orden de compra:', error);
        showWarning('Error al guardar la orden de compra. Por favor, intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        numeroOrden: '',
        proveedor: '',
        precioUnitario: 0,
        fecha: '',
        descripcion: '',
        cantidad: 1,
      });
      setErrors({
        numeroOrden: '',
        proveedor: '',
        precioUnitario: '',
        fecha: '',
        descripcion: '',
        cantidad: '',
      });
      setTouched({
        numeroOrden: false,
        proveedor: false,
        precioUnitario: false,
        fecha: false,
        descripcion: false,
        cantidad: false,
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
export const useEditPurchaseOrderForm = ({
  isOpen,
  onClose,
  onSave,
  purchaseOrder
}: editPurchaseOrderModalProps) => {
  const [formData, setFormData] = useState<editPurchaseOrder>({
    id: 0,
    numeroOrden: '',
    proveedor: '',
    precioUnitario: 0,
    fecha: '',
    estado: "Pendiente",
    descripcion: '',
    cantidad: 1,
  });

  const [errors, setErrors] = useState<formErrors>({
    numeroOrden: '',
    proveedor: '',
    precioUnitario: '',
    fecha: '',
    descripcion: '',
    cantidad: '',
  });

  const [touched, setTouched] = useState<formTouched>({
    numeroOrden: false,
    proveedor: false,
    precioUnitario: false,
    fecha: false,
    descripcion: false,
    cantidad: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertToPurchaseOrderForValidation = (editData: editPurchaseOrder): purchaseOrder => {
    return {
      ...editData,
      total: editData.precioUnitario * (editData.cantidad || 1)
    };
  };

  const handleInputChange = (field: keyof editPurchaseOrder, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field as keyof formTouched]) {
      validateFieldOnChange(field, value);
    }
  };

  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const formDataValue = formData[field as keyof editPurchaseOrder];
    validateFieldOnChange(field as string, formDataValue);
  };

  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const purchaseOrderData = convertToPurchaseOrderForValidation(formData);
    const error = validateField(fieldName, value, purchaseOrderData, true);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateFormWithNotifications = (): boolean => {
    const purchaseOrderData = convertToPurchaseOrderForValidation(formData);
    return validateFormWithNotification(
      purchaseOrderData,
      setErrors,
      setTouched,
      true
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (validateFormWithNotifications()) {
      setIsSubmitting(true);
      try {
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error al actualizar orden de compra:', error);
        showWarning('Error al actualizar la orden de compra. Por favor, intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && purchaseOrder) {
      setFormData({
        id: purchaseOrder.id,
        numeroOrden: purchaseOrder.numeroOrden,
        proveedor: purchaseOrder.proveedor,
        precioUnitario: purchaseOrder.precioUnitario,
        fecha: purchaseOrder.fecha,
        estado: purchaseOrder.estado,
        descripcion: purchaseOrder.descripcion || '',
        cantidad: purchaseOrder.cantidad || 1,
      });

      setErrors({
        numeroOrden: '',
        proveedor: '',
        precioUnitario: '',
        fecha: '',
        descripcion: '',
        cantidad: '',
      });

      setTouched({
        numeroOrden: false,
        proveedor: false,
        precioUnitario: false,
        fecha: false,
        descripcion: false,
        cantidad: false,
      });

      setIsSubmitting(false);
    }
  }, [isOpen, purchaseOrder]);

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