import { useEffect, useState } from "react";
import { fetchRoles } from "../connection/rolesApi";

export interface Role {
  roleid: number;
  name: string;
  status?: string;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const data = await fetchRoles();
        const list: Role[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : [];

        const activeRoles = list.filter((item) => {
          if (!item.status) return true;
          const status = String(item.status).toLowerCase();
          return status === "active" || status === "activo";
        });

        setRoles(activeRoles);
      } catch (error) {
        console.error("Error al cargar roles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  return { roles, loading };
};
