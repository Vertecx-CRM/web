"use client";

import { useState } from "react";
import Modal from "@/features/dashboard/components/Modal";

type TipoServicio = "Mantenimiento" | "Instalacion";

export type CreateRequestPayload = {
  tipos: TipoServicio[];
  servicio: string;
  descripcion: string;
  cliente: string;
  direccion: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequestPayload) => void | Promise<void>;
  title?: string;
  servicios?: string[];
  clientes?: string[];
};

const DEFAULT_SERVICIOS = ["Cableado", "CCTV", "Servidor", "Red WiFi", "Impresora"];
const DEFAULT_CLIENTES = ["Acme S.A.", "Innova LTDA", "SistemasPC", "Vertecx", "Cliente Demo"];

export default function CreateRequestModal({
  isOpen,
  onClose,
  onSave,
  title = "Crear solicitud",
  servicios = DEFAULT_SERVICIOS,
  clientes = DEFAULT_CLIENTES,
}: Props) {
  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cliente, setCliente] = useState("");
  const [direccion, setDireccion] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, string | null>>({});

  function toggleTipo(t: TipoServicio) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function validate() {
    const e: Record<string, string | null> = {};
    e.tipos = tipos.length ? null : "Selecciona al menos un tipo.";
    e.servicio = servicio ? null : "Selecciona un servicio.";
    e.descripcion = descripcion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    e.cliente = cliente ? null : "Selecciona un cliente.";
    e.direccion = direccion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    setErr(e);
    return Object.values(e).every((x) => !x);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await onSave({ tipos, servicio, descripcion: descripcion.trim(), cliente, direccion: direccion.trim() });
      setSaving(false);
      onClose();
      setTipos([]);
      setServicio("");
      setDescripcion("");
      setCliente("");
      setDireccion("");
      setErr({});
    } catch {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
            Cancelar
          </button>
          <button type="submit" form="create-request-form" disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <form id="create-request-form" onSubmit={handleSubmit} className="grid gap-4">
        <hr className="border-gray-300" />
        <div>
          <div className="text-sm text-gray-800 mb-2">Tipo de servicio</div>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" checked={tipos.includes("Mantenimiento")} onChange={() => toggleTipo("Mantenimiento")} className="h-4 w-4 rounded border-gray-300" />
              Mantenimiento
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" checked={tipos.includes("Instalacion")} onChange={() => toggleTipo("Instalacion")} className="h-4 w-4 rounded border-gray-300" />
              Instalacion
            </label>
          </div>
          {err.tipos && <p className="mt-1 text-xs text-red-600">{err.tipos}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Servicio</label>
          <div className="relative">
            <select
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
            >
              <option value="">Selecciona el servicio</option>
              {servicios.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </div>
          {err.servicio && <p className="mt-1 text-xs text-red-600">{err.servicio}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ingrese sus observaciones"
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {err.descripcion && <p className="mt-1 text-xs text-red-600">{err.descripcion}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Cliente</label>
          <div className="relative">
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
            >
              <option value="">Selecciona el cliente</option>
              {clientes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </div>
          {err.cliente && <p className="mt-1 text-xs text-red-600">{err.cliente}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Dirección</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ingrese su dirección"
            className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {err.direccion && <p className="mt-1 text-xs text-red-600">{err.direccion}</p>}
        </div>
      </form>
    </Modal>
  );
}
