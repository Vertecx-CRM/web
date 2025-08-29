"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "@/features/auth/login/login.module.css";
import { useAuth } from "@/features/auth/authcontext";
import Nav from "@/features/landing/layout/Nav";

type FormState = { email: string; password: string; remember: boolean };

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ email: "", password: "", remember: false });

  const next = search.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await login(form.email, form.password);
    setLoading(false);

    if (!res.ok) {
      setMsg(res.message || "No se pudo iniciar sesión");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
<div className={styles.root}>
      <Nav />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-xl shadow-lg lg:grid-cols-2">
          {/* Izquierda branding */}
          <div className="relative hidden bg-[#CC0000] p-10 text-white lg:flex lg:flex-col lg:justify-center">
            <div className="absolute inset-x-0 bottom-0 h-10 bg-black/10 blur-2xl" />
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight">SistemasPc</h2>
            <p className="max-w-xs text-red-50">20 años conectando tu mundo</p>
          </div>

          {/* Derecha: formulario */}
          <div className="bg-white p-8">
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
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
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
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 pr-10 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-md text-gray-500 hover:bg-gray-200"
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? "🙈" : "👁️"}
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
                className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Accediendo..." : "Acceder"}
              </button>

              <div className="mt-2 flex items-center justify-between text-xs text-red-600">
                <Link href="#" className="hover:underline">¿Olvidaste tu contraseña?</Link>
                <Link href="#" className="hover:underline">Crear Cuenta</Link>
              </div>

              <div className="pt-2 text-xs text-gray-500">
                <p><strong>Demo:</strong> <code>admin@sistemaspc.com</code> / <code>123456</code></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/* Si usas CSS Module: </div> */}
    </div>
  );
}
