import { useEffect, useState } from "react";
import { fetchRoles } from "../connection/rolesApi";

export interface Role {
  roleconfigurationid: number;
  roleid?: number;
  permissionid?: number;
  privilegeid?: number;

  roles?: {
    id: number;
    name: string;
    status?: string;
  };

  permission?: {
    id: number;
    module: string;
  };

  privilege?: {
    id: number;
    name: string;
  };

  createat?: string;
  updateat?: string | null;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const data = await fetchRoles();
        console.log(data);
        
        setRoles(data);
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
