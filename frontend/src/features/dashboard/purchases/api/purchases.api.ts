import { api } from "@/shared/utils/apiClient";
import { IPurchase } from "../Types/Purchase.type";
import { showError } from "@/shared/utils/notifications";

// Obtener todas las compras
export const getPurchases = async (): Promise<IPurchase[]> => {
  const { data } = await api.get("/purchasesmanagement");

  // Normalizamos el amount a number
  return data.map((p: any) => ({
    ...p,
    amount: parseFloat(p.amount),
  }));
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
  const { data } = await api.patch(`/purchasesmanagement/${id}`, {
    stateid: 2, // Asumiendo que 2 = Anulado
  });
  return data;
};

export const getProductsForPurchase = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getSuppliersForPurchase = async () => {
  const response = await api.get("/suppliers");
  return response.data.data;
};
