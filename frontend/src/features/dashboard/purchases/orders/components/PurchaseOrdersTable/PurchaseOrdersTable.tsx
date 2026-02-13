import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { DataTable } from "../../../../../dashboard/components/datatable/DataTable";
import { Column } from "../../../../../dashboard/components/datatable/types/column.types";
import { editPurchaseOrder, purchaseOrder, purchaseOrderForTable, PurchaseOrdersTableProps } from "../../types/typesPurchaseOrder";
import Colors from "@/shared/theme/colors";

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  purchaseOrders,
  onView,
  onEdit,
  onAnnul,
  onCreate
}) => {

  // Convertir órdenes de compra para la tabla asegurando que tengan ID
  const purchaseOrdersForTable: purchaseOrderForTable[] = purchaseOrders.map((order, index) => ({
    ...order,
    id: order.id || index + 1 // Usar index + 1 como fallback
  }));

  // Definición de columnas para el DataTable
  const columns: Column<purchaseOrderForTable>[] = [
    { key: "id", header: "#" },
    { key: "numeroOrden", header: "N° Orden" },
    { key: "proveedor", header: "Proveedor" },
    {
      key: "precioUnitario",
      header: "Precio Unitario",
      render: (order: { precioUnitario: { toLocaleString: (arg0: string) => any; }; }) => `$${order.precioUnitario.toLocaleString("es-CO")}`
    },
    { key: "fecha", header: "Fecha" },
    {
      key: "estado",
      header: "Estado",
      render: (order: { estado: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              order.estado === "Pendiente"
                ? Colors.states.warning
                : order.estado === "Completada"
                  ? Colors.states.success
                  : order.estado === "Cancelada"
                    ? Colors.states.error
                    : Colors.states.inactive,
          }}
        >
          {order.estado}
        </span>
      ),
    },
  ];

  const handleView = (order: purchaseOrderForTable) => {
    onView(order as purchaseOrder);
  };

  const handleEdit = (order: purchaseOrderForTable) => {
    onEdit(order as editPurchaseOrder);
  };

  const handleAnnul = (order: purchaseOrderForTable) => {
    onAnnul(order as purchaseOrder);
  };

  const renderActions = (row: purchaseOrderForTable) => (
    <div className="flex items-center gap-3 text-gray-600">
      {/* Edit Button - Only if not Anulada */}
      {row.estado !== "Anulada" && (
        <button
          className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-blue-100"
          title="Editar"
          onClick={() => handleEdit(row)}
        >
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      {/* Annul Button (Replaces Delete) */}
      {row.estado !== "Anulada" && (
        <button
          className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-100"
          title="Anular"
          onClick={() => handleAnnul(row)}
        >
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>
      )}

      {/* View Button */}
      <button
        className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-gray-200"
        title="Ver"
        onClick={() => handleView(row)}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  );

  return (
    <DataTable<purchaseOrderForTable>
      data={purchaseOrdersForTable}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "numeroOrden",
        "proveedor",
        "estado",
        "fecha",
      ]}
      renderActions={renderActions}
      onCreate={onCreate}
      searchPlaceholder="Buscar por número de orden, proveedor, estado o fecha…"
      createButtonText="Crear Orden" module={"purchaseOrders"}    />
  );
};

export default PurchaseOrdersTable;