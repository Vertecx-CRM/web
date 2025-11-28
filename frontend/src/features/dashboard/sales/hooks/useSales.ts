"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSales } from "../api/sales.api";
import { ISale } from "../types/Sales.type";

let CACHE: ISale[] | null = null; // cache simple en memoria

export const useSales = () => {
  const [sales, setSales] = useState<ISale[]>(CACHE ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSales = useCallback(async () => {
    if (CACHE) return; // ⚡ no recarga si ya existe

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const data = await getSales(controller.signal);
      CACHE = data;
      setSales(data);
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error("Error loading sales", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    return () => abortRef.current?.abort();
  }, [fetchSales]);

  return {
    sales,
    loading,
    reloadSales: fetchSales,
  };
};
