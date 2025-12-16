"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/shared/routes";
import type { AppointmentEvent } from "../types/typeAppointment";
import { getStatePalette } from "../types/typeAppointment";
import type { ServiceRequestDTO } from "@/features/dashboard/requests/services/servicerequests.service";
import Modal from "../../components/Modal";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const detailFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

const techLabel = (event: AppointmentEvent) => {
  const technicians = [
    ...(event.source === "order" ? event.order?.technicians ?? [] : []),
    ...(event.source === "request" ? event.request?.technicians ?? [] : []),
    ...(event.source === "request" ? event.request?.assignedTechnicians ?? [] : []),
    ...(event.source === "request" ? event.request?.serviceRequestTechnicians ?? [] : []),
    ...(event.source === "request" ? event.request?.requestTechnicians ?? [] : []),
    ...(event.source === "request"
      ? event.request?.techniciansMap?.map((link) => link?.technician) ?? []
      : []),
  ].filter(Boolean);

  const names = technicians
    .map((tech) =>
      [tech?.users?.name, tech?.users?.lastname].filter(Boolean).join(" ").trim()
    )
    .filter(Boolean);

  if (names.length) return names.join(", ");
  if (technicians.length) return "Técnicos asignados";
  return "Sin técnicos asignados";
};

const AppointmentDetailContent = ({
  event,
  onEditRequest,
  onFinalize,
  isFinalizing = false,
}: {
  event: AppointmentEvent;
  onEditRequest?: (request: ServiceRequestDTO) => void;
  onFinalize?: (event: AppointmentEvent) => void;
  isFinalizing?: boolean;
}) => {
  const palette = getStatePalette(event.stateLabel);

  const total = useMemo(() => {
    if (
      event.source === "order" &&
      typeof event.order?.total === "number" &&
      Number.isFinite(event.order.total)
    ) {
      return currencyFormatter.format(event.order.total);
    }

    if (
      event.source === "request" &&
      typeof event.request?.service?.price === "number"
    ) {
      return currencyFormatter.format(event.request.service.price);
    }

    return "Sin total definido";
  }, [event]);

  return (
    <div className="space-y-4 text-sm text-slate-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Cita seleccionada
          </p>
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {event.title}
          </h2>
          <p className="truncate text-sm text-slate-500">
            {event.clientLabel}
          </p>
        </div>

        <span
          className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: palette.background, color: palette.text }}
        >
          {event.stateLabel}
        </span>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-400">Tipo de evento</p>
        <p className="font-semibold text-slate-900">
          {event.source === "order"
            ? "Orden de servicio"
            : "Solicitud de servicio"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-slate-400">Inicio</p>
          <p className="font-semibold text-slate-900">
            {detailFormatter.format(event.start)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">Fin</p>
          <p className="font-semibold text-slate-900">
            {detailFormatter.format(event.end)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-400">Técnicos</p>
        <p className="font-semibold text-slate-900">{techLabel(event)}</p>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-400">Descripción</p>
        <p className="break-words">
          {(event.source === "order"
            ? event.order?.description
            : event.request?.description)?.trim() ||
            "Sin descripción adicional registrada."}
        </p>
      </div>

      {event.source === "request" && event.request?.direccion && (
        <div>
          <p className="text-xs uppercase text-slate-400">Dirección</p>
          <p className="font-semibold text-slate-900">
            {event.request.direccion}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-slate-400">
          {event.source === "order" ? "Total estimado" : "Precio estimado"}
        </p>
        <p className="font-semibold text-slate-900">{total}</p>
      </div>

      {event.source === "order" ? (
        <OrderActions orderId={event.order!.ordersservicesid} />
      ) : (
        event.request &&
        onEditRequest && (
          <RequestActions request={event.request} onEdit={onEditRequest} />
        )
      )}
      {onFinalize && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => onFinalize(event)}
            disabled={isFinalizing}
            className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-70"
          >
            {isFinalizing ? "Finalizando..." : "Finalizar cita"}
          </button>
        </div>
      )}
    </div>
  );
};

const OrderActions = ({ orderId }: { orderId: number }) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      <button
        onClick={() =>
          router.push(
            `${routes.dashboard.ordersServices}/edit?ordersservicesid=${orderId}`
          )
        }
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Editar
      </button>
      <button
        onClick={() => router.push(`${routes.dashboard.orders}/${orderId}`)}
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Ver detalle
      </button>
      <button
        onClick={() =>
          router.push(`${routes.dashboard.orders}/${orderId}?action=reprogram`)
        }
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Reprogramar
      </button>
      <button
        onClick={() =>
          router.push(`${routes.dashboard.orders}/${orderId}?action=cancel`)
        }
        className="rounded-lg border px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
      >
        Anular
      </button>
    </div>
  );
};

const RequestActions = ({
  request,
  onEdit,
}: {
  request: ServiceRequestDTO;
  onEdit: (request: ServiceRequestDTO) => void;
}) => {
  const router = useRouter();
  const base = routes.dashboard.requestsServices;

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      <button
        onClick={() => onEdit(request)}
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Editar
      </button>
      <button
        onClick={() => router.push(`${routes.dashboard.requestsServices}/${request.serviceRequestId}`)}
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Ver detalle
      </button>
      <button
        onClick={() =>
          router.push(`${base}?serviceRequestId=${request.serviceRequestId}&action=reprogram`)
        }
        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
      >
        Reprogramar
      </button>
      <button
        onClick={() =>
          router.push(`${base}?serviceRequestId=${request.serviceRequestId}&action=cancel`)
        }
        className="rounded-lg border px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
      >
        Anular
      </button>
    </div>
  );
};

const AppointmentDetailModal = ({
  open,
  event,
  onClose,
  onEditRequest,
  onFinalize,
  isFinalizing,
}: {
  open: boolean;
  event: AppointmentEvent | null;
  onClose: () => void;
  onEditRequest?: (request: ServiceRequestDTO) => void;
  onFinalize?: (event: AppointmentEvent) => void;
  isFinalizing?: boolean;
}) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Detalle de la cita"
      widthClass="md:max-w-3xl"
    >
      {event && (
        <AppointmentDetailContent
          event={event}
          onEditRequest={onEditRequest}
          onFinalize={onFinalize}
          isFinalizing={isFinalizing}
        />
      )}
    </Modal>
  );
};

export default AppointmentDetailModal;
