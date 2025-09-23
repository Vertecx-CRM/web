"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/authcontext";
import { routes } from "@/shared/routes";
import { useLoader, LoaderGate } from "@/shared/components/loader";
import AuthShell from "@/features/auth/layout/Authshell";

type FormState = { email: string; password: string; remember: boolean };
type Props = { embedded?: boolean };

export default function LoginPage({ embedded = false }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ email: "", password: "", remember: false });
  const next = search.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    showLoader();
    try {
      const res = await login(form.email, form.password);
      if (!res.ok) {
        setMsg(res.message || "No se pudo iniciar sesión");
        hideLoader();
        setLoading(false);
        return;
      }
      router.replace(next);
    } catch {
      setMsg("Ocurrió un error inesperado");
      hideLoader();
      setLoading(false);
    }
  }

  const formEl = (
    <>
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Iniciar sesión</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Correo</label>
          <input
            name="email"
            type="email"
            required
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 pr-10 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-md text-gray-500 hover:bg-gray-200"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <img src="/icons/Eye.svg" className="h-4 w-4" /> : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            checked={form.remember}
            onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
          />
          Recuérdame
        </label>
        {msg && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{msg}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Accediendo..." : "Acceder"}
        </button>
        <div className="mt-2 flex items-center justify-between text-xs text-red-600">
          <Link href="#">¿Olvidaste tu contraseña?</Link>
          <Link href={routes.auth.register}>Crear Cuenta</Link>
        </div>
        <div className="pt-2 text-xs text-gray-500">
          <p>
            <strong>Demo:</strong> <code>admin@sistemaspc.com</code> / <code>123456</code>
          </p>
        </div>
      </form>
    </>
  );

  if (embedded) return formEl;
  return (
    <>
      <LoaderGate />
      <AuthShell formSide="right">{formEl}</AuthShell>
    </>
  );
}
