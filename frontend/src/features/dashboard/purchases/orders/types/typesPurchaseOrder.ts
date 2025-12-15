import { ReactNode } from "react";

export interface purchaseOrder {
  monto: string;
  fechaCreacion: ReactNode;
  id?: number;
  numeroOrden: string;
  proveedor: string;
  precioUnitario: number;
  fecha: string;
  estado: "Pendiente" | "Completada" | "Anulada" | "En Proceso";
  descripcion?: string;
  cantidad?: number;
  total?: number;
  subtotal?: number;
  iva?: number;
  productos?: any[];
  // Campos para anulación
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacion?: string;
  producto?: string;
}

export interface purchaseOrderBase {
  numeroOrden: string;
  proveedor: string;
  precioUnitario: number;
  fecha: string;
  descripcion?: string;
  cantidad?: number;
}

export interface createPurchaseOrderData extends purchaseOrderBase {
  cantidad: number;
  estado?: "Pendiente" | "Completada" | "Anulada" | "En Proceso";
  productos?: any[];
  subtotal?: number;
  iva?: number;
  total?: number;
}

export interface editPurchaseOrder extends purchaseOrderBase {
  id: number;
  estado: "Pendiente" | "Completada" | "Anulada" | "En Proceso";
  cantidad: number;
  productos?: any[];
  subtotal?: number;
  iva?: number;
  total?: number;
  // Campos para anulación
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacion?: string;
}

export interface formErrors {
  numeroOrden: string;
  proveedor: string;
  precioUnitario: string;
  fecha: string;
  descripcion: string;
  cantidad: string;
  estado: string;
}

export interface formTouched {
  numeroOrden: boolean;
  proveedor: boolean;
  precioUnitario: boolean;
  fecha: boolean;
  descripcion: boolean;
  cantidad: boolean;
  estado: boolean;
}

export interface createPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseOrderData: createPurchaseOrderData) => void;
}

export interface editPurchaseOrderModalProps {
  isOpen: boolean;
  purchaseOrder: editPurchaseOrder | null; 
  onClose: () => void;
  onSave: (purchaseOrderData: editPurchaseOrder) => void;
}

export interface viewPurchaseOrderModalProps {
  isOpen: boolean;
  purchaseOrder: purchaseOrder | null;
  onClose: () => void;
}

export interface PurchaseOrdersTableProps {
  purchaseOrders: purchaseOrder[];
  onView: (purchaseOrder: purchaseOrder) => void;
  onEdit: (purchaseOrder: editPurchaseOrder) => void;
  onCancel: (purchaseOrder: purchaseOrder, reason: string) => void;
  onCreate: () => void;
}

export interface purchaseOrderForTable extends Omit<purchaseOrder, 'id'> {
  id: number;
}