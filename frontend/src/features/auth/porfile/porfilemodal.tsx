"use client";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import { useAuth } from "@/features/auth/authcontext";
import { fileToBase64 } from "@/shared/utils/base64";

type Props = { isOpen: boolean; onClose: () => void };

export default function ProfileModal({ isOpen, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name ?? "");
      setPhone(user?.phone ?? "");
      setAvatar(user?.avatar);
      setMsg(null);
      setLoading(false);
    }
  }, [isOpen, user]);

  const initials = useMemo(() => {
    const n = (name || user?.name || "").trim();
    return n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [name, user?.name]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setAvatar(b64);
  };

  const onSave = async () => {
    setLoading(true);
    setMsg(null);
    const res = await updateProfile({ name, phone, avatar });
    setLoading(false);
    setMsg(res.ok ? "Guardado" : res.message || "Error");
    if (res.ok) onClose();
  };

  return (
    <Modal
      title="Editar perfil"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="rounded-xl px-4 py-2 border">Cancelar</button>
          <button
            onClick={onSave}
            disabled={loading}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-gray-200 grid place-content-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-gray-600">{initials || "?"}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cambiar foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white hover:file:opacity-90"
            />
            <p className="text-xs text-gray-500 mt-1">Se guarda en local (base64).</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="300 000 0000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>
        </div>

        {msg && <div className="text-sm text-gray-600">{msg}</div>}
      </div>
    </Modal>
  );
}
