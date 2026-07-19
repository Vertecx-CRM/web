"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Cpu,
  HardDrive,
  Monitor,
  PackageSearch,
  Printer,
  Router,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCategories } from "@/features/dashboard/CategoryProducts/connection/categoryApi";
import { isLandingVisibleProductCategory } from "@/shared/utils/productInventory";

const iconMap: Record<string, JSX.Element> = {
  monitor: <Monitor className="h-6 w-6" />,
  camera: <Camera className="h-6 w-6" />,
  hard: <HardDrive className="h-6 w-6" />,
  cpu: <Cpu className="h-6 w-6" />,
  router: <Router className="h-6 w-6" />,
  printer: <Printer className="h-6 w-6" />,
};

const fallbackIcons = [Monitor, Camera, Router, Cpu, HardDrive, Printer];

type ApiCategory = {
  id: number;
  name: string;
  icon: string | null;
  status: boolean;
};

type CategoryItem = {
  id: string;
  name: string;
  icon: string | null;
  count?: number;
};

interface CategoryCarouselProps {
  categories?: string[];
  categoryCounts?: Record<string, number>;
  selectedFilters?: string[];
  onSelectCategory?: (category: string) => void;
  productCount?: number;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories = [],
  categoryCounts = {},
  selectedFilters = ["all"],
  onSelectCategory,
  productCount = 0,
}) => {
  const [apiCategories, setApiCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    if (categories.length > 0) return;

    const load = async () => {
      try {
        const data = await getCategories();
        if (!Array.isArray(data)) return;

        const active = (data as ApiCategory[])
          .filter(
            (category) =>
              category.status === true &&
              isLandingVisibleProductCategory(category.name),
          )
          .map((category) => ({
            id: String(category.id),
            name: category.name,
            icon: category.icon,
          }));

        setApiCategories(active);
      } catch (err) {
        console.error("Error cargando categorias:", err);
      }
    };

    load();
  }, [categories.length]);

  const categoryItems = useMemo<CategoryItem[]>(() => {
    if (categories.length === 0) return apiCategories;

    return categories
      .map((category) => category.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
      .map((category) => ({
        id: normalizeText(category),
        name: category,
        icon: null,
        count: categoryCounts[category],
      }));
  }, [apiCategories, categories, categoryCounts]);

  const visibleItems = categoryItems.slice(0, 8);
  const hasCategories = visibleItems.length > 0;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#B20000]/10 bg-white px-4 py-6 shadow-sm sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#B20000]/15 bg-[#B20000]/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#B20000]">
            <Sparkles className="h-3.5 w-3.5" />
            Categorias principales
          </div>
          <h2 className="text-2xl font-black uppercase leading-tight tracking-tight text-[#0D141C] sm:text-3xl">
            Encuentra rapido el equipo que necesitas
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#626262]">
            Explora computadores, camaras, redes, componentes, impresoras y
            accesorios disponibles en el catalogo publico de Vertecx Sistemas PC.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-2xl font-black text-[#0D141C]">{productCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717680]">
              Productos
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-2xl font-black text-[#0D141C]">
              {categoryItems.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717680]">
              Categorias
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {hasCategories
          ? visibleItems.map((category, index) => {
              const Icon = fallbackIcons[index % fallbackIcons.length];
              const isActive =
                selectedFilters.includes(category.name) ||
                selectedFilters.some(
                  (filter) => normalizeText(filter) === normalizeText(category.name),
                );

              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory?.(category.name)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={[
                    "group min-h-[132px] rounded-2xl border p-4 text-left transition",
                    "focus:outline-none focus:ring-2 focus:ring-[#B20000]/25 focus:ring-offset-2",
                    isActive
                      ? "border-[#B20000] bg-[#B20000] text-white shadow-[0_16px_30px_rgba(178,0,0,0.18)]"
                      : "border-gray-100 bg-white text-[#0D141C] shadow-sm hover:border-[#B20000]/30 hover:shadow-md",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={[
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition",
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-[#B20000]/8 text-[#B20000] group-hover:bg-[#B20000]/12",
                      ].join(" ")}
                    >
                      {category.icon && category.icon.startsWith("http") ? (
                        <span
                          aria-hidden="true"
                          className="h-7 w-7 bg-contain bg-center bg-no-repeat"
                          style={{ backgroundImage: `url(${category.icon})` }}
                        />
                      ) : (
                        iconMap[category.icon || ""] ?? <Icon className="h-6 w-6" />
                      )}
                    </span>
                    <ShieldCheck
                      className={[
                        "h-5 w-5 shrink-0",
                        isActive ? "text-white/80" : "text-[#B20000]/55",
                      ].join(" ")}
                    />
                  </div>

                  <h3 className="mt-4 text-base font-black leading-tight">
                    {category.name}
                  </h3>
                  <p
                    className={[
                      "mt-2 text-xs font-semibold uppercase tracking-widest",
                      isActive ? "text-white/75" : "text-[#717680]",
                    ].join(" ")}
                  >
                    {category.count ? `${category.count} productos` : "Ver productos"}
                  </p>
                </motion.button>
              );
            })
          : Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[132px] animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <PackageSearch className="h-8 w-8 text-gray-200" />
                <div className="mt-6 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
      </div>
    </section>
  );
};

export default CategoryCarousel;
