import { api } from "@/lib/api";
import { ISale } from "../types/Sales.type";

export const getSales = async (signal?: AbortSignal): Promise<ISale[]> => {
  const { data } = await api.get<ISale[]>("/sales", {
    signal,
    timeout: 4000,
  });
  return data;
};

export const getCustomersForSale = async (): Promise<any[]> => {
  try {
    const { data } = await api.get<any[]>("/customers");
    return data;
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw new Error(
      error?.response?.data?.message ??
        "No se pudo cargar el listado de clientes."
    );
  }
};

export const getProductsForSale = async (): Promise<any[]> => {
  try {
    const { data } = await api.get<any[]>("/products", {
      params: { status: "active" },
    });
    return data;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    throw new Error(
      error?.response?.data?.message ??
        "No se pudo cargar el listado de productos."
    );
  }
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

export const getSaleById = async (id: number): Promise<ISale> => {
  try {
    const { data } = await api.get(`/sales/${id}`);
    return data;
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    throw error;
  }
};

   // ANULAR VENTA (FALTABA)

export const cancelSale = async (
  saleid: number,
  data: { observation: string }
) => {
  try {
    const response = await api.patch(`/sales/${saleid}/cancel`, data);
    return response.data;
  } catch (error) {
    console.error("Error al anular la venta:", error);
    throw error;
  }
};

