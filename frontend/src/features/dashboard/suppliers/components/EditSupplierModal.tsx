"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Upload } from "lucide-react";
import Modal from "@/features/dashboard/components/Modal";
import type { SupplierSubmitPayload } from "@/features/dashboard/suppliers/components/CreateSuppliersModal";
import { showError, showSuccess, showWarning } from "@/shared/utils/notifications";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";

type SupplierForm = {
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  contactName: string;
  status: "Activo" | "Inactivo";
  imageFile: File | null;
  imageUrl: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierSubmitPayload) => void | Promise<void>;
  supplier: SupplierSubmitPayload | null;
  title?: string;
};

const MAX_IMG_MB = 2;

const initialForm: SupplierForm = {
  name: "",
  nit: "",
  phone: "",
  email: "",
  address: "",
  rating: 0,
  contactName: "",
  status: "Activo",
  imageFile: null,
  imageUrl: null,
};

function sanitizeName(v: string) {
  return v.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ'’.\- ]/g, "").replace(/\s{2,}/g, " ").slice(0, 80);
}
function sanitizeContact(v: string) {
  return v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]/g, "").replace(/\s{2,}/g, " ").slice(0, 80);
}
function sanitizePhone(v: string) {
  let s = v.replace(/[^\d+]/g, "");
  if (s.includes("+")) s = "+" + s.replace(/\+/g, "");
  if (s.startsWith("+")) s = "+" + s.slice(1).replace(/[^\d]/g, "");
  return s.slice(0, 16);
}
function sanitizeRating(v: string | number) {
  const n = typeof v === "number" ? v : parseFloat(v || "0");
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n * 10) / 10));
}
function sanitizeNITInput(v: string) {
  let s = String(v ?? "").replace(/[^\d-]/g, "");
  s = s.replace(/^-+/, "");
  s = s.replace(/-{2,}/g, "-");
  const parts = s.split("-");
  const base = (parts[0] || "").replace(/\D/g, "").slice(0, 12);
  if (s.endsWith("-") && parts.length === 2 && parts[1] === "") return `${base}-`;
  const dv = (parts[1] || "").replace(/\D/g, "").slice(0, 1);
  return parts.length > 1 ? `${base}-${dv}` : base;
}
function nitDV(num: string) {
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const digits = num.split("").reverse().map((n) => parseInt(n, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += digits[i] * weights[i];
  const r = sum % 11;
  return r > 1 ? 11 - r : r;
}

type ErrorMap = Partial<Record<keyof SupplierForm | "image", string | null>>;

const validators: Record<keyof SupplierForm | "image", (value: any, form: SupplierForm) => string | null> = {
  name: (v) => {
    const s = String(v ?? "").trim();
    if (s.length < 3) return "Mínimo 3 caracteres.";
    if (!/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ'’.\- ]+$/.test(s)) return "Solo letras, números y espacios.";
    return null;
  },
  nit: (v) => {
    const raw = String(v ?? "").replace(/[^\d-]/g, "");
    if (!/^\d{5,12}$|^\d{5,12}-$|^\d{5,12}-\d$/.test(raw)) return "Formato: base (5–12 dígitos) o base-DV (1 dígito).";
    if (raw.includes("-") && !raw.endsWith("-")) {
      const [base, dv] = raw.split("-");
      const expected = nitDV(base).toString();
      if (dv !== expected) return `DV inválido, debería ser ${expected}.`;
    }
    return null;
  },
  phone: (v) => {
    const s = String(v ?? "").replace(/[^\d+]/g, "");
    const digits = s.startsWith("+") ? s.slice(1) : s;
    if (digits.length < 7 || digits.length > 15) return "7–15 dígitos.";
    if (!/^\+?\d+$/.test(s)) return "Solo números.";
    return null;
  },
  email: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "Correo requerido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Correo inválido.";
    return null;
  },
  address: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "Campo obligatorio.";
    return null;
  },
  contactName: (v) => {
    const s = String(v ?? "").trim();
    if (s.length < 3) return "Mínimo 3 caracteres.";
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]+$/.test(s)) return "Solo letras y espacios.";
    return null;
  },
  status: () => null,
  rating: () => null,
  imageFile: () => null,
  imageUrl: () => null,
  image: (file: File | null) => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) return "Archivo no es una imagen.";
    if (file.size > MAX_IMG_MB * 1024 * 1024) return `Máx ${MAX_IMG_MB}MB.`;
    return null;
  },
};

function validateAllFields(form: SupplierForm): ErrorMap {
  const e: ErrorMap = {};
  e.name = validators.name(form.name, form);
  e.nit = validators.nit(form.nit, form);
  e.phone = validators.phone(form.phone, form);
  e.email = validators.email(form.email, form);
  e.address = validators.address(form.address, form);
  e.contactName = validators.contactName(form.contactName, form);
  e.image = validators.image(form.imageFile, form);
  return e;
}

function firstError(e: ErrorMap): string | null {
  for (const k of Object.keys(e) as (keyof ErrorMap)[]) {
    if (e[k]) return e[k] as string;
  }
  return null;
}

export default function EditSupplierModal({ isOpen, onClose, onSave, supplier, title = "Editar Proveedor" }: Props) {
  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [loadedFromProp, setLoadedFromProp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (saving) return;
    if (supplier && !loadedFromProp) {
      setForm({
        name: supplier.name ?? "",
        nit: supplier.nit ?? "",
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        address: supplier.address ?? "",
        rating: supplier.rating ?? 0,
        contactName: supplier.contactName ?? "",
        status: supplier.status ?? "Activo",
        imageFile: null,
        imageUrl: supplier.imageUrl ?? null,
      });
      setLoadedFromProp(true);
    }
  }, [isOpen, supplier, saving]);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
      setLoadedFromProp(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isOpen]);

  const update = <K extends keyof SupplierForm>(k: K, v: SupplierForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validateField = (k: keyof SupplierForm | "image") => {
    const value = k === "image" ? form.imageFile : form[k as keyof SupplierForm];
    const msg = validators[k](value as any, form);
    setErrors((er) => ({ ...er, [k]: msg }));
    return msg;
  };

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    const err = validators.image(file, form);
    setErrors((er) => ({ ...er, image: err }));
    if (err) {
      showError(err);
      return;
    }
    update("imageFile", file);
    update("imageUrl", file ? URL.createObjectURL(file) : null);
  }

  function validateAll() {
    const e = validateAllFields(form);
    setErrors(e);
    const bad = firstError(e);
    if (bad) showWarning(bad);
    return !bad;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validateAll()) return;

    const raw = String(form.nit ?? "").replace(/[^\d-]/g, "");
    if (!/^\d{5,12}-\d$/.test(raw)) {
      showError("NIT inválido. Usa formato: base (5–12 dígitos) + '-' + DV.");
      setErrors((er) => ({ ...er, nit: "Usa formato base-DV." }));
      return;
    }
    const [base, dv] = raw.split("-");
    const expected = nitDV(base).toString();
    if (dv !== expected) {
      showError(`DV inválido. El DV correcto para ${base} es ${expected}.`);
      setErrors((er) => ({ ...er, nit: `DV inválido. Debe ser ${expected}.` }));
      return;
    }

    try {
      setSaving(true);
      let finalImageUrl = form.imageUrl ?? null;
      if (form.imageFile) {
        finalImageUrl = await uploadImageToCloudinary(form.imageFile);
      }
      const payload: SupplierSubmitPayload = {
        name: form.name.trim(),
        nit: `${base}-${dv}`,
        phone: sanitizePhone(form.phone),
        email: form.email.trim(),
        address: form.address.trim(),
        contactName: form.contactName.trim(),
        status: form.status,
        rating: sanitizeRating(form.rating),
        imageFile: null,
        imageUrl: finalImageUrl,
      };
      await onSave(payload);
      showSuccess("Proveedor actualizado correctamente.");
      setSaving(false);
      onClose();
    } catch (err: any) {
      setSaving(false);
      showError(err?.message || "Ocurrió un error al guardar.");
    }
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form id="supplier-form" onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-gray-700">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => update("name", sanitizeName(e.target.value))}
            onBlur={() => validateField("name")}
            placeholder="Ingrese el nombre"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">NIT</label>
          <input
            value={form.nit}
            onChange={(e) => update("nit", sanitizeNITInput(e.target.value))}
            onBlur={() => validateField("nit")}
            placeholder="900123456-7"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.nit && <p className="mt-1 text-xs text-red-600">{errors.nit}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Dirección</label>
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            onBlur={() => validateField("address")}
            placeholder="Calle 123 #45-67"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Nombre del contacto</label>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName", sanitizeContact(e.target.value))}
            onBlur={() => validateField("contactName")}
            placeholder="Nombre del contacto"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-700">Teléfono</label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", sanitizePhone(e.target.value))}
            onBlur={() => validateField("phone")}
            placeholder="+57 3001234567"
            inputMode="tel"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700">Estado</label>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "Activo"} onChange={() => update("status", "Activo")} />
              Activo
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="status" checked={form.status === "Inactivo"} onChange={() => update("status", "Inactivo")} />
              Inactivo
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700">Calificación</label>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
                const active = form.rating >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update("rating", n)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") update("rating", sanitizeRating(form.rating + 0.5));
                      if (e.key === "ArrowLeft") update("rating", sanitizeRating(form.rating - 0.5));
                    }}
                    className="p-1"
                  >
                    <Star size={18} className={active ? "text-yellow-500" : "text-gray-300"} strokeWidth={1.5} fill={active ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={form.rating}
              onChange={(e) => update("rating", sanitizeRating(e.target.value))}
              className="h-9 w-24 rounded-md border border-gray-300 bg-gray-100 px-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
            />
            <span className="text-xs text-gray-500">0.0–5.0</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700">Imagen</label>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-10 w-10 rounded-md border flex items-center justify-center overflow-hidden"
              aria-label="Seleccionar imagen"
            >
              {form.imageUrl ? <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center border-dashed text-gray-400"><Upload size={16} /></div>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} onBlur={() => validateField("image")} />
          </div>
          {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
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
