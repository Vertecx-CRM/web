"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/features/landing/components/PublicNavbar";

export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-login-red with-circuit-pattern">
      {/* Navbar pública */}
      <PublicNavbar />

      {/* Contenido */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        {/* Tarjeta dividida grande */}
        <div className="grid w-full max-w-6xl overflow-hidden rounded-xl shadow-xl lg:grid-cols-2">
          {/* Izquierda: branding */}
          <div
            className="relative hidden p-14 text-white lg:flex lg:flex-col lg:justify-center"
            style={{ backgroundColor: "#CC0000" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-12 bg-black/10 blur-2xl" />
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight">
              SistemasPc
            </h2>
            <p className="max-w-sm text-red-50 text-lg">
              20 años conectando tu mundo
            </p>
          </div>

          {/* Derecha: formulario */}
          <div className="bg-white p-12">
            <h1 className="mb-8 text-center text-3xl font-semibold text-gray-800">
              Iniciar sesión
            </h1>

            <form className="space-y-6">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Correo</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Correo"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-3 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
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
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-3 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
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
                />
                Recuérdame
              </label>

              <button
                type="submit"
                className="w-full rounded-md bg-red-600 px-3 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Acceder
              </button>

              <div className="mt-2 flex items-center justify-between text-sm text-red-600">
                <Link href="#" className="hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link href="#" className="hover:underline">
                  Crear Cuenta
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
