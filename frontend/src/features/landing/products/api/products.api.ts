"use client";

import { api } from "@/shared/utils/apiClient";
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

  categoryid: number;
  category?: ProductCategoryFromApi | null;

  suppliercategory: string;
  image: string;

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
  if (typeof cat.categoryname === "string" && cat.categoryname.trim()) return cat.categoryname.trim();
  return "";
};

const toLanding = (p: ProductFromApi): Product => ({
  id: String(p.productid),
  title: p.productname,
  description: p.productdescription ?? "Sin descripción",
  category: getCategoryName(p.category) || "Sin categoría",
  image: p.image || undefined,
  price: p.productpriceofsale === null ? undefined : toNumber(p.productpriceofsale),
});

export const getLandingProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<ProductFromApi[]>("/products", {
    params: { status: "active" },
  });
  return (data ?? []).map(toLanding);
};
