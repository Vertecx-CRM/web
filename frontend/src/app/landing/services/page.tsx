import React from "react";

import ServicesLanding from "@/features/landing/services/services";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Servicios de soporte tecnico y mantenimiento",
  description:
    "Servicios Vertecx de mantenimiento preventivo, mantenimiento correctivo, instalacion, redes, servidores y soporte tecnico para empresas.",
  path: "/landing/services",
  image: "/assets/imgs/services/bannerservices.jpg",
});

export default function ServicesPage() {
  return <ServicesLanding />;
}
