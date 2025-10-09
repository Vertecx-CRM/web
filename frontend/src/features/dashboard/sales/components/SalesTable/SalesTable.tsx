import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";



export interface SalesTableProps {
  sales: any[];
  onView: (sale: any) => void;
  onCancel?: (sale: any) => void; // ✅ solo Anular, ya no Delete
  onCreate: () => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  onView,
  onCancel,
  onCreate,
}) => {
  const columns: Column<any>[] = [
    { key: "id", header: "ID" },
    { key: "codigoVenta", header: "Código Venta" },
    { key: "cliente", header: "Cliente" },
    { key: "fecha", header: "Fecha" },
    {
      key: "total",
      header: "Total",
      render: (sale) => `$${sale.total.toLocaleString()}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (sale) => (
        <span
          className="rounded-full px-2 py-0.5 text-sm font-medium"
          style={{
            color:
              sale.estado === "Finalizado"
                ? Colors.states?.success || "green"
                : Colors.states?.error || "red",
          }}
        >
          {sale.estado}
        </span>
      ),
    },
    {
      key: "acciones", // 👈 custom column
      header: "Acciones",
      render: (sale) => (
        <div className="flex gap-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => onView(sale)}
          >
            Ver
          </button>
          {onCancel && (
            <button
              className="text-orange-500 hover:underline"
              onClick={() => onCancel(sale)}
              disabled={sale.estado === "Anulada"}
            >
              Anular
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<any>
      data={sales}
      columns={columns}
      pageSize={10}
      searchableKeys={["codigoVenta", "cliente", "fecha", "estado"]}
      onView={onView}
      onCreate={onCreate}
      searchPlaceholder="Buscar por código, cliente, fecha o estado…"
      createButtonText="Crear Venta"
    />
  );
};

export default SalesTable;
