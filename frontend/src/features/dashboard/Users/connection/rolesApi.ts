import { useEffect, useState } from "react";

export const useRoles = () => {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/roleconfiguration")
      .then((res) => res.json())
      .then((data) => setRoles(data.data || []))
      .catch(() => setRoles([]));
  }, []);

  return { roles };
};
