"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { apiFetch } from "@/lib/api/client";

type AvailableRole = {
  code: string;
  name: string;
};

type RegistrationResponse = {
  id: number;
  username: string;
  roleCode: string;
  roleName: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<AvailableRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleCode, setRoleCode] = useState("");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRoles() {
      try {
        const availableRoles = await apiFetch<AvailableRole[]>(
          "/api/auth/available-roles",
        );

        if (!active) return;

        setRoles(availableRoles);

        if (availableRoles.length > 0) {
          setRoleCode(availableRoles[0].code);
        }
      } catch {
        if (active) {
          setRolesError("Не удалось загрузить список доступных ролей.");
        }
      } finally {
        if (active) {
          setRolesLoading(false);
        }
      }
    }

    void loadRoles();

    return () => {
      active = false;
    };
  }, []);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Пароли не совпадают.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setMessage("Пароль должен содержать от 8 до 72 символов.");
      return;
    }

    if (!roleCode) {
      setMessage("Выберите административную роль.");
      return;
    }

    setBusy(true);

    try {
      await apiFetch<RegistrationResponse>("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          roleCode,
        }),
      });

      setRegistered(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось зарегистрировать администратора.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <div className="admin-heading">
        <Link className="back-link" href="/">
          <ArrowLeft size={17} />
          Вернуться к дашборду
        </Link>

        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={handleRegister}>
        <UserPlus size={25} />

        <h2>Регистрация администратора</h2>

        <p>Создайте учётную запись для доступа к административной панели.</p>

        {registered ? (
          <div className="register-success">
            <strong>Регистрация успешно завершена.</strong>

            <p>
              Теперь вы можете войти в административную панель, используя
              созданные учётные данные.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() => router.push("/admin")}
            >
              Перейти ко входу
            </button>
          </div>
        ) : (
          <>
            <label>
              Логин
              <input
                type="text"
                autoComplete="username"
                minLength={3}
                maxLength={100}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label>
              Пароль
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label>
              Повторите пароль
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            <label>
              Административная роль
              <select
                className="register-select"
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                disabled={rolesLoading || roles.length === 0}
                required
              >
                {roles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>

            {rolesLoading && (
              <p className="form-message">Загрузка доступных ролей...</p>
            )}

            {!rolesLoading && roles.length === 0 && !rolesError && (
              <p className="form-message">
                Все административные роли уже заняты. Регистрация временно
                недоступна.
              </p>
            )}

            {rolesError && <p className="form-message">{rolesError}</p>}

            {message && <p className="form-message">{message}</p>}

            <button
              className="primary-button"
              type="submit"
              disabled={
                busy || rolesLoading || roles.length === 0 || !!rolesError
              }
            >
              <UserPlus size={17} />
              {busy ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </>
        )}

        {!registered && (
          <p className="register-login-link">
            Уже есть учётная запись? <Link href="/admin">Войти</Link>
          </p>
        )}
      </form>
    </main>
  );
}
