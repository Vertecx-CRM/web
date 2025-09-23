"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Monitor, Camera, HardDrive, Cpu, Router } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: "Electrónica", title: "Computadores y Portátiles", description: "Equipos de alto rendimiento para trabajo, gaming y uso personal.", icon: <Monitor className="w-6 h-6 text-[#B20000]" /> },
  { id: "Hardware", title: "Componentes y Hardware", description: "Placas madre, discos duros y otros componentes esenciales.", icon: <HardDrive className="w-6 h-6 text-[#B20000]" /> },
  { id: "Periféricos", title: "Periféricos", description: "Teclados, mouses y accesorios para una experiencia óptima.", icon: <Cpu className="w-6 h-6 text-[#B20000]" /> },
  { id: "Networking", title: "Networking", description: "Routers, switches y soluciones de conectividad.", icon: <Router className="w-6 h-6 text-[#B20000]" /> },
  { id: "Cámaras", title: "Cámaras", description: "Sistemas de videovigilancia y cámaras IP.", icon: <Camera className="w-6 h-6 text-[#B20000]" /> },
  { id: "Software", title: "Software y Licencias", description: "Sistemas operativos, antivirus y aplicaciones profesionales.", icon: <Monitor className="w-6 h-6 text-[#B20000]" /> },
  { id: "Almacenamiento", title: "Almacenamiento", description: "Discos duros SSD y HD para alta capacidad.", icon: <HardDrive className="w-6 h-6 text-[#B20000]" /> },
];

const cardsPerView = 3;
const buffer = cardsPerView; // número de clones antes y después

// Creamos un array extendido con buffer al inicio y al final (técnica "clone")
const extended = [
  ...categories.slice(-buffer),
  ...categories,
  ...categories.slice(0, buffer),
];

const ANIMATION_MS = 400; // duración de la transición (coincide con CSS/transition)

const CategoryCarousel: React.FC = () => {
  const [index, setIndex] = useState(buffer); // empezamos en el primer elemento "real"
  const [isTransitioning, setIsTransitioning] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [slideWidth, setSlideWidth] = useState<number>(0);

  // medir ancho de slide según el ancho del viewport y cardsPerView
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

  // autoplay opcional: si quieres lo activas descomentando el useEffect (por ahora lo dejo apagado)
  // useEffect(() => {
  //   const id = setInterval(() => handleNext(), 4500);
  //   return () => clearInterval(id);
  // }, [index, slideWidth]);

  const handleNext = () => {
    if (slideWidth === 0) return;
    setIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (slideWidth === 0) return;
    setIndex((prev) => prev - 1);
  };

  // efecto que hace el "reset invisible" cuando pasamos el último clone o el primero clone
  useEffect(() => {
    // si llegamos al final del array real + buffer -> saltar al inicio real (sin transición)
    const realStart = buffer;
    const realEnd = categories.length + buffer - 1;

    if (index > realEnd) {
      // después de la animación, jump al inicio real
      const t = setTimeout(() => {
        setIsTransitioning(false); // quitamos transición para el "jump"
        setIndex(realStart);
        // reactivar transición en micro-tick
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
  }, [index]);

  // transform en px (framer-motion usa number -> px)
  const translateX = -index * slideWidth;

  return (
    <section className="relative w-full py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#B20000] mb-8">
          Categorías de Productos
        </h2>

        <div className="relative">
          {/* viewport: ocultamos overflow para que no salga scroll, pero damos padding interior
              para que las sombras de las cards no se corten (ajusta px si hace falta). */}
          <div ref={viewportRef} className="overflow-hidden px-6">
            <motion.div
              className={`flex items-stretch`}
              animate={{ x: translateX }}
              transition={isTransitioning ? { duration: ANIMATION_MS / 1000, ease: "easeInOut" } : { duration: 0 }}
              style={{
                // ancho total del track en px: number of items * slideWidth
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
                      {cat.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">{cat.title}</h3>
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
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg transition-transform hover:scale-110"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg transition-transform hover:scale-110"
            aria-label="Siguiente"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* indicadores - calculamos "páginas" (sets) */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(categories.length / cardsPerView) }).map((_, pageIdx) => {
            // map page index to real starting index
            const pageStartIndex = buffer + pageIdx * cardsPerView;
            return (
              <button
                key={pageIdx}
                onClick={() => setIndex(pageStartIndex)}
                className={`w-3 h-3 rounded-full transition-colors ${pageStartIndex === (index % (categories.length + buffer)) + (index >= buffer ? 0 : 0) ? "bg-[#B20000]" : "bg-gray-300"}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
