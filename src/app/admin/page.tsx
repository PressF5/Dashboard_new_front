"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, LockKeyhole, LogIn } from "lucide-react";

import { useAdminAuth } from "@/components/admin/admin-auth-provider";

export default function AdminPage() {
  const router = useRouter();
  const { authorized, login, logout } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      await login(username, password);
      setPassword("");
    } catch {
      setMessage("Не удалось войти. Проверьте логин и пароль.");
    } finally {
      setBusy(false);
    }
  }

  if (authorized) {
    return (
      <main className="admin-shell">
        <a className="back-link" href="/">
          <ArrowLeft size={17} />
          Вернуться к дашборду
        </a>

        <header className="admin-heading">
          <div className="admin-icon">
            <LockKeyhole size={25} />
          </div>
          <div>
            <p className="eyebrow">АДМИНИСТРАТИВНАЯ ПАНЕЛЬ</p>
            <h1>Управление дашбордом</h1>
            <p className="subtitle">Управление статистикой и загрузками</p>
          </div>
        </header>

        <section className="upload-card">
          <div className="upload-intro">
            <FileSpreadsheet size={24} />
            <div>
              <h2>Импорт статистики</h2>
              <p>Загрузка основной статистики и статистики публикаций.</p>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() => router.push("/admin/imports")}
          >
            Перейти к импорту
          </button>
        </section>

        <button
          className="back-link"
          onClick={() => {
            logout();
            router.push("/admin");
          }}
        >
          Выйти из панели
        </button>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <a className="back-link" href="/">
        <ArrowLeft size={17} />
        Вернуться к дашборду
      </a>

      <form className="login-card" onSubmit={handleLogin}>
        <LockKeyhole size={24} />

        <h2>Вход администратора</h2>

        <p>Введите учётные данные для доступа к административной панели.</p>

        <label>
          Логин
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={busy}>
          <LogIn size={17} />
          {busy ? "Проверка..." : "Войти"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </main>
  );
}
