"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

/** ====== Lista local de usuarios (demo) ======
 * Puedes agregar/quitar usuarios a tu gusto.
 * Contraseñas en texto plano SOLO para demo.
 */
const USERS: Array<{ email: string; password: string; name: string }> = [
  { email: "admin@sistemaspc.com", password: "123456", name: "Administrador" },
  { email: "ventas@sistemaspc.com", password: "ventas2024", name: "Ventas" },
  { email: "soporte@sistemaspc.com", password: "soporte2024", name: "Soporte" },
];

const STORAGE_KEY = "auth.user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    const found = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      return { ok: false, message: "Credenciales inválidas" };
    }
    const u: User = { name: found.name, email: found.email };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
