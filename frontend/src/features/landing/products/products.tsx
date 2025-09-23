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
      title: "Laptop Gamer",
      description:
        "Laptop con procesador Intel i7, 16GB RAM y tarjeta gráfica RTX 3060 Laptop con procesador Intel i7, 16GB RAM y tarjeta gráfica RTX 3060.Laptop con procesador Intel i7, 16GB RAM y tarjeta gráfica RTX 3060.Laptop con procesador Intel i7, 16GB RAM y tarjeta gráfica RTX 3060.Laptop con procesador Intel i7, 16GB RAM y tarjeta gráfica RTX 3060.",
      image: "/assets/imgs/services/imgprovicionales/img7.jpg",
      category: "Electrónica",
      price: 5200000,
    },
    {
      title: "Impresora 3D",
      description:
        "Impresora 3D de alta precisión para prototipos y piezas mecánicas.",
      image: "https://res.cloudinary.com/dn4snnwkt/image/upload/v1758592233/bannerproducts_jpptnk.jpg",
      category: "Hardware",
      price: 2800000,
    },
    {
      title: "Monitor UltraWide",
      description: "Monitor 34'' 144Hz, ideal para diseño y gaming.",
      image: "/assets/imgs/products/img3.jpg",
      category: "Electrónica",
      price: 1700000,
    },
    {
      title: "Teclado Mecánico",
      description:
        "Teclado mecánico con switches rojos, retroiluminación RGB y macros programables.",
      image: "/assets/imgs/products/img4.jpg",
      category: "Periféricos",
      price: 350000,
    },
    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },    {
      title: "Router WiFi 6",
      description:
        "Router de última generación con cobertura hasta 200m2 y 4 antenas externas.",
      image: "/assets/imgs/products/img5.jpg",
      category: "Networking",
      price: 480000,
    },
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
