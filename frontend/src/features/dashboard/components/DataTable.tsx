"use client";

import { useMemo, useState } from "react";

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
};

/** ====== Iconos mínimos ====== */
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3-3" />
  </svg>
);
const EyeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const PenIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5l4 4L7 21l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const TrashIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
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
  onDelete,
}: DataTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [q, data, searchableKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador */}
      <div className="relative w-full max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar…"
          className="w-full rounded-full border bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg bg-white border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-left">
              {columns.map((c) => (
                <th key={String(c.key)} className="px-4 py-3 font-semibold">
                  {c.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-4 py-3 font-semibold">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {current.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key])}
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => onDelete?.(row)}
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-center items-center gap-1 border-t p-3">
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
  );
}

/** ===== Helpers ===== */
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
      className={`min-w-8 rounded-md px-2 py-1 text-xs ${
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100"
      } border disabled:opacity-40 disabled:pointer-events-none`}
    >
      {children}
    </button>
  );
}
