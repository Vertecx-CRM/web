"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/authcontext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!user) {
      const next = pathname + (search?.toString() ? `?${search}` : "");
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, pathname, search, router]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Cargando…
      </div>
    );
  }

  return <>{children}</>;
}
