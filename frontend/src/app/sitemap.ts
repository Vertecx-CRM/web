import type { MetadataRoute } from "next";
import { fetchPublicProductsForSeo } from "@/lib/public-catalog";
import { absoluteUrl } from "@/lib/seo";
import { seoServicePages } from "@/features/landing/seo/servicePages";

export const dynamic = "force-dynamic";

const publicPages = [
  { path: "/", priority: 1 },
  { path: "/landing/services", priority: 0.9 },
  { path: "/landing/products", priority: 0.8 },
  { path: "/landing/about", priority: 0.8 },
  { path: "/landing/contact", priority: 0.9 },
  { path: "/auth/login", priority: 0.4 },
  { path: "/auth/register", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await fetchPublicProductsForSeo();

  return [
    ...publicPages.map((page) => ({
      url: absoluteUrl(page.path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...seoServicePages.map((page) => ({
      url: absoluteUrl(`/landing/soluciones/${page.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/landing/products/${product.id}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
