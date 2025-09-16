import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import { Client } from "../../types/typeClients";
import Colors from "@/shared/theme/colors";

interface ClientsTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onCreate: () => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onView,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Definición de columnas para el DataTable
  const columns: Column<Client>[] = [
    { key: "id", header: "Id" },
    { key: "tipo", header: "Tipo" },
    { key: "documento", header: "Documento" },
    { key: "nombre", header: "Nombre" },
    { key: "telefono", header: "Teléfono" },
    { key: "correoElectronico", header: "Correo electrónico" },
    { key: "rol", header: "Rol" },
    {
      key: "estado",
      header: "Estado",
      render: (client: Client) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: client.estado === "Activo" ? "#e8f5e8" : "#f5e8e8",
            color: client.estado === "Activo"
              ? Colors.states.success
              : Colors.states.inactive
          }}
        >
          {client.estado}
        </span>
      )
    },
  ];

  return (
    <DataTable<Client>
      data={clients}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "tipo", "documento", "nombre", "telefono", "correoElectronico", "rol", "estado"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar clientes..."
      createButtonText="Crear Cliente"
    />
  );
};

export default ClientsTable;