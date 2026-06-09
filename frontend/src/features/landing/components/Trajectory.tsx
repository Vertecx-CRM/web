"use client";
import React from "react";
import Image from "next/image";

const timeline = [
  {
    year: "2004",
    title: "INICIOS PROFESIONALES",
    desc: `Terminé mis estudios de tecnólogo en sistemas y comencé mi vida laboral brindando soporte técnico a equipos, servidores y redes.`,
  },
  {
    year: "2012",
    title: "INDEPENDENCIA LABORAL",
    desc: `Creación de un proyecto de servicios tecnológicos para empresas con una inversión inicial mínima y visión de crecimiento.`,
  },
  {
    year: "2015 - 2022",
    title: "EXPANSIÓN EMPRESARIAL",
    desc: `SistemasPC comenzó a prestar servicios a más de 15 empresas reconocidas, consolidándose en el sector tecnológico local.`,
  },
  {
    year: "ACTUALIDAD",
    title: "INNOVACIÓN CONTINUA",
    desc: `Optimizando procesos empresariales mediante mantenimiento, redes, servidores y soluciones tecnológicas modernas.`,
  },
];

const Trajectory = () => {
  return (
    <section className="relative bg-white py-24 px-6 md:px-16 overflow-hidden">
      {/* Fondo decorativo minimalista con animación sutil de gradiente */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white animate-gradientShift"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header con animaciones de entrada */}
        <div className="relative mb-24 opacity-0 animate-fadeInUp">
          <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em] mb-4 block animate-slideInLeft">
            Nuestra Historia
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none mb-8 overflow-hidden">
            <span className="inline-block animate-slideInUp delay-200">
              DOS DÉCADAS DE
            </span>{" "}
            <br />
            <span className="text-red-600 italic inline-block animate-slideInUp delay-400">
              EVOLUCIÓN.
            </span>
          </h2>
          <div className="w-24 h-2 bg-black animate-growWidth delay-600"></div>

          <p className="mt-8 text-gray-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed opacity-0 animate-fadeIn delay-800">
            Desde 2004, transformando la infraestructura tecnológica de empresas
            con
            <span className="text-black font-semibold">
              {" "}
              compromiso y precisión técnica.
            </span>
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Columna Izquierda: Imagen con estilo Industrial */}
          <div className="lg:col-span-5 sticky top-10 opacity-0 animate-fadeInLeft delay-300">
            <div className="relative group">
              <div className="absolute -inset-4 border-2 border-red-600 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
              <div className="relative h-[700px] w-full overflow-hidden bg-white">
                <Image
                  src="/assets/imgs/camera.png"
                  alt="Equipo tecnológico"
                  fill
                  className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />
              </div>
              {/* Badge de Años con animación flotante */}
              <div className="absolute -bottom-8 -right-8 bg-red-600 text-white p-8 shadow-2xl animate-float">
                <span className="block text-4xl font-black leading-none">
                  +20
                </span>
                <span className="text-xs font-bold uppercase tracking-tighter">
                  Años de Exp.
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Timeline */}
          <div className="lg:col-span-7 relative opacity-0 animate-fadeInRight delay-300">
            {/* Línea vertical principal con animación de altura */}
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-200 origin-top scale-y-0 animate-growHeight delay-500"></div>

            <div className="space-y-16">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className="relative pl-12 group opacity-0 animate-fadeInUp"
                  style={{ animationDelay: `${600 + i * 150}ms` }}
                >
                  {/* Punto de la línea de tiempo */}
                  <div className="absolute left-[-5px] top-0 w-[11px] h-[11px] bg-white border-2 border-red-600 group-hover:bg-red-600 transition-colors duration-300 group-hover:scale-150"></div>

                  {/* Año */}
                  <span className="text-sm font-black text-red-600 tracking-widest mb-2 block group-hover:translate-x-1 transition-transform">
                    {item.year}
                  </span>

                  {/* Título y Descripción */}
                  <div className="border-b border-gray-100 pb-8">
                    <h3 className="text-2xl font-black text-black mb-4 group-hover:translate-x-2 transition-transform duration-300 uppercase italic">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed font-light group-hover:text-gray-800 transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Final sutil con animación */}
            <div className="mt-12 pl-12 opacity-0 animate-fadeIn delay-1000">
              <p className="text-black font-bold flex items-center gap-4">
                EL FUTURO ES AHORA
                <span className="h-[1px] flex-1 bg-gray-100 animate-growWidth"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trajectory;
