import React from "react";
import Image from "next/image";

const OurServices = () => {
  const services = [
    {
      title: "MANTENIMIENTO CORRECTIVO",
      description:
        "Reparación inmediata de fallas imprevistas. Garantizamos el retorno a la operatividad en tiempo récord con piezas certificadas.",
      image:
        "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
    },
    {
      title: "MANTENIMIENTO PREVENTIVO",
      description:
        "Evita paros costosos. Programamos inspecciones técnicas profundas para extender la vida útil de toda su infraestructura.",
      image:
        "https://images.pexels.com/photos/4508751/pexels-photo-4508751.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
    },
    {
      title: "INSTALACIÓN",
      description:
        "Montaje de sistemas eléctricos y electrónicos bajo normativa internacional, asegurando eficiencia energética desde el día uno.",
      image:
        "https://images.pexels.com/photos/442151/pexels-photo-442151.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
    },
  ];

  return (
    <section className="bg-white py-24 px-6 sm:px-10 lg:px-20 text-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header con animaciones de entrada */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl opacity-0 animate-fadeInUp">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-[2px] bg-red-600 animate-growWidth origin-left"></span>
              <span className="text-red-600 font-bold tracking-widest text-xs uppercase animate-fadeIn delay-200">
                Nuestras Soluciones
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black leading-none overflow-hidden">
              <span className="inline-block animate-slideInUp delay-400">
                SERVICIOS DE
              </span>{" "}
              <br />
              <span className="text-red-600 inline-block animate-slideInUp delay-600">
                ALTO IMPACTO.
              </span>
            </h2>
          </div>
          <p className="text-gray-500 text-lg max-w-sm border-l-2 border-gray-100 pl-6 opacity-0 animate-fadeIn delay-800">
            Mantenimiento e ingeniería de precisión para empresas que no pueden
            permitirse detenerse.
          </p>
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-100">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white border-b border-gray-100 md:border-r last:border-r-0 p-10 hover:bg-gray-50 transition-all duration-500 overflow-hidden opacity-0 animate-fadeInUp"
              style={{ animationDelay: `${400 + index * 200}ms` }}
            >
              {/* Número de servicio con flotación */}
              <span className="absolute top-10 right-10 text-8xl font-black text-gray-50 group-hover:text-red-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none animate-float-slow">
                0{index + 1}
              </span>

              {/* Imagen con efectos mejorados */}
              <div className="relative w-full h-56 mb-10 overflow-hidden shadow-2xl shadow-gray-200 group-hover:shadow-red-600/20 transition-shadow">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 border-[16px] border-white group-hover:border-[8px] transition-all duration-500"></div>
                {/* Overlay de brillo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000"></div>
              </div>

              {/* Contenido */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 group-hover:text-red-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                  {service.description}
                </p>

                <button className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest group-hover:gap-5 transition-all">
                  <span>Consultar Servicio</span>
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-red-600 transition-colors group-hover:rotate-45">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Línea decorativa roja en hover */}
              <div className="absolute top-0 left-0 w-1 h-0 bg-red-600 group-hover:h-full transition-all duration-500 ease-out"></div>
            </div>
          ))}
        </div>

        {/* Footer animado */}
        <div className="mt-20 flex flex-col items-center opacity-0 animate-fadeInUp delay-1000">
          <button className="cursor-pointer group relative overflow-hidden bg-black px-12 py-5 text-white transition-all hover:bg-red-600">
            <span className="relative z-10 font-bold tracking-widest uppercase text-sm">
              Solicitar Servicio Online
            </span>
            <div className="absolute inset-0 -translate-x-full bg-red-600 transition-transform duration-300 group-hover:translate-x-0"></div>
          </button>
          <p className="mt-6 text-gray-400 text-xs uppercase tracking-tighter">
            Disponibilidad 12hs
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurServices;
