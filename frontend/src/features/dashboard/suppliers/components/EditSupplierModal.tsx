"use client";

import { useRef, useState, useEffect } from "react";
import { Star, Upload, X as XIcon } from "lucide-react";
import Modal from "@/features/dashboard/components/Modal";
import type { ProviderSubmitPayload } from "@/features/dashboard/suppliers/components/CreateSuppliersModal";

type ProviderForm = {
  name: string;
  nit: string;
  phone: string;
  email: string;
  categorySelect: string;
  categories: string[];
  rating: number;
  contactName: string;
  status: "Activo" | "Inactivo";
  imageFile?: File | null;
  imageUrl?: string | null;
};

const DEFAULT_CATEGORIES = ["Servidores", "Redes", "CCTV", "Suministros"];
const MAX_IMG_MB = 2;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProviderSubmitPayload) => void | Promise<void>;
  provider: ProviderSubmitPayload | null;
  title?: string;
};

function sanitizeName(v: string) {
  return v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]/g, "").replace(/\s{2,}/g, " ").slice(0, 80);
}
function sanitizeContact(v: string) {
  return sanitizeName(v);
}
function sanitizePhone(v: string) {
  let s = v.replace(/[^\d+]/g, "");
  if (s.includes("+")) s = "+" + s.replace(/\+/g, "");
  if (s.startsWith("+")) s = "+" + s.slice(1).replace(/[^\d]/g, "");
  return s.slice(0, 16);
}
function sanitizeNIT(v: string) {
  let s = v.replace(/[^\d-]/g, "").replace(/-+/g, "-");
  const parts = s.split("-");
  const num = parts[0].slice(0, 12).replace(/\D/g, "");
  const dv = (parts[1] || "").replace(/\D/g, "").slice(0, 1);
  return dv ? `${num}-${dv}` : num;
}
function nitDV(num: string) {
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const digits = num.split("").reverse().map((n) => parseInt(n, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += digits[i] * weights[i];
  const r = sum % 11;
  return r > 1 ? 11 - r : r;
}
function validateName(v: string) {
  const s = v.trim();
  if (s.length < 3) return "Mínimo 3 caracteres.";
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]+$/.test(s)) return "Solo letras y espacios.";
  return null;
}
function validateContact(v: string) {
  return validateName(v);
}
function validateEmail(v: string) {
  const s = v.trim();
  if (!s) return "Correo requerido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Correo inválido.";
  return null;
}
function validatePhone(v: string) {
  const s = v.replace(/[^\d+]/g, "");
  const digits = s.startsWith("+") ? s.slice(1) : s;
  if (digits.length < 7 || digits.length > 15) return "7–15 dígitos.";
  if (!/^\+?\d+$/.test(s)) return "Solo números.";
  return null;
}
function validateNITValue(v: string) {
  const s = sanitizeNIT(v);
  if (!/^\d{5,12}(-\d)?$/.test(s)) return "Formato: 5–12 dígitos y opcional -DV.";
  return null;
}
function validateImage(file?: File | null) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) return "Archivo no es una imagen.";
  if (file.size > MAX_IMG_MB * 1024 * 1024) return `Máx ${MAX_IMG_MB}MB.`;
  return null;
}

export default function EditSupplierModal({ isOpen, onClose, onSave, provider, title = "Editar Proveedor" }: Props) {
  const [form, setForm] = useState<ProviderForm>({
    name: "",
    nit: "",
    phone: "",
    email: "",
    categorySelect: "",
    categories: [],
    rating: 0,
    contactName: "",
    status: "Activo",
    imageFile: null,
    imageUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // ⬇️ Sin el guard de isOpen: siempre que cambie `provider` copiamos los datos
  useEffect(() => {
    if (!provider) {
      setForm({
        name: "",
        nit: "",
        phone: "",
        email: "",
        categorySelect: "",
        categories: [],
        rating: 0,
        contactName: "",
        status: "Activo",
        imageFile: null,
        imageUrl: null,
      });
      return;
    }
    setForm({
      name: provider.name ?? "",
      nit: provider.nit ?? "",
      phone: provider.phone ?? "",
      email: provider.email ?? "",
      categorySelect: "",
      categories: provider.categories ?? [],
      rating: provider.rating ?? 0,
      contactName: provider.contactName ?? "",
      status: provider.status ?? "Activo",
      imageFile: null,
      imageUrl: provider.imageUrl ?? null,
    });
  }, [provider]);

  const update = <K extends keyof ProviderForm>(k: K, v: ProviderForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  function handlePickFile() {
    fileRef.current?.click();
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const err = validateImage(file);
    setErrors((er) => ({ ...er, image: err }));
    if (err) return;
    update("imageFile", file || null);
    update("imageUrl", file ? URL.createObjectURL(file) : null);
  }
  function removeCategory(c: string) {
    setForm((f) => ({ ...f, categories: f.categories.filter((x) => x !== c) }));
  }
  function validateAll() {
    const e: Record<string, string | null> = {};
    e.name = validateName(form.name);
    e.nit = validateNITValue(form.nit);
    e.phone = validatePhone(form.phone);
    e.email = validateEmail(form.email);
    e.contactName = validateContact(form.contactName);
    e.categories = form.categories.length ? null : "Agrega al menos una categoría.";
    e.image = validateImage(form.imageFile);
    setErrors(e);
    return Object.values(e).every((x) => !x);
  }
  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validateAll()) return;
    try {
      setSaving(true);
      const nitSan = sanitizeNIT(form.nit);
      const base = nitSan.split("-")[0];
      const dvCalc = nitDV(base).toString();
      const nitFixed = `${base}-${dvCalc}`;
      const payload: ProviderSubmitPayload = {
        name: form.name.trim(),
        nit: nitFixed,
        phone: sanitizePhone(form.phone),
        email: form.email.trim(),
        contactName: form.contactName.trim(),
        status: form.status,
        categories: form.categories.slice(),
        rating: form.rating,
        imageFile: form.imageFile ?? null,
        imageUrl: form.imageUrl ?? null,
      };
      await onSave(payload);
      setSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
      alert("Ocurrió un error al guardar.");
    }
  }

  const availableOptions = DEFAULT_CATEGORIES.filter((c) => !form.categories.includes(c));

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form id="provider-form" onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-gray-700">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => update("name", sanitizeName(e.target.value))}
            onBlur={() => setErrors((er) => ({ ...er, name: validateName(form.name) }))}
            placeholder="Ingrese el nombre"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Nit</label>
          <input
            value={form.nit}
            onChange={(e) => update("nit", sanitizeNIT(e.target.value))}
            onBlur={() => {
              const s = sanitizeNIT(form.nit);
              const base = s.split("-")[0];
              const dvCalc = nitDV(base).toString();
              const fixed = `${base}-${dvCalc}`;
              update("nit", fixed);
              setErrors((er) => ({ ...er, nit: validateNITValue(fixed) }));
            }}
            placeholder="900123456-7"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.nit && <p className="mt-1 text-xs text-red-600">{errors.nit}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Teléfono</label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", sanitizePhone(e.target.value))}
            onBlur={() => setErrors((er) => ({ ...er, phone: validatePhone(form.phone) }))}
            placeholder="+57 3001234567"
            inputMode="tel"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => setErrors((er) => ({ ...er, email: validateEmail(form.email) }))}
            placeholder="correo@dominio.com"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700">Categorías</label>
          <div className="mt-1 flex items-center gap-2">
            <select
              value={form.categorySelect}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setForm((f) => {
                  if (f.categories.includes(v)) return { ...f, categorySelect: "" };
                  return { ...f, categories: [...f.categories, v], categorySelect: "" };
                });
                setErrors((er) => ({ ...er, categories: null }));
              }}
              disabled={availableOptions.length === 0 && form.categorySelect === ""}
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
            >
              <option value="">Selecciona una categoría</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {form.categories.includes(c) ? `✓ ${c} (agregada)` : c}
                </option>
              ))}
            </select>
          </div>
          {form.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.categories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs border">
                  {c}
                  <button type="button" onClick={() => removeCategory(c)} className="rounded-full p-0.5 hover:bg-gray-200">
                    <XIcon size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.categories && <p className="mt-1 text-xs text-red-600">{errors.categories}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Calificación</label>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
              const active = form.rating >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("rating", n)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") update("rating", Math.min(5, form.rating + 1));
                    if (e.key === "ArrowLeft") update("rating", Math.max(0, form.rating - 1));
                  }}
                  className="p-1"
                >
                  <Star size={18} className={active ? "text-yellow-500" : "text-gray-300"} strokeWidth={1.5} fill={active ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700">Imagen</label>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePickFile}
              className="h-10 w-10 rounded-md border flex items-center justify-center overflow-hidden"
              aria-label="Seleccionar imagen"
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center border-dashed text-gray-400">
                  <Upload size={16} />
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700">Nombre del contacto</label>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName", sanitizeContact(e.target.value))}
            onBlur={() => setErrors((er) => ({ ...er, contactName: validateContact(form.contactName) }))}
            placeholder="Nombre del contacto"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName}</p>}
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
