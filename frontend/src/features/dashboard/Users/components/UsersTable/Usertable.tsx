import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import {
  User,
  EditUser,
  UserForTable,
  UsersTableProps,
} from "../../types/typesUser";
import Colors from "@/shared/theme/colors";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";

// Función auxiliar para mostrar tipo de documento
const mapTypeIdToLabel = (typeid: number): string => {
  const types: Record<number, string> = {
    1: "CC",
    2: "CE",
    3: "TI",
    4: "NIT",
    5: "PAS",
  };
  return types[typeid] || "N/A";
};

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
  // 🧠 Adaptar usuarios al formato del DataTable
  const usersForTable = users.map((u, index) => ({
    ...u,
    id: u.userid ?? index + 1, // ✅ Se agrega id solo para DataTable
  }));

  // Columnas para el DataTable
  const columns: Column<typeof usersForTable[0]>[] = [
    { key: "id", header: "#" },
    {
      key: "typeid",
      header: "Tipo Doc.",
      render: (u) => mapTypeIdToLabel(u.typeid),
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
      key: "stateid",
      header: "Estado",
      render: (u) => {
        const label = mapStateIdToLabel(u.stateid);
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

  // Funciones de acción
  const handleView = (u: any) => onView(u as User);
  const handleEdit = (u: any) => onEdit(u as EditUser);
  const handleDelete = (u: any) => onDelete(u as User);

  return (
    <DataTable
      data={usersForTable}
      columns={columns}
      pageSize={10}
      searchableKeys={[
        "name",
        "lastname",
        "email",
        "documentnumber",
        "phone",
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
