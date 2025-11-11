// hooks/useTechnicianTypes.ts
import { useState, useEffect } from "react";

export const useTechnicianTypes = () => {
  const [technicianTypes, setTechnicianTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch("http://localhost:3001/techniciantypes");
        if (res.ok) {
          const data = await res.json();
          setTechnicianTypes(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Error fetching technician types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return { technicianTypes, loading };
};