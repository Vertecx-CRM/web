export type TechnicianSpecialty = {
  techniciantypeid: number;
  name: string;
};

export type TechnicianProfileOption = {
  technicianid: number;
  label: string;
  title: string | null;
  specialties: TechnicianSpecialty[];
  email: string | null;
  phone: string | null;
  image: string | null;
  cvUrl: string | null;
  hasCv: boolean;
  searchText: string;
};

function normalizeText(value: string) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function uniqueSpecialties(items: TechnicianSpecialty[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.techniciantypeid}:${normalizeText(item.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeTechnicianProfile(
  raw: any,
): TechnicianProfileOption | null {
  const technicianid = Number(raw?.technicianid ?? raw?.id);
  if (!Number.isFinite(technicianid) || technicianid <= 0) return null;

  const user = raw?.users ?? raw?.user ?? raw?.Users ?? {};
  const name = [user?.name, user?.lastname].filter(Boolean).join(" ").trim();
  const title =
    typeof raw?.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : null;

  const specialties = uniqueSpecialties(
    (Array.isArray(raw?.technicianTypeMaps) ? raw.technicianTypeMaps : [])
      .map((entry: any) => {
        const mappedId = Number(
          entry?.techniciantypeid ?? entry?.techniciantype?.techniciantypeid,
        );
        const mappedName = String(entry?.techniciantype?.name ?? entry?.name ?? "")
          .trim();

        if (!mappedName) return null;

        return {
          techniciantypeid: Number.isFinite(mappedId) ? mappedId : 0,
          name: mappedName,
        } as TechnicianSpecialty;
      })
      .filter(Boolean) as TechnicianSpecialty[],
  );

  const cvUrl =
    typeof raw?.CV === "string" && raw.CV.trim() ? raw.CV.trim() : null;
  const email =
    typeof user?.email === "string" && user.email.trim()
      ? user.email.trim()
      : null;
  const phone =
    typeof user?.phone === "string" && user.phone.trim()
      ? user.phone.trim()
      : null;
  const image =
    typeof user?.image === "string" && user.image.trim()
      ? user.image.trim()
      : null;
  const label = name || `Tecnico #${technicianid}`;

  return {
    technicianid,
    label,
    title,
    specialties,
    email,
    phone,
    image,
    cvUrl,
    hasCv: Boolean(cvUrl),
    searchText: normalizeText(
      [
        label,
        title ?? "",
        email ?? "",
        phone ?? "",
        ...specialties.map((item) => item.name),
      ].join(" "),
    ),
  };
}

export function getTechnicianKnowledgeSummary(
  technician: TechnicianProfileOption,
) {
  if (technician.specialties.length > 0) {
    return `Conocimiento registrado en ${technician.specialties
      .map((item) => item.name)
      .join(", ")}.`;
  }

  if (technician.hasCv) {
    return "Tiene CV cargado, pero aun no tiene especialidades configuradas.";
  }

  return "Aun no tiene especialidades ni CV configurados en el sistema.";
}
