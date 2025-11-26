"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import type { Option } from "@/features/dashboard/requests/hooks/useLookups";
import { showError } from "@/shared/utils/notifications";
import {
  getServiceOptions,
  getCustomerOptions,
} from "@/features/dashboard/requests/services/lookups.service";

export type CreateRequestPayload = {
  scheduledAt?: string | null;
  serviceType: "MANTENIMIENTO" | "INSTALACION";
  description: string;
  direccion: string;
  stateId?: number;
  serviceId: number;
  clientId: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequestPayload) => void | Promise<void>;
  title?: string;
  servicios?: Option[];
  clientes?: Option[];
  initialDate?: string | null;
  initialTime?: string | null;
};

function toIsoFromLocalDateTime(date: string, time: string) {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  const [hh, mm] = time.split(":").map((n) => Number(n));
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
}

export default function CreateRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Crear Solicitud",
  servicios,
  clientes,
  initialDate = null,
  initialTime = null,
}: Props) {
  const [tipo, setTipo] = useState<"Mantenimiento" | "Instalacion" | null>(null);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [clientId, setClientId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [direccion, setDireccion] = useState("");
  const [programada, setProgramada] = useState<string | null>(initialDate);
  const [horaProgramada, setHoraProgramada] = useState<string | null>(initialTime);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [serviciosLocal, setServiciosLocal] = useState<Option[]>([]);
  const [clientesLocal, setClientesLocal] = useState<Option[]>([]);

  const finalServicios = useMemo(() => {
    const fromProps = Array.isArray(servicios) ? servicios : [];
    return fromProps.length ? fromProps : serviciosLocal;
  }, [servicios, serviciosLocal]);

  const finalClientes = useMemo(() => {
    const fromProps = Array.isArray(clientes) ? clientes : [];
    return fromProps.length ? fromProps : clientesLocal;
  }, [clientes, clientesLocal]);

useEffect(() => {
  if (!isOpen) return;

  let alive = true;

  (async () => {
    const hasServicios = Array.isArray(servicios) && servicios.length > 0;
    const hasClientes = Array.isArray(clientes) && clientes.length > 0;

    if (hasServicios) setServiciosLocal(servicios!);
    if (hasClientes) setClientesLocal(clientes!);

    if (hasServicios && hasClientes) return;

    setLoadingLookups(true);

    const [sr, cr] = await Promise.allSettled([
      hasServicios ? Promise.resolve(servicios!) : getServiceOptions(),
      hasClientes ? Promise.resolve(clientes!) : getCustomerOptions(),
    ]);

    if (!alive) return;

    if (sr.status === "fulfilled") setServiciosLocal(sr.value);
    else {
      setServiciosLocal([]);
      const status = (sr.reason as any)?.response?.status;
      showError(status ? `No se pudieron cargar los servicios (${status}).` : "No se pudieron cargar los servicios.");
      console.error("LOOKUP services ERROR →", sr.reason);
    }

    if (cr.status === "fulfilled") setClientesLocal(cr.value);
    else {
      setClientesLocal([]);
      const status = (cr.reason as any)?.response?.status;
      showError(status ? `No se pudieron cargar los clientes (${status}).` : "No se pudieron cargar los clientes.");
      console.error("LOOKUP customers ERROR →", cr.reason);
    }

    setLoadingLookups(false);
  })();

  return () => {
    alive = false;
  };
}, [isOpen, servicios, clientes]);


  function validate() {
    const e: Record<string, string | null> = {};
    e.tipo = tipo ? null : "Selecciona un tipo.";
    e.serviceId = serviceId !== "" ? null : "Selecciona un servicio.";
    e.clientId = clientId !== "" ? null : "Selecciona un cliente.";
    e.description = description.trim().length >= 3 ? null : "Mínimo 3 caracteres.";

    const dir = (direccion ?? "").trim();
    if (dir.length < 3) e.direccion = "Mínimo 3 caracteres.";
    else if (dir.length > 255) e.direccion = "Máximo 255 caracteres.";
    else e.direccion = null;

    if (programada && !horaProgramada) e.horaProgramada = "Selecciona la hora.";

    setErrors(e);
    return Object.values(e).every((x) => !x);
  }

  async function submit() {
    if (saving) return;
    if (!validate()) return;

    const serviceType: "MANTENIMIENTO" | "INSTALACION" =
      tipo === "Mantenimiento" ? "MANTENIMIENTO" : "INSTALACION";

    const scheduledAt = programada
      ? toIsoFromLocalDateTime(programada, horaProgramada || "09:00")
      : null;

    const dir = String(direccion ?? "").trim().slice(0, 255);

    setSaving(true);
    try {
      await onSave({
        serviceType,
        serviceId: Number(serviceId),
        clientId: Number(clientId),
        description: String(description ?? "").trim(),
        direccion: dir,
        scheduledAt,
        stateId: 1,
      });
      onClose();
    } catch {
      showError("No se pudo crear la solicitud.");
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
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      }
    >
      <div className="grid gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Tipo de servicio</h3>
            <span className="text-[11px] text-gray-500">Selecciona uno</span>
          </div>

          <div className="inline-grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("Mantenimiento")}
              className={[
                "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs border transition min-w-36",
                tipo === "Mantenimiento"
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
              ].join(" ")}
            >
              Mantenimiento
            </button>

            <button
              type="button"
              onClick={() => setTipo("Instalacion")}
              className={[
                "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs border transition min-w-36",
                tipo === "Instalacion"
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
              ].join(" ")}
            >
              Instalación
            </button>
          </div>

          {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Servicio</label>
            <div className="relative">
              <select
                value={serviceId === "" ? "" : String(serviceId)}
                onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
                disabled={saving || loadingLookups}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
              >
                <option value="">
                  {loadingLookups
                    ? "Cargando servicios..."
                    : finalServicios.length
                      ? "Selecciona el servicio"
                      : "No hay servicios"}
                </option>
                {finalServicios.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                ▾
              </span>
            </div>
            {errors.serviceId && <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Cliente</label>
            <div className="relative">
              <select
                value={clientId === "" ? "" : String(clientId)}
                onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : "")}
                disabled={saving || loadingLookups}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
              >
                <option value="">
                  {loadingLookups
                    ? "Cargando clientes..."
                    : finalClientes.length
                      ? "Selecciona el cliente"
                      : "No hay clientes"}
                </option>
                {finalClientes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                ▾
              </span>
            </div>
            {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Dirección</label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej. Calle 123 #45-67"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
            {errors.direccion && <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Programada</label>
            <input
              type="date"
              value={programada ?? ""}
              onChange={(e) => setProgramada(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Hora</label>
            <input
              type="time"
              disabled={!programada}
              value={horaProgramada ?? ""}
              onChange={(e) => setHoraProgramada(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
            />
            {errors.horaProgramada && (
              <p className="mt-1 text-xs text-red-600">{errors.horaProgramada}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe brevemente la solicitud"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
      </div>
    </Modal>
  );
}
