"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/features/dashboard/components/Modal";
import { useAuth } from "@/features/auth/authcontext";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";

type Props = { isOpen: boolean; onClose: () => void };

export default function ProfileModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const userId = user?.userid;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [roleName, setRoleName] = useState("");
  const [techTypesList, setTechTypesList] = useState<
    { techniciantypeid: number; name: string }[]
  >([]);

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    documentnumber: "",
    image: "",
    customercity: "",
    customerzipcode: "",
    CV: "",
    technicianTypeIds: [] as number[],
  });

  // Iniciales para avatar
  const initials = useMemo(() => {
    const n = form.name.trim() || "";
    return n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [form.name]);

  // Cargar technician types
  async function loadTechnicianTypes() {
    try {
      const res = await fetch("http://localhost:3001/techniciantypes");
      const json = await res.json();
      setTechTypesList(json || []);
    } catch {}
  }

  // Cargar usuario
  async function loadUser() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`);
      const json = await res.json();

      const u = json.data;
      const role = u.roles?.name?.toLowerCase() || "";

      setRoleName(role);

      setForm({
        name: u.name || "",
        lastname: u.lastname || "",
        email: u.email || "",
        phone: u.phone || "",
        documentnumber: u.documentnumber || "",
        image: u.image || "",
        customercity: u.customers?.[0]?.customercity || "",
        customerzipcode: u.customers?.[0]?.customerzipcode || "",
        CV: u.technicians?.[0]?.CV || "",
        technicianTypeIds:
          u.technicians?.[0]?.technicianTypeMaps?.map(
            (m: any) => m.techniciantypeid
          ) || [],
      });
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    if (isOpen) {
      loadUser();
      loadTechnicianTypes();
      setMsg(null);
    }
  }, [isOpen]);

  // Cambiar imagen
  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = await uploadImageToCloudinary(f);
    setForm((prev) => ({ ...prev, image: url }));
  };

  // Cambiar CV solo si es técnico
  const handleCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (roleName !== "tecnico") return;
    const f = e.target.files?.[0];
    if (!f) return;

    const url = await uploadImageToCloudinary(f);
    setForm((prev) => ({ ...prev, CV: url }));
  };

  const toggleTechType = (id: number) => {
    if (roleName !== "tecnico") return;
    setForm((prev) => {
      const arr = prev.technicianTypeIds.includes(id)
        ? prev.technicianTypeIds.filter((t) => t !== id)
        : [...prev.technicianTypeIds, id];
      return { ...prev, technicianTypeIds: arr };
    });
  };

  // Guardar cambios
  const onSave = async () => {
    if (!userId) return;

    setSaving(true);
    setMsg(null);

    const payload: any = {
      name: form.name,
      lastname: form.lastname,
      phone: form.phone,
      image: form.image,
    };

    if (roleName === "cliente") {
      payload.customercity = form.customercity;
      payload.customerzipcode = form.customerzipcode;
    }

    if (roleName === "tecnico") {
      payload.CV = form.CV;
      payload.techniciantypeids = form.technicianTypeIds;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setMsg("Guardado correctamente");
        onClose();
      } else {
        setMsg(json.message || "Error");
      }
    } catch {
      setMsg("Error al guardar");
    }

    setSaving(false);
  };

  return (
    <Modal
      title="Editar perfil"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 border"
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="py-10 text-center text-gray-500">Cargando…</div>
      ) : (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-gray-200 grid place-content-center overflow-hidden">
              {form.image ? (
                <img
                  src={form.image}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {initials || "?"}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cambiar foto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white hover:file:opacity-90"
              />
            </div>
          </div>

          {/* Campos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                value={form.lastname}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastname: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Documento
              </label>
              <input
                value={form.documentnumber}
                disabled
                className="w-full rounded-xl border bg-gray-50 border-gray-200 px-3 py-2 text-gray-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Correo</label>
              <input
                value={form.email}
                disabled
                className="w-full rounded-xl border bg-gray-50 border-gray-200 px-3 py-2 text-gray-500"
              />
            </div>

            {/* Cliente → ciudad y zipcode */}
            {roleName === "cliente" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ciudad
                  </label>
                  <input
                    value={form.customercity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        customercity: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Código Postal
                  </label>
                  <input
                    value={form.customerzipcode}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        customerzipcode: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </>
            )}

            {/* Técnico → CV y technician types */}
            {roleName === "tecnico" && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">CV</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleCV}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white hover:file:opacity-90"
                  />
                  {form.CV && (
                    <a
                      href={form.CV}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      Ver CV actual
                    </a>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Tipos de técnico
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {techTypesList.map((t) => (
                      <button
                        key={t.techniciantypeid}
                        type="button"
                        onClick={() => toggleTechType(t.techniciantypeid)}
                        className={`px-3 py-1 rounded-xl border text-sm ${
                          form.technicianTypeIds.includes(t.techniciantypeid)
                            ? "bg-gray-900 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {msg && <div className="text-sm text-gray-600">{msg}</div>}
        </div>
      )}
    </Modal>
  );
}
