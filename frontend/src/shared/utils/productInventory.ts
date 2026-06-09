export type InventoryCategoryScope = "sellable" | "service_material" | "tool";

function normalizeCategoryText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getInventoryCategoryScope(categoryName?: string | null): InventoryCategoryScope {
  const normalized = normalizeCategoryText(categoryName);

  if (!normalized) return "sellable";
  if (normalized.includes("herramient")) return "tool";
  if (
    (normalized.includes("material") && normalized.includes("servicio")) ||
    normalized.includes("inventario tecnico")
  ) {
    return "service_material";
  }
  return "sellable";
}

export function isLandingVisibleProductCategory(categoryName?: string | null) {
  return getInventoryCategoryScope(categoryName) === "sellable";
}

export function isQuoteSelectableProductCategory(categoryName?: string | null) {
  return getInventoryCategoryScope(categoryName) !== "tool";
}

export function getInventoryCategoryScopeLabel(scope: InventoryCategoryScope) {
  switch (scope) {
    case "service_material":
      return "Material de servicio";
    case "tool":
      return "Herramienta";
    default:
      return "Producto";
  }
}
