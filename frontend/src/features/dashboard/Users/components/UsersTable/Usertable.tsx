import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import { editUser, user, userForTable, UsersTableProps } from "../../types/typesUser";
import Colors from "@/shared/theme/colors";

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  onCreate
}) => {

  // Convertir usuarios para la tabla asegurando que tengan ID
  const usersForTable: userForTable[] = users.map((user, index) => ({
    ...user,
    id: user.id || index + 1 // Usar index + 1 como fallback
  }));

  // Definición de columnas para el DataTable
  const columns: Column<userForTable>[] = [
    { key: "id", header: "#" },
    { key: "tipoDocumento", header: "T. Documento" },
    { key: "numeroDocumento", header: "Número de documento" },
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

  // Funciones adaptadoras para mantener la compatibilidad
  const handleView = (user: userForTable) => {
    onView(user as user);
  };

  const handleEdit = (user: userForTable) => {
    onEdit(user as editUser);
  };

  const handleDelete = (user: userForTable) => {
    onDelete(user as user);
  };

  return (
    <DataTable<userForTable>
      data={usersForTable}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "nombre",
        "email",
        "rol",
        "numeroDocumento",
        "telefono",
        "estado",
      ]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar por nombre, email, rol, documento, teléfono o estado…"
      createButtonText="Crear Usuario"
    />
  );
};

export default UsersTable;