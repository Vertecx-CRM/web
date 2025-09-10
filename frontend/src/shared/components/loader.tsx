  "use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
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

type LoaderContextType = { showLoader: () => void; hideLoader: () => void };
const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
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

export function LoaderGate() {
  const { hideLoader } = useLoader();
  const pathname = usePathname();

  useEffect(() => {
    const raw = sessionStorage.getItem("__loader_min_until__");
    const minUntil = raw ? Number(raw) : 0;
    const delay = pathname.startsWith("/auth") ? 0 : Math.max(0, minUntil - Date.now());
    const t = setTimeout(() => {
      hideLoader();
      sessionStorage.removeItem("__loader_min_until__");
    }, delay);
    return () => clearTimeout(t);
  }, [hideLoader, pathname]);

  return null;
}
