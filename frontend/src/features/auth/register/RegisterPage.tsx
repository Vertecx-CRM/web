"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/authcontext";
import React, { useEffect, useRef, useState } from "react";
import AuthShell from "@/features/auth/layout/Authshell";
import Portal from "@/features/auth/Components/Portal";

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
type Props = { embedded?: boolean };

export default function RegisterPage({ embedded = false }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const { register } = useAuth();

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

  function handleTermsCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    if (checked && !form.terms) {
      e.preventDefault();
      setShowTerms(true);
    } else {
      update("terms", false);
    }
  }

  function onTermsScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setCanAcceptTerms(true);
  }

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

  const formEl = (
    <>
      <h1 className="mb-4 text-center text-xl font-semibold text-gray-800">Crear cuenta</h1>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit} noValidate>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-700">Tipo y número de documento</label>
          <div className="flex gap-2">
            <select
              value={form.docType}
              onChange={(e) => update("docType", e.target.value as DocType)}
              className="w-28 rounded-md border border-gray-300 bg-gray-100 px-2 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
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
              className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
            />
          </div>
          {!docOk && form.docNumber.length > 0 && <p className="mt-1 text-[11px] text-red-600">Ingresa un documento válido (4–20 caracteres).</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-700">Nombre completo</label>
          <input
            name="fullName"
            type="text"
            placeholder="Nombre Completo"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-700">Correo</label>
          <input
            name="email"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {!emailOk && form.email.length > 0 && <p className="mt-1 text-[11px] text-red-600">Correo inválido.</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-700">Teléfono</label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value.replace(/[^\d+]/g, ""))}
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
          />
          {!phoneOk && form.phone.length > 0 && <p className="mt-1 text-[11px] text-red-600">Ingresa un teléfono válido (7–15 dígitos).</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 pr-10 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:bg-gray-200"
            >
              {showPwd ? <img src="/icons/Eye.svg" className="h-4 w-4" /> : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
            </button>
          </div>
          {!passOk && form.password.length > 0 && <p className="mt-1 text-[11px] text-red-600">Mínimo 6 caracteres.</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-700">Confirmar contraseña</label>
          <div className="relative">
            <input
              name="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 pr-10 h-9 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/40"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:bg-gray-200"
            >
              {showConfirm ? <img src="/icons/Eye.svg" className="h-4 w-4" /> : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
            </button>
          </div>
          {!passwordsMatch && form.confirm.length > 0 && <p className="mt-1 text-[11px] text-red-600">Las contraseñas no coinciden.</p>}
        </div>

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
            className="text-xs text-[#CC0000]"
          >
            Leer términos
          </button>
        </div>

        {msg && <div className="md:col-span-2 rounded-md bg-red-50 p-2 text-xs text-red-700">{msg}</div>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="md:col-span-2 h-9 rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:bg-[#b30000] disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Acceder"}
        </button>

        <div className="md:col-span-2 mt-1 flex items-center justify-between text-xs">
          <span className="text-gray-600">¿Ya tienes una cuenta?</span>
          <Link href="/auth/login" className="text-[#CC0000]">Iniciar sesión</Link>
        </div>
      </form>

      {showTerms && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowTerms(false)}
          >
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-800">Términos y Condiciones de uso</h2>
                <button type="button" onClick={() => setShowTerms(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
              <div ref={scrollBoxRef} onScroll={onTermsScroll} className="max-h-[70vh] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-gray-700">
                {/* ...contenido... */}
                <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-white px-4 py-2 text-[11px] text-gray-500">
                  Desplázate hasta el final para habilitar “Aceptar y continuar”.
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                <button type="button" onClick={() => { update("terms", false); setShowTerms(false); }} className="h-9 rounded-md border px-3 text-sm text-gray-700">
                  Rechazar
                </button>
                <button
                  type="button"
                  disabled={!canAcceptTerms}
                  onClick={() => { update("terms", true); setShowTerms(false); }}
                  className={`h-9 rounded-md px-3 text-sm font-semibold text-white ${canAcceptTerms ? "bg-[#CC0000]" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  Aceptar y continuar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );

  if (embedded) return formEl;
  return <AuthShell formSide="left">{formEl}</AuthShell>;
}
