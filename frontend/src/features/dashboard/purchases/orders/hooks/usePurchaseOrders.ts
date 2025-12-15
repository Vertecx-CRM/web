import { useEffect, useState } from "react";
import {
  createPurchaseOrderData,
  createPurchaseOrderModalProps,
  editPurchaseOrder,
  editPurchaseOrderModalProps,
  formErrors,
  formTouched,
  purchaseOrder,
} from "../types/typesPurchaseOrder";

import {
  validateField,
  validateFormWithNotification,
} from "../Validations/UserValidations";

import { showSuccess, showWarning } from "@/shared/utils/notifications";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";
import { initialPurchaseOrders } from "../mocks/mockUser";

// MAIN HOOK
export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] =
    useState<purchaseOrder[]>(initialPurchaseOrders);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<editPurchaseOrder | null>(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] =
    useState<purchaseOrder | null>(null);

  // CREAR ORDEN
  const handleCreatePurchaseOrder = (purchaseOrderData: createPurchaseOrderData) => {
    const existingIds = purchaseOrders
      .map((po) => po.id)
      .filter((id): id is number => id !== undefined);

    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

    const nextOrderNumber = `ORD-${String(maxId + 1).padStart(3, "0")}`;

    const newPurchaseOrder: purchaseOrder = {
      id: maxId + 1,
      numeroOrden: purchaseOrderData.numeroOrden?.trim() || nextOrderNumber,
      proveedor: purchaseOrderData.proveedor,
      precioUnitario: purchaseOrderData.precioUnitario,
      fecha: purchaseOrderData.fecha,
      estado: purchaseOrderData.estado || "Pendiente",
      descripcion: purchaseOrderData.descripcion || "",
      cantidad: purchaseOrderData.cantidad,
      productos: purchaseOrderData.productos || [],
      subtotal: purchaseOrderData.subtotal,
      iva: purchaseOrderData.iva,
      total: purchaseOrderData.total,
      monto: String(purchaseOrderData.total),
      fechaCreacion: new Date().toLocaleDateString("es-CO"),
    };

    setPurchaseOrders((prev) => [...prev, newPurchaseOrder]);
    setIsCreateModalOpen(false);

    showSuccess(`Orden ${newPurchaseOrder.numeroOrden} creada exitosamente`);
  };

  // EDITAR ORDEN
  const handleEditPurchaseOrder = (purchaseOrderData: editPurchaseOrder) => {
    if (!purchaseOrderData.id) return;

    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === purchaseOrderData.id
          ? { ...po, ...purchaseOrderData }
          : po
      )
    );

    setEditingPurchaseOrder(null);
    showSuccess("Orden de compra actualizada exitosamente");
  };

  // ELIMINAR ORDEN
  const handleDelete = async (purchaseOrder: purchaseOrder) => {
    await confirmDelete(
      {
        itemName: purchaseOrder.numeroOrden,
        itemType: "orden de compra",
        successMessage: `La orden "${purchaseOrder.numeroOrden}" fue eliminada.`,
        errorMessage: "No se pudo eliminar la orden.",
      },
      () => {
        setPurchaseOrders((prev) =>
          prev.filter((po) => po.id !== purchaseOrder.id)
        );
        return Promise.resolve();
      }
    );
  };

  const handleView = (purchaseOrder: purchaseOrder) =>
    setViewingPurchaseOrder(purchaseOrder);

  const handleEdit = (purchaseOrder: editPurchaseOrder) =>
    setEditingPurchaseOrder(purchaseOrder);

  const closeModals = () => {
    setViewingPurchaseOrder(null);
    setEditingPurchaseOrder(null);
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
    handleDelete,
    handleView,
    handleEdit,
    closeModals,
  };
};

// FORMULARIO DE CREACIÓN
export const useCreatePurchaseOrderForm = ({
  isOpen,
  onClose,
  onSave,
}: createPurchaseOrderModalProps) => {
  const IVA_RATE = 0.19;

  const [formData, setFormData] = useState<createPurchaseOrderData>({
    numeroOrden: "",
    proveedor: "",
    precioUnitario: 0,
    fecha: "",
    descripcion: "",
    cantidad: 1,
    estado: "Pendiente",
    productos: [],
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  const [errors, setErrors] = useState<formErrors>({
    numeroOrden: "",
    proveedor: "",
    precioUnitario: "",
    fecha: "",
    descripcion: "",
    cantidad: "",
    estado: "",
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

  // CÁLCULO AUTOMÁTICO
  useEffect(() => {
    const precio = Number(formData.precioUnitario) || 0;
    const cantidad = Number(formData.cantidad) || 0;

    const subtotal = precio * cantidad;
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      iva,
      total,
    }));
  }, [formData.precioUnitario, formData.cantidad]);

  // MANEJO CAMBIOS
  // MANEJO CAMBIOS
const validateFieldOnChange = (
  field: keyof createPurchaseOrderData,
  value: string | number
) => {
  // Adaptamos formData (createPurchaseOrderData) a purchaseOrder SOLO para validación
  const formDataForValidation: purchaseOrder = {
    id: 0,
    numeroOrden: formData.numeroOrden,
    proveedor: formData.proveedor,
    precioUnitario: formData.precioUnitario,
    fecha: formData.fecha,
    estado: formData.estado ?? "Pendiente",
    descripcion: formData.descripcion,
    cantidad: formData.cantidad,
    subtotal: formData.subtotal,
    iva: formData.iva,
    total: formData.total,
    productos: formData.productos,
    monto: String(formData.total ?? 0),
    fechaCreacion: undefined,
  };

  const error = validateField(
    field as string,
    value,
    formDataForValidation,
    false
  );

  setErrors((prev) => ({ ...prev, [field]: error }));
};

const handleInputChange = (
  field: keyof createPurchaseOrderData,
  value: string | number
) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  if (touched[field as keyof formTouched]) {
    validateFieldOnChange(field, value);
  }
};

const handleBlur = (field: keyof formTouched) => {
  setTouched((prev) => ({ ...prev, [field]: true }));

  const value = formData[field as keyof createPurchaseOrderData];

  // value puede ser string | number | undefined; forzamos a string|number
  validateFieldOnChange(
    field as keyof createPurchaseOrderData,
    (value as string | number) ?? ""
  );
};
  
  // SUBMIT
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateFormWithNotification(formData as any, setErrors, setTouched, false)) return;

    setIsSubmitting(true);

    try {
      onSave(formData);
      onClose();
    } catch (err) {
      showWarning("Error al guardar la orden de compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  // RESET AL ABRIR
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        numeroOrden: "",
        proveedor: "",
        precioUnitario: 0,
        fecha: "",
        descripcion: "",
        cantidad: 1,
        estado: "Pendiente",
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0,
      });

      setErrors({
        numeroOrden: "",
        proveedor: "",
        precioUnitario: "",
        fecha: "",
        descripcion: "",
        cantidad: "",
        estado: "",
      });

      setTouched({
        numeroOrden: false,
        proveedor: false,
        precioUnitario: false,
        fecha: false,
        descripcion: false,
        cantidad: false,
        estado: false,
      });

      setIsSubmitting(false);
    }
  }, [isOpen]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
};

// FORMULARIO DE EDICIÓN
export const useEditPurchaseOrderForm = ({
  isOpen,
  onClose,
  onSave,
  purchaseOrder,
}: editPurchaseOrderModalProps) => {
  const IVA_RATE = 0.19;

  const [formData, setFormData] = useState<editPurchaseOrder>({
    id: 0,
    numeroOrden: "",
    proveedor: "",
    precioUnitario: 0,
    fecha: "",
    estado: "Pendiente",
    descripcion: "",
    cantidad: 1,
    productos: [],
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  const [errors, setErrors] = useState<formErrors>({
    numeroOrden: "",
    proveedor: "",
    precioUnitario: "",
    fecha: "",
    descripcion: "",
    cantidad: "",
    estado: "",
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

  // CÁLCULO AUTOMÁTICO
  useEffect(() => {
    const precio = Number(formData.precioUnitario) || 0;
    const cantidad = Number(formData.cantidad) || 0;

    const subtotal = precio * cantidad;
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      iva,
      total,
    }));
  }, [formData.precioUnitario, formData.cantidad]);

  const validateFieldOnChange = (
    field: keyof editPurchaseOrder,
    value: any
  ) => {
    const error = validateField(field, value, formData as any);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (
    field: keyof editPurchaseOrder,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field as keyof formTouched]) {
      validateFieldOnChange(field, value);
    }
  };

  const handleBlur = (field: keyof formTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateFieldOnChange(field as keyof editPurchaseOrder, formData[field]);
  };

  // SUBMIT
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const isValid = validateFormWithNotification(
      formData as any,
      setErrors,
      setTouched,
      true
    );

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      onSave(formData);
      onClose();
    } catch (err) {
      showWarning("Error al actualizar la orden de compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CARGAR DATOS AL ABRIR
  useEffect(() => {
    if (isOpen && purchaseOrder) {
      setFormData({
        id: purchaseOrder.id,
        numeroOrden: purchaseOrder.numeroOrden,
        proveedor: purchaseOrder.proveedor,
        precioUnitario: purchaseOrder.precioUnitario,
        fecha: purchaseOrder.fecha,
        estado: purchaseOrder.estado,
        descripcion: purchaseOrder.descripcion || "",
        cantidad: purchaseOrder.cantidad || 1,
        productos: purchaseOrder.productos || [],
        subtotal: purchaseOrder.subtotal || 0,
        iva: purchaseOrder.iva || 0,
        total: purchaseOrder.total || 0,
      });

      setErrors({
        numeroOrden: "",
        proveedor: "",
        precioUnitario: "",
        fecha: "",
        descripcion: "",
        cantidad: "",
        estado: "",
      });

      setTouched({
        numeroOrden: false,
        proveedor: false,
        precioUnitario: false,
        fecha: false,
        descripcion: false,
        cantidad: false,
        estado: false,
      });

      setIsSubmitting(false);
    }
  }, [isOpen, purchaseOrder]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
};