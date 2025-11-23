"use client";
import { useEffect, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import type { Option } from "@/features/dashboard/requests/hooks/useLookups";

export type CreateRequestPayload = {
  tipos: ("Mantenimiento" | "Instalacion")[];
  servicio: string;
  descripcion: string;
  direccion: string;
  cliente: string;
  programada?: string | null;
  horaProgramada?: string | null;
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

export default function CreateRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Crear Solicitud",
  servicios = [],
  clientes = [],
  initialDate = null,
  initialTime = null,
}: Props) {
  const [tipo, setTipo] = useState<"Mantenimiento" | "Instalacion" | null>(null);
  const [servicio, setServicio] = useState("");
  const [cliente, setCliente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [programada, setProgramada] = useState<string | null>(initialDate);
  const [horaProgramada, setHoraProgramada] = useState<string | null>(initialTime);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (isOpen) {
      setTipo(null);
      setServicio("");
      setCliente("");
      setDescripcion("");
      setDireccion("");
      setProgramada(initialDate);
      setHoraProgramada(initialTime);
      setErrors({});
    }
  }, [isOpen, initialDate, initialTime]);

  function validate() {
    const e: Record<string, string | null> = {};
    e.tipos = tipo ? null : "Selecciona un tipo.";
    e.servicio = servicio ? null : "Selecciona un servicio.";
    e.cliente = cliente ? null : "Selecciona un cliente.";
    e.descripcion = descripcion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    e.direccion = direccion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    if (programada && !horaProgramada) {
      e.horaProgramada = "Selecciona la hora.";
    }
    setErrors(e);
    return Object.values(e).every((x) => !x);
  }

  async function submit() {
    if (!validate()) return;
    const finalHour =
      horaProgramada && horaProgramada.includes(":") ? horaProgramada : programada ? "09:00" : null;
    await onSave({
      tipos: tipo ? [tipo] as ("Mantenimiento" | "Instalacion")[] : [],
      servicio,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      cliente,
      programada,
      horaProgramada: finalHour,
    });
    onClose();
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
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Guardar
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
          {errors.tipos && <p className="mt-1 text-xs text-red-600">{errors.tipos}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Servicio</label>
            <div className="relative">
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
              >
                <option value="">Selecciona el servicio</option>
                {servicios.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
            {errors.servicio && <p className="mt-1 text-xs text-red-600">{errors.servicio}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Cliente</label>
            <div className="relative">
              <select
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 pr-8 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
              >
                <option value="">Selecciona el cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
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
              onChange={(e) => setProgramada(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-900">Hora</label>
            <input
              type="time"
              value={horaProgramada ?? ""}
              onChange={(e) => setHoraProgramada(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/15"
            />
            {errors.horaProgramada && <p className="mt-1 text-xs text-red-600">{errors.horaProgramada}</p>}
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
          {errors.descripcion && <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>}
        </div>
      </div>
    </Modal>
  );
}
