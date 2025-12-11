"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import type { Option } from "@/features/dashboard/requests/hooks/useLookups";
import { showError, showInfo } from "@/shared/utils/notifications";
import {
  getServiceOptions,
  getCustomerOptions,
} from "@/features/dashboard/requests/services/lookups.service";

export type EditRequestPayload = {
  tipos: ("Mantenimiento" | "Instalacion")[];
  servicio: string;
  cliente: string;
  descripcion: string;
  direccion: string;
  programada: string | null;
  horaProgramada: string | null;
  horaFinal: string | null;
  estado?: string;
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
  onSave: (data: EditRequestPayload) => void | Promise<void>;
  title?: string;
  servicios?: ServiceOption[] | null;
  clientes?: Option[] | null;
  initial?: EditRequestPayload | null;
};

type Errors = Record<string, string | null>;

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

function normalizeTipoFromLabel(label: string): "Mantenimiento" | "Instalacion" {
  const norm = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (norm.startsWith("instal")) return "Instalacion";
  return "Mantenimiento";
}

export default function EditRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Editar Solicitud",
  servicios,
  clientes,
  initial = null,
}: Props) {
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [servicio, setServicio] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [tipos, setTipos] = useState<("Mantenimiento" | "Instalacion")[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [programada, setProgramada] = useState<string | null>(null);
  const [horaProgramada, setHoraProgramada] = useState<string | null>(null);
  const [horaFinal, setHoraFinal] = useState<string | null>(null);
  const [estado] = useState<string | undefined>(initial?.estado);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [serviciosLocal, setServiciosLocal] = useState<ServiceOption[]>([]);
  const [clientesLocal, setClientesLocal] = useState<Option[]>([]);

  const finalServicios = useMemo<ServiceOption[]>(() => {
    const fromProps = (Array.isArray(servicios) ? servicios : []) as ServiceOption[];
    return fromProps.length ? fromProps : serviciosLocal;
  }, [servicios, serviciosLocal]);

  const finalClientes = useMemo<Option[]>(() => {
    const fromProps = Array.isArray(clientes) ? clientes : [];
    return fromProps.length ? fromProps : clientesLocal;
  }, [clientes, clientesLocal]);

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

      map.set(typeId, {
        id: typeId,
        label: typeName,
        code,
      });
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

  useEffect(() => {
    if (!isOpen) return;

    setServicio(initial?.servicio ?? "");
    setCliente(initial?.cliente ?? "");
    setDescripcion(initial?.descripcion ?? "");
    setDireccion(initial?.direccion ?? "");
    setProgramada(initial?.programada ?? null);
    setHoraProgramada(initial?.horaProgramada ?? null);
    setHoraFinal(initial?.horaFinal ?? null);
    setTipos(initial?.tipos ?? []);
    setErrors({});
  }, [isOpen, initial]);

  useEffect(() => {
    if (!isOpen) return;

    let alive = true;

    (async () => {
      const hasServicios = Array.isArray(servicios) && servicios.length > 0;
      const hasClientes = Array.isArray(clientes) && clientes.length > 0;

      if (hasServicios) setServiciosLocal(servicios as ServiceOption[]);
      if (hasClientes) setClientesLocal(clientes!);

      if (hasServicios && hasClientes) return;

      setLoadingLookups(true);

      const [sr, cr] = await Promise.allSettled([
        hasServicios ? Promise.resolve(servicios as ServiceOption[]) : getServiceOptions(),
        hasClientes ? Promise.resolve(clientes!) : getCustomerOptions(),
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

      if (cr.status === "fulfilled") setClientesLocal(cr.value as Option[]);
      else {
        setClientesLocal([]);
        const status = (cr.reason as any)?.response?.status;
        showError(
          status
            ? `No se pudieron cargar los clientes (${status}).`
            : "No se pudieron cargar los clientes."
        );
        console.error("LOOKUP customers ERROR →", cr.reason);
      }

      setLoadingLookups(false);
    })();

    return () => {
      alive = false;
    };
  }, [isOpen, servicios, clientes]);

  useEffect(() => {
    if (!serviceTypes.length) {
      setServiceTypeId(null);
      return;
    }

    if (serviceTypeId && serviceTypes.some((t) => t.id === serviceTypeId)) return;

    if (initial?.tipos?.length) {
      const p = initial.tipos[0].toLowerCase();
      const match = serviceTypes.find((t) => {
        const lbl = t.label
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return lbl.startsWith(p.substring(0, 4));
      });
      if (match) {
        setServiceTypeId(match.id);
        return;
      }
    }

    setServiceTypeId(serviceTypes[0].id);
  }, [serviceTypes, serviceTypeId, initial]);

  function validate() {
    const e: Errors = {};

    e.tipo = serviceTypeId ? null : "Selecciona un tipo.";
    e.servicio = servicio ? null : "Selecciona un servicio.";
    e.cliente = cliente ? null : "Selecciona un cliente.";
    e.descripcion = descripcion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";

    const dir = (direccion ?? "").trim();
    if (dir.length < 3) e.direccion = "Mínimo 3 caracteres.";
    else if (dir.length > 255) e.direccion = "Máximo 255 caracteres.";
    else e.direccion = null;

    if (programada && !horaProgramada) e.horaProgramada = "Selecciona la hora inicial.";
    else e.horaProgramada = null;

    if (programada && !horaFinal) e.horaFinal = "Selecciona la hora final.";
    else e.horaFinal = null;

    if (programada && horaProgramada && horaFinal) {
      const start = timeToMinutes(horaProgramada);
      const end = timeToMinutes(horaFinal);
      if (end <= start) e.horaFinal = "La hora final debe ser mayor que la hora inicial.";
    }

    setErrors(e);
    return Object.values(e).every((x) => !x);
  }

  async function submit() {
    if (saving) return;

    if (loadingLookups) {
      showInfo("Espera a que carguen los servicios y clientes.");
      return;
    }

    if (!validate()) return;

    if (!selectedType) {
      setErrors((prev) => ({ ...prev, tipo: "Selecciona un tipo." }));
      showError("Selecciona un tipo de servicio.");
      return;
    }

    const dir = String(direccion ?? "").trim().slice(0, 255);

    const tiposFinal =
      tipos.length > 0
        ? tipos
        : [normalizeTipoFromLabel(selectedType.label)];

    const payload: EditRequestPayload = {
      tipos: tiposFinal,
      servicio,
      cliente,
      descripcion: String(descripcion ?? "").trim(),
      direccion: dir,
      programada,
      horaProgramada,
      horaFinal,
      estado,
    };

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
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
            title={loadingLookups ? "Cargando servicios/clientes..." : undefined}
          >
            {saving ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      }
    >
      <div className="grid gap-3">
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
                    setServiceTypeId(t.id);
                    setTipos([normalizeTipoFromLabel(t.label)]);
                    setErrors((prev) => ({ ...prev, tipo: null }));
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
              Configura tipos de servicio en el catálogo de servicios.
            </p>
          )}

          {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Servicio</label>
            <div className="relative">
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                disabled={saving || loadingLookups}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
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
            {errors.servicio && <p className="mt-1 text-xs text-red-600">{errors.servicio}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Cliente</label>
            <div className="relative">
              <select
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
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
            {errors.cliente && <p className="mt-1 text-xs text-red-600">{errors.cliente}</p>}
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
              onChange={(e) => {
                const v = e.target.value || null;
                setProgramada(v);
                if (!v) {
                  setHoraProgramada(null);
                  setHoraFinal(null);
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
                const v = e.target.value || null;
                setHoraProgramada(v);
                if (programada && v && !horaFinal) {
                  setHoraFinal(addMinutesToTime(v, 60));
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
            />
            {errors.horaProgramada && (
              <p className="mt-1 text-xs text-red-600">{errors.horaProgramada}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Hora final</label>
            <input
              type="time"
              disabled={!programada}
              value={horaFinal ?? ""}
              onChange={(e) => setHoraFinal(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15 disabled:opacity-60"
            />
            {errors.horaFinal && <p className="mt-1 text-xs text-red-600">{errors.horaFinal}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-900">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Describe brevemente la solicitud"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
          />
          {errors.descripcion && (
            <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
