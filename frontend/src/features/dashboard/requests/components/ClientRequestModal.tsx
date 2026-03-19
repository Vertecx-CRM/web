"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import type { Option } from "@/features/dashboard/requests/types/option.types";
import { showError, showInfo } from "@/shared/utils/notifications";
import {
  ensureServiceOption,
  getServiceOptions,
} from "@/features/dashboard/requests/services/lookups.service";
import {
  formatRequestAvailabilityLabel,
  normalizeRequestAvailabilityOptions,
  type RequestAvailabilityOption,
} from "@/features/dashboard/requests/utils/requestAvailability";
import {
  getInstallationAssessmentExplainer,
  getRequestStageLabel,
  isInstallationServiceType,
} from "@/shared/utils/requestFlow";

export type CreateRequestPayload = {
  scheduledAt?: string | null;
  scheduledEndAt?: string | null;
  serviceType: string;
  description: string;
  direccion: string;
  stateId?: number;
  serviceId: number;
  clientId: number;
  availabilityOptions?: RequestAvailabilityOption[];
};

type ServiceOption = Option & {
  typeofserviceid?: number | null;
  typeofservicename?: string | null;
  serviceTypeCode?: string | null;
};

type ServiceTypeOption = {
  id: number;
  label: string;
  code: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequestPayload) => void | Promise<void>;
  title?: string;
  submitLabel?: string;
  servicios?: ServiceOption[] | null;
  clientId: number;
  clientLabel?: string;
  initialServiceId?: number | null;
  initialDireccion?: string | null;
  pendingStateId?: number | null;
  scheduledStateId?: number | null;
  initial?: Partial<CreateRequestPayload> | null;
};

type ErrorKey =
  | "tipo"
  | "serviceId"
  | "customServiceName"
  | "description"
  | "direccion"
  | "availabilityOptions";
type Errors = Partial<Record<ErrorKey, string | null>>;
type Touched = Partial<Record<ErrorKey, boolean>>;

const SCHEDULE_MIN = 7 * 60;
const SCHEDULE_MAX = 17 * 60;

function getBackendMessage(err: unknown) {
  const anyErr = err as any;
  const msg = anyErr?.response?.data?.message ?? anyErr?.message ?? "";
  if (Array.isArray(msg)) return msg.filter(Boolean).join(" | ");
  return String(msg || "");
}

function timeToMinutes(value: string) {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
}

function isAllowedSchedule(value: string) {
  const minutes = timeToMinutes(value);
  return Number.isFinite(minutes) && minutes >= SCHEDULE_MIN && minutes <= SCHEDULE_MAX;
}

function validateAvailabilityDraft(
  date: string,
  startTime: string,
  endTime: string
) {
  if (!String(date || "").trim()) return "Selecciona la fecha disponible.";
  if (!String(startTime || "").trim()) return "Selecciona la hora inicial disponible.";
  if (!String(endTime || "").trim()) return "Selecciona la hora final disponible.";
  if (!isAllowedSchedule(startTime) || !isAllowedSchedule(endTime)) {
    return "Horario permitido: 07:00-17:00.";
  }
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return "La hora final debe ser mayor que la inicial.";
  }
  return null;
}

export default function ClientCreateRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Solicitar servicio",
  submitLabel = "Guardar",
  servicios,
  clientId,
  clientLabel,
  initialServiceId = null,
  initialDireccion,
  pendingStateId = null,
  scheduledStateId = null,
  initial = null,
}: Props) {
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [customServiceMode, setCustomServiceMode] = useState(false);
  const [customServiceName, setCustomServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [direccion, setDireccion] = useState("");
  const [availabilityOptions, setAvailabilityOptions] = useState<RequestAvailabilityOption[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityStartTime, setAvailabilityStartTime] = useState("");
  const [availabilityEndTime, setAvailabilityEndTime] = useState("");

  const [touched, setTouched] = useState<Touched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [serviciosLocal, setServiciosLocal] = useState<ServiceOption[]>([]);

  const finalServicios = useMemo<ServiceOption[]>(() => {
    const fromProps = (Array.isArray(servicios) ? servicios : []) as ServiceOption[];
    return fromProps.length ? fromProps : serviciosLocal;
  }, [servicios, serviciosLocal]);

  const serviceTypes = useMemo<ServiceTypeOption[]>(() => {
    const map = new Map<number, ServiceTypeOption>();

    finalServicios.forEach((service) => {
      const typeId = service.typeofserviceid;
      const typeName = service.typeofservicename;
      if (!typeId || !typeName || map.has(typeId)) return;

      let code = String(service.serviceTypeCode || "").trim();
      if (!code) {
        const normalized = typeName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (normalized.startsWith("mantenimiento")) code = "MANTENIMIENTO";
        else if (normalized.startsWith("instal")) code = "INSTALACION";
        else code = typeName;
      }

      map.set(typeId, { id: typeId, label: typeName, code });
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [finalServicios]);

  const selectedType = useMemo(
    () => (serviceTypeId ? serviceTypes.find((item) => item.id === serviceTypeId) || null : null),
    [serviceTypeId, serviceTypes]
  );
  const effectiveServiceType = selectedType?.code ?? initial?.serviceType ?? "";
  const isInstallationFlow = isInstallationServiceType(effectiveServiceType);
  const requestStageLabel = getRequestStageLabel(effectiveServiceType);

  const filteredServicios = useMemo<ServiceOption[]>(() => {
    if (!serviceTypeId) return finalServicios;
    const hasTypeInfo = finalServicios.some((item) => item.typeofserviceid != null);
    if (!hasTypeInfo) return finalServicios;
    return finalServicios.filter((item) => item.typeofserviceid === serviceTypeId);
  }, [finalServicios, serviceTypeId]);

  function validateDireccion(value: string) {
    const text = String(value ?? "").trim();
    if (text.length < 3) return "Minimo 3 caracteres.";
    if (text.length > 255) return "Maximo 255 caracteres.";
    return null;
  }

  function validateDescription(value: string) {
    return String(value ?? "").trim().length >= 3 ? null : "Minimo 3 caracteres.";
  }

  function validateServiceId(
    value: number | "",
    customName: string,
    isCustomMode: boolean
  ) {
    if (isCustomMode && customName.trim().length >= 3) return null;
    return value !== "" ? null : "Selecciona un servicio.";
  }

  function validateCustomServiceName(value: string, isCustomMode: boolean) {
    if (!isCustomMode) return null;
    const text = String(value ?? "").trim();
    if (text.length < 3) return "Escribe al menos 3 caracteres.";
    if (text.length > 120) return "Maximo 120 caracteres.";
    return null;
  }

  function validateTipo(value: number | null) {
    return value ? null : "Selecciona un tipo.";
  }

  function validateAvailabilityOptions(value: RequestAvailabilityOption[]) {
    return value.length ? null : "Agrega al menos una opcion de disponibilidad.";
  }

  const errors: Errors = useMemo(() => {
    const next: Errors = {};
    next.tipo = validateTipo(serviceTypeId);
    next.serviceId = validateServiceId(serviceId, customServiceName, customServiceMode);
    next.customServiceName = validateCustomServiceName(
      customServiceName,
      customServiceMode
    );
    next.description = validateDescription(description);
    next.direccion = validateDireccion(direccion);
    next.availabilityOptions = validateAvailabilityOptions(availabilityOptions);
    return next;
  }, [
    serviceTypeId,
    serviceId,
    customServiceName,
    customServiceMode,
    description,
    direccion,
    availabilityOptions,
  ]);

  function markTouched(key: ErrorKey) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function shouldShowError(key: ErrorKey) {
    return !!submitAttempted || !!touched[key];
  }

  function resetDraftAvailability() {
    setAvailabilityDate("");
    setAvailabilityStartTime("");
    setAvailabilityEndTime("");
  }

  function resetForm() {
    setServiceTypeId(null);
    setServiceId("");
    setCustomServiceMode(false);
    setCustomServiceName("");
    setDescription("");
    setDireccion(initialDireccion ?? "");
    setAvailabilityOptions([]);
    resetDraftAvailability();
    setTouched({});
    setSubmitAttempted(false);
  }

  function addAvailabilityOption() {
    markTouched("availabilityOptions");
    const draftError = validateAvailabilityDraft(
      availabilityDate,
      availabilityStartTime,
      availabilityEndTime
    );
    if (draftError) {
      showInfo(draftError);
      return;
    }

    setAvailabilityOptions((prev) =>
      normalizeRequestAvailabilityOptions([
        ...prev,
        {
          date: availabilityDate,
          startTime: availabilityStartTime,
          endTime: availabilityEndTime,
        },
      ])
    );
    resetDraftAvailability();
  }

  function removeAvailabilityOption(index: number) {
    markTouched("availabilityOptions");
    setAvailabilityOptions((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  useEffect(() => {
    if (!isOpen) return;
    setTouched({});
    setSubmitAttempted(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(servicios) && servicios.length) return;

    let cancel = false;

    (async () => {
      try {
        setLoadingLookups(true);
        const opts = await getServiceOptions();
        if (cancel) return;
        setServiciosLocal(Array.isArray(opts) ? (opts as ServiceOption[]) : []);
      } catch {
        if (cancel) return;
        setServiciosLocal([]);
      } finally {
        if (cancel) return;
        setLoadingLookups(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [isOpen, servicios]);

  useEffect(() => {
    if (!isOpen) return;

    const initialAvailability = normalizeRequestAvailabilityOptions(
      initial?.availabilityOptions
    );
    const initialService =
      Number(initial?.serviceId ?? initialServiceId ?? 0) > 0
        ? Number(initial?.serviceId ?? initialServiceId ?? 0)
        : "";

    setServiceId(initialService);
    setCustomServiceMode(false);
    setCustomServiceName("");
    setDescription(String(initial?.description ?? "").trim());
    setDireccion(String(initial?.direccion ?? initialDireccion ?? ""));
    setAvailabilityOptions(initialAvailability);
    resetDraftAvailability();
    setTouched({});
    setSubmitAttempted(false);
  }, [isOpen, initial, initialDireccion, initialServiceId]);

  useEffect(() => {
    if (!isOpen || !finalServicios.length) return;

    const desiredServiceId =
      Number(initial?.serviceId ?? initialServiceId ?? serviceId ?? 0) > 0
        ? Number(initial?.serviceId ?? initialServiceId ?? serviceId ?? 0)
        : null;

    if (desiredServiceId) {
      const found = finalServicios.find((item) => Number(item.id) === desiredServiceId);
      if (found) {
        const resolvedTypeId = Number(found.typeofserviceid);
        if (Number.isFinite(resolvedTypeId) && resolvedTypeId > 0) {
          setServiceTypeId(resolvedTypeId);
          return;
        }
      }
    }

    if (!serviceTypeId && serviceTypes.length) {
      setServiceTypeId(serviceTypes[0].id);
    }
  }, [isOpen, finalServicios, initial, initialServiceId, serviceId, serviceTypeId, serviceTypes]);

  useEffect(() => {
    if (!serviceTypeId) {
      setServiceId("");
      return;
    }

    if (customServiceMode || serviceId === "") return;

    if (!filteredServicios.some((item) => Number(item.id) === Number(serviceId))) {
      setServiceId("");
    }
  }, [serviceTypeId, customServiceMode, serviceId, filteredServicios]);

  async function submit() {
    setSubmitAttempted(true);

    const errKeys = Object.keys(errors) as ErrorKey[];
    const firstError = errKeys.find((key) => !!errors[key]);
    if (firstError) {
      showInfo("Revisa los campos marcados.");
      return;
    }

    if (!selectedType) {
      showInfo("Selecciona un tipo de servicio.");
      return;
    }

    let resolvedServiceId = Number(serviceId);

    if (customServiceMode) {
      const customError = validateCustomServiceName(customServiceName, true);
      if (customError) {
        showInfo("Escribe un servicio especifico valido.");
        return;
      }

      const ensuredService = await ensureServiceOption({
        name: customServiceName,
        typeofserviceid: selectedType.id,
        description,
      });

      resolvedServiceId = Number(ensuredService.id);
      setServiciosLocal((prev) => {
        const exists = prev.some((item) => Number(item.id) === Number(ensuredService.id));
        if (exists) return prev;
        return [...prev, ensuredService];
      });
      setServiceId(resolvedServiceId);
    }

    if (!Number.isFinite(resolvedServiceId) || resolvedServiceId <= 0) {
      showInfo("Selecciona un servicio valido.");
      return;
    }

    try {
      setSaving(true);

      const basePayload: CreateRequestPayload = {
        scheduledAt: null,
        scheduledEndAt: null,
        serviceType: selectedType.code,
        description: String(description || "").trim(),
        direccion: String(direccion || "").trim(),
        stateId: 0,
        serviceId: resolvedServiceId,
        clientId,
        availabilityOptions: availabilityOptions,
      };

      const hasProgrammedDate =
        (basePayload.scheduledAt && String(basePayload.scheduledAt).trim()) ||
        (basePayload.scheduledEndAt && String(basePayload.scheduledEndAt).trim());

      const stateIdToSend =
        (hasProgrammedDate &&
          scheduledStateId &&
          Number.isFinite(scheduledStateId) &&
          scheduledStateId > 0 &&
          scheduledStateId) ||
        (pendingStateId &&
          Number.isFinite(pendingStateId) &&
          pendingStateId > 0 &&
          pendingStateId) ||
        5;

      await onSave({
        ...basePayload,
        stateId: stateIdToSend,
      });

      resetForm();
      onClose();
    } catch (err) {
      showError(getBackendMessage(err) || "No se pudo guardar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            disabled={saving || loadingLookups}
            title={loadingLookups ? "Cargando servicios..." : undefined}
          >
            {saving ? "Guardando..." : submitLabel}
          </button>
        </div>
      }
    >
      <div className="grid gap-3">
        {clientLabel && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[11px] font-medium text-gray-500">Cliente</p>
            <p className="text-sm font-semibold text-gray-900">{clientLabel}</p>
          </div>
        )}

        {isInstallationFlow && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              {requestStageLabel}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900">
              {getInstallationAssessmentExplainer()}
            </p>
          </div>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Tipo de servicio</h3>
            <span className="text-[11px] text-gray-500">
              {loadingLookups
                ? "Cargando tipos..."
                : serviceTypes.length
                ? "Selecciona uno"
                : "No hay tipos disponibles"}
            </span>
          </div>

          {serviceTypes.length ? (
            <div className="inline-grid grid-cols-2 gap-2">
              {serviceTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    markTouched("tipo");
                    setServiceTypeId(type.id);
                  }}
                  className={[
                    "inline-flex min-w-36 items-center justify-center rounded-full border px-3 py-1.5 text-xs transition",
                    serviceTypeId === type.id
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200",
                  ].join(" ")}
                  disabled={saving || loadingLookups}
                >
                  {type.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No hay tipos de servicio configurados por el administrador.
            </p>
          )}

          {shouldShowError("tipo") && errors.tipo && (
            <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">
              {isInstallationFlow ? "Servicio a instalar" : "Servicio especifico"}
            </label>
            <div className="relative">
              <select
                value={serviceId === "" ? "" : String(serviceId)}
                onChange={(e) => {
                  markTouched("serviceId");
                  const value = e.target.value ? Number(e.target.value) : "";
                  setServiceId(value);
                  setCustomServiceMode(false);
                  setCustomServiceName("");
                }}
                onBlur={() => markTouched("serviceId")}
                disabled={saving || loadingLookups || customServiceMode}
                className={[
                  "h-10 w-full appearance-none rounded-lg border bg-gray-50 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60",
                  shouldShowError("serviceId") && errors.serviceId
                    ? "border-red-500"
                    : "border-gray-300",
                ].join(" ")}
              >
                <option value="">
                  {loadingLookups
                    ? "Cargando servicios..."
                    : filteredServicios.length
                    ? "Selecciona el servicio"
                    : serviceTypeId
                    ? "No hay servicios para este tipo"
                    : "No hay servicios"}
                </option>
                {filteredServicios.map((service) => (
                  <option key={service.id} value={String(service.id)}>
                    {service.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                v
              </span>
            </div>

            {shouldShowError("serviceId") && errors.serviceId && (
              <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-gray-500">
                Si no aparece en la lista, puedes agregarlo.
              </p>
              <button
                type="button"
                onClick={() => {
                  markTouched("customServiceName");
                  setCustomServiceMode((prev) => !prev);
                  setServiceId("");
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                disabled={saving || loadingLookups || !serviceTypeId}
              >
                {customServiceMode ? "Usar lista" : "Agregar servicio"}
              </button>
            </div>

            {customServiceMode && (
              <div className="mt-3">
                <input
                  value={customServiceName}
                  onChange={(e) => {
                    markTouched("customServiceName");
                    setCustomServiceName(e.target.value);
                  }}
                  onBlur={() => markTouched("customServiceName")}
                  placeholder="Ej. Instalacion de camara PTZ"
                  className={[
                    "h-10 w-full rounded-lg border bg-gray-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15",
                    shouldShowError("customServiceName") && errors.customServiceName
                      ? "border-red-500"
                      : "border-gray-300",
                  ].join(" ")}
                />
                {shouldShowError("customServiceName") && errors.customServiceName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customServiceName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">
              Direccion
            </label>
            <input
              value={direccion}
              onChange={(e) => {
                markTouched("direccion");
                setDireccion(e.target.value);
              }}
              onBlur={() => markTouched("direccion")}
              placeholder="Ej. Calle 123 #45-67"
              className={[
                "h-10 w-full rounded-lg border bg-gray-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15",
                shouldShowError("direccion") && errors.direccion
                  ? "border-red-500"
                  : "border-gray-300",
              ].join(" ")}
            />
            {shouldShowError("direccion") && errors.direccion && (
              <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {isInstallationFlow ? "Disponibilidad para la asesoria" : "Disponibilidad"}
              </h4>
              <p className="text-[11px] text-gray-500">
                {isInstallationFlow
                  ? "Agrega horarios para la asesoria tecnica previa. Con esa visita definiremos materiales y luego se podra cotizar la instalacion."
                  : "Agrega uno o varios horarios donde puedas recibir la visita. El admin vera estas opciones y luego confirmara la cita final segun la agenda de los tecnicos."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
            <input
              type="time"
              min="07:00"
              max="16:59"
              value={availabilityStartTime}
              onChange={(e) => setAvailabilityStartTime(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
            <input
              type="time"
              min="07:01"
              max="17:00"
              value={availabilityEndTime}
              onChange={(e) => setAvailabilityEndTime(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
            <button
              type="button"
              onClick={addAvailabilityOption}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              disabled={saving}
            >
              Agregar
            </button>
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            Horario permitido para propuestas: 07:00-17:00.
          </p>

          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
            {availabilityOptions.length ? (
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option, index) => (
                  <span
                    key={`${option.date}-${option.startTime}-${option.endTime}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-900"
                  >
                    <span>{formatRequestAvailabilityLabel(option)}</span>
                    <button
                      type="button"
                      onClick={() => removeAvailabilityOption(index)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100"
                      disabled={saving}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="px-1 py-1 text-xs text-gray-500">
                Aun no has agregado horarios disponibles.
              </p>
            )}
          </div>

          {shouldShowError("availabilityOptions") && errors.availabilityOptions && (
            <p className="mt-1 text-xs text-red-600">{errors.availabilityOptions}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">
            Descripcion
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              markTouched("description");
              setDescription(e.target.value);
            }}
            onBlur={() => markTouched("description")}
            rows={3}
            className={[
              "w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black/15",
              shouldShowError("description") && errors.description
                ? "border-red-500"
                : "border-gray-300",
            ].join(" ")}
            placeholder={
              isInstallationFlow
                ? "Ej. Quiero instalar camaras y necesito definir cableado, soportes y ubicaciones."
                : undefined
            }
          />
          {shouldShowError("description") && errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
