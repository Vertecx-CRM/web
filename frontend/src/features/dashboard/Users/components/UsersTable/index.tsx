
import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import { User } from "../../types";
import Colors from "@/shared/theme/colors";

interface UsersTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Definición de columnas para el DataTable
  const columns: Column<User>[] = [
    { key: "id", header: "#" },
    { key: "documento", header: "T. Documento" },
    { key: "numeroDocumento", header: "Número" },
    { key: "nombre", header: "Nombre" },
    { key: "telefono", header: "Teléfono" },
    { key: "email", header: "Correo electrónico" },
    { key: "rol", header: "Rol" },
    {
      key: "estado",
      header: "Estado",
      render: (user) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              user.estado === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {user.estado}
        </span>
      ),
    },
  ];

  return (
    <DataTable<User>
      data={users}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "nombre",
        "email",
        "rol",
        "documento",
        "numeroDocumento",
        "telefono",
        "estado",
      ]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar por nombre, email, rol, documento, teléfono o estado…"
      createButtonText="Crear Usuario"
    />
  );
};

export default UsersTable;