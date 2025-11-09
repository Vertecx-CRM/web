import { useState, useEffect } from "react";
import { Category } from "../types/typeCategoryProducts";

export const useViewCategory = (category: Category | null) => {
  const [currentIcon, setCurrentIcon] = useState<File | string | null>(null);

  useEffect(() => {
    if (category) {
      setCurrentIcon(category.icon || null);
    }
  }, [category]);

  return { currentIcon };
};
