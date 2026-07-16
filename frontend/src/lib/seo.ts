import type { Metadata } from "next";

export const SITE_NAME = "Vertecx";
export const SITE_LEGAL_NAME = "Vertecx Sistemas PC";
export const SITE_ALTERNATE_NAME = "Sistemas PC";
export const DEFAULT_SITE_URL = "https://www.sistemaspc.co";
export const DEFAULT_OG_IMAGE = "/assets/imgs/preview.png";
export const DEFAULT_DESCRIPTION =
  "Vertecx es una empresa colombiana de soporte tecnico, mantenimiento preventivo y correctivo, redes, servidores y equipos tecnologicos para empresas.";
export const BRAND_KEYWORDS = [
  "Vertecx",
  "Vertecx Sistemas PC",
  "soporte tecnico empresarial",
  "mantenimiento de computadores",
  "mantenimiento preventivo",
  "mantenimiento correctivo",
  "redes empresariales",
  "servidores",
  "hardware empresarial",
  "servicios tecnologicos Colombia",
];

function normalizeBaseUrl(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const explicit =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeBaseUrl(process.env.SITE_URL);

  if (explicit) return explicit;

  if (process.env.NODE_ENV === "production") return DEFAULT_SITE_URL;

  const azureHost = normalizeBaseUrl(process.env.WEBSITE_HOSTNAME);
  if (azureHost) return azureHost;

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  try {
    return new URL(path).toString();
  } catch {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
  }
}

export function truncateDescription(value: string, maxLength = 155) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: PageMetadataInput): Metadata {
  const cleanDescription = truncateDescription(description, 170);

  return {
    title,
    description: cleanDescription,
    keywords: BRAND_KEYWORDS,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: path,
      siteName: SITE_NAME,
      locale: "es_CO",
      type,
      images: [
        {
          url: image,
          width: 1024,
          height: 1024,
          alt: `${SITE_NAME} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#business`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: [SITE_LEGAL_NAME, SITE_ALTERNATE_NAME],
    url: absoluteUrl("/"),
    logo: absoluteUrl("/assets/imgs/logo.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: "vertecxoficial@gmail.com",
    telephone: "+573136850968",
    areaServed: ["Colombia"],
    sameAs: ["https://www.instagram.com/sistemas.pc/"],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
      alternateName: SITE_LEGAL_NAME,
    },
    knowsAbout: [
      "soporte tecnico",
      "mantenimiento preventivo",
      "mantenimiento correctivo",
      "redes",
      "servidores",
      "hardware",
      "soluciones tecnologicas",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+573136850968",
      contactType: "customer support",
      availableLanguage: ["es"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: SITE_NAME,
    alternateName: SITE_LEGAL_NAME,
    url: absoluteUrl("/"),
    inLanguage: "es-CO",
    publisher: {
      "@id": `${absoluteUrl("/")}#business`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/landing/products")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
