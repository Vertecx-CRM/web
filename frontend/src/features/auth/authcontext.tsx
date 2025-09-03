"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { name: string; email: string };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

const USERS = [
  { email: "admin@sistemaspc.com",  password: "123456",     name: "Administrador" },
  { email: "ventas@sistemaspc.com", password: "ventas2024", name: "Ventas" },
  { email: "soporte@sistemaspc.com",password: "soporte2024",name: "Soporte" },
];

const STORAGE_KEY = "auth.user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Cargar desde localStorage después de montar (solo cliente)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch { /* ignore */ }
    finally { setReady(true); }
  }, []);

  // Sincronizar cambios
  useEffect(() => {
    if (!ready) return;
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [user, ready]);

  const login: AuthContextType["login"] = async (email, password) => {
    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) return { ok: false, message: "Credenciales inválidas" };
    setUser({ name: found.name, email: found.email });
    return { ok: true };
  };

  const logout = () => setUser(null);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    ready,
    login,
    logout,
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
