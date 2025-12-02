import { api } from "@/lib/api";
import { ISale } from "../types/Sales.type";

export const getSales = async (signal?: AbortSignal): Promise<ISale[]> => {
  const { data } = await api.get<ISale[]>("/sales", {
    signal,
    timeout: 4000,
  });
  return data;
};

export const createSale = async (sale: Partial<ISale>) => {
  try {
    const { data } = await api.post("/sales", sale);
    return data;
  } catch (error) {
    console.error("Error al crear la venta:", error);
    throw error;
  }
};
