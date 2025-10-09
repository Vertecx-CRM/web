"use client";

import React, { useMemo, useState, useCallback } from "react";
import Colors from "@/shared/theme/colors";
import { SearchIcon } from "./icons/SearchIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { DataTableProps } from "./types/datatable.types";
import { MobileCardComponent } from "./ui/mobile/MobileCardComponent";
import { ActionButtonsComponent } from "./ui/ActionButtonsComponent";
import { ActionButtonComponent } from "./ui/ActionButtonComponent";
import { CreateButtonComponent } from "./ui/CreateButtonComponent";
import { OptimizedTdComponent } from "./ui/OptimizedTdComponent";
import { PaginationComponent } from "./ui/PaginationComponent";

const ROW_HEIGHT = 60;
const VISIBLE_ROWS = 10;

function Th({
  children,
  className = "",
  width,
}: {
  children: React.ReactNode;
  className?: string;
  width?: string;
}) {
  return (
    <th
      className={`px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm whitespace-pre-line break-words text-center align-middle ${className}`}
      style={{ width }}
    >
      {children}
    </th>
  );
}

const OptimizedTd = React.memo(OptimizedTdComponent);

export const ActionButton = React.memo(ActionButtonComponent);

export const ActionButtons = React.memo(ActionButtonsComponent);

const MobileCard = React.memo(
  MobileCardComponent
) as typeof MobileCardComponent;

const CreateButton = React.memo(CreateButtonComponent);

const Pagination = React.memo(PaginationComponent);

// Componente principal DataTable
export function DataTable<T extends { id: number | string }>(
  props: DataTableProps<T>
) {
  const {
    data,
    columns,
    pageSize: defaultPageSize = 8,
    searchableKeys = [],
    onView,
    onEdit,
    onDelete,
    onCancel,
    onCheck,
    onCreate,
    searchPlaceholder = "Buscar…",
    createButtonText = "Crear",
    rightActions,
    renderActions,
    renderExtraActions,
    tailHeader,
    renderTail,
    mobileCardView = true,
  } = props;

  const [q, setQ] = useState("");
  const [pageSizeOption, setPageSizeOption] = useState<string | number>("");
  const [pageSize, setPageSize] = useState<number>(5);
  const [page, setPage] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);

  const normalize = useCallback((value: unknown): string[] => {
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
      ].map((f) => f.toLowerCase());
    }

    return [str];
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;

    const isExactStatus = term === "activo" || term === "inactivo";

    return data.filter((row) =>
      searchableKeys.some((key) => {
        const value = row[key];
        if (value == null) return false;

        if ((key === "estado" || key === "state") && isExactStatus) {
          const estado = String(value).toLowerCase();
          return estado === term;
        }

        const strValue = String(value).toLowerCase();
        if (strValue.includes(term)) return true;

        const normalized = normalize(value);
        return normalized.some((n) => n.includes(term));
      })
    );
  }, [q, data, searchableKeys, normalize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  // calcular registros visibles
  const current = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  const goTo = useCallback(
    (p: number) => setPage(Math.min(Math.max(p, 1), totalPages)),
    [totalPages]
  );

  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const visibleRows = current.slice(startIndex, startIndex + VISIBLE_ROWS);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleColumns = useMemo(() => {
    return columns.filter(
      (col) =>
        col.priority === "high" || (!col.priority && columns.indexOf(col) < 3)
    );
  }, [columns]);

  const Row = useCallback(
    ({ row, index }: { row: T; index: number }) => (
      <tr
        key={row.id}
        className="hover:bg-gray-50 text-center table-row"
        style={{
          top: `${(startIndex + index) * ROW_HEIGHT}px`,
          width: "100%",
          height: `${ROW_HEIGHT}px`,
        }}
      >
        {(window.innerWidth >= 768 ? columns : visibleColumns).map(
          (c, colIndex) => (
            <OptimizedTd
              key={String(c.key)}
              colIndex={colIndex}
              header={c.header}
              width={c.width}
              className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <div className="truncate" title={String(row[c.key])}>
                {c.render ? c.render(row) : String(row[c.key])}
              </div>
            </OptimizedTd>
          )
        )}

        {(onView || onEdit || onDelete || onCancel || onCheck || renderActions) && (
          <OptimizedTd header="Acciones">
            {renderActions ? (
              renderActions(row)
            ) : (
              <ActionButtons
                row={row}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onCancel={onCancel}
                onCheck={onCheck}
                renderExtraActions={renderExtraActions}
              />
            )}
          </OptimizedTd>
        )}

        {renderTail && (
          <OptimizedTd
            header={tailHeader ?? "Imprimir"}
            className="text-center"
          >
            {renderTail(row)}
          </OptimizedTd>
        )}
      </tr>
    ),
    [
      columns,
      visibleColumns,
      onView,
      onEdit,
      onDelete,
      onCancel,
      onCheck,
      renderActions,
      renderExtraActions,
      renderTail,
      tailHeader,
      startIndex,
    ]
  );

  return (
    <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* 🔍 Search + PageSize juntos */}
        {searchableKeys && searchableKeys.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:max-w-lg">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-full bg-white px-9 py-2 text-sm shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {/* Page size select */}
            <div className="flex items-center gap-2">
              <select
                value={pageSizeOption}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setPageSizeOption("");
                    setPageSize(5);
                  } else {
                    const num = Number(value);
                    setPageSizeOption(num);
                    setPageSize(num);
                  }
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-red-400"
              >
                <option value="">Mostrar</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}

        {/* Botones de acciones a la derecha */}
        {(rightActions || onCreate) && (
          <div className="flex items-center gap-2 justify-end">
            {rightActions}
            {onCreate && (
              <div className="hidden md:block">
                <CreateButton
                  onCreate={onCreate}
                  createButtonText={createButtonText}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {mobileCardView && (
          <div className="md:hidden">
            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {current.map((row) => (
                <MobileCard
                  key={row.id}
                  row={row}
                  columns={columns}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCancel={onCancel}
                  onCheck={onCheck}
                  renderActions={renderActions}
                  renderExtraActions={renderExtraActions}
                  renderTail={renderTail}
                  tailHeader={tailHeader}
                />
              ))}
              {current.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`${
            mobileCardView ? "hidden md:block" : "block"
          } overflow-x-auto`}
        >
          <div
            className="max-h-[600px] overflow-y-auto"
            onScroll={handleScroll}
          >
            <table className="min-w-full text-sm table-fixed border-collapse">
              <thead
                className="bg-gray-50 text-gray-700 sticky top-0 z-10"
                style={{ backgroundColor: Colors.table.header }}
              >
                <tr className="text-center table-row">
                  {columns.map((c) => (
                    <Th key={String(c.key)} width={c.width}>
                      {c.header}
                    </Th>
                  ))}
                  {(onView ||
                    onEdit ||
                    onDelete ||
                    onCancel ||
                    onCheck ||
                    renderActions) && <Th>Acciones</Th>}
                  {renderTail && (
                    <Th className="text-center">{tailHeader ?? "Imprimir"}</Th>
                  )}
                </tr>
              </thead>
              <tbody
                className="divide divide-[#E6E6E6]"
                style={{
                  position: "relative",
                  height: `${current.length * ROW_HEIGHT}px`,
                }}
              >
                {visibleRows.map((row, index) => (
                  <Row key={row.id} row={row} index={index} />
                ))}
              </tbody>
            </table>

            {current.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} goTo={goTo} />
        )}
      </div>

      {onCreate && (
        <button
          className="fixed bottom-6 right-6 z-50 flex md:hidden items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-transform hover:scale-105"
          style={{ background: Colors.buttons.primary }}
          onClick={onCreate}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
