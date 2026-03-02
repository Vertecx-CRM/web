"use client";

import React, { useEffect, useState } from "react";

const Banner = () => {
  const fullText = "Nuestros Productos";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-white overflow-hidden flex items-center">
      {/* --- FONDO ESTRUCTURAL --- */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/imgs/products/bannerproducts.jpg"
          alt="Hardware y Tecnología"
          className="w-full h-full object-cover grayscale opacity-90 contrast-125"
        />
        {/* Overlays de fundido a blanco */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* --- DETALLE DECORATIVO LATERAL --- */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em] rotate-90 origin-left">
          SISTEMAS PC / HARDWARE DEPOT
        </p>
      </div>

      {/* Rejilla de fondo técnica */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16">
        <div className="max-w-3xl">
          {/* Label Superior */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-[3px] bg-red-600"></span>
            <span className="text-red-600 font-black tracking-[0.4em] text-xs uppercase">
              Equipamiento de Vanguardia
            </span>
          </div>

          {/* Título Principal Typewriter */}
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-black mb-8">
            {displayedText.split(" ").map((word, idx) => (
              <span
                key={idx}
                className={
                  word.toLowerCase() === "productos"
                    ? "text-red-600"
                    : "text-black"
                }
              >
                {word}{" "}
              </span>
            ))}
            <span className="animate-pulse text-[#B22222] inline-block w-2 h-12 md:h-16 bg-[#B22222] ml-1 align-middle"></span>
          </h1>

          {/* Descripción */}
          <div className="border-l-4 border-gray-100 pl-6 py-2 mb-10">
            <p className="text-lg md:text-xl font-medium text-gray-500 leading-relaxed max-w-xl">
              Selección premium de hardware y componentes. <br />
              <span className="text-black font-bold">
                Rendimiento garantizado
              </span>{" "}
              para flujos de trabajo de alta exigencia.
            </p>
          </div>

          {/* Indicadores de Status del Catálogo */}
          <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                Disponibilidad
              </p>
              <p className="text-sm font-bold text-black flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                STOCK ACTUALIZADO
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                Garantía
              </p>
              <p className="text-sm font-bold text-black uppercase">
                Soporte Oficial
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                Logística
              </p>
              <p className="text-sm font-bold text-black uppercase">
                Envío Rápido
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- NÚMERO DE SECCIÓN DECORATIVO --- */}
      <div className="absolute bottom-0 right-0 p-10 hidden md:block">
        <div className="flex flex-col items-end">
          <span className="text-[60px] font-black text-gray-100 leading-none">
            #2
          </span>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Catalogo de Productos
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
