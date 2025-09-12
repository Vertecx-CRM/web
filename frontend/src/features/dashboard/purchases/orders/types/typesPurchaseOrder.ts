export interface purchaseOrder {
  monto: string;
  fechaCreacion: ReactNode;
  id?: number;
  numeroOrden: string;
  proveedor: string;
  precioUnitario: number;
  fecha: string;
  estado: "Pendiente" | "Completada" | "Cancelada" | "En Proceso";
  descripcion?: string;
  cantidad?: number;
  total?: number;
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
}

export interface editPurchaseOrder extends purchaseOrderBase {
  id: number;
  estado: "Pendiente" | "Completada" | "Cancelada" | "En Proceso";
  cantidad: number;
}

export interface formErrors {
  numeroOrden: string;
  proveedor: string;
  precioUnitario: string;
  fecha: string;
  descripcion: string;
  cantidad: string;
}

export interface formTouched {
  numeroOrden: boolean;
  proveedor: boolean;
  precioUnitario: boolean;
  fecha: boolean;
  descripcion: boolean;
  cantidad: boolean;
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
  onDelete: (purchaseOrder: purchaseOrder) => void;
  onCreate: () => void;
}

export interface purchaseOrderForTable extends Omit<purchaseOrder, 'id'> {
  id: number;
}