"use client";

import React, { useState } from "react";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import Banner from "./components/Banner";
import LayoutServicios from "./components/LayoutServicios";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import CardServices from "./components/CardServices";
import Pagination from "./components/Pagination";
import { useServices, Service } from "./hooks/useServices";

interface ServicesProps {
  className?: string;
}

export default function ServicesLanding({ className = "" }: ServicesProps) {
  const mockServices: Service[] = [
    { 
      title: "Seguridad y monitoreo", 
      description: "Instalación y configuración de cámaras IP, sistemas CCTV y soporte en seguridad digital.",
      image: "/assets/imgs/services/imgprovicionales/img1.jpg",
      category: "Instalación"
    },
    { 
      title: "Redes Estructuradas", 
      description: "Instalación y mantenimiento de redes certificadas bajo RETIE. Cableado estructurado, configuración y marcación.",
      image: "/assets/imgs/services/imgprovicionales/img2.jpg",
      category: "Instalación"
    },
    { 
      title: "Reparación de equipos", 
      description: "Mantenimiento y reparación de computadores, impresoras, monitores, plotters y periféricos.",
      image: "/assets/imgs/services/imgprovicionales/img7.jpg",
      category: "Mantenimiento Correctivo"
    },
    { 
      title: "Mantenimiento y soporte Técnico", 
      description: "Soporte técnico 24/7 y presencial. Solucionamos fallos, optimizamos equipos y garantizamos contunuidad",
      image: "/assets/imgs/services/imgprovicionales/img4.jpg",
      category: "Mantenimiento Preventivo"
    },
    { 
      title: "Servidores y Sistemas", 
      description: "Configuración y administración de servidores Linux y Windows. Instalación, puesta en marcha y soporte ",
      image: "/assets/imgs/services/imgprovicionales/img5.jpg",
      category: "Instalación"
    }
  ];

  const {
    selectedFilters,
    handleToggleFilter,
    searchTerm,
    setSearchTerm,
    filteredServices,
  } = useServices(mockServices);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const displayedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={className}>
      <Nav />
      <Banner />

      <LayoutServicios>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FilterBar 
            selectedFilters={selectedFilters} 
            handleToggle={handleToggleFilter} 
            className="w-full lg:w-64 flex-shrink-0" 
          />

          <div className="flex-1 flex flex-col gap-6">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedServices.map((service, index) => (
                <CardServices
                  key={index}
                  title={service.title}
                  description={service.description}
                  category={service.category}
                  image={service.image}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </LayoutServicios>

      <Footer />
    </div>
  );
}
