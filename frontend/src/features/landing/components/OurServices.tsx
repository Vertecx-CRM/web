import React from "react";
import Image from "next/image";

const OurServices = () => {
  const services = [
    {
      title: "MANTENIMIENTO CORRECTIVO",
      description:
        "Atendemos y reparamos fallas o averías imprevistas en tus equipos o sistemas, asegurando que vuelvan a operar de forma eficiente y segura en el menor tiempo posible.",
      image: "/assets/imgs/services/corrective.png",
    },
    {
      title: "MANTENIMIENTO PREVENTIVO",
      description:
        "Realizamos inspecciones y ajustes periódicos para prevenir fallos, mejorar el rendimiento y extender la vida útil de tus equipos, evitando interrupciones innecesarias.",
      image: "/assets/imgs/services/preventive.png",
    },
    {
      title: "INSTALACIÓN",
      description:
        "Nos encargamos de la instalación de equipos, sistemas eléctricos o electrónicos, garantizando que funcionen correctamente desde el primer uso y cumplan con todos los estándares.",
      image: "/assets/imgs/services/installation.png",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-900 py-16 px-6 md:px-20 text-center">
      {/* Título */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-12">
        Categoría de Servicios
      </h2>

      {/* Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {services.map((service, index) => (
          <div
            key={index}
            className="cursor-pointer flex flex-col items-center text-white text-center p-6 rounded-xl 
  bg-gray-800/30 shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300"
          >
            {/* Imagen animada */}
            <Image
              src={service.image}
              alt={service.title}
              width={200}
              height={200}
              className="object-contain mb-4 transform transition-transform duration-500 hover:rotate-3 hover:scale-105"
            />

            {/* Título */}
            <h3 className="text-lg font-bold mb-4">{service.title}</h3>

            {/* Descripción */}
            <p className="text-lg text-gray-200 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Botón único */}
      <button className="cursor-pointer bg-red-700 text-white px-8 py-3 rounded-md shadow-md hover:bg-red-800 transition">
        Ver Servicios
      </button>
    </section>
  );
};

export default OurServices;
