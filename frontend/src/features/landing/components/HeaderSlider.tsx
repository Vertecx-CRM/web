"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const HeaderSlider = () => {
  const images = [
    "https://images.pexels.com/photos/3205735/pexels-photo-3205735.jpeg?auto=compress&cs=tinysrgb&w=1400&h=1400&fit=crop",
    "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1400&h=1400&fit=crop",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full min-h-[700px] lg:min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Fondo con patrón tecnológico sutil con movimiento */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] animate-slow-spin"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Lado Izquierdo: Texto */}
          <div className="flex flex-col space-y-8">
            {/* Línea y marca con animación de deslizamiento */}
            <div className="flex items-center gap-3 animate-slideInLeft">
              <span className="w-12 h-[2px] bg-red-600 origin-left scale-x-0 animate-growWidth"></span>
              <span className="text-red-600 font-bold tracking-[0.3em] text-xs uppercase opacity-0 animate-fadeIn delay-300">
                SistemasPC Technology
              </span>
            </div>

            {/* Título principal con animación de aparición y desplazamiento */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter opacity-0 animate-fadeInUp delay-500">
              SOLUCIONES <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 inline-block animate-gradient">
                DIGITALES.
              </span>
            </h1>

            {/* Párrafo con fade-in */}
            <p className="text-xl text-gray-500 font-light max-w-md leading-relaxed opacity-0 animate-fadeIn delay-700">
              Expertos en soporte técnico, redes y mantenimiento industrial con
              más de 20 años de trayectoria.
            </p>

            {/* Botones con animación de escala y sombra */}
            <div className="flex flex-wrap gap-4 opacity-0 animate-fadeIn delay-1000">
              <button className="cursor-pointer px-10 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-all duration-300 shadow-2xl shadow-gray-200 hover:scale-105 hover:shadow-red-600/30">
                Contactar Ahora
              </button>
              <button className="cursor-pointer px-10 py-4 border-2 border-gray-100 text-black font-bold uppercase tracking-widest text-xs hover:border-red-600 transition-all duration-300 hover:scale-105">
                Nuestros Servicios
              </button>
            </div>

            {/* Indicadores de Slide con animación de rebote */}
            <div className="flex gap-4 pt-4">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 transition-all duration-500 ${
                    index === current
                      ? "w-16 bg-red-600 animate-pulse"
                      : "w-8 bg-gray-200 hover:bg-red-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Lado Derecho: Imagen con Diseño de Capas */}
          <div className="relative flex justify-center lg:justify-end animate-fadeInRight delay-300">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Cuadrante Decorativo Rojo con animación de flotación */}
              <div className="absolute -top-6 -right-6 w-2/3 h-2/3 border-t-8 border-r-8 border-red-600 z-0 animate-float"></div>

              {/* Contenedor de Imagen con sombra animada */}
              <div className="relative z-10 w-full h-full overflow-hidden bg-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                      index === current
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-110"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Slide ${index}`}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay sutil para mejorar contraste */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                  </div>
                ))}
              </div>

              {/* Elemento Flotante Negro con animación de rebote */}
              <div className="absolute -bottom-10 -left-10 bg-black text-white p-8 hidden md:block z-20 shadow-2xl animate-bounce-slow">
                <p className="text-3xl font-black leading-none">12hrs</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                  Soporte Técnico
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decoración lateral con animación de deslizamiento */}
      <div className="absolute right-0 top-0 h-full w-1/4 bg-gray-50 -z-10 skew-x-[-10deg] translate-x-20 animate-slideInRight"></div>
    </div>
  );
};

export default HeaderSlider;
