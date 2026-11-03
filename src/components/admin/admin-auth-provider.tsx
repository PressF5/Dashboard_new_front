"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "@/lib/api/client";

type AdminAuthContextType = {
  authorization: string | null;
  authorized: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [authorization, setAuthorization] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const token = `Basic ${btoa(`${username}:${password}`)}`;

    await apiFetch("/api/admin/imports", {
      headers: {
        Authorization: token,
      },
    });

    setAuthorization(token);
  }, []);

  const logout = useCallback(() => {
    setAuthorization(null);
  }, []);

  const value = useMemo(
    () => ({
      authorization,
      authorized: authorization !== null,
      login,
      logout,
    }),
    [authorization, login, logout],
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
