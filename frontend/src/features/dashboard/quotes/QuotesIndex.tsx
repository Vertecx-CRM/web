"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";

import RequireAuth from "../../auth/requireauth";
import Modal from "../components/Modal";
import { DataTable } from "../components/datatable/DataTable";
import { Column } from "../components/datatable/types/column.types";
import Colors from "@/shared/theme/colors";
import { useAuth } from "@/features/auth/authcontext";

import ViewQuote from "./components/ViewQuote";
import {
  acceptQuote,
  approveQuote,
  cancelQuote,
  completeQuote,
  getQuotes,
  revokeQuote,
} from "./api/quotes.api";
import { QuoteTableRow as BaseQuoteTableRow } from "./types/Quote.type";

type QuoteTableRow = BaseQuoteTableRow & {
  clientAccepted: boolean;
  clientAcceptedLabel: string;
  orderId: number | null;
  orderState: string;
};

type QuoteStatusConfig = {
  label: string;
  className: string;
  style?: React.CSSProperties;
};

const normalizeRoleName = (role?: string | null) =>
  String(role ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeText = (value?: string | null) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toPositiveInteger = (value: any): number | null => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const integer = Math.trunc(numeric);
  return integer > 0 ? integer : null;
};

const getQuoteStateName = (quote?: any) =>
  String(quote?.state?.name ?? quote?.status ?? "").trim();

const getQuoteOrderServiceId = (quote?: any): number | null => {
  if (!quote) return null;
  const candidates = [
    quote.ordersservices?.ordersservicesid,
    quote.ordersservices?.id,
    quote.ordersservicesid,
    quote.ordersservicesId,
    quote.order?.ordersservicesid,
    quote.order?.id,
  ];
  for (const candidate of candidates) {
    const id = toPositiveInteger(candidate);
    if (id) return id;
  }
  return null;
};

const getQuoteServiceRequestId = (quote?: any): number | null => {
  if (!quote) return null;
  const candidates = [
    quote.serviceRequest?.serviceRequestId,
    quote.serviceRequest?.id,
    quote.serviceRequestId,
    quote.servicerequestid,
    quote.servicerequestId,
  ];
  for (const candidate of candidates) {
    const id = toPositiveInteger(candidate);
    if (id) return id;
  }
  return null;
};

const isPendingLike = (value?: string | null) => {
  const normalized = normalizeText(value);
  return normalized.includes("pend");
};

const isApprovedLike = (value?: string | null) => {
  const normalized = normalizeText(value);
  return normalized.includes("aprob") || normalized.includes("approved");
};

const isCompletedLike = (value?: string | null) => {
  const normalized = normalizeText(value);
  return (
    normalized.includes("finish") ||
    normalized.includes("finaliz") ||
    normalized.includes("complet")
  );
};

const isCanceledLike = (value?: string | null) => {
  const normalized = normalizeText(value);
  return (
    normalized.includes("cancel") ||
    normalized.includes("anul") ||
    normalized.includes("revoke")
  );
};

const isFinishedLike = (value?: string | null) => {
  const normalized = normalizeText(value);
  return normalized.includes("finish") || normalized.includes("finaliz");
};

const normalizeQuoteStatus = (status?: string): QuoteStatusConfig => {
  if (!status) return { label: "-", className: "text-slate-500" };

  if (isPendingLike(status)) {
    return {
      label: "Pendiente",
      className: "",
      style: { color: Colors.states.pending },
    };
  }

  if (isApprovedLike(status)) {
    return {
      label: "Aprobada",
      className: "",
      style: { color: Colors.states.success },
    };
  }

  if (isCompletedLike(status)) {
    return {
      label: "Completada",
      className: "",
      style: { color: Colors.states.completed },
    };
  }

  if (isCanceledLike(status)) {
    return { label: "Cancelada", className: "text-gray-600" };
  }

  return { label: status, className: "text-slate-500" };
};

const canClientAcceptQuote = (quote?: any) => {
  const status = getQuoteStateName(quote);
  return (
    !Boolean(quote?.clientAccepted) &&
    isPendingLike(status) &&
    !isCanceledLike(status) &&
    !isCompletedLike(status)
  );
};

const canCreateOrderFromQuote = (quote?: any) => {
  const status = getQuoteStateName(quote);
  return (
    Boolean(quote?.clientAccepted) &&
    isApprovedLike(status) &&
    !getQuoteOrderServiceId(quote) &&
    !isCanceledLike(status) &&
    !isCompletedLike(status)
  );
};

const canManuallyCompleteQuote = (quote?: any) => {
  const status = getQuoteStateName(quote);
  const orderState = String(quote?.ordersservices?.state?.name ?? "").trim();
  return (
    isApprovedLike(status) &&
    !isCompletedLike(status) &&
    !isCanceledLike(status) &&
    Boolean(getQuoteOrderServiceId(quote)) &&
    isFinishedLike(orderState)
  );
};

function ActionPill({
  title,
  onClick,
  tone = "default",
}: {
  title: string;
  onClick: () => void;
  tone?: "default" | "success";
}) {
  const classes =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${classes}`}
      title={title}
    >
      {title}
    </button>
  );
}

export default function QuotesIndex() {
  const router = useRouter();
  const { user } = useAuth();

  const [quotesData, setQuotesData] = useState<QuoteTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isCompletingQuote, setCompletingQuote] = useState(false);

  const isClient = useMemo(
    () => normalizeRoleName(user?.rolename) === "cliente",
    [user?.rolename]
  );

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuotes();
      const mapped: QuoteTableRow[] = (data ?? []).map((quote: any) => {
        const rawStatus = getQuoteStateName(quote);
        const clientName = `${quote.customer?.users?.name ?? ""} ${quote.customer?.users?.lastname ?? ""}`.trim();
        const techName = `${quote.technician?.users?.name ?? ""} ${quote.technician?.users?.lastname ?? ""}`.trim();
        const orderId = getQuoteOrderServiceId(quote);
        const clientAccepted = Boolean(quote?.clientAccepted);

        return {
          id: Number(quote?.quotesid ?? 0),
          client: clientName || "-",
          technician: techName || "-",
          status: rawStatus,
          statusSearch: normalizeText(rawStatus),
          creationDate: String(quote?.createdat ?? ""),
          amount: Number(quote?.total ?? 0),
          clientAccepted,
          clientAcceptedLabel: clientAccepted ? "Aceptada" : "Pendiente",
          orderId,
          orderState: String(quote?.ordersservices?.state?.name ?? "").trim(),
          raw: quote,
        };
      });

      setQuotesData(mapped);
      setSelectedQuote((current: any) => {
        if (!current) return current;
        const selectedId = Number(current?.quotesid ?? 0);
        return mapped.find((row) => row.id === selectedId)?.raw ?? current;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const columns: Column<QuoteTableRow>[] = [
    { key: "id", header: "ID" },
    { key: "client", header: "Cliente" },
    { key: "technician", header: "Tecnico" },
    {
      key: "creationDate",
      header: "Fecha",
      render: (row) => {
        const created = row.creationDate ? new Date(row.creationDate) : null;
        return created && !Number.isNaN(created.getTime())
          ? created.toLocaleDateString("es-CO")
          : "-";
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => {
        const config = normalizeQuoteStatus(row.status);
        return (
          <span className={config.className} style={config.style}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "clientAcceptedLabel",
      header: "Cliente",
      render: (row) => (
        <span className={row.clientAccepted ? "text-emerald-700" : "text-amber-700"}>
          {row.clientAcceptedLabel}
        </span>
      ),
    },
    {
      key: "orderId",
      header: "Orden",
      render: (row) => (row.orderId ? `#${row.orderId}` : "-"),
    },
    {
      key: "amount",
      header: "Total",
      render: (row) =>
        Number(row.amount ?? 0).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }),
    },
  ];

  const handleApproveQuote = async (row: QuoteTableRow) => {
    if (!row.clientAccepted) {
      await Swal.fire(
        "Esperando cliente",
        "El cliente debe aceptar la cotizacion antes de que el admin la apruebe.",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Aprobar cotizacion",
      text: "La cotizacion quedara lista para crear la orden de servicio.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    try {
      await approveQuote(row.id);
      await fetchQuotes();
      await Swal.fire(
        "Cotizacion aprobada",
        "Ahora puedes crear la orden de servicio con los materiales cotizados.",
        "success"
      );
    } catch (error: any) {
      console.error("Error al aprobar la cotizacion:", error);
      await Swal.fire(
        "Error",
        error?.response?.data?.message ?? error?.message ?? "No se pudo aprobar la cotizacion.",
        "error"
      );
    }
  };

  const handleAcceptQuote = async (row: QuoteTableRow) => {
    const result = await Swal.fire({
      title: "Aceptar cotizacion",
      text: "Le avisaremos al administrador para que continue con la orden de servicio despues de validar esta cotizacion.",
      input: "textarea",
      inputLabel: "Observacion opcional",
      inputPlaceholder: "Ej: Pueden continuar con la instalacion con esta cotizacion",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Volver",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    try {
      await acceptQuote(row.id, result.value);
      await fetchQuotes();
      await Swal.fire(
        "Cotizacion aceptada",
        "Tu respuesta fue registrada correctamente.",
        "success"
      );
    } catch (error: any) {
      console.error("Error al aceptar la cotizacion:", error);
      await Swal.fire(
        "Error",
        error?.response?.data?.message ?? error?.message ?? "No se pudo aceptar la cotizacion.",
        "error"
      );
    }
  };

  const handleCancelQuote = async (row: QuoteTableRow) => {
    const result = await Swal.fire({
      title: "Cancelar cotizacion",
      text: "La cotizacion quedara marcada como cancelada por el cliente.",
      input: "textarea",
      inputLabel: "Motivo opcional",
      inputPlaceholder: "Ej: Ya no deseo continuar con la instalacion",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancelar cotizacion",
      cancelButtonText: "Volver",
      confirmButtonColor: "#b91c1c",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelQuote(row.id, result.value);
      await fetchQuotes();
      await Swal.fire("Cancelada", "La cotizacion fue cancelada.", "success");
    } catch (error: any) {
      console.error("Error al cancelar la cotizacion:", error);
      await Swal.fire(
        "Error",
        error?.response?.data?.message ?? error?.message ?? "No se pudo cancelar la cotizacion.",
        "error"
      );
    }
  };

  const handleRevokeQuote = async (row: QuoteTableRow) => {
    if (!isApprovedLike(row.status)) {
      await Swal.fire(
        "Accion no permitida",
        "Solo se pueden anular cotizaciones que ya esten aprobadas.",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Anular cotizacion",
      input: "textarea",
      inputLabel: "Observacion opcional",
      inputPlaceholder: "Motivo de la anulacion",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b20000",
    });

    if (!result.isConfirmed) return;

    try {
      await revokeQuote(row.id, result.value);
      await fetchQuotes();
      await Swal.fire(
        "Cotizacion anulada",
        "La cotizacion fue anulada correctamente.",
        "success"
      );
    } catch (error: any) {
      console.error("Error al anular la cotizacion:", error);
      await Swal.fire(
        "Error",
        error?.response?.data?.message ?? error?.message ?? "No se pudo anular la cotizacion.",
        "error"
      );
    }
  };

  const goToCreateOrder = useCallback(
    (quote: any) => {
      const quoteId = Number(quote?.quotesid ?? quote?.id ?? 0);
      if (!Number.isFinite(quoteId) || quoteId <= 0) return;
      router.push(
        `/dashboard/orders-services/new?quotesId=${quoteId}&returnTo=${encodeURIComponent(
          "/dashboard/quotes"
        )}`
      );
    },
    [router]
  );

  const handleCompleteQuote = useCallback(async () => {
    if (!selectedQuote) return;

    const quoteId = Number(selectedQuote?.quotesid ?? 0);
    if (!quoteId) {
      await Swal.fire("Error", "ID de cotizacion invalido.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Generar venta desde la cotizacion",
      text: "Usa esta opcion solo si la orden ya fue finalizada y la venta aun no se ha creado.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Generar venta",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setCompletingQuote(true);
      const completionResult = await completeQuote(quoteId);
      await fetchQuotes();
      setDetailModalOpen(false);
      setSelectedQuote(null);

      await Swal.fire(
        "Venta generada",
        completionResult?.sale
          ? `Se genero la venta ${completionResult.sale.salecode ?? completionResult.sale.saleid}.`
          : "La cotizacion se completo y la venta quedo creada.",
        "success"
      );
    } catch (error: any) {
      console.error("Error al completar la cotizacion:", error);
      await Swal.fire(
        "Error",
        error?.response?.data?.message ?? error?.message ?? "No se pudo completar la cotizacion.",
        "error"
      );
    } finally {
      setCompletingQuote(false);
    }
  }, [fetchQuotes, selectedQuote]);

  const selectedQuoteState = getQuoteStateName(selectedQuote);
  const selectedQuoteCompleted = isCompletedLike(selectedQuoteState);
  const selectedQuoteOrderId = getQuoteOrderServiceId(selectedQuote);
  const selectedQuoteOrderState = String(selectedQuote?.ordersservices?.state?.name ?? "").trim();
  const selectedQuoteCanCreateOrder = !isClient && canCreateOrderFromQuote(selectedQuote);
  const selectedQuoteCanComplete =
    !isClient &&
    !selectedQuoteCompleted &&
    Boolean(selectedQuoteOrderId) &&
    isFinishedLike(selectedQuoteOrderState) &&
    canManuallyCompleteQuote(selectedQuote);

  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />

        <h1 className="mb-4 text-xl font-semibold">Listado de Cotizaciones</h1>

        <DataTable<QuoteTableRow>
          module="quotes"
          data={quotesData}
          columns={columns}
          loading={loading}
          searchableKeys={[
            "id",
            "client",
            "technician",
            "statusSearch",
            "clientAcceptedLabel",
            "orderState",
            "amount",
            "creationDate",
          ]}
          pageSize={8}
          onView={(row) => {
            setSelectedQuote(row.raw);
            setDetailModalOpen(true);
          }}
          onCreate={isClient ? undefined : () => router.push("/dashboard/quotes/register")}
          createButtonText="Crear Cotizacion"
          onCancel={isClient ? handleCancelQuote : undefined}
          renderExtraActions={(row) => {
            const actions: React.ReactNode[] = [];

            if (isClient && canClientAcceptQuote(row.raw)) {
              actions.push(
                <ActionPill
                  key={`accept-${row.id}`}
                  title="Aceptar"
                  tone="success"
                  onClick={() => handleAcceptQuote(row)}
                />
              );
            }

            if (
              !isClient &&
              row.clientAccepted &&
              isPendingLike(row.status) &&
              !isCanceledLike(row.status) &&
              !isCompletedLike(row.status)
            ) {
              actions.push(
                <ActionPill
                  key={`approve-${row.id}`}
                  title="Aprobar"
                  tone="success"
                  onClick={() => handleApproveQuote(row)}
                />
              );
            }

            if (!isClient && canCreateOrderFromQuote(row.raw)) {
              actions.push(
                <ActionPill
                  key={`order-${row.id}`}
                  title="Crear orden"
                  onClick={() => goToCreateOrder(row.raw)}
                />
              );
            }

            if (
              !isClient &&
              isApprovedLike(row.status) &&
              !isCanceledLike(row.status) &&
              !isCompletedLike(row.status)
            ) {
              actions.push(
                <ActionPill
                  key={`revoke-${row.id}`}
                  title="Anular"
                  onClick={() => handleRevokeQuote(row)}
                />
              );
            }

            if (!actions.length) return null;
            return <>{actions}</>;
          }}
          rightActions={
            isClient ? undefined : (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#b20000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#910000]"
                onClick={() =>
                  Swal.fire("Pendiente", "Conecta aqui la descarga del reporte.", "info")
                }
              >
                <Image src="/icons/download.svg" alt="Descargar" width={16} height={16} />
                Descargar Reporte
              </button>
            )
          }
        />

        <Modal
          title="Detalle de Cotizacion"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={null}
        >
          {selectedQuote && (
            <ViewQuote
              quote={selectedQuote}
              canCreateOrder={selectedQuoteCanCreateOrder}
              onCreateOrder={() => goToCreateOrder(selectedQuote)}
              canComplete={selectedQuoteCanComplete}
              isCompleting={isCompletingQuote}
              onComplete={handleCompleteQuote}
            />
          )}
        </Modal>
      </div>
    </RequireAuth>
  );
}
