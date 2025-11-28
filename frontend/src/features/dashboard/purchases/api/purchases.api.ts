import { api } from "@/shared/utils/apiClient";
import { IPurchase } from "../Types/Purchase.type";
import { showError } from "@/shared/utils/notifications";

// Obtener todas las compras
export const getPurchases = async (
  signal?: AbortSignal
): Promise<IPurchase[]> => {
  const { data } = await api.get("/purchasesmanagement", {
    signal,
    timeout: 4000,
  });

  return data.map((p: any) => ({
    ...p,
    amount: parseFloat(p.amount),
  }));
};

export const getPurchaseById = async (id: number): Promise<IPurchase> => {
  try {
    const { data } = await api.get(`/purchasesmanagement/${id}`);
    return { ...data, amount: parseFloat(data.amount) };
  } catch (error) {
    console.error("Error al obtener la compra:", error);
    showError("Error al obtener la compra. Por favor, inténtalo de nuevo.");
    throw error;
  }
};
// Crear una nueva compra
export const createPurchase = async (purchase: Partial<IPurchase>) => {
  try {
    const { data } = await api.post("/purchasesmanagement", purchase);
    return data;
  } catch (error) {
    console.error("Error al crear la compra:", error);
    showError("Error al crear la compra. Por favor, inténtalo de nuevo.");
    throw error;
  }
};

// Anular una compra (actualizar estado)
export const cancelPurchase = async (id: number) => {
  try {
    const { data } = await api.post(`/purchasesmanagement/${id}/cancel`);
    return data;
  } catch (error) {
    console.error("Error al anular la compra:", error);
    showError("Error al anular la compra. Por favor, inténtalo de nuevo.");
    throw error;
  }
};

export const getProductsForPurchase = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getSuppliersForPurchase = async () => {
  const response = await api.get("/suppliers");
  return response.data.data;
};
