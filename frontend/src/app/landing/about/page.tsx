import About from "@/features/landing/about/about";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Nosotros",
  description:
    "Conoce la trayectoria de Vertecx y Sistemas PC en soporte tecnico, mantenimiento, redes e infraestructura tecnologica para empresas.",
  path: "/landing/about",
  image: "/assets/imgs/about.png",
});

export default function AboutPage() {
    return <About />;
}
