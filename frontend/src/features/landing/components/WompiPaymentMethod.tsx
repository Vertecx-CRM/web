"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CreditCard,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  readStoredWompiCheckout,
  submitWompiWebCheckout,
  type StoredWompiCheckout,
} from "@/shared/utils/wompiCheckout";

function formatCOP(value?: number | null) {
  const amount = Number(value ?? 0);
  return amount > 0
    ? `$${amount.toLocaleString("es-CO")}`
    : "$0";
}

function formatExpiration(value?: string) {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "No disponible";
  return date.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const PAYMENT_METHODS = [
  { label: "Nequi", icon: Smartphone },
  { label: "PSE", icon: Landmark },
  { label: "Bancolombia", icon: Building2 },
  { label: "Tarjetas", icon: CreditCard },
];

export default function WompiPaymentMethod() {
  const searchParams = useSearchParams();
  const [checkout, setCheckout] = useState<StoredWompiCheckout | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedSaleId = Number(searchParams.get("saleId") ?? 0);

  useEffect(() => {
    const stored = readStoredWompiCheckout();
    if (!stored) {
      setError(
        "No encontramos una sesion activa de pago. Vuelve a iniciar el checkout desde el carrito o desde ventas.",
      );
      return;
    }

    const storedSaleId = Number(stored.saleId ?? 0);
    if (
      Number.isFinite(requestedSaleId) &&
      requestedSaleId > 0 &&
      Number.isFinite(storedSaleId) &&
      storedSaleId > 0 &&
      storedSaleId !== requestedSaleId
    ) {
      setError(
        "La sesion de pago guardada no coincide con la venta solicitada. Intenta iniciar el pago nuevamente.",
      );
      return;
    }

    if (!stored.wompiSession?.publicKey || !stored.wompiSession?.reference) {
      setError(
        "La sesion de Wompi ya no esta disponible. Intenta generar el pago nuevamente.",
      );
      return;
    }

    setCheckout(stored);
    setError(null);
  }, [requestedSaleId]);

  const session = checkout?.wompiSession ?? null;
  const saleLabel = checkout?.saleCode
    ? checkout.saleCode
    : checkout?.saleId
      ? `#${checkout.saleId}`
      : "Pendiente";

  const totalAmount = useMemo(() => {
    const cents = Number(session?.amountInCents ?? 0);
    if (Number.isFinite(cents) && cents > 0) return cents / 100;
    return Number(checkout?.total ?? 0);
  }, [checkout?.total, session?.amountInCents]);

  const backHref =
    checkout?.returnUrl ||
    (checkout?.origin === "dashboard_sales"
      ? "/dashboard/sales"
      : "/landing/products");

  const handleContinue = () => {
    if (!session) {
      setError(
        "La sesion de Wompi no esta lista todavia. Intenta crear el pago nuevamente.",
      );
      return;
    }

    try {
      setRedirecting(true);
      submitWompiWebCheckout(session);
    } catch (err) {
      setRedirecting(false);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo abrir el checkout de Wompi.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff5f5_0%,_#ffffff_44%,_#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-2xl border border-red-100 bg-white px-4 py-2 shadow-sm transition hover:border-red-200 hover:bg-red-50/60"
          >
            <Image
              src="/assets/imgs/logo.png"
              alt="Vertecx"
              width={158}
              height={42}
              priority
            />
          </Link>

          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-red-100 bg-[linear-gradient(145deg,_#7f1d1d_0%,_#b91c1c_45%,_#ef4444_100%)] p-6 text-white shadow-[0_28px_80px_rgba(127,29,29,0.22)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.14),_transparent_32%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-red-50">
                <ShieldCheck className="h-4 w-4" />
                Pago Seguro
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                Paga con la identidad de Vertecx, finaliza con Wompi.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-red-50/90 sm:text-base">
                Esta pantalla conserva el estilo del proyecto y te resume el pedido
                antes de abrir la pasarela oficial de Wompi. El cobro final se hace
                en el checkout seguro externo.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-100/90">
                    Venta
                  </p>
                  <p className="mt-2 text-2xl font-black">{saleLabel}</p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-100/90">
                    Referencia
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold">
                    {session?.reference ?? checkout?.reference ?? "Pendiente"}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-100/90">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-black">{formatCOP(totalAmount)}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/15 bg-slate-950/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-red-50">
                    <LockKeyhole className="h-5 w-5" />
                    <p className="text-sm font-bold uppercase tracking-[0.18em]">
                      Que sigue
                    </p>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-red-50/90">
                    <p>
                      1. Revisa el resumen del pago y el vencimiento de la sesion.
                    </p>
                    <p>
                      2. Continúa al checkout oficial de Wompi para elegir tu medio
                      de pago.
                    </p>
                    <p>
                      3. Regresas a Vertecx para confirmar el resultado de la
                      transaccion.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/15 bg-slate-950/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-red-50">
                    <ReceiptText className="h-5 w-5" />
                    <p className="text-sm font-bold uppercase tracking-[0.18em]">
                      Sesion actual
                    </p>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-red-50/90">
                    <div className="flex items-center justify-between gap-3">
                      <span>Ambiente</span>
                      <span className="font-semibold">
                        {session?.wompiEnv === "production" ? "Produccion" : "Sandbox"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Moneda</span>
                      <span className="font-semibold">{session?.currency ?? "COP"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Expira</span>
                      <span className="text-right font-semibold">
                        {formatExpiration(session?.expirationTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-white bg-white/95 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-red-700">
                    Metodo de pago
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    Checkout oficial de Wompi
                  </h2>
                </div>
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Total a pagar
                  </p>
                  <p className="mt-1 text-2xl font-black text-red-800">
                    {formatCOP(totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 text-red-700 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">
                          Disponible segun tu configuracion Wompi
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold">Datos precargados para un checkout mas limpio</p>
                    <p className="mt-1 leading-relaxed">
                      Estamos enviando a Wompi el correo del cliente y, cuando existe,
                      tambien la informacion basica de entrega para que la experiencia
                      quede mas consistente con tu compra.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!session || redirecting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_#b91c1c_0%,_#7f1d1d_100%)] px-6 py-4 text-sm font-bold text-white shadow-[0_18px_34px_rgba(127,29,29,0.24)] transition hover:scale-[1.01] hover:shadow-[0_24px_42px_rgba(127,29,29,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {redirecting ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Abriendo checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Continuar a Wompi
                    </>
                  )}
                </button>

                <Link
                  href={backHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Ajustar pedido
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                La pantalla final de cobro pertenece a Wompi y mantiene sus propios
                componentes de seguridad. Aqui personalizamos la experiencia previa
                con el estilo de Vertecx.
              </p>
            </section>

            <section className="rounded-[32px] border border-white bg-white/95 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Resumen de la venta</p>
                  <p className="text-sm text-slate-500">
                    Cargos consolidados antes de abrir la pasarela
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Subtotal productos</span>
                  <span>{formatCOP(checkout?.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Envio</span>
                  <span>{formatCOP(checkout?.deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Asesoria tecnica previa</span>
                  <span>{formatCOP(checkout?.serviceVisitFeeTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>IVA</span>
                  <span>{formatCOP(checkout?.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                  <span>Total</span>
                  <span>{formatCOP(totalAmount)}</span>
                </div>
              </div>

              {(session?.customerData?.email || session?.shippingAddress?.city) && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Datos precargados
                  </p>
                  <div className="mt-3 space-y-2">
                    {session?.customerData?.email && (
                      <div className="flex items-center justify-between gap-3">
                        <span>Correo</span>
                        <span className="font-semibold text-slate-900">
                          {session.customerData.email}
                        </span>
                      </div>
                    )}
                    {session?.shippingAddress?.city && (
                      <div className="flex items-center justify-between gap-3">
                        <span>Ciudad</span>
                        <span className="font-semibold text-slate-900">
                          {session.shippingAddress.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
