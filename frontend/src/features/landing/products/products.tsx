"use client";

import React, { useState } from "react";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import Banner from "./components/Banner";
import LayoutProductos from "./components/LayoutProductos";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import CardProducts from "./components/CardProducts";
import Pagination from "./components/Pagination";
import { useProducts, Product } from "./hooks/useProducts";
import CategoryCarousel from "./components/CategoryCarousel";
import ViewDetailsModal from "./components/ViewDetailsModal";

interface ProductsProps {
  className?: string;
}

export default function ProductsLanding({ className = "" }: ProductsProps) {
  const mockProducts: Product[] = [
  {
    title: "Cámara TP-Link Tapo C500",
    description:
      "Cámara de seguridad exterior con giro e inclinación 360°, resolución Full HD 1080p, visión nocturna a color y detección inteligente de movimiento. Compatible con app Tapo para monitoreo remoto, alertas instantáneas y almacenamiento local en tarjeta microSD hasta 512 GB.",
    image:
      "/assets/imgs/products/product1.webp",
    category: "Seguridad",
    price: 160000
  },
  {
    title: "Servidor NAS Synology DS923+",
    description:
      "Servidor NAS de 4 bahías ideal para pymes, con sistema DiskStation Manager. Soporta RAID, ampliación de bahías hasta 9, memoria expandible y cache SSD NVMe para mejorar rendimiento. Perfecto para backups automáticos, multimedia y acceso remoto seguro.",
    image:
      "/assets/imgs/products/product2.webp",
    category: "Almacenamiento",
    price: 5545000
  },
  {
    title: "Laptop HP 14-dq0530la",
    description:
      "Portátil liviano con pantalla de 14”, procesador Intel Celeron, 8 GB de RAM y SSD de 256 GB. Perfecto para trabajo de oficina, clases virtuales y navegación rápida. Incluye Windows 11 Home y batería de larga duración.",
    image:
      "/assets/imgs/products/product3.avif",
    category: "Computadores",
    price: 1299900
  },
  {
    title: "PC Gamer Ryzen 5 5600G",
    description:
      "Computador gamer armado con procesador AMD Ryzen 5 5600G con gráficos Vega integrados, 16 GB de RAM y SSD NVMe de 512 GB. Ideal para juegos competitivos en 1080p y multitarea fluida para streaming o edición ligera.",
    image:
      "/assets/imgs/products/product4.webp",
    category: "Gaming",
    price: 1831200
  },
  {
    title: "Servidor Blade HPE ProLiant BL460c",
    description:
      "Servidor blade de alta densidad con procesadores Intel Xeon escalables, soporte para virtualización y alto rendimiento. Diseñado para data centers que necesitan optimizar espacio, consumo energético y administración centralizada.",
    image:
      "/assets/imgs/products/product5.jpg",
    category: "Servidores",
    price: 1909800
  },
  {
    title: "NAS Synology DS1821+",
    description:
      "Estación NAS de 8 bahías expandible hasta 18, con procesador AMD Ryzen V1500B y hasta 32 GB de RAM ECC. Ofrece rendimiento empresarial, soporte para máquinas virtuales, snapshots y cifrado avanzado para seguridad de datos.",
    image:
      "/assets/imgs/products/product6.webp",
    category: "Almacenamiento Empresarial",
    price: 9052600
  },   {
    title: "Kit de Paneles Solares EcoPower 5kW",
    description:
      "Sistema de energía solar residencial de 5 kW con 10 paneles monocristalinos, inversor híbrido y monitoreo en tiempo real desde app móvil. Ideal para reducir consumo eléctrico y almacenar energía en baterías.",
    image:
      "/assets/imgs/products/product7.webp",
    category: "Energía Renovable",
    price: 14800000
  },
  {
    title: "Servidor Rack Dell PowerEdge R740",
    description:
      "Servidor en rack de 2U con doble procesador Intel Xeon Silver, hasta 768 GB de RAM y soporte para virtualización avanzada. Diseñado para cargas de trabajo de bases de datos y aplicaciones críticas empresariales.",
    image:
      "/assets/imgs/products/product8.jpg",
    category: "Servidores",
    price: 23600000
  },
  {
    title: "Laptop Gamer ASUS ROG Strix G15",
    description:
      "Portátil gamer con procesador AMD Ryzen 7 6800H, 16 GB de RAM DDR5, SSD de 1 TB y tarjeta gráfica NVIDIA RTX 3060. Pantalla Full HD 144 Hz para gaming competitivo con gran fluidez.",
    image:
      "/assets/imgs/products/product9.webp",
    category: "Gaming",
    price: 6800000
  },
  {
    title: "Cámara de Seguridad Hikvision ColorVu",
    description:
      "Cámara bullet con visión nocturna a color, lente de 2.8 mm, grabación en 4 MP y resistencia IP67 para exteriores. Compatible con NVRs y monitoreo remoto desde móvil.",
    image:
      "/assets/imgs/products/product10.jpg",
    category: "Seguridad",
    price: 310000
  },
  {
    title: "Mini PC Empresarial Intel NUC 13",
    description:
      "Computador ultra compacto con procesador Intel Core i7 de 13.ª generación, 32 GB de RAM y SSD de 1 TB. Ideal para oficinas modernas, puntos de venta y entornos donde el espacio es limitado.",
    image:
      "/assets/imgs/products/product11.webp",
    category: "Computadores",
    price: 5200000
  }
];

  const {
    selectedFilters,
    handleToggleFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
  } = useProducts(mockProducts);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estado para el modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={className}>
      <Nav />
      <Banner />

      <LayoutProductos>
        <CategoryCarousel />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FilterBar
            selectedFilters={selectedFilters}
            handleToggle={handleToggleFilter}
            className="w-full lg:w-64 flex-shrink-0"
          />

          <div className="flex-1 flex flex-col gap-6">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((product, index) => (
                <CardProducts
                  key={index}
                  title={product.title}
                  description={product.description}
                  category={product.category}
                  image={product.image}
                  price={product.price}
                  onViewDetails={() => handleViewDetails(product)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => setCurrentPage(page)}
            />
          </div>
        </div>
      </LayoutProductos>

      <Footer />

      {/* Modal */}
      {selectedProduct && (
        <ViewDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
