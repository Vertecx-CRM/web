import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import { Role } from "../../types/typeRoles";
import Colors from "@/shared/theme/colors";

interface RolesTableProps {
  roles: Role[];
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onCreate: () => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  onView,
  onEdit,
  onDelete,
  onCreate
}) => {
  const columns: Column<Role>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    {
      key: "state",
      header: "Estado",
      render: (role: Role) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              role.state === "Activo"
                ? Colors.states.success
                : Colors.states.inactive
          }}
        >
          {role.state}
        </span>
      )
    }
  ];

  return (
    <DataTable<Role>
      data={roles}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "name", "state"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar roles..."
      createButtonText="Crear Rol"
    />
  );
};

export default RolesTable;
