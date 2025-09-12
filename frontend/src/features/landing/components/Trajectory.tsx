import React from "react";
import Image from "next/image";
import Colors from "@/shared/theme/colors";

const Trajectory = () => {
  return (
    <section className="bg-white py-20 px-10 md:px-20 flex flex-col md:flex-row items-center md:items-start gap-12 relative overflow-hidden">
      {/* Texto con fondo */}
      <div className="flex-1 relative">
        <div className="absolute flex justify-center items-center">
          <Image
            src="/assets/imgs/startup-rocket.png"
            alt="Cohete Startup"
            width={1000}
            height={1000}
            className="object-contain opacity-10"
          />
        </div>

        <h2 className="text-5xl md:text-6xl font-extrabold text-red-700 mb-8 leading-tight relative">
          ¡Conoce nuestra <br /> Trayectoria!
        </h2>
        <p className="text-gray-700 mb-8 text-xl leading-relaxed relative">
          Con más de 10 años de experiencia,{" "}
          <span className="font-semibold">Tech Solutions</span> se ha
          consolidado como líder en soluciones tecnológicas. Hemos ayudado a
          cientos de empresas a crecer y optimizar sus operaciones a través de
          la tecnología.
        </p>
        <button
          style={{ backgroundColor: Colors.buttons.primary }}
          className="relative cursor-pointer inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white rounded-md shadow-lg overflow-hidden group transition-transform duration-300 hover:scale-105"
        >
          <span className="absolute inset-0 bg-red-800 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>

          <span className="relative z-10 w-100 transition-colors duration-300 group-hover:text-white">
            Ver más
          </span>
        </button>
      </div>

      {/* Imagen principal */}
      <div className="flex-1 flex justify-center">
        <Image
          src="/assets/imgs/camera.png"
          alt="Cámara de seguridad"
          className="rounded-2xl shadow-xl w-full max-w-2xl object-cover"
          width={700}
          height={700}
        />
      </div>
    </section>
  );
};

export default Trajectory;
