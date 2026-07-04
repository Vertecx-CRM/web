import { isLandingVisibleProductCategory } from "@/shared/utils/productInventory";

const DEFAULT_API_URL =
  "https://vertecx-back-c5abeza7bwcrg2hh.canadacentral-01.azurewebsites.net/";

type ProductCategoryFromApi = {
  id?: number;
  name?: string;
  categoryid?: number;
  categoryname?: string;
};

type ProductFromApi = {
  productid: number;
  productname: string;
  productdescription: string | null;
  productstock: number;
  categoryid: number;
  category?: ProductCategoryFromApi | null;
  suppliercategory: string;
  image: string;
  images?: string[] | null;
  productpriceofsale: number | string | null;
  isactive: boolean;
};

export type PublicProductForSeo = {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  images?: string[];
  price?: number;
  stock: number;
};

function apiBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
}

function apiUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path.replace(/^\//, ""), apiBaseUrl());
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url;
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const numeric = Number(String(value ?? "").trim());
  return Number.isNaN(numeric) ? 0 : numeric;
}

function categoryName(category: ProductCategoryFromApi | null | undefined) {
  if (!category) return "";
  if (typeof category.name === "string" && category.name.trim()) {
    return category.name.trim();
  }
  if (typeof category.categoryname === "string" && category.categoryname.trim()) {
    return category.categoryname.trim();
  }
  return "";
}

function normalizeProduct(product: ProductFromApi): PublicProductForSeo {
  return {
    id: String(product.productid),
    title: product.productname,
    description: product.productdescription?.trim() || "Sin descripcion",
    category: categoryName(product.category) || "Sin categoria",
    image: product.image || undefined,
    images: Array.isArray(product.images)
      ? product.images.filter((image) => typeof image === "string" && image.trim())
      : undefined,
    price:
      product.productpriceofsale === null
        ? undefined
        : toNumber(product.productpriceofsale),
    stock: toNumber(product.productstock),
  };
}

function isPublicProduct(product: ProductFromApi) {
  if (product.isactive === false) return false;
  return isLandingVisibleProductCategory(categoryName(product.category));
}

export async function fetchPublicProductsForSeo() {
  try {
    const response = await fetch(apiUrl("/products", { status: "active" }), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = (await response.json()) as ProductFromApi[];
    if (!Array.isArray(data)) return [];

    return data.filter(isPublicProduct).map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function fetchPublicProductForSeo(id: string | number) {
  try {
    const response = await fetch(apiUrl(`/products/${id}`), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ProductFromApi;
    if (!data || !isPublicProduct(data)) return null;

    return normalizeProduct(data);
  } catch {
    return null;
  }
}
