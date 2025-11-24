"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.div
        className="absolute w-20 h-20 border-4 border-red-400 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [1, 0, 1],
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
    </div>
  );
}

type LoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

// Tiempo mínimo que el loader debe estar visible (en ms)
const MIN_LOADER_TIME = 1000;

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const startRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoader = () => {
    // Cancelar cualquier hide pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!loading) {
      startRef.current = Date.now();
      setLoading(true);
    }
  };

  const hideLoader = () => {
    if (!loading) return;

    const start = startRef.current;
    if (!start) {
      setLoading(false);
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = MIN_LOADER_TIME - elapsed;

    if (remaining <= 0) {
      setLoading(false);
      startRef.current = null;
    } else {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        startRef.current = null;
        timeoutRef.current = null;
      }, remaining);
    }
  };

  // Limpiar timeout al desmontar el provider
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && <Loader />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader debe usarse dentro de LoaderProvider");
  return ctx;
}

// Opcional: para esconder el loader cuando cambias de ruta
export function LoaderGate() {
  const { hideLoader } = useLoader();
  const pathname = usePathname();

  useEffect(() => {
    // En cada cambio de ruta pedimos ocultar loader;
    // el propio hideLoader respeta el tiempo mínimo.
    hideLoader();
  }, [hideLoader, pathname]);

  return null;
}
