import { api } from "@/shared/utils/apiClient";
import { IPurchase } from "../Types/Purchase.type";

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
  const { data } = await api.post("/purchasesmanagement", purchase);
  return data;
};

// Anular una compra (actualizar estado)
export const cancelPurchase = async (id: number) => {
  const { data } = await api.patch(`/purchasesmanagement/${id}`, {
    stateid: 2, // Asumiendo que 2 = Anulado
  });
  return data;
};
