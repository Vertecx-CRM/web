import { useEffect, useMemo, useState } from "react";
import {
  createPurchaseOrderData,
  createPurchaseOrderModalProps,
  formErrors,
  formTouched,
  purchaseOrder,
  PurchaseOrderItem
} from "../types/typesPurchaseOrder";
import { showSuccess, showWarning } from "@/shared/utils/notifications";
import {
  validateField,
  validateFormWithNotification
} from "../Validations/UserValidations";
import { initialPurchaseOrders } from "../mocks/mockPurchaseOrders";

/* ============================= */
/* Hook PRINCIPAL ORDENES */
/* ============================= */

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] =
    useState<purchaseOrder[]>(initialPurchaseOrders);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] =
    useState<purchaseOrder | null>(null);

  const handleCreatePurchaseOrder = (
    purchaseOrderData: createPurchaseOrderData
  ) => {
    const maxId =
      purchaseOrders.length > 0
        ? Math.max(...purchaseOrders.map((po) => po.id))
        : 0;

    const total = purchaseOrderData.items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitario,
      0
    );

    const newPurchaseOrder: purchaseOrder = {
      id: maxId + 1,
      numeroOrden: `OC-${Date.now()}`,
      proveedor: purchaseOrderData.proveedor,
      fecha: purchaseOrderData.fecha,
      estado: "Pendiente",
      descripcion: purchaseOrderData.descripcion,
      items: purchaseOrderData.items,
      total
    };

    setPurchaseOrders((prev) => [...prev, newPurchaseOrder]);
    setIsCreateModalOpen(false);

    showSuccess("Orden de compra creada exitosamente!");
  };

  const handleView = (purchaseOrder: purchaseOrder) => {
    setViewingPurchaseOrder(purchaseOrder);
  };

  const closeModals = () => {
    setViewingPurchaseOrder(null);
    setIsCreateModalOpen(false);
  };

  return {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    viewingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleView,
    closeModals
  };
};

/* ============================= */
/* Hook CREAR ORDEN DE COMPRA */
/* ============================= */

type HeaderFields = "proveedor" | "fecha" | "descripcion";

export const useCreatePurchaseOrderForm = ({
  isOpen,
  onClose,
  onSave
}: createPurchaseOrderModalProps) => {
  const [formData, setFormData] = useState<createPurchaseOrderData>({
    proveedor: "",
    fecha: "",
    descripcion: "",
    items: [{ producto: "", cantidad: 1, precioUnitario: 0 }]
  });

  const [errors, setErrors] = useState<formErrors>({
    proveedor: "",
    fecha: "",
    descripcion: ""
  });

  const [touched, setTouched] = useState<formTouched>({
    proveedor: false,
    fecha: false,
    descripcion: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ============================= */
  /* TOTAL DINÁMICO */
  /* ============================= */

  const calculatedTotal = useMemo(() => {
    return formData.items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitario,
      0
    );
  }, [formData.items]);

  /* ============================= */
  /* HANDLERS HEADER */
  /* ============================= */

  const handleInputChange = (field: HeaderFields, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field]) {
      const error = validateField(field, value, newFormData, false);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: HeaderFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const value = formData[field];

    const error = validateField(field, value, formData, false);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  /* ============================= */
  /* HANDLERS ITEMS */
  /* ============================= */

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { producto: "", cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];

    newItems[index] = {
      ...newItems[index],
      [field]:
        field === "cantidad" || field === "precioUnitario"
          ? Number(value)
          : value
    };

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  /* ============================= */
  /* VALIDACIONES */
  /* ============================= */

  const validateItems = (): boolean => {
    if (formData.items.length === 0) {
      showWarning("Debe agregar al menos un producto.");
      return false;
    }

    for (const item of formData.items) {
      if (!item.producto.trim()) {
        showWarning("Todos los productos deben tener nombre.");
        return false;
      }

      if (item.cantidad <= 0) {
        showWarning("La cantidad debe ser mayor a 0.");
        return false;
      }

      if (item.precioUnitario < 0) {
        showWarning("El precio no puede ser negativo.");
        return false;
      }
    }

    if (calculatedTotal <= 0) {
      showWarning("El total debe ser mayor a 0.");
      return false;
    }

    return true;
  };

  const validateFormWithNotifications = (): boolean => {
    const headerValid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      false
    );

    const itemsValid = validateItems();

    return headerValid && itemsValid;
  };

  /* ============================= */
  /* SUBMIT */
  /* ============================= */

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateFormWithNotifications()) return;

    setIsSubmitting(true);

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar orden:", error);
      showWarning("Error al guardar la orden de compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================= */
  /* RESET AL ABRIR MODAL */
  /* ============================= */

  useEffect(() => {
    if (isOpen) {
      setFormData({
        proveedor: "",
        fecha: "",
        descripcion: "",
        items: [{ producto: "", cantidad: 1, precioUnitario: 0 }]
      });

      setErrors({
        proveedor: "",
        fecha: "",
        descripcion: ""
      });

      setTouched({
        proveedor: false,
        fecha: false,
        descripcion: false
      });

      setIsSubmitting(false);
    }
  }, [isOpen]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    calculatedTotal,
    handleInputChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleBlur,
    handleSubmit,
    validateForm: validateFormWithNotifications
  };
};