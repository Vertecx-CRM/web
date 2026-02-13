import { ReactNode } from "react";

export interface purchaseOrder {
  monto?: string;
  fechaCreacion?: ReactNode;
  id?: number;
  numeroOrden: string;
  proveedor: string;
  precioUnitario: number;
  fecha: string;
  estado: "Pendiente" | "Completada" | "Cancelada" | "En Proceso" | "Anulada";
  descripcion?: string;
  cantidad?: number;
  items?: PurchaseOrderItem[];
  total?: number;
}

export interface PurchaseOrderItem {
  producto: string; // Identifier for the item/product
  cantidad: number;
  precioUnitario: number;
}

export interface purchaseOrderBase {
  numeroOrden: string; // PO Number
  proveedor: string;
  precioUnitario: number; // Keep for backward compat or summary
  fecha: string;
  descripcion?: string;
  cantidad?: number; // Keep for backward compat or summary
  items?: PurchaseOrderItem[];
}

export interface createPurchaseOrderData extends purchaseOrderBase {
  cantidad: number;
}

export interface editPurchaseOrder extends purchaseOrderBase {
  id: number;
  estado: "Pendiente" | "Completada" | "Cancelada" | "En Proceso" | "Anulada";
  cantidad: number;
}

export interface formErrors {
  numeroOrden: string;
  proveedor: string;
  precioUnitario: string;
  fecha: string;
  descripcion: string;
  cantidad: string;
  estado?: string;
}

export interface formTouched {
  numeroOrden: boolean;
  proveedor: boolean;
  precioUnitario: boolean;
  fecha: boolean;
  descripcion: boolean;
  cantidad: boolean;
  estado?: boolean;
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
  onSave?: (purchaseOrder: purchaseOrder) => void; // Optional if needed
}

export interface annulPurchaseOrderModalProps {
  isOpen: boolean;
  purchaseOrder: purchaseOrder | null;
  onClose: () => void;
  onAnnul: (id: number, reason: string) => void;
}

export interface PurchaseOrdersTableProps {
  purchaseOrders: purchaseOrder[];
  onView: (purchaseOrder: purchaseOrder) => void;
  onEdit: (purchaseOrder: editPurchaseOrder) => void;
  onAnnul: (purchaseOrder: purchaseOrder) => void;
  onCreate: () => void;
}

export interface purchaseOrderForTable extends Omit<purchaseOrder, 'id'> {
  id: number;
}