import { api } from "@/shared/utils/apiClient";
import { showError } from "@/shared/utils/notifications";

const normalizeText = (value?: string | null) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isCanceledLikeQuote = (quote: any) => {
  const stateId = Number(quote?.state?.stateid ?? quote?.statesid ?? 0);
  if (stateId === 4 || stateId === 8) return true;

  const stateName = normalizeText(
    quote?.state?.name ?? quote?.state?.description ?? quote?.status ?? ""
  );

  return (
    stateName.includes("cancel") ||
    stateName.includes("anul") ||
    stateName.includes("revoke")
  );
};

const isCompletedLikeQuote = (quote: any) => {
  const stateId = Number(quote?.state?.stateid ?? quote?.statesid ?? 0);
  if (stateId === 6) return true;

  const stateName = normalizeText(quote?.state?.name ?? quote?.status ?? "");
  return (
    stateName.includes("finish") ||
    stateName.includes("finaliz") ||
    stateName.includes("complet")
  );
};

const hasAssignedTechnician = (request: any) => {
  const techMap = Array.isArray(request?.techniciansMap) ? request.techniciansMap : [];
  if (techMap.some((item) => Number(item?.technicianId ?? item?.technician?.technicianid ?? 0) > 0)) {
    return true;
  }

  const technicians = Array.isArray(request?.technicians) ? request.technicians : [];
  return technicians.some((item) => Number(item?.technicianid ?? item?.id ?? 0) > 0);
};

const isAvailableRequestForQuote = (request: any, activeRequestIds: Set<number>) => {
  const requestId = Number(
    request?.serviceRequestId ?? request?.servicerequestid ?? request?.id ?? 0
  );
  if (!requestId || activeRequestIds.has(requestId)) return false;
  if (!hasAssignedTechnician(request)) return false;

  const stateId = Number(request?.stateId ?? request?.stateid ?? request?.state?.stateid ?? 0);
  if (stateId === 4 || stateId === 6 || stateId === 8) return false;

  const stateName = normalizeText(
    request?.state?.name ?? request?.state?.description ?? request?.status ?? ""
  );
  if (
    stateName.includes("cancel") ||
    stateName.includes("anul") ||
    stateName.includes("finish") ||
    stateName.includes("finaliz")
  ) {
    return false;
  }

  return true;
};

export const createQuote = async (payload: any) => {
  try {
    const { data } = await api.post("/quotes", payload);
    return data;
  } catch (error) {
    console.error("Error al crear la cotizacion:", error);
    showError("Error al crear la cotizacion. Intentalo nuevamente.");
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

export const getProductsForQuote = async (): Promise<any[]> => {
  try {
    const { data } = await api.get("/products");
    return data;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    showError("Error al obtener los productos");
    throw error;
  }
};

export const getServicesRequestsForQuote = async (): Promise<any[]> => {
  try {
    const [{ data: requests }, { data: quotes }] = await Promise.all([
      api.get("/service-requests"),
      api.get("/quotes"),
    ]);

    const activeRequestIds = new Set<number>(
      (Array.isArray(quotes) ? quotes : [])
        .filter((quote: any) => !isCanceledLikeQuote(quote) && !isCompletedLikeQuote(quote))
        .map((quote: any) =>
          Number(
            quote?.serviceRequest?.serviceRequestId ??
              quote?.serviceRequestId ??
              quote?.servicerequestid ??
              0
          )
        )
        .filter((id) => Number.isFinite(id) && id > 0)
    );

    return (Array.isArray(requests) ? requests : []).filter((request: any) =>
      isAvailableRequestForQuote(request, activeRequestIds)
    );
  } catch (error) {
    console.error("Error al obtener las solicitudes de servicio:", error);
    showError("Error al obtener las solicitudes de servicio");
    throw error;
  }
};

export const approveQuote = async (quoteId: number): Promise<void> => {
  try {
    await api.patch(`/quotes/${quoteId}/approve`);
  } catch (error) {
    console.error("Error al aprobar la cotizacion:", error);
    showError("Error al aprobar la cotizacion. Intentalo nuevamente.");
    throw error;
  }
};

export const acceptQuote = async (
  quoteId: number,
  observation?: string
): Promise<void> => {
  try {
    await api.patch(`/quotes/${quoteId}/accept-client`, {
      observation: observation ?? null,
    });
  } catch (error) {
    console.error("Error al aceptar la cotizacion:", error);
    showError("Error al aceptar la cotizacion. Intentalo nuevamente.");
    throw error;
  }
};

export const completeQuote = async (quoteId: number): Promise<any> => {
  try {
    const { data } = await api.patch(`/quotes/${quoteId}/complete`);
    return data;
  } catch (error) {
    console.error("Error al completar la cotizacion:", error);
    showError("Error al completar la cotizacion. Intentalo nuevamente.");
    throw error;
  }
};

export const linkQuoteOrder = async (
  quoteId: number,
  ordersServicesId: number
): Promise<any> => {
  try {
    const { data } = await api.patch(`/quotes/${quoteId}/link-order`, {
      ordersServicesId,
    });
    return data;
  } catch (error) {
    console.error("Error al vincular la cotizacion con la orden:", error);
    showError("No se pudo vincular la cotizacion con la orden.");
    throw error;
  }
};

export const revokeQuote = async (
  quoteId: number,
  observation?: string
): Promise<void> => {
  try {
    await api.patch(`/quotes/${quoteId}/cancel`, {
      observation: observation ?? null,
    });
  } catch (error) {
    console.error("Error al revocar la cotizacion:", error);
    showError("Error al revocar la cotizacion. Intentalo nuevamente.");
    throw error;
  }
};

export const cancelQuote = async (
  quoteId: number,
  observation?: string
): Promise<void> => {
  try {
    await api.patch(`/quotes/${quoteId}/cancel-client`, {
      observation: observation ?? null,
    });
  } catch (error) {
    console.error("Error al cancelar la cotizacion:", error);
    showError("Error al cancelar la cotizacion. Intentalo nuevamente.");
    throw error;
  }
};
