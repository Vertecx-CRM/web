export const translateSaleStatus = (status?: string): string => {
  if (!status) return "Pendiente";
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "pending":
      return "Pendiente";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Completado";
    default:
      return status;
  }
};
