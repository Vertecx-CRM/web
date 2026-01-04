"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/shared/routes";
import type { AppointmentEvent } from "../types/typeAppointment";
import { getStatePalette, normalizeStateKey } from "../types/typeAppointment";
import {
  getPermissionsFromTokenCookie,
  hasPermissionFromToken,
} from "../helpers/authToken.helpers";
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

const actionButtonClass =
  "rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";
const dangerButtonClass =
  "rounded-lg border px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-rose-100";

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
  const normalizedStateLabel = normalizeStateKey(event.stateLabel);
  const isFinishedLabel = normalizedStateLabel === "finished";
  const isFinishedStateId = [event.order?.state?.stateid, event.request?.state?.stateid].some(
    (value) => Number.isFinite(Number(value)) && Number(value) === 6
  );
  const shouldHideFinalizeButton = isFinishedLabel || isFinishedStateId;
  const permissions = useMemo(() => getPermissionsFromTokenCookie(), []);
  const hasAnyPermissions = permissions.length > 0;
  const canUpdateAppointment = hasPermissionFromToken(permissions, "appointments", "update");
  const canDeleteAppointment = hasPermissionFromToken(permissions, "appointments", "delete");
  const canEditOrder = !shouldHideFinalizeButton && hasAnyPermissions && canUpdateAppointment;
  const canReprogramOrder = canEditOrder;
  const canCancelOrder = !shouldHideFinalizeButton && hasAnyPermissions && canDeleteAppointment;
  const canEditRequest = !shouldHideFinalizeButton && hasAnyPermissions && canUpdateAppointment;
  const canReprogramRequest = canEditRequest;
  const canCancelRequest = !shouldHideFinalizeButton && hasAnyPermissions && canDeleteAppointment;
  const canFinalizeEvent =
    !shouldHideFinalizeButton && hasAnyPermissions && canUpdateAppointment;

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
        <OrderActions
          orderId={event.order!.ordersservicesid}
          canEdit={canEditOrder}
          canReprogram={canReprogramOrder}
          canCancel={canCancelOrder}
        />
      ) : (
        event.request &&
        onEditRequest && (
          <RequestActions
            request={event.request}
            onEdit={onEditRequest}
            canEdit={canEditRequest}
            canReprogram={canReprogramRequest}
            canCancel={canCancelRequest}
          />
        )
      )}
      {onFinalize && canFinalizeEvent && (
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

const OrderActions = ({
  orderId,
  canEdit = false,
  canReprogram = false,
  canCancel = false,
}: {
  orderId: number;
  canEdit?: boolean;
  canReprogram?: boolean;
  canCancel?: boolean;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {canEdit && (
        <button
          onClick={() =>
            router.push(
              `${routes.dashboard.ordersServices}/edit?ordersservicesid=${orderId}`
            )
          }
          className={actionButtonClass}
        >
          Editar
        </button>
      )}
      <button
        onClick={() => router.push(`${routes.dashboard.orders}/${orderId}`)}
        className={actionButtonClass}
      >
        Ver detalle
      </button>
      {canReprogram && (
        <button
          onClick={() =>
            router.push(`${routes.dashboard.orders}/${orderId}?action=reprogram`)
          }
          className={actionButtonClass}
        >
          Reprogramar
        </button>
      )}
      {canCancel && (
        <button
          onClick={() =>
            router.push(`${routes.dashboard.orders}/${orderId}?action=cancel`)
          }
          className={dangerButtonClass}
        >
          Anular
        </button>
      )}
    </div>
  );
};

const RequestActions = ({
  request,
  onEdit,
  canEdit = false,
  canReprogram = false,
  canCancel = false,
}: {
  request: ServiceRequestDTO;
  onEdit: (request: ServiceRequestDTO) => void;
  canEdit?: boolean;
  canReprogram?: boolean;
  canCancel?: boolean;
}) => {
  const router = useRouter();
  const base = routes.dashboard.requestsServices;

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {canEdit && (
        <button
          onClick={() => onEdit(request)}
          className={actionButtonClass}
        >
          Editar
        </button>
      )}
      <button
        onClick={() => router.push(`${routes.dashboard.requestsServices}/${request.serviceRequestId}`)}
        className={actionButtonClass}
      >
        Ver detalle
      </button>
      {canReprogram && (
        <button
          onClick={() =>
            router.push(`${base}?serviceRequestId=${request.serviceRequestId}&action=reprogram`)
          }
          className={actionButtonClass}
        >
          Reprogramar
        </button>
      )}
      {canCancel && (
        <button
          onClick={() =>
            router.push(`${base}?serviceRequestId=${request.serviceRequestId}&action=cancel`)
          }
          className={dangerButtonClass}
        >
          Anular
        </button>
      )}
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
