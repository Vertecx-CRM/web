import Home from "@/features/landing/Home/Home";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Vertecx - Soporte tecnico empresarial en Colombia",
  description:
    "Vertecx brinda soporte tecnico empresarial, mantenimiento preventivo y correctivo, redes, servidores, hardware y soluciones tecnologicas en Colombia.",
  path: "/",
});

export default function page() {
  return <Home />;
}
