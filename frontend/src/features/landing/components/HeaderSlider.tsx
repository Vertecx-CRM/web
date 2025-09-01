import Image from "next/image";
import React, { useEffect, useState } from "react";

const HeaderSlider = () => {
  const images = ["/assets/imgs/HomeSlider1.webp"];

  const [current, setCurrent] = useState(0);

  // Cambiar imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Imagen */}
      <Image
        src={images[current]}
        alt="Home slider"
        fill
        priority
        className="object-cover transition-all duration-700"
      />

      {/* Texto encima */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Bienvenido a <span className="block">SISTEMAS PC</span>
        </h2>
        <p className="mt-4 text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          Tu aliado tecnológico de confianza.
        </p>
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-9xl font-bold hover:scale-110 transition-transform"
      >
        ‹
      </button>

      {/* Flecha derecha */}
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
        className="absolute  right-4 top-1/2 -translate-y-1/2 text-white text-9xl font-bold hover:scale-110 transition-transform"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === current ? "bg-white" : "bg-gray-500"
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
