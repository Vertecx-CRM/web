"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { usePermissions } from "@/features/auth/hooks/usePermissions";

const ROW_HEIGHT = 60,
  VISIBLE_ROWS = 10,
  ACTIONS_COL_WIDTH = "230px";

// ================================
// SKELETONS & COMPONENTES REUSABLES
// ================================
const SkeletonBlock = ({ c = "", w }: { c?: string; w?: string | number }) => (
  <div
    className={`animate-pulse bg-gray-200/80 rounded ${c}`}
    style={{ width: w }}
  />
);

const Th = ({ children, c = "", w }: any) => (
  <th
    className={`px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm whitespace-pre-line break-words text-center align-middle ${c}`}
    style={{ width: w }}
  >
    {children}
  </th>
);

const OptimizedTd = React.memo(OptimizedTdComponent);
export const ActionButton = React.memo(ActionButtonComponent);
export const ActionButtons = React.memo(ActionButtonsComponent);
const MobileCard = React.memo(
  MobileCardComponent,
) as typeof MobileCardComponent;
const CreateButton = React.memo(CreateButtonComponent);
const Pagination = React.memo(PaginationComponent);

// ================================
// LÓGICA DE BÚSQUEDA
// ================================
const normText = (v: any) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const moneyTokens = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return [];
  const r = Math.round(n);
  return [
    String(r),
    r.toLocaleString("es-CO"),
    r.toLocaleString("en-US"),
    r.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }),
  ].map(normText);
};

const estadoTokens = (v: any) => {
  const r = normText(v);
  if (!r) return [];
  if (r.includes("garantiareportada") || r.includes("garantia_reportada"))
    return [
      "garantia reportada",
      "garantia (reportada)",
      "garantia",
      "garantiareportada",
      "reportada",
    ].map(normText);
  if (r.includes("garantia"))
    return ["garantia", "en garantia", "garantia sin reporte"].map(normText);
  if (r.includes("anul") || r.includes("cancel") || r.includes("revoke"))
    return [
      "anulada",
      "anulado",
      "cancelada",
      "cancelado",
      "revocada",
      "revoke",
    ].map(normText);
  if (r.includes("aprob") || r.includes("approved"))
    return ["aprobada", "aprobado", "approved"].map(normText);
  if (r.includes("pend")) return ["pendiente", "pendient"].map(normText);
  return [r];
};

const normalize = (val: any, key?: string): string[] => {
  if (val == null) return [];
  if (key === "estado") return estadoTokens(val);
  if (key === "state") {
    const sName = normText(typeof val === "string" ? val : (val?.name ?? ""));
    const mapped =
      sName === "approved"
        ? "aprobado"
        : sName === "revoke"
          ? "anulado"
          : sName;
    return [...estadoTokens(mapped), normText(mapped)];
  }
  if (["monto", "viaticos", "total"].includes(key!)) return moneyTokens(val);
  const str = normText(val),
    cleaned = str.replace(/\s/g, "").replace(/[^0-9.-]/g, "");
  if (cleaned && !isNaN(Number(cleaned)))
    return Array.from(
      new Set([str, cleaned, ...moneyTokens(Number(cleaned))].map(normText)),
    );
  if (!isNaN(Date.parse(String(val)))) {
    const d = new Date(String(val));
    return [
      d.toISOString().slice(0, 10),
      d.toLocaleDateString("es-CO"),
      d.toLocaleDateString("es-ES"),
      d.getFullYear().toString(),
    ].map(normText);
  }
  return [str];
};

const pickStatus = (row: any, keys: string[]) => {
  for (const k of ["status", "estado", "stateSearch", "statusSearch"])
    if (keys.includes(k) && row?.[k] != null) return normText(row[k]);
  if (keys.includes("state"))
    return normText(
      typeof row?.state === "string" ? row.state : (row?.state?.name ?? ""),
    );
  return "";
};

// ================================
// COMPONENTE PRINCIPAL
// ================================
const DataTableComponent = <T extends Record<string, any>>(
  props: DataTableProps<T> & { module: string },
) => {
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
    onApprove,
    onCreate,
    searchPlaceholder = "Buscar…",
    createButtonText = "Crear",
    rightActions,
    renderActions,
    renderExtraActions,
    tailHeader,
    renderTail,
    mobileCardView = true,
    module,
    actionGuard,
    freeze,
    disableInternalScroll = false,
    loading = false,
  } = props;

  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [pageSizeOption, setPageSizeOption] = useState<string | number>("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);

  const filtered = useMemo(() => {
    if (loading) return Array.isArray(data) ? data : [];
    const term = normText(q);
    if (!term) return data;
    const tokens = term.split(/\s+/).filter(Boolean);
    if (!tokens.length) return data;
    const isExact = term === "activo" || term === "inactivo",
      d = Array.isArray(data) ? data : [];

    return d.filter((row) => {
      if (isExact) return pickStatus(row, searchableKeys as string[]) === term;
      return tokens.every((t) =>
        searchableKeys.some((key) => {
          const val = (row as any)[key];
          if (val == null) return false;
          if (["stateSearch", "statusSearch"].includes(String(key))) {
            const v = normText(val);
            return t.startsWith("act")
              ? v === "activo"
              : t.startsWith("ina")
                ? v === "inactivo"
                : v.includes(t);
          }
          return normalize(val, String(key)).some((nv) => nv.includes(t));
        }),
      );
    });
  }, [q, data, searchableKeys, loading]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const visibleRows = disableInternalScroll
    ? current
    : current.slice(startIndex, startIndex + VISIBLE_ROWS);

  const resolveRowKey = (r: T, i: number) =>
    r.id ?? r.purchaseorderid ?? r.numberoforder ?? r.reference ?? i;
  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  const visibleCols = useMemo(
    () =>
      columns.filter(
        (c) => c.priority === "high" || (!c.priority && columns.indexOf(c) < 3),
      ),
    [columns],
  );
  const colsToRender = isDesktop ? columns : visibleCols;
  const showActions =
    canView(module) ||
    canUpdate(module) ||
    canDelete(module) ||
    onCancel ||
    onCheck ||
    onApprove ||
    renderActions;
  const tableStyle = freeze ? { animation: "none" } : {};

  const Thead = () => (
    <thead
      className="bg-gray-50 text-gray-700 sticky top-0 z-10"
      style={{ backgroundColor: Colors.table.header }}
    >
      <tr className="text-center table-row">
        {columns.map((c) => (
          <Th key={String(c.key)} w={c.width}>
            {c.header}
          </Th>
        ))}
        {showActions && <Th w={ACTIONS_COL_WIDTH}>Acciones</Th>}
        {renderTail && <Th c="text-center">{tailHeader ?? "Imprimir"}</Th>}
      </tr>
    </thead>
  );

  return (
    <div
      className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-0 mt-4 sm:mt-6"
      style={tableStyle}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchableKeys.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:max-w-lg">
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
            <select
              value={pageSizeOption}
              onChange={(e) => {
                const v = e.target.value;
                setPageSizeOption(v);
                setPageSize(v ? Number(v) : 5);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-red-400"
            >
              <option value="">Mostrar</option>
              {[8, 10, 15, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
        {(rightActions || onCreate) && (
          <div className="flex items-center gap-2 justify-end">
            {rightActions}
            {onCreate && canCreate(module) && (
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

      <div
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        style={tableStyle}
      >
        {loading ? (
          <>
            {mobileCardView && (
              <div
                className={`md:hidden p-3 space-y-3 ${disableInternalScroll ? "" : "max-h-[600px] overflow-y-auto"}`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-3"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <SkeletonBlock c="h-4" w="70%" />
                        <SkeletonBlock c="h-3" w="55%" />
                      </div>
                      <div className="flex gap-2">
                        <SkeletonBlock c="h-8 w-8" />
                        <SkeletonBlock c="h-8 w-8" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <SkeletonBlock c="h-3" w="80%" />
                      <SkeletonBlock c="h-3" w="70%" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`${mobileCardView ? "hidden md:block" : "block"} overflow-x-auto`}
              style={tableStyle}
            >
              <div
                className={
                  disableInternalScroll ? "" : "max-h-[600px] overflow-y-auto"
                }
                style={freeze ? { overflowY: "hidden" } : {}}
              >
                <table className="min-w-max w-full text-sm table-fixed border-collapse">
                  <Thead />
                  <tbody className="divide divide-[#E6E6E6]">
                    {!disableInternalScroll && startIndex > 0 && (
                      <tr style={{ height: `${startIndex * ROW_HEIGHT}px` }} />
                    )}

                    {visibleRows.map((row, idx) => {
                      const i = disableInternalScroll ? idx : startIndex + idx;
                      return (
                        <tr
                          key={resolveRowKey(row, i)}
                          className="hover:bg-gray-50 text-center table-row transition-all duration-300"
                          style={{ height: `${ROW_HEIGHT}px` }}
                        >
                          {colsToRender.map((c, cIdx) => (
                            <OptimizedTd
                              key={String(c.key)}
                              colIndex={cIdx}
                              header={String(c.header ?? "")}
                              width={c.width}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                            >
                              <div
                                className="truncate"
                                title={String((row as any)[c.key])}
                              >
                                {c.render
                                  ? c.render(row)
                                  : String((row as any)[c.key])}
                              </div>
                            </OptimizedTd>
                          ))}

                          {showActions && (
                            <OptimizedTd
                              header="Acciones"
                              width={ACTIONS_COL_WIDTH}
                              className="min-w-[230px] whitespace-nowrap"
                            >
                              {renderActions ? (
                                renderActions(row)
                              ) : (
                                <ActionButtons
                                  row={row}
                                  onView={canView(module) ? onView : undefined}
                                  onEdit={
                                    canUpdate(module) ? onEdit : undefined
                                  }
                                  onDelete={
                                    canDelete(module) ? onDelete : undefined
                                  }
                                  onCancel={onCancel}
                                  onCheck={onCheck}
                                  onApprove={onApprove}
                                  actionGuard={actionGuard}
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
                      );
                    })}

                    {!disableInternalScroll &&
                      current.length > startIndex + VISIBLE_ROWS && (
                        <tr
                          style={{
                            height: `${(current.length - startIndex - VISIBLE_ROWS) * ROW_HEIGHT}px`,
                          }}
                        />
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {mobileCardView && (
              <div
                className={`md:hidden p-3 space-y-3 ${disableInternalScroll ? "" : "max-h-[600px] overflow-y-auto"}`}
              >
                {current.map((row, i) => (
                  <MobileCard
                    key={resolveRowKey(row, i)}
                    {...{
                      row,
                      columns,
                      onView: canView(module) ? onView : undefined,
                      onEdit: canUpdate(module) ? onEdit : undefined,
                      onDelete: canDelete(module) ? onDelete : undefined,
                      onCancel,
                      onCheck,
                      actionGuard,
                      renderActions,
                      renderExtraActions,
                      renderTail,
                      tailHeader,
                    }}
                  />
                ))}
                {!current.length && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            )}

            <div
              className={`${mobileCardView ? "hidden md:block" : "block"} overflow-x-auto`}
              style={tableStyle}
            >
              <div
                className={
                  disableInternalScroll ? "" : "max-h-[600px] overflow-y-auto"
                }
                onScroll={
                  disableInternalScroll
                    ? undefined
                    : (e) => {
                        if (Math.abs(e.currentTarget.scrollTop - scrollTop) > 1)
                          setScrollTop(e.currentTarget.scrollTop);
                      }
                }
                style={freeze ? { overflowY: "hidden" } : {}}
              >
                <table className="min-w-full w-full text-sm table-fixed border-collapse">
                  <Thead />
                  <tbody className="divide divide-[#E6E6E6]">
                    {!disableInternalScroll && startIndex > 0 && (
                      <tr style={{ height: `${startIndex * ROW_HEIGHT}px` }} />
                    )}

                    {visibleRows.map((row, idx) => {
                      const i = disableInternalScroll ? idx : startIndex + idx;
                      return (
                        <tr
                          key={resolveRowKey(row, i)}
                          className="hover:bg-gray-50 text-center table-row transition-all duration-300"
                          style={{ height: `${ROW_HEIGHT}px` }}
                        >
                          {colsToRender.map((c, cIdx) => (
                            <OptimizedTd
                              key={String(c.key)}
                              colIndex={cIdx}
                              header={String(c.header ?? "")}
                              width={c.width}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                            >
                              <div
                                className="truncate"
                                title={String((row as any)[c.key])}
                              >
                                {c.render
                                  ? c.render(row)
                                  : String((row as any)[c.key])}
                              </div>
                            </OptimizedTd>
                          ))}

                          {showActions && (
                            <OptimizedTd
                              header="Acciones"
                              width={ACTIONS_COL_WIDTH}
                              className="min-w-[230px] whitespace-nowrap"
                            >
                              {renderActions ? (
                                renderActions(row)
                              ) : (
                                <ActionButtons
                                  row={row}
                                  onView={canView(module) ? onView : undefined}
                                  onEdit={
                                    canUpdate(module) ? onEdit : undefined
                                  }
                                  onDelete={
                                    canDelete(module) ? onDelete : undefined
                                  }
                                  onCancel={onCancel}
                                  onCheck={onCheck}
                                  onApprove={onApprove}
                                  actionGuard={actionGuard}
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
                      );
                    })}

                    {!disableInternalScroll &&
                      current.length > startIndex + VISIBLE_ROWS && (
                        <tr
                          style={{
                            height: `${(current.length - startIndex - VISIBLE_ROWS) * ROW_HEIGHT}px`,
                          }}
                        />
                      )}
                  </tbody>
                </table>

                {!current.length && (
                  <div className="text-center py-12 text-gray-500">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                goTo={(p) => setPage(Math.min(Math.max(p, 1), totalPages))}
              />
            )}
          </>
        )}
      </div>

      {onCreate && canCreate(module) && (
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
};

export const DataTable = React.memo(
  DataTableComponent,
  (p, n) =>
    p.data === n.data &&
    p.columns === n.columns &&
    p.freeze === n.freeze &&
    p.onCreate === n.onCreate &&
    p.onView === n.onView &&
    p.onCancel === n.onCancel &&
    p.loading === n.loading,
) as typeof DataTableComponent;
