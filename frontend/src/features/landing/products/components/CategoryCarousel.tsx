"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import { motion } from "framer-motion";

// Íconos por defecto si el backend no trae icono
import { Monitor, Camera, HardDrive, Cpu, Router } from "lucide-react";
import { getCategories } from "@/features/dashboard/categoryProducts/connection/categoryApi";

const iconMap: Record<string, JSX.Element> = {
  monitor: <Monitor className="w-6 h-6 text-[#B20000]" />,
  camera: <Camera className="w-6 h-6 text-[#B20000]" />,
  hard: <HardDrive className="w-6 h-6 text-[#B20000]" />,
  cpu: <Cpu className="w-6 h-6 text-[#B20000]" />,
  router: <Router className="w-6 h-6 text-[#B20000]" />,
};

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  status: boolean;
}

const cardsPerView = 3;
const buffer = cardsPerView;
const ANIMATION_MS = 400;

const CategoryCarousel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [extended, setExtended] = useState<any[]>([]);
  const [index, setIndex] = useState(buffer);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [slideWidth, setSlideWidth] = useState<number>(0);

  // Cargar categorías desde backend
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        if (Array.isArray(data)) {
          // SOLO CATEGORÍAS ACTIVAS
          const active = data.filter((c) => c.status === true);

          setCategories(active);

          // Extender lista para efecto infinito
          setExtended([
            ...active.slice(-buffer),
            ...active,
            ...active.slice(0, buffer),
          ]);

          setIndex(buffer);
        }
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };

    load();
  }, []);

  // Medir ancho dinámico
  useEffect(() => {
    const measure = () => {
      if (!viewportRef.current) return;
      const vw = viewportRef.current.clientWidth;
      setSlideWidth(vw / cardsPerView);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleNext = () => {
    if (slideWidth === 0) return;
    setIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (slideWidth === 0) return;
    setIndex((prev) => prev - 1);
  };

  // Carrusel infinito
  useEffect(() => {
    if (extended.length === 0) return;

    const realStart = buffer;
    const realEnd = categories.length + buffer - 1;

    if (index > realEnd) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(realStart);
        setTimeout(() => setIsTransitioning(true), 20);
      }, ANIMATION_MS);
      return () => clearTimeout(t);
    }

    if (index < realStart) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(realEnd);
        setTimeout(() => setIsTransitioning(true), 20);
      }, ANIMATION_MS);
      return () => clearTimeout(t);
    }
  }, [index, extended]);

  const translateX = -index * slideWidth;

  return (
    <section className="relative w-full py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#B20000] mb-8">
          Categorías de Productos
        </h2>

        <div className="relative">
          <div ref={viewportRef} className="overflow-hidden px-6">
            <motion.div
              className="flex items-stretch"
              animate={{ x: translateX }}
              transition={
                isTransitioning
                  ? { duration: ANIMATION_MS / 1000, ease: "easeInOut" }
                  : { duration: 0 }
              }
              style={{
                width: `${extended.length * slideWidth}px`,
              }}
            >
              {extended.map((cat, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  className="flex-shrink-0"
                  style={{ width: `${slideWidth}px` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center gap-4 min-h-[220px] mx-2">
                    <div className="bg-gray-100 rounded-full p-4 flex items-center justify-center shadow-inner w-14 h-14">
                      {cat.icon && cat.icon.startsWith("http")
                        ? (
                          <img
                            src={cat.icon}
                            alt={cat.name}
                            className="w-12 h-12 object-contain"
                          />
                        )
                        : (
                          iconMap[cat.icon || "monitor"] || iconMap["monitor"]
                        )
                      }
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                      {cat.name}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* botones */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
