"use client";

import { api } from "@/shared/utils/apiClient";
import { isLandingVisibleProductCategory } from "@/shared/utils/productInventory";
import type { Product } from "../hooks/useProducts";

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

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? "").trim());
  return Number.isNaN(n) ? 0 : n;
};

const getCategoryName = (cat: ProductCategoryFromApi | null | undefined): string => {
  if (!cat) return "";
  if (typeof cat.name === "string" && cat.name.trim()) return cat.name.trim();
  if (typeof cat.categoryname === "string" && cat.categoryname.trim())
    return cat.categoryname.trim();
  return "";
};

const toLanding = (p: ProductFromApi): Product => ({
  id: String(p.productid),
  title: p.productname,
  description: p.productdescription ?? "Sin descripción",
  category: getCategoryName(p.category) || "Sin categoría",
  image: p.image || undefined,
  images: Array.isArray(p.images)
    ? p.images.filter((x) => typeof x === "string" && x.trim())
    : undefined,
  price: p.productpriceofsale === null ? undefined : toNumber(p.productpriceofsale),
  stock: toNumber(p.productstock),
});

export const getLandingProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<ProductFromApi[]>("/products", {
    params: { status: "active" },
  });

  return (data ?? [])
    .filter((product) => {
      if (product.isactive === false) return false;
      return isLandingVisibleProductCategory(getCategoryName(product.category));
    })
    .map(toLanding);
};

export const getLandingProductById = async (id: string | number): Promise<Product> => {
  const { data } = await api.get<ProductFromApi>(`/products/${id}`);
  if (!isLandingVisibleProductCategory(getCategoryName(data?.category))) {
    throw new Error("Producto no disponible en el catalogo publico.");
  }
  return toLanding(data);
};
