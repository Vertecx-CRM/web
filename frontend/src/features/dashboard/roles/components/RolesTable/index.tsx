import React, { useMemo } from "react";
import {
  DataTable,
} from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import { Role } from "../../types/typeRoles";
import Colors from "@/shared/theme/colors";

interface RolesTableProps {
  roles: Role[];
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onCreate: () => void;
}

// Extendemos Role solo para la tabla, agregando el campo de búsqueda
type RoleRow = Role & {
  searchText: string;
};

const normalizeForSearch = (value: string): string => {
  const lower = value.toLowerCase();
  const withoutAccents = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // Guardamos ambas variantes para que matchee con o sin tilde
  return `${lower} ${withoutAccents}`;
};

const buildSearchText = (role: Role): string => {
  const parts: string[] = [];

  const add = (val?: string | number | null) => {
    if (val === undefined || val === null) return;
    const str = String(val).trim();
    if (!str) return;
    parts.push(normalizeForSearch(str));
  };

  add(role.id);       // ID
  add(role.name);     // Nombre
  add(role.state);    // Estado (Activo / Inactivo)

  return parts.join(" ");
};

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const protectDefaultAdmin = (role: RoleRow) => {
    const isFirstAdmin = Number(role.id) === 1;
    if (!isFirstAdmin) return {};

    return {
      disableEdit: true,
      disableDelete: true,
      editTitle: "No puedes editar el rol administrador inicial",
      deleteTitle: "No puedes eliminar el rol administrador inicial",
    };
  };

  // Enriquecemos los roles con el campo searchText normalizado
  const rows: RoleRow[] = useMemo(
    () =>
      roles.map((r) => ({
        ...r,
        searchText: buildSearchText(r),
      })),
    [roles]
  );

  const columns: Column<RoleRow>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    {
      key: "state",
      header: "Estado",
      render: (role: RoleRow) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              role.state === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {role.state}
        </span>
      ),
    },
  ];

  return (
    <DataTable<RoleRow>
      module="roles"
      data={rows}
      columns={columns}
      pageSize={6}
      // Buscamos solo sobre searchText, que ya contiene id, nombre y estado
      // normalizados (mayúsculas, minúsculas y tildes)
      searchableKeys={["searchText"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar roles..."
      createButtonText="Crear Rol"
      actionGuard={protectDefaultAdmin}
    />
  );
};

export default RolesTable;
