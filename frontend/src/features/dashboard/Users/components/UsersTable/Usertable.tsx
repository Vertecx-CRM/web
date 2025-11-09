import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import {
  User,
  EditUser,
  UserForTable,
  UsersTableProps,
} from "../../types/typesUser";
import Colors from "@/shared/theme/colors";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";

// Función auxiliar para mostrar estado
const mapStateIdToLabel = (stateid: number): string => {
  const states: Record<number, string> = {
    1: "Activo",
    2: "Inactivo",
  };
  return states[stateid] || "Desconocido";
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const usersForTable: UserForTable[] = users.map((u, index) => ({
    ...u,
    id: u.userid ?? index + 1,
    userid: u.userid ?? index + 1,
  }));


  //Columnas del DataTable
  // Columnas del DataTable
  const columns: Column<UserForTable>[] = [
    { key: "id", header: "#" },
    {
      key: "typeofdocuments",
      header: "Tipo Doc.",
      render: (u) => u.typeofdocuments?.name || "Sin tipo",
    },
    { key: "documentnumber", header: "N° Documento" },
    {
      key: "name",
      header: "Nombre Completo",
      render: (u) => `${u.name} ${u.lastname || ""}`.trim(),
    },
    { key: "phone", header: "Teléfono" },
    { key: "email", header: "Correo Electrónico" },
    {
      key: "roleconfiguration",
      header: "Rol",
      render: (u) =>
        u.roleconfiguration?.roles?.name || "Sin rol"
    },
    {
      key: "stateid",
      header: "Estado",
      render: (u) => {
        const label = u.stateid === 1 ? "Activo" : "Inactivo";
        return (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color:
                label === "Activo"
                  ? Colors.states.success
                  : Colors.states.inactive,
            }}
          >
            {label}
          </span>
        );
      },
    },
  ];


  // Funciones adaptadoras
  const handleView = (u: UserForTable) => onView(u as User);
  const handleEdit = (u: UserForTable) => onEdit(u as EditUser);
  const handleDelete = (u: UserForTable) => onDelete(u as User);

  return (
    <DataTable<UserForTable>
      data={usersForTable}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "name",
        "lastname",
        "email",
        "documentnumber",
        "phone",
        "typeofdocuments",
      ]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar por nombre, correo, documento o teléfono…"
      createButtonText="Crear Usuario"
    />

  );
};

export default UsersTable;
