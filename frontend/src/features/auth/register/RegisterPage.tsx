"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/authcontext";
import Nav from "@/features/landing/layout/Nav";
import styles from "@/features/auth/login/auth.module.css";
import React, { useEffect, useRef, useState } from "react";

type DocType = "CC" | "CE" | "TI" | "PP";

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

  // --- Modal de términos ---
  const [showTerms, setShowTerms] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

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

  // Abre el modal cuando intentan marcar la casilla
  function handleTermsCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    if (checked && !form.terms) {
      e.preventDefault();
      setShowTerms(true);
    } else {
      update("terms", false);
    }
  }

  // Habilita "Aceptar y continuar" al llegar al final del scroll
  function onTermsScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setCanAcceptTerms(true);
  }

  // Bloquea scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showTerms) {
      document.body.style.overflow = "hidden";
      setCanAcceptTerms(false);
      requestAnimationFrame(() => {
        if (scrollBoxRef.current) scrollBoxRef.current.scrollTop = 0;
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showTerms]);

  // Cerrar modal con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowTerms(false);
    }
    if (showTerms) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showTerms]);

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
          {/* Izquierda: branding */}
          <div className="relative hidden bg-[#CC0000] p-8 text-white lg:flex lg:flex-col lg:items-center lg:justify-center text-center">
            <div className="absolute inset-x-0 bottom-0 h-10 bg-black/10 blur-2xl" />
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
              SistemasPc
            </h2>
            <p className="max-w-xs text-red-50 text-sm">
              20 años conectando tu mundo
            </p>
          </div>

          {/* Derecha: formulario */}
          <div className="bg-white p-6">
            <h1 className="mb-4 text-center text-xl font-semibold text-gray-800">
              Crear cuenta
            </h1>

            <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit} noValidate>
              {/* Tipo + Número de documento */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Tipo y número de documento
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.docType}
                    onChange={(e) => update("docType", e.target.value as DocType)}
                    className="w-28 rounded-md border border-gray-300 bg-gray-100 px-2 h-9 text-sm shadow-sm
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
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

              {/* Nombre */}
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

              {/* Correo */}
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
                  <p className="mt-1 text-[11px] text-red-600">Correo inválido.</p>
                )}
              </div>

              {/* Teléfono */}
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
                  onChange={(e) => update("phone", e.target.value.replace(/[^\d+]/g, ""))}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm
                 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {!phoneOk && form.phone.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Ingresa un teléfono válido (7–15 dígitos).
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="mb-1 block text-xs text-gray-700">Contraseña</label>
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
                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPwd ? (
                      <img src="/icons/Eye.svg" className="h-4 w-4" />
                    ) : (
                      <img src="/icons/eye-off.svg" className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!passOk && form.password.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">Mínimo 6 caracteres.</p>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <label className="mb-1 block text-xs text-gray-700">Confirmar contraseña</label>
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
                    aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                    title={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                  >
                    {showConfirm ? (
                      <img src="/icons/Eye.svg" className="h-4 w-4" />
                    ) : (
                      <img src="/icons/eye-off.svg" className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!passwordsMatch && form.confirm.length > 0 && (
                  <p className="mt-1 text-[11px] text-red-600">Las contraseñas no coinciden.</p>
                )}
              </div>

              {/* Términos */}
              <div className="md:col-span-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]"
                    checked={form.terms}
                    onChange={handleTermsCheckbox}
                  />
                  Acepto términos y condiciones
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTerms(true);
                  }}
                  className="text-xs text-[#CC0000] hover:underline"
                >
                  Leer términos
                </button>
              </div>

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
                <Link href="/auth/login" className="text-[#CC0000] hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ======= Modal de Términos ======= */}
      {showTerms && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          aria-labelledby="terms-title"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 id="terms-title" className="text-sm font-semibold text-gray-800">
                Términos y Condiciones de uso
              </h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollBoxRef}
              onScroll={onTermsScroll}
              className="max-h-[70vh] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-gray-700"
            >
              {/* --- Contenido simulado de términos --- */}
              <p className="mb-2">
                Bienvenido/a a <strong>SistemasPc</strong>. Estos Términos y Condiciones regulan
                el uso de nuestros servicios. Al crear una cuenta, aceptas cumplirlos.
              </p>
              <h3 className="mt-3 font-semibold">1. Cuenta y seguridad</h3>
              <p>
                Eres responsable de mantener la confidencialidad de tus credenciales y de todas
                las actividades realizadas desde tu cuenta.
              </p>
              <h3 className="mt-3 font-semibold">2. Uso aceptable</h3>
              <p>
                Te comprometes a no utilizar la plataforma para fines ilícitos, a respetar los
                derechos de terceros y a cumplir la normativa aplicable.
              </p>
              <h3 className="mt-3 font-semibold">3. Datos personales</h3>
              <p>
                Tratamos tus datos conforme a nuestra Política de Privacidad. Puedes ejercer tus
                derechos de acceso, rectificación y supresión según corresponda.
              </p>
              <h3 className="mt-3 font-semibold">4. Disponibilidad del servicio</h3>
              <p>
                Hacemos esfuerzos razonables para mantener el servicio disponible; no garantizamos
                disponibilidad ininterrumpida ni ausencia de errores.
              </p>
              <h3 className="mt-3 font-semibold">5. Limitación de responsabilidad</h3>
              <p>
                En la medida permitida por la ley, no seremos responsables por pérdidas indirectas
                o consecuentes derivadas del uso del servicio.
              </p>
              <h3 className="mt-3 font-semibold">6. Modificaciones</h3>
              <p>
                Podemos actualizar estos términos. Las modificaciones serán comunicadas por los
                canales habituales y entrarán en vigor desde su publicación.
              </p>
              <h3 className="mt-3 font-semibold">7. Contacto</h3>
              <p className="mb-8">
                Para dudas sobre estos términos, contáctanos a soporte@sistemaspc.co.
              </p>

              {/* Indicador para el usuario */}
              <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-white px-4 py-2 text-[11px] text-gray-500">
                Desplázate hasta el final para habilitar “Aceptar y continuar”.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  update("terms", false);
                  setShowTerms(false);
                }}
                className="h-9 rounded-md border px-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Rechazar
              </button>
              <button
                type="button"
                disabled={!canAcceptTerms}
                onClick={() => {
                  update("terms", true);
                  setShowTerms(false);
                }}
                className={`h-9 rounded-md px-3 text-sm font-semibold text-white shadow-sm
                  ${canAcceptTerms ? "bg-[#CC0000] hover:bg-[#b30000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Aceptar y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
