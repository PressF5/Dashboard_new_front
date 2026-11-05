"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  LockKeyhole,
  UploadCloud,
} from "lucide-react";

import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { apiFetch } from "@/lib/api/client";

type RecordRow = {
  id: number;
  uploaded_at: string;
  snapshot_date: string;
  original_filename: string;
  status: string;
  message: string;
  schools_read: number;
  created_or_updated_msu: number;
};

type ImportResponse = {
  snapshotDate: string;
  msuCount: number;
  schoolsRead?: number;
};

function getTodayLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ImportsPage() {
  const { authorization, authorized, initializing, user } = useAdminAuth();

  const [file, setFile] = useState<File | null>(null);
  const [publicationFile, setPublicationFile] = useState<File | null>(null);

  const [snapshotDate, setSnapshotDate] = useState(getTodayLocalDate);
  const [publicationSnapshotDate, setPublicationSnapshotDate] =
    useState(getTodayLocalDate);

  const [records, setRecords] = useState<RecordRow[]>([]);
  const [historyMessage, setHistoryMessage] = useState("");

  const [message, setMessage] = useState("");
  const [publicationMessage, setPublicationMessage] = useState("");

  const [busy, setBusy] = useState(false);
  const [publicationBusy, setPublicationBusy] = useState(false);

  const canImportStatistics = user?.roleCode === "STATISTICS_ADMIN";
  const canImportPublications = user?.roleCode === "PUBLICATIONS_ADMIN";

  const loadHistory = useCallback(async () => {
    if (!authorization) {
      return;
    }

    try {
      const data = await apiFetch<RecordRow[]>("/api/admin/imports", {
        headers: {
          Authorization: authorization,
        },
      });

      setRecords(data);
      setHistoryMessage("");
    } catch (error) {
      setHistoryMessage(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить историю импорта.",
      );
    }
  }, [authorization]);

  useEffect(() => {
    if (authorized && authorization) {
      void loadHistory();
    }
  }, [authorized, authorization, loadHistory]);

  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setMessage("Выберите файл Excel.");
      return;
    }

    if (!snapshotDate) {
      setMessage("Укажите дату статистики.");
      return;
    }

    if (!authorization) {
      setMessage("Сессия администратора недействительна.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("snapshotDate", snapshotDate);

      const data = await apiFetch<ImportResponse>("/api/admin/imports", {
        method: "POST",
        headers: {
          Authorization: authorization,
        },
        body,
      });

      setFile(null);

      await loadHistory();

      setMessage(
        `Импорт завершён: дата ${data.snapshotDate}, МСУ: ${data.msuCount}, ОО: ${data.schoolsRead ?? 0}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ошибка загрузки файла.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadPublications(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!publicationFile) {
      setPublicationMessage("Выберите Excel-файл публикаций.");
      return;
    }

    if (!publicationSnapshotDate) {
      setPublicationMessage("Укажите дату статистики публикаций.");
      return;
    }

    if (!authorization) {
      setPublicationMessage("Сессия администратора недействительна.");
      return;
    }

    setPublicationBusy(true);
    setPublicationMessage("");

    try {
      const body = new FormData();
      body.append("file", publicationFile);
      body.append("snapshotDate", publicationSnapshotDate);

      const data = await apiFetch<ImportResponse>(
        "/api/admin/publications/import",
        {
          method: "POST",
          headers: {
            Authorization: authorization,
          },
          body,
        },
      );

      setPublicationFile(null);

      await loadHistory();

      setPublicationMessage(
        `Публикации загружены: дата ${data.snapshotDate}, МСУ: ${data.msuCount}.`,
      );
    } catch (error) {
      setPublicationMessage(
        error instanceof Error ? error.message : "Ошибка загрузки публикаций.",
      );
    } finally {
      setPublicationBusy(false);
    }
  }

  if (initializing) {
    return (
      <main className="admin-shell">
        <p>Проверка сессии администратора...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="admin-shell">
        <Link className="back-link" href="/admin">
          <ArrowLeft size={17} />
          Перейти ко входу администратора
        </Link>

        <section className="login-card">
          <LockKeyhole size={24} />
          <h2>Требуется авторизация</h2>
          <p>
            Для доступа к импорту необходимо войти в административную панель.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <Link className="back-link" href="/admin">
        <ArrowLeft size={17} />
        Вернуться в административную панель
      </Link>

      <header className="admin-heading">
        <div className="admin-icon">
          <FileSpreadsheet size={25} />
        </div>

        <div>
          <p className="eyebrow">УПРАВЛЕНИЕ ДАННЫМИ</p>
          <h1>Импорт статистики</h1>
          <p className="subtitle">
            Администратор: {user?.username} ({user?.roleName})
          </p>
        </div>
      </header>

      {canImportStatistics && (
        <form className="upload-card" onSubmit={upload}>
          <div className="upload-intro">
            <UploadCloud size={24} />
            <div>
              <h2>Загрузить основную статистику</h2>
              <p>
                Выберите Excel-файл и укажите дату, за которую собрана
                статистика. Файл удаляется после обработки.
              </p>
            </div>
          </div>

          <label>
            Дата статистики
            <input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              required
            />
          </label>

          <label className="file-picker">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <FileSpreadsheet size={22} />
            <span>{file ? file.name : "Выберите файл Excel"}</span>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={busy || !file || !snapshotDate}
          >
            {busy ? "Обработка..." : "Загрузить и обработать"}
          </button>

          {message && <div className="form-message">{message}</div>}
        </form>
      )}

      {canImportPublications && (
        <form className="upload-card" onSubmit={uploadPublications}>
          <div className="upload-intro">
            <UploadCloud size={24} />
            <div>
              <h2>Загрузить статистику публикаций</h2>
              <p>
                Выберите отдельный Excel-файл и укажите дату, за которую собрана
                статистика публикаций.
              </p>
            </div>
          </div>

          <label>
            Дата статистики публикаций
            <input
              type="date"
              value={publicationSnapshotDate}
              onChange={(e) => setPublicationSnapshotDate(e.target.value)}
              required
            />
          </label>

          <label className="file-picker">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setPublicationFile(e.target.files?.[0] ?? null)}
            />
            <FileSpreadsheet size={22} />
            <span>
              {publicationFile
                ? publicationFile.name
                : "Выберите Excel публикаций"}
            </span>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={
              publicationBusy || !publicationFile || !publicationSnapshotDate
            }
          >
            {publicationBusy ? "Обработка..." : "Загрузить публикации"}
          </button>

          {publicationMessage && (
            <div className="form-message">{publicationMessage}</div>
          )}
        </form>
      )}

      {!canImportStatistics && !canImportPublications && (
        <section className="upload-card">
          <h2>Нет доступных операций импорта</h2>
          <p>
            У вашей учётной записи нет роли для загрузки основной статистики или
            публикаций.
          </p>
        </section>
      )}

      <section className="history-card">
        <div className="section-title">
          <div>
            <h2>История загрузок</h2>
            <p>Последние 100 попыток импорта</p>
          </div>
        </div>

        {historyMessage && <p className="form-message">{historyMessage}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Загружено</th>
                <th>Дата статистики</th>
                <th>Файл</th>
                <th>МСУ</th>
                <th>ОО</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    {new Date(record.uploaded_at).toLocaleString("ru-RU")}
                  </td>
                  <td>
                    {new Date(
                      `${record.snapshot_date}T12:00:00`,
                    ).toLocaleDateString("ru-RU")}
                  </td>
                  <td>{record.original_filename || "—"}</td>
                  <td>{record.created_or_updated_msu}</td>
                  <td>{record.schools_read}</td>
                  <td>
                    <span
                      className={
                        record.status === "SUCCESS"
                          ? "status success"
                          : "status failed"
                      }
                    >
                      <CheckCircle2 size={14} />
                      {record.status}
                    </span>
                    <small className="status-message">{record.message}</small>
                  </td>
                </tr>
              ))}

              {!records.length && (
                <tr>
                  <td colSpan={6} className="table-empty">
                    История загрузок пока пуста.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
