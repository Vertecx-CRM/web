import type { InventoryCategoryScope } from "./productInventory";

export type OrderMaterialAvailability = "DISPONIBLE" | "SOLICITAR";

export type OrderMaterialPlanInput = {
  requestedQty: number;
  stock: number;
  scope?: InventoryCategoryScope | null;
  manualEntry?: boolean;
  forcedAvailability?: OrderMaterialAvailability | null;
};

export type OrderMaterialPlan = {
  requestedQty: number;
  stockCoveredQty: number;
  backorderQty: number;
  availability: OrderMaterialAvailability;
};

export function supportsOrderBackorder(scope?: InventoryCategoryScope | null) {
  return scope === "service_material" || scope === "tool";
}

export function computeOrderMaterialPlan(
  input: OrderMaterialPlanInput
): OrderMaterialPlan {
  const requestedQty = Math.max(1, Math.round(Number(input.requestedQty || 0)));
  const stock = Math.max(0, Math.round(Number(input.stock || 0)));
  const scope = input.scope ?? "sellable";
  const manualEntry = !!input.manualEntry;

  if (!supportsOrderBackorder(scope)) {
    return {
      requestedQty,
      stockCoveredQty: requestedQty,
      backorderQty: 0,
      availability: "DISPONIBLE",
    };
  }

  const stockCoveredQty = manualEntry ? 0 : Math.min(requestedQty, stock);
  const backorderQty = Math.max(0, requestedQty - stockCoveredQty);
  const availability =
    input.forcedAvailability === "SOLICITAR" || manualEntry || backorderQty > 0
      ? "SOLICITAR"
      : "DISPONIBLE";

  return {
    requestedQty,
    stockCoveredQty,
    backorderQty,
    availability,
  };
}
