export function normalizeServiceTypeCode(value: unknown): string {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized.includes("instal")) return "INSTALACION";
  if (normalized.includes("manten")) return "MANTENIMIENTO";
  return String(value ?? "").trim().toUpperCase();
}

export function isInstallationServiceType(value: unknown): boolean {
  return normalizeServiceTypeCode(value) === "INSTALACION";
}

export function getServiceTypeDisplayLabel(value: unknown): string {
  return isInstallationServiceType(value) ? "Instalacion" : "Mantenimiento";
}

export function getRequestStageLabel(value: unknown): string {
  if (isInstallationServiceType(value)) {
    return "Asesoria tecnica previa a instalacion";
  }

  const normalized = normalizeServiceTypeCode(value);
  if (normalized === "MANTENIMIENTO") return "Solicitud de mantenimiento";
  return "Solicitud de servicio";
}

export function getAssessmentFeeLabel(value?: unknown): string {
  if (isInstallationServiceType(value)) {
    return "Asesoria tecnica previa";
  }
  return "Visita tecnica";
}

export function getInstallationAssessmentExplainer(): string {
  return "Primero realizamos una asesoria tecnica para revisar el sitio, definir materiales y validar el alcance antes de programar la instalacion.";
}

export function buildPreInstallationAssessmentDescription(
  description?: string | null,
  linkedEntityLabel?: string | null,
): string {
  const parts = [
    "Asesoria tecnica previa a instalacion para definir materiales, alcance y condiciones del sitio.",
    String(description ?? "").trim(),
    linkedEntityLabel ? String(linkedEntityLabel).trim() : "",
  ].filter(Boolean);

  return parts.join(" | ");
}
