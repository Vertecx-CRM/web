"use client";

import { useEffect, useMemo } from "react";
import type { OrdersServiceHistoryItem } from "../types/ordersServices.types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number | null;
  history: OrdersServiceHistoryItem[];
  loading?: boolean;
};

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function techName(it: OrdersServiceHistoryItem) {
  const u = it.technician?.users;
  const name = [u?.name, u?.lastname].filter(Boolean).join(" ").trim();
  return name || (it.technician?.technicianid ? `Técnico #${it.technician.technicianid}` : "Técnico");
}

function badgeByEntry(it: OrdersServiceHistoryItem) {
  const t = (it.entrytype || "").toUpperCase();
  if (t === "TECH") return "bg-indigo-50 text-indigo-800 border-indigo-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function iconByEntry(it: OrdersServiceHistoryItem) {
  const t = (it.entrytype || "").toUpperCase();
  const cls = "h-4 w-4";
  if (t === "TECH")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function OrderServiceHistoryModal({ isOpen, onClose, orderId, history, loading }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const items = useMemo(() => {
    const arr = Array.isArray(history) ? [...history] : [];
    arr.sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());

    const out: OrdersServiceHistoryItem[] = [];
    let lastSystemTitle = "";
    for (const it of arr) {
      const isSystem = (it.entrytype || "").toUpperCase() === "SYSTEM";
      const title = (it.title || "").trim();
      if (isSystem) {
        if (title && title === lastSystemTitle) continue;
        lastSystemTitle = title;
      }
      out.push(it);
    }
    return out;
  }, [history]);

  const title = `Historial${orderId ? ` #${orderId}` : ""}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="oshm-title">
      <button
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Cerrar historial"
      />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="sticky top-0 z-10 border-b bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 id="oshm-title" className="truncate text-base font-semibold text-slate-900">
                  {title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {loading ? "Cargando…" : `${items.length} registro(s)`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Cerrar
              </button>
            </div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-slate-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    </div>
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-900">Esta orden no tiene historial</p>
                <p className="mt-1 text-sm text-slate-600">Cuando se registren avances o cambios, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it) => {
                  const isTech = (it.entrytype || "").toUpperCase() === "TECH";
                  const titleText = (it.title || (isTech ? "Avance" : "Evento")).trim() || (isTech ? "Avance" : "Evento");
                  const note = (it.note ?? "").trim();
                  const hasNote = note.length > 0;
                  const who = isTech ? techName(it) : "Sistema";

                  return (
                    <details key={it.ordersserviceshistoryid} className="rounded-xl border bg-white" open={false}>
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-3 py-3 hover:bg-slate-50">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${badgeByEntry(
                                it
                              )}`}
                            >
                              {iconByEntry(it)}
                              <span className="truncate">{isTech ? "Técnico" : "Sistema"}</span>
                            </span>

                            <span className="text-xs text-slate-500">{fmtDateTime(it.createdat)}</span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-medium text-slate-900">{titleText}</p>
                            <span className="text-xs text-slate-500">•</span>
                            <p className="text-xs text-slate-600">{who}</p>
                          </div>

                          {hasNote ? (
                            <p className="mt-1 line-clamp-1 text-sm text-slate-700">{note}</p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">Sin detalle.</p>
                          )}
                        </div>

                        <svg
                          className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform [details[open]_&]:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </summary>

                      <div className="border-t bg-slate-50 px-3 py-3">
                        <div className="rounded-xl border bg-white px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium text-slate-500">Detalle</p>
                            <p className="text-[11px] text-slate-500">ID #{it.ordersserviceshistoryid}</p>
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{hasNote ? note : "—"}</div>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Tip: usa <span className="font-medium text-slate-700">Esc</span> para cerrar.
              </p>
              <button
                onClick={onClose}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
