"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { routes } from "@/shared/routes";
import { showError, showSuccess } from "@/shared/utils/notifications";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showError("El correo es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      showSuccess(
        "Si el correo existe en nuestro sistema, te enviaremos un enlace para restablecer tu contraseña."
      );
      setEmail("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "No se pudo procesar la solicitud. Intenta de nuevo.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-16 w-16 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <Image
                src="/assets/imgs/preview.png"
                alt="Logo Vertecx"
                fill
                className="object-contain p-1 rounded-2xl"
                priority
              />
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="p-6">
            <label className="block text-sm font-medium text-neutral-800 mb-2">
              Correo electrónico
            </label>

            <div className="relative">
              <input
                type="email"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition
                           focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition
                         hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:hover:bg-red-600"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

          </form>

          <div className="border-t border-neutral-200 px-6 py-4 text-center">
            <Link
              href={routes.auth.login}
              className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Vertecx
        </p>
      </div>
    </div>
  );
}
