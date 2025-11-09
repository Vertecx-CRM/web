import { api } from "@/shared/utils/apiClient";

export type RoleRow = {
  id: number;
  name: string;
  state: "Activo" | "Inactivo";
};

type RoleConfigResponse = {
  roleconfigurationid: number;
  role: { id: number; name: string; status: string };
  permission: { id: number; module: string };
  privilege: { id: number; name: string };
};

const toUiStatus = (s?: string) =>
  (s ?? "").toLowerCase() === "active" ? "Activo" : "Inactivo";

/** Normaliza cualquier forma de estado a lo que espera el backend */
const toBackendStatus = (
  s?: "Activo" | "Inactivo" | "active" | "inactive" | boolean
): "active" | "inactive" => {
  if (typeof s === "boolean") return s ? "active" : "inactive";
  const v = String(s ?? "").toLowerCase().trim();
  if (["activo", "active", "1", "true"].includes(v)) return "active";
  if (["inactivo", "inactive", "0", "false"].includes(v)) return "inactive";
  // por defecto, activo
  return "active";
};

export const getRoles = async (): Promise<RoleRow[]> => {
  const { data } = await api.get<RoleConfigResponse[]>("/roles");
  const map = new Map<number, RoleRow>();

  for (const rc of data) {
    const r = rc.role;
    if (!r?.id) continue;
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        state: toUiStatus(r.status),
      });
    }
  }
  return Array.from(map.values());
};

export const getRoleDetail = async (id: number) => {
  const { data } = await api.get(`/roles/${id}/detail`);
  return data;
};

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`);
};

export type CreateRolePayload = {
  name: string;
  roleconfigurations: { permissionid: number; privilegeid: number }[];
  status?: "active" | "inactive" | "Activo" | "Inactivo" | boolean;
};

export const createRole = async (payload: CreateRolePayload) => {
  const body = {
    name: payload.name,
    roleconfigurations: payload.roleconfigurations,
    status: toBackendStatus(payload.status ?? "active"),
  };
  const { data } = await api.post("/roles", body);
  return data;
};

export type UpdateMatrixItem = { permissionid: number; privilegeids: number[] };

/** Reemplaza TODA la matriz (PUT /roles/:id/configurations) */
export const updateRoleMatrix = async (
  roleid: number,
  items: UpdateMatrixItem[]
) => {
  const { data } = await api.put(`/roles/${roleid}/configurations`, { items });
  return data;
};

/**
 * Parchea metadatos del rol (name/status) usando PATCH /roles/configurations.
 * Este endpoint del backend requiere enviar al menos un 'configuration' existente,
 * por eso primero leemos /roles/:id/detail y mandamos los roleconfigurationid.
 */
export const patchRoleMeta = async (
  roleid: number,
  payload: { name?: string; status?: "Activo" | "Inactivo" }
) => {
  // 1) Traemos detalle para extraer roleconfigurationid existentes
  const detail = await api.get(`/roles/${roleid}/detail`);
  const configs = Array.isArray(detail.data?.configurations)
    ? detail.data.configurations
    : [];

  if (!configs.length) {
    // El backend exige al menos una configuración para PATCH /roles/configurations
    // (porque el DTO incluye 'configurations' aunque no cambiemos nada).
    // Si no hay, el flujo correcto es: usar PUT /roles/:id/configurations para crear la matriz
    // y luego volver a intentar el PATCH si aún se requiere.
    throw new Error(
      "El rol no tiene configuraciones registradas. Primero define la matriz con PUT /roles/:id/configurations."
    );
  }

  // 2) Solo necesitamos mandar los IDs existentes; no cambiamos permiso/privilegio aquí
  const configurations = configs.map((c: any) => ({
    roleconfigurationid: c.roleconfigurationid,
  }));

  // 3) Armamos objeto 'role' con lo editable
  const role: any = { roleid };
  if (payload.name !== undefined) role.name = payload.name;
  if (payload.status !== undefined)
    role.status = payload.status; 

  const { data } = await api.patch(`/roles/configurations`, {
    role,
    configurations,
  });

  return data;
};
