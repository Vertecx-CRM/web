"use client";

import { useMemo, useState } from "react";
import Colors from "@/shared/theme/colors";
import { motion } from "framer-motion";
import Image from "next/image";

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
  onCancel?: (row: T) => void;
  onCreate?: () => void;
  searchPlaceholder?: string;
  createButtonText?: string;
  rightActions?: React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;
  renderExtraActions?: (row: T) => React.ReactNode;
  tailHeader?: string;
  renderTail?: (row: T) => React.ReactNode;
};
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

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  pageSize = 5,
  searchableKeys = [],
  onView,
  onEdit,
  onDelete,
  onCancel,
  onCreate,
  searchPlaceholder = "Buscar…",
  createButtonText = "Crear",
  rightActions,
  renderActions,
  renderExtraActions,
  tailHeader,
  renderTail,
}: DataTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  function normalize(value: unknown): string[] {
    if (value == null) return [];
    const str = String(value).toLowerCase().trim();
    if (!isNaN(Number(str.replace(/[\$,]/g, "")))) {
      const num = Number(str.replace(/[\$,]/g, ""));
      return [num.toString(), num.toFixed(0), num.toFixed(2)];
    }
    if (!isNaN(Date.parse(str))) {
      const d = new Date(str);
      return [
        d.toISOString().slice(0, 10),
        d.toLocaleDateString("es-ES"),
        d.getFullYear().toString(),
        d.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
      ].map((f) => f.toLowerCase());
    }
    return [str];
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;

    const isExactStatus = term === "activo" || term === "inactivo";

    return data.filter((row) =>
      searchableKeys.some((key) => {
        const normalizedValues = normalize(row[key]);

        if ((key === "estado" || key === "state") && isExactStatus) {
          return normalizedValues.includes(term);
        }

        return normalizedValues.some((value) => value.includes(term));
      })
    );
  }, [q, data, searchableKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        {searchableKeys && searchableKeys.length > 0 && (
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
        )}

        {(rightActions || onCreate) && (
          <div>
            <div className="hidden md:flex items-center gap-2">
              {rightActions}
              {onCreate && (
                <button
                  className="cursor-pointer inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white shadow-sm 
               transition-transform duration-200 transform hover:scale-105 hover:bg-red-600"
                  style={{ background: Colors.buttons.primary }}
                  onClick={onCreate}
                >
                  <PlusIcon className="h-4 w-4" />
                  {createButtonText || "Crear"}
                </button>
              )}
            </div>
            {onCreate && (
              <button
                className="cursor-pointer fixed bottom-6 right-6 z-50 flex md:hidden items-center justify-center w-14 h-14 rounded-full shadow-lg text-white"
                style={{ background: Colors.buttons.primary }}
                onClick={onCreate}
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm flex flex-col">
        <table className="min-w-max w-full text-sm">
          <thead
            className="bg-gray-50 text-gray-700 sticky top-0 z-10 hidden md:table-header-group"
            style={{ backgroundColor: Colors.table.header }}
          >
            <tr className="text-left">
              {columns.map((c) => (
                <Th key={String(c.key)}>{c.header}</Th>
              ))}
              {(onView || onEdit || onDelete || onCancel || renderActions) && (
                <Th>Acciones</Th>
              )}
              {renderTail && (
                <Th className="text-center">{tailHeader ?? "Imprimir"}</Th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E6E6E6]">
            {current.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 block md:table-row">
                {columns.map((c, colIndex) => (
                  <Td
                    key={String(c.key)}
                    colIndex={colIndex}
                    className="block md:table-cell before:content-[attr(data-label)] before:font-semibold before:mr-2 md:before:content-none"
                    data-label={c.header}
                  >
                    {c.render ? c.render(row) : String(row[c.key])}
                  </Td>
                ))}

                {(onView || onEdit || onDelete || onCancel || renderActions) && (
                  <Td
                    className="block md:table-cell before:content-['Acciones'] before:font-semibold before:mr-2 md:before:content-none"
                    data-label="Acciones"
                  >
                    {renderActions ? (
                      renderActions(row)
                    ) : (
                      <div className="flex items-center gap-3 text-gray-600">
                        {onView && (
                          <button
                            className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                            title="Ver"
                            onClick={() => onView(row)}
                          >
                            <Image
                              src="/icons/Eye.svg"
                              alt="View icon"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                            title="Editar"
                            onClick={() => onEdit(row)}
                          >
                            <Image
                              src="/icons/Edit.svg"
                              alt="Edit icon"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                            title="Eliminar"
                            onClick={() => onDelete(row)}
                          >
                            <Image
                              src="/icons/delete.svg"
                              alt="Delete icon"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                          </button>
                        )}
                        {onCancel && (
                          <button
                            className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                            title="Anular"
                            onClick={() => onCancel(row)}
                          >
                            <Image
                              src="/icons/X.svg"
                              alt="Cancel icon"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                          </button>
                        )}
                        {renderExtraActions && renderExtraActions(row)}
                      </div>
                    )}
                  </Td>
                )}

                {renderTail && (
                  <Td
                    className="block md:table-cell text-center before:content-[attr(data-label)] before:font-semibold before:mr-2 md:before:content-none"
                    data-label={tailHeader ?? "Imprimir"}
                  >
                    {renderTail(row)}
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

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

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-semibold whitespace-pre-line ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  colIndex = 0,
}: {
  children: React.ReactNode;
  className?: string;
  colIndex?: number;
}) {
  return (
    <motion.td
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: colIndex * 0.1,
      }}
      className={`px-4 py-3 align-top ${className}`}
    >
      {children}
    </motion.td>
  );
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
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      className={`
        min-w-8 rounded-md px-2 py-1 text-xs border text-black
        transition-all duration-200 ease-in-out
        ${active ? "shadow-md scale-105" : "hover:shadow-sm hover:scale-105"}
        ${disabled ? "opacity-40" : ""}
      `}
    >
      {children}
    </button>
  );
}
