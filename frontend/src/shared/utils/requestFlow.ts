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

export function normalizeRequestMode(value: unknown): string {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (!normalized) return "";
  if (normalized.includes("direct")) return "DIRECT_INSTALLATION";
  if (normalized.includes("asesor")) return "ASSESSMENT";
  return normalized.toUpperCase();
}

export function isDirectInstallationRequestMode(value: unknown): boolean {
  return normalizeRequestMode(value) === "DIRECT_INSTALLATION";
}

export function getServiceTypeDisplayLabel(value: unknown): string {
  return isInstallationServiceType(value) ? "Instalacion" : "Mantenimiento";
}

export function getRequestModeLabel(value: unknown): string {
  if (isDirectInstallationRequestMode(value)) {
    return "Instalacion directa sujeta a validacion tecnica";
  }
  return "Asesoria tecnica previa a instalacion";
}

export function getRequestStageLabel(
  value: unknown,
  requestMode?: unknown
): string {
  if (isInstallationServiceType(value)) {
    return getRequestModeLabel(requestMode);
  }

  const normalized = normalizeServiceTypeCode(value);
  if (normalized === "MANTENIMIENTO") return "Solicitud de mantenimiento";
  return "Solicitud de servicio";
}

export function getTechnicalReviewStatusLabel(value: unknown): string {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "READY_TO_QUOTE") return "Lista para cotizar";
  if (normalized === "ASSESSMENT_REQUIRED") return "Requiere asesoria";
  if (normalized === "PENDING_REVIEW") return "Pendiente de revision";
  if (normalized === "NOT_APPLICABLE") return "No aplica";
  return "Sin definir";
}

export function shouldChargeAssessmentVisit(
  serviceType: unknown,
  requestMode?: unknown
): boolean {
  if (!isInstallationServiceType(serviceType)) return true;
  return !isDirectInstallationRequestMode(requestMode);
}

export function getDirectInstallationExplainer(): string {
  return "El cliente ya cuenta con materiales o contexto del sitio. El equipo revisa la informacion y define si puede cotizar directo o si primero hace falta una asesoria tecnica.";
}

export function getTechnicalReviewStatusHelp(value: unknown): string {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (normalized === "READY_TO_QUOTE") {
    return "La informacion enviada ya permite preparar la cotizacion.";
  }
  if (normalized === "ASSESSMENT_REQUIRED") {
    return "Hace falta una asesoria tecnica previa antes de cotizar la instalacion.";
  }
  if (normalized === "PENDING_REVIEW") {
    return "El admin o tecnico aun debe revisar fotos, materiales y condiciones del sitio.";
  }
  return "";
}

export function getInstallationModeOptions() {
  return [
    {
      value: "ASSESSMENT" as const,
      label: "Asesoria tecnica previa",
      description:
        "Incluye la visita de validacion antes de cotizar materiales y la instalacion.",
    },
    {
      value: "DIRECT_INSTALLATION" as const,
      label: "Instalacion directa",
      description:
        "La solicitud pasa a revision tecnica con tus materiales y datos del sitio antes de cotizar.",
    },
  ];
}

export function getAssessmentFeeLabel(value?: unknown, requestMode?: unknown): string {
  if (isInstallationServiceType(value)) {
    return shouldChargeAssessmentVisit(value, requestMode)
      ? "Asesoria tecnica previa"
      : "Revision tecnica remota";
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

export function buildDirectInstallationDescription(
  description?: string | null,
  linkedEntityLabel?: string | null,
): string {
  const parts = [
    "Solicitud de instalacion directa sujeta a validacion tecnica remota.",
    String(description ?? "").trim(),
    linkedEntityLabel ? String(linkedEntityLabel).trim() : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

export function getQuotedInstallationCopy(requestMode?: unknown) {
  if (isDirectInstallationRequestMode(requestMode)) {
    return "Cotiza mano de obra y materiales faltantes. Los materiales ya comprados por el cliente no deben duplicarse.";
  }
  return "Esta cotizacion nace despues de la asesoria tecnica previa y debe incluir materiales, mano de obra y observaciones del sitio.";
}

export function getServiceTypeDisplayWithMode(
  serviceType: unknown,
  requestMode?: unknown
) {
  if (!isInstallationServiceType(serviceType)) {
    return getServiceTypeDisplayLabel(serviceType);
  }
  return getRequestModeLabel(requestMode);
}

export function getRequestStageLabelLegacy(value: unknown): string {
  if (isInstallationServiceType(value)) {
    return "Asesoria tecnica previa a instalacion";
  }

  const normalized = normalizeServiceTypeCode(value);
  if (normalized === "MANTENIMIENTO") return "Solicitud de mantenimiento";
  return "Solicitud de servicio";
}
