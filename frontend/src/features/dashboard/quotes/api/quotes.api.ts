import { api } from "@/shared/utils/apiClient";
import { showError } from "@/shared/utils/notifications";

export const createQuote = async (payload: any) => {
  try {
    const { data } = await api.post("/quotes", payload);
    return data;
  } catch (error) {
    console.error("Error al crear la cotización:", error);
    showError("Error al crear la cotización. Inténtalo nuevamente.");
    throw error;
  }
};

export const getQuotes = async () => {
  try {
    const { data } = await api.get("/quotes");
    return data;
  } catch (error) {
    console.error("Error al obtener las cotizaciones:", error);
    showError("Error al obtener las cotizaciones");
    throw error;
  }
};

export const getCustomersForQuote = async (): Promise<any> => {
  try {
    const { data } = await api.get("/customers");
    return data;
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    showError("Error al obtener los clientes");
    throw error;
  }
};

export const getTechniciansForQuote = async (): Promise<any> => {
  try {
    const { data } = await api.get("/technicians");
    return data;
  } catch (error) {
    console.error("Error al obtener los tecnicos:", error);
    showError("Error al obtener los tecnicos");
    throw error;
  }
};

export const getProductsForQuote = async (): Promise<any> => {
  try {
    const { data } = await api.get("/products");
    return data;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    showError("Error al obtener los productos");
    throw error;
  }
};
