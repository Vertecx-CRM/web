import { api } from "@/lib/api";
import { AxiosError } from "axios";
import { ISale } from "../types/sales.type";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://vertecx-back-c5abeza7bwcrg2hh.canadacentral-01.azurewebsites.net/";

export type WompiCheckoutSessionDTO = {
  saleId: number;
  saleCode: string;
  wompiEnv: "sandbox" | "production";
  publicKey: string;
  currency: "COP";
  amountInCents: number;
  reference: string;
  redirectUrl: string;
  expirationTime: string;
  signature: {
    integrity: string;
  };
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix?: string;
    legalId?: string;
    legalIdType?: string;
  };
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    phoneNumber?: string;
    region?: string;
    country?: string;
  };
};

export type WompiTransactionSyncDTO = {
  saleId: number;
  saleCode: string | null;
  reference: string;
  transactionId: string;
  transactionStatus: string;
  transactionStatusMessage: string;
  paymentMethod: string;
  amountInCents: number;
  currency: string;
  paymentState: string | null;
  saleStatus: string | null;
};

export const getSales = async (signal?: AbortSignal): Promise<ISale[]> => {
  const { data } = await api.get<ISale[]>("/sales", {
    signal,
    timeout: 4000,
  });
  return data;
};

export const getCustomersForSale = async (): Promise<any[]> => {
  try {
    const { data } = await api.get<any[]>("/customers", {
      params: { includeRelations: true },
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al obtener los clientes:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo cargar el listado de clientes.";
      throw new Error(message);
    }
    console.error("Error al obtener los clientes:", error);
    throw new Error("No se pudo cargar el listado de clientes.");
  }
};

export const getProductsForSale = async (): Promise<any[]> => {
  try {
    const { data } = await api.get<any[]>("/products", {
      params: { status: "active" },
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al obtener los productos:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo cargar el listado de productos.";
      throw new Error(message);
    }
    console.error("Error al obtener los productos:", error);
    throw new Error("No se pudo cargar el listado de productos.");
  }
};

export const createSale = async (sale: Partial<ISale>) => {
  try {
    const { data } = await api.post("/sales", sale);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al crear la venta:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo crear la venta.";
      throw new Error(message);
    }
    console.error("Error al crear la venta:", error);
    throw new Error("No se pudo crear la venta.");
  }
};

export const createSaleFromAuth = async (sale: Record<string, unknown>) => {
  try {
    const { data } = await api.post("/sales/from-auth", sale);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al crear la venta desde el cliente:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo crear la compra.";
      throw new Error(message);
    }
    console.error("Error al crear la venta desde el cliente:", error);
    throw new Error("No se pudo crear la compra.");
  }
};

export const createWompiCheckoutSession = async (
  saleId: number,
  input: { redirectUrl: string }
): Promise<WompiCheckoutSessionDTO> => {
  try {
    const { data } = await api.post<WompiCheckoutSessionDTO>(
      `/payments/wompi/sales/${saleId}/checkout-session`,
      input
    );
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        "Error al crear la sesion de pago con Wompi:",
        error.response?.data ?? error
      );
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo iniciar el checkout de Wompi.";
      throw new Error(message);
    }
    console.error("Error al crear la sesion de pago con Wompi:", error);
    throw new Error("No se pudo iniciar el checkout de Wompi.");
  }
};

export const syncWompiTransaction = async (
  transactionId: string,
  saleId: number
): Promise<WompiTransactionSyncDTO> => {
  try {
    const { data } = await api.get<WompiTransactionSyncDTO>(
      `/payments/wompi/transactions/${transactionId}`,
      {
        params: { saleId },
      }
    );
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        "Error al sincronizar la transaccion de Wompi:",
        error.response?.data ?? error
      );
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo confirmar el estado del pago.";
      throw new Error(message);
    }
    console.error("Error al sincronizar la transaccion de Wompi:", error);
    throw new Error("No se pudo confirmar el estado del pago.");
  }
};

export const syncWompiTransactionForCheckout = async (
  transactionId: string,
  saleId: number,
  reference: string
): Promise<WompiTransactionSyncDTO> => {
  try {
    const response = await fetch(
      `${API_URL}payments/wompi/public/transactions/${encodeURIComponent(
        transactionId
      )}?saleId=${encodeURIComponent(String(saleId))}&reference=${encodeURIComponent(reference)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        payload?.message ?? payload?.error ?? "No se pudo confirmar el estado del pago.";
      throw new Error(Array.isArray(message) ? message.join(" | ") : String(message));
    }

    return payload as WompiTransactionSyncDTO;
  } catch (error: unknown) {
    console.error("Error al sincronizar la transaccion publica de Wompi:", error);
    throw error instanceof Error
      ? error
      : new Error("No se pudo confirmar el estado del pago.");
  }
};

export const cancelSale = async (id: number, observation: string) => {
  try {
    const { data } = await api.patch(`/sales/${id}/cancel`, {
      observation,
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al cancelar la venta:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo cancelar la venta.";
      throw new Error(message);
    }
    console.error("Error al cancelar la venta:", error);
    throw new Error("No se pudo cancelar la venta.");
  }
};

export const completeSale = async (id: number) => {
  try {
    const { data } = await api.patch(`/sales/${id}`, { salestatus: "Completed" });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al completar la venta:", error.response?.data ?? error);
      const message =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message ??
        "No se pudo completar la venta.";
      throw new Error(message);
    }
    console.error("Error al completar la venta:", error);
    throw new Error("No se pudo completar la venta.");
  }
};

export const getSaleById = async (id: number): Promise<ISale> => {
  try {
    const { data } = await api.get(`/sales/${id}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error al obtener la venta:", error.response?.data ?? error);
    } else {
      console.error("Error al obtener la venta:", error);
    }
    throw error;
  }
};

export const getSaleCheckoutSummary = async (
  id: number,
  reference: string
): Promise<ISale> => {
  try {
    const response = await fetch(
      `${API_URL}sales/${encodeURIComponent(String(id))}/checkout-summary?reference=${encodeURIComponent(reference)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        payload?.message ?? payload?.error ?? "No se pudo obtener la venta.";
      throw new Error(Array.isArray(message) ? message.join(" | ") : String(message));
    }

    return payload as ISale;
  } catch (error: unknown) {
    console.error("Error al obtener el resumen publico de la venta:", error);
    throw error instanceof Error ? error : new Error("No se pudo obtener la venta.");
  }
};
