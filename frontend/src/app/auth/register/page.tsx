import { createPageMetadata } from "@/lib/seo";
import RegisterPage from "@/features/auth/register/RegisterPage";

export const metadata = createPageMetadata({
  title: "Crear cuenta",
  description:
    "Crea tu cuenta en Vertecx Sistemas PC para solicitar soporte tecnico, registrar servicios y comprar productos tecnologicos.",
  path: "/auth/register",
});

export default function Page() {
  return <RegisterPage />;
}
