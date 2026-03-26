"use client";

import React, { useState } from "react";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import Banner from "./components/Banner";
import LayoutProductos from "./components/LayoutProductos";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";
import { useProducts, Product } from "./hooks/useProducts";
import CategoryCarousel from "./components/CategoryCarousel";
import { useCart } from "../contexts/CartContext";
import { showSuccess, showError } from "@/shared/utils/notifications";
import { LayoutGrid, ListFilter } from "lucide-react";
import CardProduct from "./components/CardProducts";

export default function ProductsLanding() {
  const { addToCart, cart } = useCart();
  const {
    loading,
    selectedFilters,
    handleToggleFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    availableCategories,
  } = useProducts([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleAddToCart = (product: Product) => {
    if ((product.stock ?? 0) <= 0) {
      showError("Producto agotado.");
      return;
    }
    const itemInCart = cart.find(
      (item) => String(item.id) === String(product.id),
    );
    if ((itemInCart?.quantity ?? 0) >= (product.stock ?? 0)) {
      showError(`Stock máximo alcanzado: ${product.stock}`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price ?? 0,
      stock: product.stock,
      image: product.image || "/assets/imgs/default-product.png",
    });
    showSuccess("Equipo añadido al carrito");
  };

  return (
    <div className="bg-[#E8E8E8]/40 min-h-screen font-sans">
      <Nav />

      {/* Banner con mayor impacto visual */}
      <section className="relative overflow-hidden">
        <Banner />
      </section>

      <LayoutProductos>
        <div className="py-8 space-y-10">
          {/* Cabecera Técnica */}
          <div className="border-b border-[#626262]/10 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-[#B20000] uppercase tracking-[0.4em]">
                SistemasPC Catalog
              </h2>
              <p className="text-3xl font-black text-[#0D141C] uppercase tracking-tighter">
                Explora nuestro Hardware
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-[#626262]/10 text-[10px] font-bold uppercase tracking-widest text-[#717680]">
              {filteredProducts.length} Productos Encontrados
            </div>
          </div>

          <CategoryCarousel />

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar de Filtros Refinado */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center gap-2 text-[#0D141C] mb-4">
                  <ListFilter size={18} className="text-[#B20000]" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Filtros de Precisión
                  </span>
                </div>
                <FilterBar
                  selectedFilters={selectedFilters}
                  handleToggle={handleToggleFilter}
                  categories={availableCategories}
                  className="bg-white p-6 rounded-2xl border border-[#626262]/10 shadow-sm"
                />
              </div>
            </aside>

            {/* Grid Principal */}
            <main className="flex-1 space-y-8">
              <div className="bg-white p-4 rounded-2xl border border-[#626262]/10 shadow-sm">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl h-[450px] animate-pulse border border-[#626262]/10"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayedProducts.map((product) => (
                      <CardProduct
                        key={product.id}
                        id={String(product.id)}
                        title={product.title}
                        description={product.description}
                        category={product.category}
                        image={product.image}
                        price={product.price}
                        stock={product.stock}
                        quantityInCart={
                          cart.find((item) => String(item.id) === String(product.id))
                            ?.quantity ?? 0
                        }
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ))}
                  </div>

                  {displayedProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#626262]/30">
                      <Package
                        className="mx-auto text-gray-300 mb-4"
                        size={64}
                      />
                      <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                        No se encontraron equipos
                      </p>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="pt-10 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </LayoutProductos>

      <Footer />
    </div>
  );
}
