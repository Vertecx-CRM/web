import React, { useState } from "react";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
// importar el tipo DataTableProps (ruta basada en tu DataTable)
import type { DataTableProps } from "@/features/dashboard/components/datatable/types/datatable.types";
import {
  editPurchaseOrder,
  purchaseOrder,
  purchaseOrderForTable,
  PurchaseOrdersTableProps,
} from "../../types/typesPurchaseOrder";
import Colors from "@/shared/theme/colors";
import { CancelPurchaseOrderModal } from "../CancelPurchaseOrderModal/CancelPurchaseOrderModal";

// Usamos el tipo exacto que espera el DataTable para columns
type ColumnsType = DataTableProps<purchaseOrderForTable>["columns"];

interface ExtendedPurchaseOrdersTableProps
  extends Omit<PurchaseOrdersTableProps, "onDelete"> {
  onCancel: (order: purchaseOrder, reason: string) => void;
}

export const PurchaseOrdersTable: React.FC<ExtendedPurchaseOrdersTableProps> = ({
  purchaseOrders,
  onView,
  onEdit,
  onCreate,
  onCancel,
}) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] =
    useState<purchaseOrder | null>(null);

  const purchaseOrdersForTable: purchaseOrderForTable[] = purchaseOrders.map(
    (order, index) => ({
      ...order,
      id: order.id || index + 1,
    })
  );

  const columns: ColumnsType = [
    { key: "id", header: "#" },
    { key: "numeroOrden", header: "N° Orden" },
    { key: "proveedor", header: "Proveedor" },
    {
      key: "precioUnitario",
      header: "Precio Unitario",
      render: (row) => {
        const value = Number((row as any).precioUnitario || 0);
        return `$${value.toLocaleString("es-CO")}`;
      },
    },
    { key: "fecha", header: "Fecha" },
    {
      key: "estado",
      header: "Estado",
      render: (row) => {
        const r = row as purchaseOrderForTable;
        const color =
          r.estado === "Pendiente"
            ? Colors.states.warning
            : r.estado === "Completada"
            ? Colors.states.success
            : r.estado === "Anulada" 
            ? Colors.states.error
            : Colors.states.inactive;
        const bg = r.estado === "Anulada"  ? "#fee2e2" : "transparent";
        return (
          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color, backgroundColor: bg }}>
            {r.estado}
          </span>
        );
      },
    },
  ];

  const handleView = (row: purchaseOrderForTable) => onView(row as purchaseOrder);
  const handleEdit = (row: purchaseOrderForTable) =>
    onEdit(row as editPurchaseOrder);
  const handleCancelClick = (row: purchaseOrderForTable) => {
    setSelectedOrderToCancel(row as purchaseOrder);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = (order: purchaseOrder, reason: string) => {
    onCancel(order, reason);
    setCancelModalOpen(false);
    setSelectedOrderToCancel(null);
  };

  return (
    <>
      <DataTable<purchaseOrderForTable>
        data={purchaseOrdersForTable}
        columns={columns}
        pageSize={10}
        searchableKeys={["numeroOrden", "proveedor", "estado", "fecha"]}
        onView={handleView}
        onEdit={handleEdit}
        onCancel={handleCancelClick}
        onCreate={onCreate}
        searchPlaceholder="Buscar por número de orden, proveedor, estado o fecha…"
        createButtonText="Crear Orden" module={""}      />

      <CancelPurchaseOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedOrderToCancel(null);
        }}
        onCancel={handleCancelConfirm}
        purchaseOrder={selectedOrderToCancel}
      />
    </>
  );
};

export default PurchaseOrdersTable;
