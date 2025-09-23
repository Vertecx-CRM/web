"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/authcontext";
import { useLoader } from "@/shared/components/loader";

type Props = { children: React.ReactNode; loginPath?: string };

export default function RequireAuth({ children, loginPath = "/auth/access" }: Props) {
  const { isAuthenticated, ready } = useAuth();
  const { showLoader } = useLoader();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      sessionStorage.setItem("__loader_min_until__", String(Date.now() + 200));
      showLoader();
      const to = `${loginPath}?next=${encodeURIComponent(pathname)}`;
      router.replace(to);
    }
  }, [ready, isAuthenticated, router, pathname, loginPath, showLoader]);

  if (!ready) {
    return <div className="w-full h-[40vh] grid place-items-center text-gray-500">Cargando…</div>;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
