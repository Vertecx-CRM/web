import { Suspense } from "react";
import { createPageMetadata } from "@/lib/seo";
import LoginPage from "@/features/auth/login/login";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Iniciar sesion",
  description:
    "Inicia sesion en Vertecx Sistemas PC para gestionar tus servicios, solicitudes y compras tecnologicas.",
  path: "/auth/login",
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
