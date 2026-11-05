"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "@/lib/api/client";

type AdminLoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  id: number;
  username: string;
  email: string;
  roleCode: string;
  roleName: string;
};

type AdminAuthContextType = {
  authorization: string | null;
  authorized: boolean;
  user: AdminLoginResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminLoginResponse | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiFetch<AdminLoginResponse>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    setUser(response);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      // Локально завершаем сессию даже при ошибке сети.
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      authorization: user ? `${user.tokenType} ${user.accessToken}` : null,
      authorized: user !== null,
      user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }

  return context;
}
