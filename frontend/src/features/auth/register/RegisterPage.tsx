"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "@/features/auth/login/auth.module.css"; // <-- tu ruta
import { useAuth } from "@/features/auth/authcontext";
import Nav from "@/features/landing/layout/Nav";

type DocType = "CC" | "CE" | "TI" | "PPT";
type FormState = {
  docType: DocType;
  docNumber: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  terms: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const { register } = useAuth();

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    docType: "CC",
    docNumber: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const passwordsMatch = form.password === form.confirm;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneOk = /^[0-9]{7,15}$/.test(form.phone.replace(/\D/g, ""));
  const docOk = /^[A-Za-z0-9.-]{4,20}$/.test(form.docNumber.trim());
  const passOk = form.password.length >= 6;

  const canSubmit =
    form.fullName.trim().length >= 3 &&
    emailOk &&
    phoneOk &&
    docOk &&
    passOk &&
    passwordsMatch &&
    form.terms &&
    !loading;

  function update<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!passwordsMatch) return setMsg("Las contraseñas no coinciden");
    if (!form.terms) return setMsg("Debes aceptar los términos y condiciones");

    try {
      setLoading(true);
      const res = await register({
        docType: form.docType,
        docNumber: form.docNumber.trim(),
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setLoading(false);

      if (!res?.ok) return setMsg(res?.message || "No se pudo crear la cuenta");

      router.replace(next);
      router.refresh();
    } catch {
      setLoading(false);
      setMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
    }
  }

  return (
    <div className={styles.root}>
      <Nav />

      <div className="flex flex-1 items-center justify-center px-3 py-6">
        <div
          className="
            grid w-full max-w-3xl overflow-hidden rounded-xl shadow-lg
            lg:grid-cols-2
            max-h-[calc(100dvh-140px)] overflow-auto
          "
        >
          {/* Izquierda: branding (compacto) */}
          <div className="relative hidden bg-[#CC0000] p-8 text-white lg:flex lg:flex-col lg:items-center lg:justify-center text-center">
            <div className="absolute inset-x-0 bottom-0 h-10 bg-black/10 blur-2xl" />
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
              SistemasPc
            </h2>
            <p className="max-w-xs text-red-50 text-sm">
              20 años conectando tu mundo
            </p>
          </div>

          {/* Derecha: formulario compacto en 2 columnas */}
          <div className="bg-white p-6">
            <h1 className="mb-4 text-center text-xl font-semibold text-gray-800">
              Crear cuenta
            </h1>

            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={onSubmit}
              noValidate
            >
              {/* Tipo + Número de documento (full width) */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Tipo y número de documento
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.docType}
                    onChange={(e) =>
                      update("docType", e.target.value as DocType)
                    }
                    className="w-28 rounded-md border border-gray-300 bg-gray-100 px-2 h-9 text-sm shadow-sm
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
                    <option value="NIT">NIT</option>
                    <option value="PP">PP</option>
                  </select>

                  <input
                    name="docNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="Número Documento"
                    value={form.docNumber}
                    onChange={(e) => update("docNumber", e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                  />
                </div>
                {!docOk && form.docNumber.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Ingresa un documento válido (4–20 caracteres).
                  </p>
                )}
              </div>

              {/* Nombre (FULL WIDTH) */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Nombre completo
                </label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Nombre Completo"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm
                 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                />
              </div>

              {/* Correo (FULL WIDTH) */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Correo
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Correo"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm
                 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {!emailOk && form.email.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Correo inválido.
                  </p>
                )}
              </div>

              {/* Teléfono (full o puedes dejarlo a 1 col si quieres más compacto) */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value.replace(/[^\d+]/g, ""))
                  }
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm
                 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {!phoneOk && form.phone.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Ingresa un teléfono válido (7–15 dígitos).
                  </p>
                )}
              </div>

              {/* Contraseña (col izquierda) */}
              <div>
                <label className="mb-1 block text-xs text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 pr-10 h-9 text-sm shadow-sm
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:bg-gray-200"
                    aria-label={
                      showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    title={
                      showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPwd ? <img src="/icons/Eye.svg" className="h-4 w-4" /> : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
                  </button>
                </div>
                {!passOk && form.password.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Mínimo 6 caracteres.
                  </p>
                )}
              </div>

              {/* Confirmar (col derecha) */}
              <div>
                <label className="mb-1 block text-xs text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 pr-10 h-9 text-sm shadow-sm
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:bg-gray-200"
                    aria-label={
                      showConfirm
                        ? "Ocultar confirmación"
                        : "Mostrar confirmación"
                    }
                    title={
                      showConfirm
                        ? "Ocultar confirmación"
                        : "Mostrar confirmación"
                    }
                  >
                    {showConfirm ? <img src="/icons/Eye.svg" className="h-4 w-4" /> : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
                  </button>
                </div>
                {!passwordsMatch && form.confirm.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>

              {/* Términos */}
              <label className="md:col-span-2 flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]"
                  checked={form.terms}
                  onChange={(e) => update("terms", e.target.checked)}
                />
                Acepto términos y condiciones
              </label>

              {/* Mensajes */}
              {msg && (
                <div className="md:col-span-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                  {msg}
                </div>
              )}

              {/* Botón principal */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="md:col-span-2 h-9 rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm
               hover:bg-[#b30000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40
               disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Acceder"}
              </button>

              {/* Enlaces inferiores */}
              <div className="md:col-span-2 mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-600">¿Ya tienes una cuenta?</span>
                <Link
                  href="/auth/login"
                  className="text-[#CC0000] hover:underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
