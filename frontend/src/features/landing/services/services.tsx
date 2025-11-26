"use client";

import React, { useEffect, useMemo, useState } from "react";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import Banner from "./components/Banner";
import LayoutServicios from "./components/LayoutServicios";
import FilterBar, { FilterItem } from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import CardServices from "./components/CardServices";
import Pagination from "./components/Pagination";
import { useServices, Service } from "./hooks/useServices";
import { fetchLandingServices, fetchLandingServiceTypes } from "./api/servicesLanding.api";

interface ServicesProps {
  className?: string;
}

export default function ServicesLanding({ className = "" }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const load = async () => {
      try {
        const [list, types] = await Promise.all([
          fetchLandingServices({ page: 1, limit: 200, stateid: 1 }),
          fetchLandingServiceTypes(),
        ]);

        setServices(Array.isArray(list) ? list : []);
        setTypeNames(Array.isArray(types) ? types : []);
      } catch {
        setServices([]);
        setTypeNames([]);
      }
    };

    load();
  }, []);

  const filters: FilterItem[] = useMemo(() => {
    const unique = Array.from(new Set(typeNames)).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );

    return [{ id: "all", label: "Todos" }, ...unique.map((n) => ({ id: n, label: n }))];
  }, [typeNames]);

  const { selectedFilters, handleToggleFilter, searchTerm, setSearchTerm, filteredServices } =
    useServices(services);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters, services]);

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
            filters={filters}
            selectedFilters={selectedFilters}
            handleToggle={handleToggleFilter}
            className="w-full lg:w-64 flex-shrink-0"
          />

          <div className="flex-1 flex flex-col gap-6">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedServices.map((service) => (
                <CardServices
                  key={service.id ?? `${service.title}-${service.category}`}
                  title={service.title}
                  description={service.description || "Sin descripción"}
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
