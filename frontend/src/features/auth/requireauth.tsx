"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/authcontext";

type Props = { children: React.ReactNode; loginPath?: string };

export default function RequireAuth({ children, loginPath = "/auth/login" }: Props) {
  const { isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Espera a que cargue desde localStorage
    if (!ready) return;
    if (!isAuthenticated) {
      // opcional: preservar a dónde quería ir
      const to = `${loginPath}?next=${encodeURIComponent(pathname)}`;
      router.replace(to);
    }
  }, [ready, isAuthenticated, router, pathname, loginPath]);

  // Mientras no esté listo, no renders nada (o muestra un loader estable)
  if (!ready) {
    return (
      <div className="w-full h-[40vh] grid place-items-center text-gray-500">
        Cargando…
      </div>
    );
  }

  // Ya listo: si no autenticado, no renderizamos la página protegida
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
