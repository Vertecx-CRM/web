"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthShell from "@/features/auth/layout/Authshell";
import LoginForm from "@/features/auth/login/login";
import RegisterForm from "@/features/auth/register/RegisterPage";
import { routes } from "@/shared/routes";
import { useLoader } from "@/shared/components/loader";

const spring = { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 };
const swap = {
  initial: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: spring },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0, transition: { duration: 0.18 } }),
};

export default function AccessPage() {
  const { hideLoader } = useLoader();

  useEffect(() => { hideLoader(); }, [hideLoader]);

  const [mode, setMode] = useState<"login" | "register">(() => {
    if (typeof window === "undefined") return "login";
    const p = new URLSearchParams(window.location.search).get("mode");
    return (p === "register" || p === "login") ? p : "login";
  });

  const [dir, setDir] = useState(1);
  const key = useMemo(() => (mode === "login" ? "login" : "register"), [mode]);
  const formSide = mode === "login" ? "right" : "left";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get("mode") || "login";
    if (current !== mode) {
      url.searchParams.set("mode", mode);
      window.history.replaceState(null, "", url.toString());
    }
  }, [mode]);

  function go(next: "login" | "register") {
    setDir(mode === "login" && next === "register" ? 1 : -1);
    setMode(next);
  }

  return (
    <>
      <Link
        href={routes.path}
        className="fixed left-6 top-6 z-30 inline-flex h-9 items-center rounded-md bg-white/85 px-3 text-sm shadow backdrop-blur hover:bg-white"
      >
        ← Volver
      </Link>

      <AuthShell formSide={formSide}>
        <div className="mb-3 flex items-center justify-end">
          <div className="flex gap-2 rounded-md bg-black/5 px-1 py-1">
            <button
              onClick={() => go("login")}
              aria-pressed={mode === "login"}
              className={`h-8 rounded-md px-3 text-sm transition ${mode === "login" ? "bg-white shadow" : "text-gray-700 hover:bg-white/70"}`}
            >
              Ingresar
            </button>
            <button
              onClick={() => go("register")}
              aria-pressed={mode === "register"}
              className={`h-8 rounded-md px-3 text-sm transition ${mode === "register" ? "bg-white shadow" : "text-gray-700 hover:bg-white/70"}`}
            >
              Registrarse
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === "login" ? (
            <motion.div key={key} custom={dir} variants={swap} initial="initial" animate="animate" exit="exit">
              <LoginForm embedded />
            </motion.div>
          ) : (
            <motion.div key={key} custom={dir} variants={swap} initial="initial" animate="animate" exit="exit">
              <RegisterForm embedded />
            </motion.div>
          )}
        </AnimatePresence>
      </AuthShell>
    </>
  );
}
