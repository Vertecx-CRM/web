"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { api, setAccessToken } from "@/lib/api";
import { AuthUser } from "@/features/auth/types/AuthUser";

type AuthResult = { ok: boolean; message?: string };

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  loadUser: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<AuthResult>;
  updateProfile: (
    data: { 
      name?: string; 
      lastname?: string;
      phone?: string; 
      avatar?: string 
    }
  ) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  async function loadUser() {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      const access = data.accessToken || data.access_token;
      const refresh = data.refreshToken || data.refresh_token;

      if (!access || !refresh) {
        return { ok: false, message: data.message || "Credenciales inválidas" };
      }

      setAccessToken(access);
      Cookies.set("refresh", refresh, { path: "/" });

      await loadUser();

      return { ok: true };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.response?.data?.message || "No se pudo iniciar sesión",
      };
    }
  };

  const logout = () => {
    setAccessToken(null);
    Cookies.remove("refresh");
    setUser(null);
  };

  const changePassword: AuthContextType["changePassword"] = async (
    currentPassword,
    newPassword
  ) => {
    try {
      await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword,
      });
      await loadUser();
      return { ok: true };
    } catch (err: any) {
      return {
        ok: false,
        message:
          err?.response?.data?.message ||
          "No se pudo actualizar la contrase��a",
      };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user?.userid) return { ok: false, message: "Usuario no autenticado" };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.userid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        return { ok: false, message: result.message || "Error al actualizar" };
      }

          await loadUser();

    return { ok: true };

  } catch (e) {
    return { ok: false, message: "Error de conexión" };
  }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      ready,
      login,
      logout,
      loadUser,
      changePassword,
      updateProfile,
    }),
    [user, ready, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
