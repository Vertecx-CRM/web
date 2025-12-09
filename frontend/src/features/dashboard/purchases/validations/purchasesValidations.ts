// purchasesValidations.ts
import { IPurchase } from "@/features/dashboard/purchases/Types/Purchase.type";

export interface PurchaseErrors {
  orderNumber?: string;
  invoiceNumber?: string;
  supplier?: string;
  registerDate?: string;
  amount?: string;
  status?: string;
  description?: string;
  products?: string;
}

/**
 * Valida un campo individual de una compra
 */
export const validatePurchaseField = (
  field: any,
  value: any,
  purchases: IPurchase[] = [],
  currentId?: number
): string | undefined => {
  switch (field) {
    case "orderNumber":
      if (!String(value).trim()) return "El número de orden es obligatorio";
      if (
        (purchases ?? []).some(
          (p) =>
            p.orderNumber.toLowerCase() ===
              String(value).trim().toLowerCase() && p.id !== currentId
        )
      ) {
        return "Ya existe una compra con este número de orden";
      }
      return;

    case "invoiceNumber":
      if (!String(value).trim()) return "El número de factura es obligatorio";

      // Validar formato tipo FAC-2025-1001 (sin importar mayúsculas/minúsculas)
      const invoicePattern = /^fac-\d{4}-\d{4}$/i;
      if (!invoicePattern.test(String(value).trim()))
        return "El formato debe ser FAC-AAAA-NNNN (ej: FAC-2025-1001)";

      if (
        (purchases ?? []).some(
          (p) =>
            p.invoiceNumber?.toLowerCase() ===
              String(value).trim().toLowerCase() && p.id !== currentId
        )
      ) {
        return "Ya existe una compra con este número de factura";
      }

      return;

    case "supplier":
      if (!value) return "El proveedor es obligatorio";
      return;

    case "registerDate":
      if (!value) return "La fecha de registro es obligatoria";
      // Validación: que no sea una fecha futura
      const today = new Date();
      const dateValue = new Date(value);
      if (dateValue > today) return "La fecha de registro no puede ser futura";
      return;

    case "amount":
      if (value === undefined || value === null || value === "")
        return "El monto total es obligatorio";
      const numericAmount = Number(String(value).replace(/[^\d.-]/g, ""));
      if (isNaN(numericAmount) || numericAmount <= 0)
        return "El monto debe ser mayor que 0";
      return;

    case "status":
      if (!value) return "El estado es obligatorio";
      if (!["Aprobado", "Anulado", "Pendiente"].includes(value))
        return "Estado inválido";
      return;

    case "description":
      // Campo opcional
      return;

    default:
      return;
  }
};

/**
 * Valida todo el formulario de compra
 */
export const validatePurchaseForm = (
  data: Omit<IPurchase, "id">,
  purchases: IPurchase[],
  currentId?: number
): PurchaseErrors => {
  const errors: PurchaseErrors = {};

  const fields: any[] = [
    "registerDate",
    "status",
    "numberoforder",
    "invoiceNumber",
    "supplierid",
    "amount",
    "description",
  ];

  fields.forEach((field) => {
    const error = validatePurchaseField(
      field as any,
      (data as any)[field],
      purchases ?? [],
      currentId
    );
    if (error) errors[field] = error;
  });

  return errors;
};
