"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch } from "@/lib/api/client";

type AdminUser = {
  id: number;
  username: string;
  roleCode: string;
  roleName: string;
};

type AdminAuthResponse = AdminUser & {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

type AdminAuthContextType = {
  authorization: string | null;
  authorized: boolean;
  initializing: boolean;
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState("Bearer");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Не допускаем параллельную ротацию refresh-токена.
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const request = (async () => {
      try {
        const response = await apiFetch<AdminAuthResponse>(
          "/api/auth/refresh",
          {
            method: "POST",
          },
        );

        setAccessToken(response.accessToken);
        setTokenType(response.tokenType);

        setUser({
          id: response.id,
          username: response.username,
          roleCode: response.roleCode,
          roleName: response.roleName,
        });
      } catch {
        setAccessToken(null);
        setTokenType("Bearer");
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();

    refreshPromiseRef.current = request;

    try {
      await request;
    } finally {
      if (refreshPromiseRef.current === request) {
        refreshPromiseRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiFetch<AdminAuthResponse>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    setAccessToken(response.accessToken);
    setTokenType(response.tokenType);

    setUser({
      id: response.id,
      username: response.username,
      roleCode: response.roleCode,
      roleName: response.roleName,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
      setTokenType("Bearer");
      setUser(null);
    }
  }, []);

  const authorization = accessToken ? `${tokenType} ${accessToken}` : null;

  const value = useMemo(
    () => ({
      authorization,
      authorized: accessToken !== null,
      initializing,
      user,
      login,
      logout,
    }),
    [authorization, accessToken, initializing, user, login, logout],
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
