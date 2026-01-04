"use client";

import { useMemo } from "react";
import type { AppointmentEvent } from "../types/typeAppointment";
import {
  getPermissionsFromTokenCookie,
  hasPermissionFromToken,
} from "../helpers/authToken.helpers";
import { normalizeStateKey } from "../helpers/appointmentState.helpers";

export const useAppointmentPermissions = (event?: AppointmentEvent | null) => {
  const permissions = useMemo(() => getPermissionsFromTokenCookie(), []);
  const hasAnyPermissions = permissions.length > 0;
  const canUpdateAppointment = hasPermissionFromToken(permissions, "appointments", "update");
  const canDeleteAppointment = hasPermissionFromToken(permissions, "appointments", "delete");

  const normalizedState =
    event && typeof event.stateLabel === "string" ? normalizeStateKey(event.stateLabel) : "";
  const isFinishedLabel = normalizedState === "finished";
  const isFinishedStateId = event
    ? [event.order?.state?.stateid, event.request?.state?.stateid].some(
        (value) => Number.isFinite(Number(value)) && Number(value) === 6
      )
    : false;
  const shouldHideFinalizeButton = isFinishedLabel || isFinishedStateId;

  const canEditOrder =
    Boolean(event && event.source === "order") &&
    !shouldHideFinalizeButton &&
    hasAnyPermissions &&
    canUpdateAppointment;
  const canReprogramOrder = canEditOrder;
  const canCancelOrder =
    Boolean(event && event.source === "order") &&
    !shouldHideFinalizeButton &&
    hasAnyPermissions &&
    canDeleteAppointment;

  const canEditRequest =
    Boolean(event && event.source === "request") &&
    !shouldHideFinalizeButton &&
    hasAnyPermissions &&
    canUpdateAppointment;
  const canReprogramRequest = canEditRequest;
  const canCancelRequest =
    Boolean(event && event.source === "request") &&
    !shouldHideFinalizeButton &&
    hasAnyPermissions &&
    canDeleteAppointment;

  const canFinalizeEvent = Boolean(event) && !shouldHideFinalizeButton && hasAnyPermissions && canUpdateAppointment;

  return {
    canEditOrder,
    canReprogramOrder,
    canCancelOrder,
    canEditRequest,
    canReprogramRequest,
    canCancelRequest,
    canFinalizeEvent,
  };
};
