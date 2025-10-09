"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = { name: string; email: string; phone?: string; avatar?: string };
type StoredUser = User & { password: string } & Record<string, any>;
type AuthResult = { ok: boolean; message?: string };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  register: (input: { name: string; email: string; password: string; [k: string]: any }) => Promise<AuthResult>;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "avatar">>) => Promise<AuthResult>;
};

const SEEDED_USERS: StoredUser[] = [
  { email: "admin@sistemaspc.com",  password: "123456",    name: "Administrador" },
  { email: "ventas@sistemaspc.com", password: "ventas2024", name: "Ventas" },
  { email: "soporte@sistemaspc.com", password: "soporte2024", name: "Soporte" },
];

const STORAGE_KEY_USER  = "auth.user";
const STORAGE_KEY_USERS = "auth.users";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(list: StoredUser[]) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(list));
  } catch {}
}

function getAllUsers(): StoredUser[] {
  const saved = loadRegisteredUsers();
  const savedEmails = new Set(saved.map((u) => u.email.toLowerCase()));
  const seededFiltered = SEEDED_USERS.filter((u) => !savedEmails.has(u.email.toLowerCase()));
  return [...saved, ...seededFiltered];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {} finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
  }, [user, ready]);

  const login: AuthContextType["login"] = async (email, password) => {
    const all = getAllUsers();
    const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) return { ok: false, message: "Credenciales inválidas" };
    setUser({ name: found.name, email: found.email, phone: found.phone, avatar: found.avatar });
    return { ok: true };
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
    setUser(null);
  };

  const register: AuthContextType["register"] = async (input) => {
    const name = (input?.name || "").trim();
    const email = (input?.email || "").trim().toLowerCase();
    const password = String(input?.password || "");

    if (!name || name.length < 3) return { ok: false, message: "Ingresa un nombre válido" };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Correo inválido" };
    if (!password || password.length < 6) return { ok: false, message: "La contraseña debe tener al menos 6 caracteres" };

    const all = getAllUsers();
    const exists = all.some((u) => u.email.toLowerCase() === email);
    if (exists) return { ok: false, message: "Este correo ya está registrado" };

    const newUser: StoredUser = { ...input, name, email, password };
    const nextList = [newUser, ...loadRegisteredUsers()];
    saveRegisteredUsers(nextList);

    setUser({ name, email, phone: newUser.phone, avatar: newUser.avatar });
    return { ok: true };
  };

  const updateProfile: AuthContextType["updateProfile"] = async (patch) => {
    if (!user) return { ok: false, message: "No autenticado" };
    const emailKey = user.email.toLowerCase();
    const saved = loadRegisteredUsers();
    const idx = saved.findIndex((u) => u.email.toLowerCase() === emailKey);
    let base: StoredUser | null =
      idx >= 0 ? saved[idx] : SEEDED_USERS.find((u) => u.email.toLowerCase() === emailKey) ?? null;
    if (!base) {
      base = { email: user.email, name: user.name, password: "placeholder", phone: user.phone, avatar: user.avatar };
    }
    const updated: StoredUser = {
      ...base,
      name: patch.name ?? base.name,
      phone: patch.phone ?? base.phone,
      avatar: patch.avatar ?? base.avatar,
    };
    let nextList: StoredUser[];
    if (idx >= 0) {
      nextList = [...saved];
      nextList[idx] = updated;
    } else {
      nextList = [updated, ...saved];
    }
    saveRegisteredUsers(nextList);
    const nextUser: User = { email: updated.email, name: updated.name, phone: updated.phone, avatar: updated.avatar };
    setUser(nextUser);
    return { ok: true };
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user, ready, login, logout, register, updateProfile }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
