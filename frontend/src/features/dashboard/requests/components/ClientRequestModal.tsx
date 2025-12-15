"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import type { Option } from "@/features/dashboard/requests/types/option.types";
import { showError, showInfo, showSuccess } from "@/shared/utils/notifications";
import { getServiceOptions } from "@/features/dashboard/requests/services/lookups.service";

export type CreateRequestPayload = {
  scheduledAt?: string | null;
  scheduledEndAt?: string | null;
  serviceType: string;
  description: string;
  direccion: string;
  stateId?: number;
  serviceId: number;
  clientId: number;
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
  servicios?: ServiceOption[] | null;
  clientId: number;
  clientLabel?: string;
  initialDate?: string | null;
  initialTime?: string | null;
  initialEndTime?: string | null;
};

type ErrorKey =
  | "tipo"
  | "serviceId"
  | "description"
  | "direccion"
  | "horaProgramada"
  | "horaFinal";

type Errors = Partial<Record<ErrorKey, string | null>>;
type Touched = Partial<Record<ErrorKey, boolean>>;

function toIsoFromLocalDateTime(date: string, time: string) {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  const [hh, mm] = time.split(":").map((n) => Number(n));
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
}

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map((n) => Number(n));
  return (hh || 0) * 60 + (mm || 0);
}

function minutesToTime(total: number) {
  const m = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function addMinutesToTime(t: string, add: number) {
  return minutesToTime(timeToMinutes(t) + add);
}

function getBackendMessage(err: unknown) {
  const anyErr = err as any;
  const msg = anyErr?.response?.data?.message ?? anyErr?.message ?? "";
  if (Array.isArray(msg)) return msg.filter(Boolean).join(" | ");
  return String(msg || "");
}

export default function ClientCreateRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Solicitar servicio",
  servicios,
  clientId,
  clientLabel,
  initialDate = null,
  initialTime = null,
  initialEndTime = null,
}: Props) {
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [direccion, setDireccion] = useState("");
  const [programada, setProgramada] = useState<string | null>(initialDate);
  const [horaProgramada, setHoraProgramada] = useState<string | null>(initialTime);
  const [horaFinal, setHoraFinal] = useState<string | null>(initialEndTime);

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

    (finalServicios || []).forEach((s) => {
      const typeId = s.typeofserviceid;
      const typeName = s.typeofservicename;
      if (!typeId || !typeName) return;
      if (map.has(typeId)) return;

      let code = (s.serviceTypeCode || "").trim();
      if (!code) {
        const norm = typeName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (norm.startsWith("mantenimiento")) code = "MANTENIMIENTO";
        else if (norm.startsWith("instal")) code = "INSTALACION";
        else code = typeName;
      }

      map.set(typeId, { id: typeId, label: typeName, code });
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [finalServicios]);

  const selectedType = useMemo(
    () => (serviceTypeId ? serviceTypes.find((t) => t.id === serviceTypeId) || null : null),
    [serviceTypeId, serviceTypes]
  );

  const filteredServicios = useMemo<ServiceOption[]>(() => {
    const list = finalServicios || [];
    if (!serviceTypeId) return list;

    const hasTypeInfo = list.some((s) => s.typeofserviceid != null);
    if (!hasTypeInfo) return list;

    return list.filter((s) => s.typeofserviceid === serviceTypeId);
  }, [finalServicios, serviceTypeId]);

  function validateDireccion(v: string) {
    const dir = (v ?? "").trim();
    if (dir.length < 3) return "Mínimo 3 caracteres.";
    if (dir.length > 255) return "Máximo 255 caracteres.";
    return null;
  }

  function validateDescription(v: string) {
    const d = (v ?? "").trim();
    return d.length >= 3 ? null : "Mínimo 3 caracteres.";
  }

  function validateServiceId(v: number | "") {
    return v !== "" ? null : "Selecciona un servicio.";
  }

  function validateHoraProgramada(start: string | null, hasDate: boolean) {
    if (!hasDate) return null;
    return start ? null : "Selecciona la hora inicial.";
  }

  function validateHoraFinal(start: string | null, end: string | null, hasDate: boolean) {
    if (!hasDate) return null;
    if (!end) return "Selecciona la hora final.";
    if (!start) return null;
    return timeToMinutes(end) <= timeToMinutes(start)
      ? "La hora final debe ser mayor que la hora inicial."
      : null;
  }

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};

    e.tipo = serviceTypeId ? null : "Selecciona un tipo.";
    e.serviceId = validateServiceId(serviceId);
    e.direccion = validateDireccion(direccion);
    e.description = validateDescription(description);

    if (programada) {
      e.horaProgramada = validateHoraProgramada(horaProgramada, true);
      e.horaFinal = validateHoraFinal(horaProgramada, horaFinal, true);
    } else {
      e.horaProgramada = null;
      e.horaFinal = null;
    }

    return e;
  }, [serviceTypeId, serviceId, direccion, description, programada, horaProgramada, horaFinal]);

  function markTouched(key: ErrorKey) {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }

  function shouldShowError(key: ErrorKey) {
    return Boolean(submitAttempted || touched[key]);
  }

  function isValidNow() {
    return Object.values(errors).every((x) => !x);
  }

  useEffect(() => {
    if (!isOpen) return;

    let alive = true;

    (async () => {
      const hasServicios = Array.isArray(servicios) && servicios.length > 0;

      if (hasServicios) setServiciosLocal(servicios as ServiceOption[]);
      if (hasServicios) return;

      setLoadingLookups(true);

      const [sr] = await Promise.allSettled([
        hasServicios ? Promise.resolve(servicios as ServiceOption[]) : getServiceOptions(),
      ]);

      if (!alive) return;

      if (sr.status === "fulfilled") setServiciosLocal(sr.value as ServiceOption[]);
      else {
        setServiciosLocal([]);
        const status = (sr.reason as any)?.response?.status;
        showError(
          status
            ? `No se pudieron cargar los servicios (${status}).`
            : "No se pudieron cargar los servicios."
        );
        console.error("LOOKUP services ERROR →", sr.reason);
      }

      setLoadingLookups(false);
    })();

    return () => {
      alive = false;
    };
  }, [isOpen, servicios]);

  useEffect(() => {
    if (!isOpen) return;

    setServiceTypeId(null);
    setServiceId("");
    setDescription("");
    setDireccion("");
    setProgramada(initialDate);
    setHoraProgramada(initialTime);
    setHoraFinal(initialEndTime);
    setTouched({});
    setSubmitAttempted(false);
    setSaving(false);
  }, [isOpen, initialDate, initialTime, initialEndTime]);

  useEffect(() => {
    if (!serviceTypes.length) {
      setServiceTypeId(null);
      return;
    }
    if (serviceTypeId && serviceTypes.some((t) => t.id === serviceTypeId)) return;
    setServiceTypeId(serviceTypes[0].id);
  }, [serviceTypes, serviceTypeId]);

  useEffect(() => {
    if (!isOpen) return;
    if (serviceId === "") return;
    if (!filteredServicios.some((s) => Number(s.id) === Number(serviceId))) {
      setServiceId("");
      markTouched("serviceId");
    }
  }, [isOpen, filteredServicios, serviceId]);

  async function submit() {
    if (saving) return;

    setSubmitAttempted(true);

    if (loadingLookups) {
      showInfo("Espera a que carguen los servicios.");
      return;
    }

    if (!isValidNow()) return;

    if (!selectedType) {
      showError("Selecciona un tipo de servicio.");
      return;
    }

    if (!clientId) {
      showError("No se pudo identificar al cliente.");
      return;
    }

    const scheduledAt =
      programada && horaProgramada ? toIsoFromLocalDateTime(programada, horaProgramada) : null;

    const scheduledEndAt =
      programada && horaFinal ? toIsoFromLocalDateTime(programada, horaFinal) : null;

    const dir = String(direccion ?? "").trim().slice(0, 255);

    const payload: CreateRequestPayload = {
      serviceType: selectedType.code,
      serviceId: Number(serviceId),
      clientId,
      description: String(description ?? "").trim(),
      direccion: dir,
      scheduledAt,
      scheduledEndAt,
      stateId: 1,
    };

    setSaving(true);
    try {
      await onSave(payload);
      showSuccess("Solicitud creada correctamente.");
      onClose();
    } catch (err) {
      const msg = getBackendMessage(err);
      showError(msg || "No se pudo crear la solicitud.");
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
            {saving ? "Enviando..." : "Guardar"}
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
              {serviceTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    markTouched("tipo");
                    setServiceTypeId(t.id);
                  }}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs border transition min-w-36",
                    serviceTypeId === t.id
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
                  ].join(" ")}
                  disabled={saving || loadingLookups}
                >
                  {t.label}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Servicio</label>
            <div className="relative">
              <select
                value={serviceId === "" ? "" : String(serviceId)}
                onChange={(e) => {
                  markTouched("serviceId");
                  const v = e.target.value ? Number(e.target.value) : "";
                  setServiceId(v);
                }}
                onBlur={() => markTouched("serviceId")}
                disabled={saving || loadingLookups}
                className={[
                  "w-full appearance-none rounded-lg border bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60",
                  shouldShowError("serviceId") && errors.serviceId ? "border-red-500" : "border-gray-300",
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
                {filteredServicios.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                ▾
              </span>
            </div>

            {shouldShowError("serviceId") && errors.serviceId && (
              <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Dirección</label>
            <input
              value={direccion}
              onChange={(e) => {
                markTouched("direccion");
                setDireccion(e.target.value);
              }}
              onBlur={() => markTouched("direccion")}
              placeholder="Ej. Calle 123 #45-67"
              className={[
                "w-full rounded-lg border bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15",
                shouldShowError("direccion") && errors.direccion ? "border-red-500" : "border-gray-300",
              ].join(" ")}
            />
            {shouldShowError("direccion") && errors.direccion && (
              <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Programada</label>
            <input
              type="date"
              value={programada ?? ""}
              onChange={(e) => {
                const v = e.target.value || null;
                setProgramada(v);

                if (!v) {
                  setHoraProgramada(null);
                  setHoraFinal(null);
                } else {
                  markTouched("horaProgramada");
                  markTouched("horaFinal");
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Hora (inicio)</label>
            <input
              type="time"
              disabled={!programada}
              value={horaProgramada ?? ""}
              onChange={(e) => {
                markTouched("horaProgramada");
                const v = e.target.value || null;
                setHoraProgramada(v);

                if (programada && v && !horaFinal) {
                  setHoraFinal(addMinutesToTime(v, 60));
                }
              }}
              onBlur={() => markTouched("horaProgramada")}
              className={[
                "w-full rounded-lg border bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60",
                shouldShowError("horaProgramada") && errors.horaProgramada ? "border-red-500" : "border-gray-300",
              ].join(" ")}
            />
            {shouldShowError("horaProgramada") && errors.horaProgramada && (
              <p className="mt-1 text-xs text-red-600">{errors.horaProgramada}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Hora final</label>
            <input
              type="time"
              disabled={!programada}
              value={horaFinal ?? ""}
              onChange={(e) => {
                markTouched("horaFinal");
                setHoraFinal(e.target.value || null);
              }}
              onBlur={() => markTouched("horaFinal")}
              className={[
                "w-full rounded-lg border bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60",
                shouldShowError("horaFinal") && errors.horaFinal ? "border-red-500" : "border-gray-300",
              ].join(" ")}
            />
            {shouldShowError("horaFinal") && errors.horaFinal && (
              <p className="mt-1 text-xs text-red-600">{errors.horaFinal}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => {
              markTouched("description");
              setDescription(e.target.value);
            }}
            onBlur={() => markTouched("description")}
            rows={3}
            placeholder="Describe brevemente la solicitud"
            className={[
              "w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black/15",
              shouldShowError("description") && errors.description ? "border-red-500" : "border-gray-300",
            ].join(" ")}
          />
          {shouldShowError("description") && errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
