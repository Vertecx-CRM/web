import Contact from "@/features/landing/contact/contact";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contacto y soporte tecnico",
  description:
    "Contacta a Vertecx para soporte tecnico, cotizaciones, mantenimiento preventivo, mantenimiento correctivo e instalacion de soluciones tecnologicas.",
  path: "/landing/contact",
});

export default function ContactPage() {
  return <Contact />;
}
