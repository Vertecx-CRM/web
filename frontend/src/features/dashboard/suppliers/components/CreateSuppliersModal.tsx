"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Upload } from "lucide-react";
import Modal from "@/features/dashboard/components/Modal";
import { showError, showSuccess, showWarning } from "@/shared/utils/notifications";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";

export type SupplierSubmitPayload = {
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  status: "Activo" | "Inactivo";
  rating: number;
  imageFile: File | null;
  imageUrl: string | null;
};

type SupplierForm = {
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  contactName: string;
  imageFile: File | null;
  imageUrl: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierSubmitPayload) => void | Promise<void>;
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
  imageFile: null,
  imageUrl: null,
};

// ─── Sanitizers ────────────────────────────────────────────────────────────────

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
/** Input permisivo: dígitos y un solo '-' (inclusive al final) */
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
/** Cálculo DV Colombia (DIAN) */
function nitDV(num: string) {
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const digits = num.split("").reverse().map((n) => parseInt(n, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += digits[i] * weights[i];
  const r = sum % 11;
  return r > 1 ? 11 - r : r;
}

// ─── Validación ────────────────────────────────────────────────────────────────

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
    if (!/^\d{5,12}$|^\d{5,12}-$|^\d{5,12}-\d$/.test(raw)) {
      return "Formato: base (5–12 dígitos) o base-DV (1 dígito).";
    }
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
    if (!s) return "Dirección requerida.";
    return null;
  },
  contactName: (v) => {
    const s = String(v ?? "").trim();
    if (s.length < 3) return "Mínimo 3 caracteres.";
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]+$/.test(s)) return "Solo letras y espacios.";
    return null;
  },
  rating: () => null,
  imageFile: () => null,
  imageUrl: () => null,
  // imagen obligatoria
  image: (file: File | null) => {
    if (!file) return "Imagen requerida.";
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
  for (const key of Object.keys(e) as (keyof ErrorMap)[]) {
    if (e[key]) return e[key] as string;
  }
  return null;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export default function CreateSuppliersModal({ isOpen, onClose, onSave, title = "Crear Proveedor" }: Props) {
  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isOpen]);

  const update = <K extends keyof SupplierForm>(k: K, v: SupplierForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validateField = (k: keyof SupplierForm | "image") => {
    const value = k === "image" ? form.imageFile : form[k as keyof SupplierForm];
    const msg = validators[k](value as any, form);
    setErrors((er) => ({ ...er, [k]: msg }));
    return msg;
  };

  function handlePickFile() {
    fileRef.current?.click();
  }

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

    // Validación NIT base-DV (colombiano)
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

    // Subir imagen a Cloudinary y usar secure_url
    const imgErr = validators.image(form.imageFile, form);
    if (imgErr) {
      setErrors((er) => ({ ...er, image: imgErr }));
      showError(imgErr);
      return;
    }

    try {
      setSaving(true);

      let finalImageUrl: string | null = form.imageUrl;
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
        status: "Activo",
        rating: form.rating,
        imageFile: null,
        imageUrl: finalImageUrl ?? null,
      };

      await onSave(payload);
      showSuccess("Proveedor creado correctamente.");
      setForm(initialForm);
      setErrors({});
      if (fileRef.current) fileRef.current.value = "";
      setSaving(false);
      onClose();
    } catch (err: any) {
      setSaving(false);
      showError(err?.message || "No se pudo crear el proveedor.");
    }
  }

  const footer = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          setForm(initialForm);
          setErrors({});
          if (fileRef.current) fileRef.current.value = "";
          onClose();
        }}
        className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={() => formRef.current?.requestSubmit()}
        disabled={saving}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} footer={footer}>
      <form ref={formRef} id="supplier-form" onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
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

        <div>
          <label className="block text-sm text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => validateField("email")}
            placeholder="correo@dominio.com"
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
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
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              onBlur={() => validateField("image")}
            />
          </div>
          {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
        </div>
      </form>
    </Modal>
  );
}
