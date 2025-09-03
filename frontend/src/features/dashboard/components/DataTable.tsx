"use client";

import { useMemo, useState } from "react";
import Colors from "@/shared/theme/colors";

/** ===== Tipos ===== */
export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchableKeys?: (keyof T)[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCreate?: () => void;
  onCancel?: (row: T) => void;
  searchPlaceholder?: string;
  createButtonText?: string;
};

/** ====== Iconos mínimos ====== */
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3-3" />
  </svg>
);
const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" d="M12 5v14M5 12h14" />
  </svg>
);

/** ====== DataTable ====== */
export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  pageSize = 5,
  searchableKeys = [],
  onView,
  onEdit,
  onCancel,
  onDelete,
  onCreate,
  searchPlaceholder = "Buscar…",
  createButtonText = "Crear",
}: DataTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;

    const isEstadoExact = term === "activo" || term === "inactivo";

    return data.filter((row) =>
      searchableKeys.some((key) => {
        const value = String(row[key] ?? "").toLowerCase();

        // Si la columna es "estado" y se busca exactamente activo/inactivo
        if (key === "estado" || key === "status" && isEstadoExact) {
          return value === term;
        }

        return value.includes(term);
      })
    );
  }, [q, data, searchableKeys]);


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  return (
    <div className="flex flex-col gap-4">
      {/* Header con buscador y botón crear */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-full bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {onCreate && (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            style={{ background: Colors.buttons.primary }}
            onClick={onCreate}
          >
            <PlusIcon className="h-4 w-4" />
            {createButtonText || "Crear"}{" "}
            {/* <- Usa el texto personalizado o "Crear" por defecto */}
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm flex flex-col">
        <table className="min-w-full text-sm">
          <thead
            className="bg-gray-50 text-gray-700 sticky top-0 z-10"
            style={{ backgroundColor: Colors.table.header }}
          >
            <tr className="text-left">
              {columns.map((c) => (
                <Th key={String(c.key)}>{c.header}</Th>
              ))}
              {(onView || onEdit || onDelete || onCancel) && <Th>Acciones</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E6E6]">
            {current.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <Td key={String(c.key)}>
                    {c.render ? c.render(row) : String(row[c.key])}
                  </Td>
                ))}
                {(onView || onEdit || onDelete || onCancel) && (
                  <Td>
                    <div className="flex items-center gap-3 text-gray-600">
                      {onView && (
                        <button
                          className="hover:text-gray-900"
                          title="Ver"
                          onClick={() => onView(row)}
                        >
                          <img src="/icons/Eye.svg" className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="hover:text-gray-900"
                          title="Editar"
                          onClick={() => onEdit(row)}
                        >
                          <img src="/icons/Edit.svg" className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="hover:text-red-600"
                          title="Eliminar"
                          onClick={() => onDelete(row)}
                        >
                          <img src="/icons/delete.svg" className="h-4 w-4" />
                        </button>
                      )}
                      {onCancel && (
                        <button
                          className="hover:text-red-500"
                          title="Anular"
                          onClick={() => onCancel(row)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </Td>
                )}
              </tr>
            ))}

            {current.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length + (onView || onEdit || onDelete ? 1 : 0)
                  }
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="border-t border-[#E6E6E6] bg-white px-3 py-2">
          <div className="flex items-center justify-center gap-1">
            <PageBtn onClick={() => goTo(page - 1)} disabled={page === 1}>
              {"<"}
            </PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <PageBtn key={p} onClick={() => goTo(p)} active={p === page}>
                  {p}
                </PageBtn>
              );
            })}
            <PageBtn
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
            >
              {">"}
            </PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== Helpers ===== */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: active ? "white" : Colors.table.header,
        borderColor: Colors.table.lines,
      }}
      className="min-w-8 rounded-md px-2 py-1 text-xs border text-black disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
    >
      {children}
    </button>
  );
}