"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/authcontext";
import Nav from "@/features/landing/layout/Nav";
import { showError } from "@/shared/utils/notifications";
import { routes } from "@/shared/routes";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = {
  email: string;
  password: string;
};

type FormTouched = {
  email: boolean;
  password: boolean;
};

const emptyErrors: FormErrors = { email: "", password: "" };
const emptyTouched: FormTouched = { email: false, password: false };

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);
  const [touched, setTouched] = useState<FormTouched>(emptyTouched);

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Lógica de Validación ---
  const validateEmail = (value: string) => {
    const v = value.trim();
    if (!v) return "El correo electrónico es obligatorio";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
    if (!ok) return "Ingresa un correo electrónico válido";
    return "";
  };

  const validatePassword = (value: string) => {
    const v = value.trim();
    if (!v) return "La contraseña es obligatoria";
    return "";
  };

  const validateField = (name: keyof FormState, value: string) => {
    if (name === "email") return validateEmail(value);
    if (name === "password") return validatePassword(value);
    return "";
  };

  const setField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const touchField = (name: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const nextErrors: FormErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    return !nextErrors.email && !nextErrors.password;
  };

  // --- Manejo de Envío ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const ok = validateAll();
    if (!ok) return;

    const next = searchParams.get("next");

    setLoading(true);
    const result = await login(form.email.trim(), form.password.trim(), next);
    setLoading(false);

    if (!result.ok) {
      showError(result.message || "Correo o contraseña incorrectos.");
      return;
    }

    if (!result.redirectTo) {
      showError("Tu rol no tiene acceso a ningún módulo disponible.");
      return;
    }

    router.replace(result.redirectTo);
  };

  const emailHasError = !!errors.email && touched.email;
  const passHasError = !!errors.password && touched.password;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-hidden text-black font-sans">
      <Nav />

      <div className="flex flex-col lg:flex-row flex-1 px-6 lg:px-20 items-center justify-center gap-12 lg:gap-24 max-w-7xl mx-auto w-full">
        {/* Columna Izquierda: Formulario Minimalista */}
        <div className="w-full lg:w-[45%] max-w-md flex flex-col justify-center py-10">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-[2px] bg-red-600"></span>
              <span className="text-red-600 font-bold tracking-[0.3em] text-[10px] uppercase">
                Acceso Autorizado
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-none">
              INICIAR <br /> <span className="text-red-600">SESIÓN.</span>
            </h2>
            <p className="text-gray-400 font-light text-sm max-w-xs">
              Bienvenido al portal técnico de Sistemas PC. Por favor,
              identifícate.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-8">
            {/* Input Email con estilo Industrial */}
            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Credencial de Correo
              </label>
              <input
                type="text"
                inputMode="email"
                className={`w-full h-12 px-0 bg-transparent border-b-2 outline-none transition-all duration-300 ${
                  emailHasError
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => touchField("email")}
                placeholder="usuario@sistemaspc.com"
                autoComplete="email"
              />
              {emailHasError && (
                <p className="absolute -bottom-5 text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Input Password */}
            <div className="relative group pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Contraseña de Seguridad
              </label>
              <div
                className={`flex items-center w-full border-b-2 transition-all duration-300 ${
                  passHasError
                    ? "border-red-600"
                    : "border-gray-100 focus-within:border-red-600"
                }`}
              >
                <input
                  type={show ? "text" : "password"}
                  className="flex-1 h-12 px-0 outline-none bg-transparent"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onBlur={() => touchField("password")}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="cursor-pointer px-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Image
                    src={show ? "/icons/eye-off.svg" : "/icons/Eye.svg"}
                    alt="Ver"
                    width={20}
                    height={20}
                    className={show ? "opacity-100" : "opacity-30"}
                  />
                </button>
              </div>
              {passHasError && (
                <p className="absolute -bottom-5 text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Botón de Entrada Industrial */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer   group relative w-full h-14 bg-black overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20"
              >
                <div
                  className={`absolute inset-0 bg-red-600 transition-transform duration-500 translate-y-full group-hover:translate-y-0 ${loading ? "translate-y-0" : ""}`}
                ></div>
                <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-xs">
                  {loading ? "VERIFICANDO..." : "AUTENTICAR"}
                </span>
              </button>
            </div>
          </form>

          {/* Footer del Formulario */}
          <div className="mt-12 flex flex-col gap-4">
            <Link
              href={routes.auth.forgotPassword}
              className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors inline-flex items-center gap-2"
            >
              <span className="w-4 h-[1px] bg-gray-200"></span> ¿Olvidaste tus
              credenciales?
            </Link>

            <p className="text-[10px] text-gray-400 font-medium tracking-tight">
              ¿SIN ACCESO AL SISTEMA?{" "}
              <Link
                href="/auth/register"
                className="text-black font-black hover:text-red-600 transition-colors underline underline-offset-4"
              >
                REGISTRAR NUEVA CUENTA
              </Link>
            </p>
          </div>
        </div>

        {/* Columna Derecha: Imagen Estructural */}
        <div className="hidden lg:flex w-[50%] justify-center relative group">
          {/* Decoración de fondo (Marco Industrial) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] border-l border-r border-gray-100 z-0"></div>

          <div className="relative z-10 w-full aspect-square max-w-[500px] grayscale hover:grayscale-0 transition-all duration-1000">
            <Image
              src="/assets/imgs/previewSinFondo.png"
              alt="Sistemas PC Hero"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Indicador de Version o Status Sutil */}
      <div className="absolute bottom-6 left-6 hidden md:block">
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">
          System Status: Online / v2.0.26
        </p>
      </div>
    </div>
  );
}
