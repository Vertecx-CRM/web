"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  ShieldAlert,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import Nav from "../layout/Nav";
import {
  getSaleCheckoutSummary,
  syncWompiTransactionForCheckout,
  type WompiTransactionSyncDTO,
} from "@/features/dashboard/sales/api/sales.api";
import { showError, showInfo } from "@/shared/utils/notifications";
import type { ISale } from "@/features/dashboard/sales/types/sales.type";

type CheckoutSnapshot = {
  saleId?: number;
  saleCode?: string;
  reference?: string;
  subtotal?: number;
  deliveryFee?: number;
  serviceVisitFeeTotal?: number;
  taxAmount?: number;
  total?: number;
};

type ViewState =
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string; payment: WompiTransactionSyncDTO | null }
  | { kind: "pending"; message: string; payment: WompiTransactionSyncDTO | null }
  | { kind: "failed"; message: string; payment: WompiTransactionSyncDTO | null };

const STATUS_STYLES = {
  loading: {
    icon: LoaderCircle,
    cardClass: "border-amber-100 bg-amber-50/70 text-amber-900",
    iconClass: "animate-spin text-amber-600",
    badgeClass: "bg-amber-100 text-amber-800",
    label: "Validando",
  },
  success: {
    icon: CheckCircle2,
    cardClass: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    iconClass: "text-emerald-600",
    badgeClass: "bg-emerald-100 text-emerald-800",
    label: "Pagada",
  },
  pending: {
    icon: Clock3,
    cardClass: "border-amber-100 bg-amber-50/70 text-amber-900",
    iconClass: "text-amber-600",
    badgeClass: "bg-amber-100 text-amber-800",
    label: "Pendiente",
  },
  failed: {
    icon: XCircle,
    cardClass: "border-red-100 bg-red-50/80 text-red-900",
    iconClass: "text-red-600",
    badgeClass: "bg-red-100 text-red-800",
    label: "No aprobada",
  },
} as const;

function readCheckoutSnapshot(): CheckoutSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("vertecx_checkout");
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutSnapshot;
  } catch {
    return null;
  }
}

function getFriendlyStatus(status: string) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "APPROVED") return "Pago aprobado";
  if (normalized === "PENDING") return "Pago pendiente";
  if (normalized === "DECLINED") return "Pago rechazado";
  if (normalized === "VOIDED") return "Pago anulado";
  if (normalized === "ERROR") return "Pago con error";
  return normalized || "Estado desconocido";
}

function parseMoneyFromNotes(notes: string | null | undefined, label: string) {
  const safeNotes = String(notes ?? "");
  const pattern = new RegExp(`${label}:\\s*\\$([\\d.,]+)`, "i");
  const match = pattern.exec(safeNotes);
  if (!match?.[1]) return 0;

  const numeric = Number(match[1].replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseAssessmentMoneyFromNotes(notes: string | null | undefined) {
  return (
    parseMoneyFromNotes(notes, "Asesorias tecnicas previas") ||
    parseMoneyFromNotes(notes, "Visitas tecnicas")
  );
}

function buildSnapshotFromSale(sale: ISale): CheckoutSnapshot {
  const subtotal = Number(sale?.subtotal ?? 0);
  const taxAmount = Number(sale?.taxamount ?? 0);
  const total = Number(sale?.totalamount ?? 0);
  const deliveryFee = parseMoneyFromNotes(sale?.notes, "Envio");
  const serviceVisitFeeTotal = parseAssessmentMoneyFromNotes(sale?.notes);

  return {
    saleId: Number(sale?.saleid ?? 0) || undefined,
    saleCode: String(sale?.salecode ?? "").trim() || undefined,
    subtotal,
    deliveryFee,
    serviceVisitFeeTotal,
    taxAmount,
    total,
  };
}

export default function RegisterPaymentMarket() {
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<CheckoutSnapshot | null>(null);
  const [view, setView] = useState<ViewState>({
    kind: "loading",
    message: "Estamos validando tu transaccion con Wompi.",
  });

  const saleId = Number(searchParams.get("saleId") ?? snapshot?.saleId ?? 0);
  const transactionId = String(
    searchParams.get("id") ?? searchParams.get("transactionId") ?? "",
  ).trim();
  const reference =
    String(searchParams.get("reference") ?? snapshot?.reference ?? "").trim() ||
    "Sin referencia";
  const paymentDetails = view.kind === "loading" ? null : view.payment;

  useEffect(() => {
    setSnapshot(readCheckoutSnapshot());
  }, []);

  useEffect(() => {
    if (!saleId) return;

    const hasMeaningfulSnapshot =
      Number(snapshot?.subtotal ?? 0) > 0 ||
      Number(snapshot?.deliveryFee ?? 0) > 0 ||
      Number(snapshot?.serviceVisitFeeTotal ?? 0) > 0 ||
      Number(snapshot?.taxAmount ?? 0) > 0 ||
      Number(snapshot?.total ?? 0) > 0;

    if (hasMeaningfulSnapshot) return;

    let cancelled = false;

    getSaleCheckoutSummary(saleId, reference)
      .then((sale) => {
        if (cancelled) return;
        setSnapshot((current) => ({
          ...buildSnapshotFromSale(sale),
          reference: current?.reference ?? reference,
        }));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("No se pudo reconstruir el resumen del checkout:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, saleId, snapshot?.deliveryFee, snapshot?.serviceVisitFeeTotal, snapshot?.subtotal, snapshot?.taxAmount, snapshot?.total]);

  useEffect(() => {
    if (!saleId) {
      setView({
        kind: "failed",
        message:
          "No pudimos identificar la venta asociada al pago. Revisa el enlace o vuelve al carrito.",
        payment: null,
      });
      return;
    }

    if (!transactionId) {
      setView({
        kind: "pending",
        message:
          "La venta quedo creada, pero todavia no recibimos el identificador de la transaccion. Si ya pagaste, espera unos segundos y recarga esta pagina.",
        payment: null,
      });
      return;
    }

    let cancelled = false;
    setView({
      kind: "loading",
      message: "Confirmando el estado de tu pago con Wompi.",
    });

    syncWompiTransactionForCheckout(transactionId, saleId, reference)
      .then((payment) => {
        if (cancelled) return;

        const status = String(payment?.transactionStatus ?? "").toUpperCase();

        if (status === "APPROVED") {
          localStorage.removeItem("vertecx_checkout");
          setView({
            kind: "success",
            message:
              "Tu pago fue aprobado y la venta quedo registrada correctamente.",
            payment,
          });
          return;
        }

        if (status === "PENDING") {
          showInfo(
            "Tu pago sigue pendiente. Puedes volver a esta pagina en un momento para revisar el estado.",
          );
          setView({
            kind: "pending",
            message:
              "La transaccion aun esta pendiente. Apenas Wompi la confirme, la venta quedara pagada.",
            payment,
          });
          return;
        }

        setView({
          kind: "failed",
          message:
            payment?.transactionStatusMessage ||
            "La transaccion no fue aprobada. La venta quedo pendiente de pago.",
          payment,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof Error && error.message
            ? error.message
            : "No pudimos validar el estado del pago.";
        showError(message);
        setView({
          kind: "failed",
          message,
          payment: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [saleId, transactionId]);

  const palette = STATUS_STYLES[view.kind];
  const Icon = palette.icon;
  const amountLabel = useMemo(() => {
    const cents = Number(paymentDetails?.amountInCents ?? 0);
    if (Number.isFinite(cents) && cents > 0) {
      return `$${(cents / 100).toLocaleString("es-CO")}`;
    }
    const total = Number(snapshot?.total ?? 0);
    return total > 0 ? `$${total.toLocaleString("es-CO")}` : "Pendiente";
  }, [paymentDetails?.amountInCents, snapshot?.total]);

  return (
    <>
      <Nav />

      <main className="min-h-[calc(100vh-96px)] bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.16),_transparent_38%),linear-gradient(180deg,_#fff_0%,_#fff7f7_100%)] px-4 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_55px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-700">
                  Estado del pago
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  Checkout con Wompi
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Aqui validamos la transaccion que abriste desde el carrito. Si
                  incluiste servicio, el cobro de la asesoria tecnica previa tambien quedo
                  sumado en este pago.
                </p>
              </div>

              <div className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                {reference}
              </div>
            </div>

            <div
              className={`mt-8 rounded-[24px] border p-6 shadow-sm ${palette.cardClass}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/80 p-3 shadow-sm">
                    <Icon className={`h-9 w-9 ${palette.iconClass}`} />
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${palette.badgeClass}`}
                    >
                      {palette.label}
                    </span>
                    <h2 className="mt-3 text-2xl font-black">
                      {view.kind === "success"
                        ? "Pago confirmado"
                        : view.kind === "pending"
                          ? "Pago en proceso"
                          : view.kind === "failed"
                            ? "Pago no confirmado"
                            : "Validando transaccion"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-90">
                      {view.message}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/70 px-5 py-4 text-right shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total cobrado
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {amountLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Moneda COP</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Venta
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  #{paymentDetails?.saleCode || saleId}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Metodo
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {paymentDetails?.paymentMethod || "Wompi"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Transaccion
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                  {transactionId || "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado Wompi
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {paymentDetails
                    ? getFriendlyStatus(paymentDetails.transactionStatus ?? "")
                    : "Validando"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/landing/products"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a productos
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <CreditCard className="h-4 w-4" />
                Ir al inicio
              </a>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-50 p-2 text-red-700">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Resumen del checkout
                  </p>
                  <p className="text-sm text-slate-500">
                    Lo que enviamos desde el carrito.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal productos</span>
                  <span>${Number(snapshot?.subtotal ?? 0).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Envio</span>
                  <span>${Number(snapshot?.deliveryFee ?? 0).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Asesoria tecnica previa</span>
                  <span>
                    ${Number(snapshot?.serviceVisitFeeTotal ?? 0).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>IVA</span>
                  <span>${Number(snapshot?.taxAmount ?? 0).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>${Number(snapshot?.total ?? 0).toLocaleString("es-CO")}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Metodos esperados
                  </p>
                  <p className="text-sm text-slate-500">
                    Segun tu configuracion activa en Wompi.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Nequi", "PSE", "Bancolombia"].map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {method}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                Si el pago queda pendiente o no aprobado, la venta permanece en
                estado pendiente hasta que Wompi confirme el resultado final.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
