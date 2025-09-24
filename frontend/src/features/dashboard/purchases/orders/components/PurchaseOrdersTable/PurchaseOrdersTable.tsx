import {
  DataTable,
  Column,
} from "@/features/dashboard/components/datatable/DataTable";
import {
  editPurchaseOrder,
  purchaseOrder,
  purchaseOrderForTable,
  PurchaseOrdersTableProps,
} from "../../types/typesPurchaseOrder";
import Colors from "@/shared/theme/colors";

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  purchaseOrders,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  // Convertir órdenes de compra para la tabla asegurando que tengan ID
  const purchaseOrdersForTable: purchaseOrderForTable[] = purchaseOrders.map(
    (order, index) => ({
      ...order,
      id: order.id || index + 1, // Usar index + 1 como fallback
    })
  );

  // Definición de columnas para el DataTable
  const columns: Column<purchaseOrderForTable>[] = [
    { key: "id", header: "#" },
    { key: "numeroOrden", header: "N° Orden" },
    { key: "proveedor", header: "Proveedor" },
    {
      key: "precioUnitario",
      header: "Precio Unitario",
      render: (order) => `$${order.precioUnitario.toLocaleString("es-CO")}`,
    },
    { key: "fecha", header: "Fecha" },
    {
      key: "estado",
      header: "Estado",
      render: (order) => (
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

  // Funciones adaptadoras para mantener la compatibilidad
  const handleView = (order: purchaseOrderForTable) => {
    onView(order as purchaseOrder);
  };

  const handleEdit = (order: purchaseOrderForTable) => {
    onEdit(order as editPurchaseOrder);
  };

  const handleDelete = (order: purchaseOrderForTable) => {
    onDelete(order as purchaseOrder);
  };

  return (
    <DataTable<purchaseOrderForTable>
      data={purchaseOrdersForTable}
      columns={columns}
      pageSize={10}
      searchableKeys={["numeroOrden", "proveedor", "estado", "fecha"]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar por número de orden, proveedor, estado o fecha…"
      createButtonText="Crear Orden"
    />
  );
};

export default PurchaseOrdersTable;
