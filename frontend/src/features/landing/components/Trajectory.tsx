import React from "react";
import Image from "next/image";

const Trajectory = () => {
  return (
    <section className="bg-white py-10 px-6 md:px-16 flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Texto */}
      <div className="flex-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-4 leading-tight">
          ¡Conoce nuestra <br /> Trayectoria!
        </h2>
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Con más de 10 años de experiencia,{" "}
          <span className="font-semibold">Tech Solutions</span> se ha
          consolidado como líder en soluciones tecnológicas. Hemos ayudado a
          cientos de empresas a crecer y optimizar sus operaciones a través de
          la tecnología.
        </p>
        <button className="cursor-pointer bg-red-700 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-800 transition">
          Nosotros
        </button>
      </div>

      {/* Imagen */}
      <div className="flex-1 flex justify-center">
        <Image
          src="/assets/imgs/camera.png"
          alt="Cámara de seguridad"
          className="rounded-xl shadow-lg w-full max-w-md object-cover"
          width={600}
          height={600}
        />
      </div>
    </section>
  );
};

export default Trajectory;
