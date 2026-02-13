import { useEffect, useState } from "react";
import { createPurchaseOrderData, createPurchaseOrderModalProps, editPurchaseOrder, editPurchaseOrderModalProps, formErrors, formTouched, purchaseOrder, PurchaseOrderItem } from "../types/typesPurchaseOrder";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { validateField, validateAllFields, hasErrors, validateSpecificFields, validateFormWithNotification } from "../Validations/UserValidations";
import { initialPurchaseOrders } from "../mocks/mockUser";

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<purchaseOrder[]>(initialPurchaseOrders);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<editPurchaseOrder | null>(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState<purchaseOrder | null>(null);
  const [annulingPurchaseOrder, setAnnulingPurchaseOrder] = useState<purchaseOrder | null>(null);

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
              (purchaseOrderData.cantidad || purchaseOrder.cantidad || 1),
          }
          : purchaseOrder
      )
    );
    setEditingPurchaseOrder(null);
    showSuccess('Orden de compra actualizada exitosamente!');
  };

  const confirmAnnulPurchaseOrder = (id: number, reason: string) => {
    setPurchaseOrders(prev =>
      prev.map(po =>
        po.id === id ? { ...po, estado: "Anulada" } : po
      )
    );
    setAnnulingPurchaseOrder(null);
    showSuccess(`La orden de compra ha sido anulada correctamente.`);
  };

  const handleView = (purchaseOrder: purchaseOrder) => {
    setViewingPurchaseOrder(purchaseOrder);
  };

  const handleEdit = (purchaseOrder: editPurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
  };

  const handleAnnul = (purchaseOrder: purchaseOrder) => {
    setAnnulingPurchaseOrder(purchaseOrder);
  };

  const closeModals = () => {
    setEditingPurchaseOrder(null);
    setViewingPurchaseOrder(null);
    setAnnulingPurchaseOrder(null);
    setIsCreateModalOpen(false);
  };

  return {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPurchaseOrder,
    viewingPurchaseOrder,
    annulingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleEditPurchaseOrder,
    confirmAnnulPurchaseOrder,
    handleView,
    handleEdit,
    handleAnnul,
    closeModals,
    setEditingPurchaseOrder,
    setViewingPurchaseOrder,
    setAnnulingPurchaseOrder
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
    items: [{ producto: '', cantidad: 1, precioUnitario: 0 }]
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

  // Manejo de campos generales (Header)
  const handleInputChange = (field: keyof createPurchaseOrderData, value: string | number) => {
    // Si el campo es parte del array de items, no lo manejamos aquí
    if (field === 'items') return;

    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field as keyof formTouched]) {
      validateFieldOnChange(field as string, value as string | number);
    }
  };

  // Manejo de Items (Detalle)
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { producto: '', cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...(formData.items || [])];

    // Type safety for field assignment
    if (field === 'cantidad') {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else if (field === 'precioUnitario') {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value as string };
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };


  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const formDataValue = formData[field as keyof createPurchaseOrderData];
    if (typeof formDataValue === 'string' || typeof formDataValue === 'number') {
      validateFieldOnChange(field as string, formDataValue);
    }
  };

  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const error = validateField(fieldName, value, formData, false);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateFormWithNotifications = (): boolean => {
    // Validar campos del header
    const headerValid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      false
    );

    // Validar que haya al menos un item y que esté completo (básico)
    // TODO: Implementar validación detallada de items si es necesario
    const itemsValid = (formData.items && formData.items.length > 0) && formData.items.every(item => item.producto && item.cantidad > 0);

    if (!itemsValid) {
      showWarning("Debe agregar al menos un producto válido (con nombre y cantidad > 0).");
      return false;
    }

    return headerValid;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (validateFormWithNotifications()) {
      setIsSubmitting(true);
      try {
        // Calcular totales basados en items antes de guardar si se desea
        // o dejar que el backend lo maneje.
        // Aquí actualizamos el createPurchaseOrderData para reflejar sumas si es necesario,
        // pero purchaseOrderData ya tiene 'items'.
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
        items: [{ producto: '', cantidad: 1, precioUnitario: 0 }]
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
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
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
    estado: '',
  });

  const [touched, setTouched] = useState<formTouched>({
    numeroOrden: false,
    proveedor: false,
    precioUnitario: false,
    fecha: false,
    descripcion: false,
    cantidad: false,
    estado: false,
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
      // Cast value since we excluded 'items' above
      validateFieldOnChange(field as string, value as string | number);
    }
  };

  const handleBlur = (field: keyof formTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const formDataValue = formData[field as keyof editPurchaseOrder];
    // Asegurarse de queue formDataValue no sea undefined
    if (formDataValue !== undefined && (typeof formDataValue === 'string' || typeof formDataValue === 'number')) {
      validateFieldOnChange(field as string, formDataValue);
    }
  };

  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const purchaseOrderData = convertToPurchaseOrderForValidation(formData);
    if (typeof value === 'string' || typeof value === 'number') {
      const error = validateField(fieldName, value, purchaseOrderData, true);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
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