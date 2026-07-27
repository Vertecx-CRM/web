import { absoluteUrl, SITE_LEGAL_NAME, SITE_NAME } from "@/lib/seo";

export type SeoServicePage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  heroTitle: string;
  summary: string;
  keywords: string[];
  services: string[];
  industries: string[];
  cities: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const seoServicePages: SeoServicePage[] = [
  {
    slug: "soporte-tecnico-empresarial-colombia",
    title: "Soporte tecnico empresarial en Colombia",
    eyebrow: "Soporte tecnico empresarial",
    description:
      "Servicio de soporte tecnico empresarial en Colombia para computadores, servidores, redes, impresoras, camaras y continuidad operativa.",
    heroTitle: "SOPORTE TECNICO EMPRESARIAL EN COLOMBIA",
    summary:
      "Atendemos empresas que necesitan respuestas rapidas, mantenimiento confiable y soporte tecnico para mantener operativa su infraestructura tecnologica.",
    keywords: [
      "soporte tecnico empresarial",
      "soporte tecnico para empresas",
      "mesa de ayuda tecnologica",
      "soporte computadores empresas",
      "servicio tecnico empresarial Colombia",
    ],
    services: [
      "Diagnostico y correccion de fallas en equipos empresariales",
      "Mantenimiento preventivo y correctivo de computadores",
      "Soporte para impresoras, perifericos y estaciones de trabajo",
      "Acompanamiento tecnico para continuidad operativa",
    ],
    industries: [
      "Oficinas administrativas",
      "Comercio y puntos de venta",
      "Empresas de servicios",
      "Operaciones con equipos criticos",
    ],
    cities: ["Bogota", "Medellin", "Cali", "Barranquilla", "Colombia"],
    faqs: [
      {
        question: "Atienden soporte tecnico para empresas pequenas?",
        answer:
          "Si. Vertecx atiende empresas pequenas, medianas y equipos de trabajo que necesitan mantenimiento, soporte tecnico y continuidad operativa.",
      },
      {
        question: "El soporte puede incluir redes y servidores?",
        answer:
          "Si. El servicio puede cubrir computadores, redes, servidores, impresoras, camaras y equipos tecnologicos de la empresa.",
      },
      {
        question: "Puedo solicitar una visita tecnica?",
        answer:
          "Si. Desde la pagina de contacto o WhatsApp puedes solicitar una revision tecnica y coordinar los detalles del servicio.",
      },
    ],
  },
  {
    slug: "mantenimiento-computadores-empresas",
    title: "Mantenimiento de computadores para empresas",
    eyebrow: "Mantenimiento preventivo y correctivo",
    description:
      "Mantenimiento de computadores para empresas: limpieza, diagnostico, optimizacion, correccion de fallas y soporte para equipos de trabajo.",
    heroTitle: "MANTENIMIENTO DE COMPUTADORES PARA EMPRESAS",
    summary:
      "Reducimos paradas, fallas repetitivas y perdida de productividad con mantenimiento preventivo y correctivo para equipos empresariales.",
    keywords: [
      "mantenimiento de computadores empresas",
      "mantenimiento preventivo computadores",
      "mantenimiento correctivo computadores",
      "limpieza de computadores empresarial",
      "soporte equipos de oficina",
    ],
    services: [
      "Limpieza fisica y revision general de equipos",
      "Optimizacion de sistema, arranque y rendimiento",
      "Cambio o diagnostico de componentes",
      "Plan preventivo para reducir fallas recurrentes",
    ],
    industries: [
      "Empresas con equipos administrativos",
      "Salas de computo",
      "Puntos de venta",
      "Negocios con atencion al cliente",
    ],
    cities: ["Bogota", "Medellin", "Cali", "Colombia"],
    faqs: [
      {
        question: "Cada cuanto se recomienda hacer mantenimiento preventivo?",
        answer:
          "Depende del uso y ambiente, pero muchas empresas lo programan cada tres a seis meses para reducir fallas y lentitud.",
      },
      {
        question: "El servicio incluye diagnostico de equipos lentos?",
        answer:
          "Si. Se revisan causas comunes como almacenamiento, memoria, temperatura, software, virus o desgaste de componentes.",
      },
      {
        question: "Pueden atender varios computadores en una misma visita?",
        answer:
          "Si. Se puede coordinar una jornada para revisar varios equipos de una empresa segun prioridad y disponibilidad.",
      },
    ],
  },
  {
    slug: "redes-servidores-empresas",
    title: "Redes y servidores para empresas",
    eyebrow: "Infraestructura tecnologica",
    description:
      "Instalacion, revision y soporte de redes y servidores para empresas: conectividad, cableado, switches, routers, camaras y continuidad.",
    heroTitle: "REDES Y SERVIDORES PARA EMPRESAS",
    summary:
      "Mejoramos la conectividad y estabilidad de la operacion con revision tecnica de redes, servidores y equipos clave de infraestructura.",
    keywords: [
      "redes empresariales",
      "servidores para empresas",
      "instalacion de redes",
      "soporte redes empresas",
      "mantenimiento servidores Colombia",
    ],
    services: [
      "Revision de conectividad, routers, switches y cableado",
      "Soporte para servidores y equipos de red",
      "Instalacion y organizacion de puntos de red",
      "Diagnostico de caidas, lentitud o fallas intermitentes",
    ],
    industries: [
      "Oficinas con varios puestos de trabajo",
      "Empresas con archivos compartidos",
      "Negocios con camaras de seguridad",
      "Operaciones que dependen de conectividad estable",
    ],
    cities: ["Bogota", "Medellin", "Cali", "Colombia"],
    faqs: [
      {
        question: "Pueden revisar fallas intermitentes de internet o red?",
        answer:
          "Si. Se revisa la infraestructura para detectar problemas de configuracion, cableado, equipos de red o saturacion.",
      },
      {
        question: "Instalan puntos de red para oficinas?",
        answer:
          "Si. Vertecx puede apoyar la instalacion, organizacion y revision de puntos de red segun la necesidad de la empresa.",
      },
      {
        question: "Tambien dan soporte a camaras de seguridad?",
        answer:
          "Si. El soporte puede incluir equipos tecnologicos conectados a la red como camaras, grabadores y dispositivos asociados.",
      },
    ],
  },
];

export function getSeoServicePage(slug: string) {
  return seoServicePages.find((page) => page.slug === slug);
}

export function serviceJsonLd(page: SeoServicePage) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/landing/soluciones/${page.slug}`)}#service`,
    name: page.title,
    description: page.description,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${absoluteUrl("/")}#business`,
      name: SITE_LEGAL_NAME,
      url: absoluteUrl("/"),
    },
    areaServed: page.cities.map((city) => ({
      "@type": "AdministrativeArea",
      name: city,
    })),
    serviceType: page.keywords,
    url: absoluteUrl(`/landing/soluciones/${page.slug}`),
  };
}

export function faqJsonLd(page: SeoServicePage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(page: SeoServicePage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Soluciones",
        item: absoluteUrl("/landing/services"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: absoluteUrl(`/landing/soluciones/${page.slug}`),
      },
    ],
  };
}
