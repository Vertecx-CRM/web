import { useState, useMemo } from "react";

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  price?: number;
}

export const useProducts = (products: Product[]) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleFilter = (id: string) => {
    if (id === "all") {
      setSelectedFilters(["all"]);
    } else {
      let updated;
      if (selectedFilters.includes(id)) {
        updated = selectedFilters.filter((f) => f !== id);
      } else {
        updated = [...selectedFilters.filter((f) => f !== "all"), id];
      }
      setSelectedFilters(updated.length > 0 ? updated : ["all"]);
    }
  };

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return products.filter((product) => {
      const normalizedCategory = normalizeText(product.category);
      const normalizedTitle = normalizeText(product.title);
      const normalizedDescription = normalizeText(product.description);

      const categoryMatch =
        selectedFilters.includes("all") ||
        selectedFilters.some((f) => normalizeText(f) === normalizedCategory);

      const searchMatch =
        normalizedTitle.includes(normalizedSearch) ||
        normalizedDescription.includes(normalizedSearch) ||
        normalizedCategory.includes(normalizedSearch);

      return categoryMatch && searchMatch;
    });
  }, [products, selectedFilters, searchTerm]);

  return {
    selectedFilters,
    handleToggleFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
  };
};
