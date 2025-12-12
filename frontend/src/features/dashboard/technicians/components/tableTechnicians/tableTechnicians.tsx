"use client";

import { useMemo } from "react";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import Colors from "@/shared/theme/colors";
import { Technician } from "../../types/typesTechnicians";

interface TechniciansTableProps {
  technicians: Technician[];
  onView: (t: Technician) => void;
  onEdit: (t: Technician) => void;
  onDelete: (t: Technician) => void;
  onCreate: () => void;
}

type TechnicianRow = Technician & {
  searchText: string;
};

function abbreviateType(type: string): string {
  const clean = type.trim();
  if (!clean) return clean;

  const lc = clean.toLowerCase();

  if (lc.startsWith("cableado estructurado")) {
    return "CE";
  }

  if (clean.length <= 15) return clean;

  const words = clean.split(/\s+/);

  if (words.length >= 2) {
    const first = words[0].slice(0, 4);
    const second = words[1].slice(0, 7);
    return `${first}. ${second}`;
  }

  return `${clean.slice(0, 12)}…`;
}

function normalizeForSearch(value: string): string {
  const lower = value.toLowerCase();
  const withoutAccents = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `${lower} ${withoutAccents}`;
}

function buildSearchText(t: Technician): string {
  const parts: string[] = [];

  const add = (val?: string | number | null) => {
    if (val === undefined || val === null) return;
    const str = String(val).trim();
    if (!str) return;
    parts.push(normalizeForSearch(str));
  };

  const fullName = `${t.name ?? ""} ${t.lastName ?? ""}`.trim();
  const doc = `${t.documentType ?? ""} ${t.documentNumber ?? ""}`.trim();

  add(t.id);
  add(fullName);
  add(doc);
  add(t.phone);
  add(t.email);
  add(t.state);

  const types = t.types ?? [];
  types.forEach((tp) => {
    add(tp);
    add(abbreviateType(tp));
  });

  return parts.join(" ");
}

const TechniciansTable: React.FC<TechniciansTableProps> = ({
  technicians,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {

  const rows: TechnicianRow[] = useMemo(
    () =>
      technicians.map((t) => ({
        ...t,
        searchText: buildSearchText(t),
      })),
    [technicians]
  );

  const columns: Column<TechnicianRow>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Nombre",
      render: (t) => {
        const fullName = `${t.name ?? ""} ${t.lastName ?? ""}`.trim();
        const words = fullName.split(/\s+/).filter(Boolean);

        if (words.length <= 2) {
          return (
            <div className="max-w-[180px] whitespace-normal leading-5">
              {fullName}
            </div>
          );
        }

        const firstLine = words.slice(0, 2).join(" ");
        const secondLine = words.slice(2).join(" ");

        return (
          <div className="max-w-[180px] whitespace-normal leading-5">
            <div>{firstLine}</div>
            <div>{secondLine}</div>
          </div>
        );
      },
    },
    {
      key: "documentNumber",
      header: "Documento",
      render: (t) => {
        const doc = `${t.documentType ?? ""} ${t.documentNumber ?? ""}`.trim();
        return doc || "—";
      },
    },
    { key: "phone", header: "Teléfono" },
    {
      key: "email",
      header: `Correo\nElectrónico`,
    },
    {
      key: "types",
      header: "Tipos técnico",
      render: (t) => {
        const types = t.types ?? [];

        if (!types.length) {
          return (
            <div className="max-w-[220px] whitespace-normal leading-5 text-center">
              Sin especificar
            </div>
          );
        }

        const full = types.join(", ");

        return (
          <div
            className="max-w-[220px] whitespace-normal leading-5"
            title={full}
          >
            <div className="flex flex-row flex-wrap justify-center gap-x-2 gap-y-1">
              {types.map((tp) => (
                <span
                  key={tp}
                  className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-800"
                >
                  {abbreviateType(tp)}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      key: "state",
      header: "Estado",
      render: (t) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              t.state === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {t.state}
        </span>
      ),
    },
  ];

  return (
    <DataTable<TechnicianRow>
      module="technicians"
      data={rows}
      columns={columns}
      pageSize={6}

      searchableKeys={["searchText"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar técnicos..."
      createButtonText="Crear Técnico"
    />
  );
};

export default TechniciansTable;
