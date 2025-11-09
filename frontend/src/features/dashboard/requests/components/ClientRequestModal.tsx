"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";

export type ClientData = {
  id?: number | string;
  nombre: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  tipoDoc?: "CC" | "CE" | "NIT" | "PAS";
  documento?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientData) => void | Promise<void>;
  title?: string;
  initial?: ClientData;
};

export default function ClientRequestModal({ isOpen, onClose, onSave, title = "Cliente", initial }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [correo, setCorreo] = useState(initial?.correo ?? "");
  const [telefono, setTelefono] = useState(initial?.telefono ?? "");
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [direccion, setDireccion] = useState(initial?.direccion ?? "");
  const [tipoDoc, setTipoDoc] = useState<ClientData["tipoDoc"]>(initial?.tipoDoc ?? "CC");
  const [documento, setDocumento] = useState(initial?.documento ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!isOpen) return;
    setNombre(initial?.nombre ?? "");
    setCorreo(initial?.correo ?? "");
    setTelefono(initial?.telefono ?? "");
    setCiudad(initial?.ciudad ?? "");
    setDireccion(initial?.direccion ?? "");
    setTipoDoc(initial?.tipoDoc ?? "CC");
    setDocumento(initial?.documento ?? "");
    setErr({});
    setSaving(false);
  }, [isOpen, initial]);

  function validate() {
    const e: Record<string, string | null> = {};
    e.nombre = nombre.trim().length >= 3 ? null : "Nombre requerido (mín. 3).";
    if (correo) e.correo = /^\S+@\S+\.\S+$/.test(correo) ? null : "Correo inválido.";
    if (telefono) e.telefono = /^[0-9\-+()\s]{7,20}$/.test(telefono) ? null : "Teléfono inválido.";
    if (documento) e.documento = documento.trim().length >= 4 ? null : "Documento inválido.";
    setErr(e);
    return Object.values(e).every((x) => !x);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    const payload: ClientData = {
      id: initial?.id,
      nombre: nombre.trim(),
      correo: correo.trim() || undefined,
      telefono: telefono.trim() || undefined,
      ciudad: ciudad.trim() || undefined,
      direccion: direccion.trim() || undefined,
      tipoDoc,
      documento: documento?.trim() || undefined,
    };
    await onSave(payload);
    setSaving(false);
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
          <button type="submit" form="client-request-form" disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <form id="client-request-form" onSubmit={handleSubmit} className="grid gap-4">
        <hr className="border-gray-300" />
        <div className="grid grid-cols-[110px,1fr] gap-2">
          <div className="flex items-center">
            <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as ClientData["tipoDoc"])} className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-2 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40">
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PAS">PAS</option>
            </select>
          </div>
          <div>
            <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Número de documento" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
            {err.documento && <p className="mt-1 text-xs text-red-600">{err.documento}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellidos" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
          {err.nombre && <p className="mt-1 text-xs text-red-600">{err.nombre}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Correo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@dominio.com" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
            {err.correo && <p className="mt-1 text-xs text-red-600">{err.correo}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
            <input inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="300 000 0000" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
            {err.telefono && <p className="mt-1 text-xs text-red-600">{err.telefono}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ciudad</label>
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Dirección</label>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
