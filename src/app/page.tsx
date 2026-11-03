"use client";

import { useEffect, useMemo, useState } from "react";

import {
  useDashboardDates,
  useMsuOptions,
  useOrganizationOptions,
  usePublicationDates,
} from "@/lib/queries/dictionary-queries";

import { useDashboardStatistics } from "@/lib/queries/dashboard-queries";
import { usePublicationStatistics } from "@/lib/queries/publication-queries";

import type { Metric } from "@/types/dashboard";
import type { PublicationRow } from "@/types/publication";

import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

type Option = { id: number; name: string; msuId?: number };

type Stats = {
  date: string;
  scope: string;
  title?: string;
  metrics: Metric[];
  message?: string;
};

function showValue(m: Metric) {
  if (!m.hasData || m.value === null || m.value === undefined || m.value === "")
    return "Нет данных";
  if (typeof m.value === "number")
    return (
      m.value.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) +
      (m.unit === "%" ? "%" : "")
    );
  return String(m.value);
}
function color(value: number) {
  if (value < 50) return "#dc4848";
  if (value < 80) return "#e69a36";
  if (value < 100) return "#a3a832";
  return "#2a9d69";
}
function PercentageRing({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, value));
  const ringColor = color(value);

  return (
    <div className="percentage-ring-wrap">
      <div
        className="percentage-ring"
        style={{
          background: `conic-gradient(
            ${ringColor} ${percent}%,
            var(--progress-track) ${percent}% 100%
            )`,
        }}
      >
        <div className="percentage-ring-inner">
          <strong>
            {value.toLocaleString("ru-RU", {
              maximumFractionDigits: 1,
            })}
            %
          </strong>
        </div>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  const [tab, setTab] = useState<"school" | "publications">("school");

  const [date, setDate] = useState("");
  const [msuId, setMsuId] = useState("");
  const [orgId, setOrgId] = useState("");

  const [publicationDate, setPublicationDate] = useState("");
  const [publicationMsuId, setPublicationMsuId] = useState("");

  const [opened, setOpened] = useState<string[]>([]);

  const { authorized } = useAdminAuth();

  // Справочники основной статистики.
  const {
    data: datesData = [],
    isPending: datesLoading,
    isError: datesError,
  } = useDashboardDates();

  const {
    data: msu = [],
    isPending: msuLoading,
    isError: msuError,
  } = useMsuOptions();

  const {
    data: orgs = [],
    isPending: orgsLoading,
    isError: orgsError,
  } = useOrganizationOptions(msuId ? Number(msuId) : null);

  // Справочники публикаций.
  const {
    data: publicationDatesData = [],
    isPending: publicationDatesLoading,
    isError: publicationDatesError,
  } = usePublicationDates();

  // Инициализация выбранных дат после получения справочников.
  const dates = useMemo(() => datesData.map((item) => item.date), [datesData]);

  const publicationDates = useMemo(
    () => publicationDatesData.map((item) => item.date),
    [publicationDatesData],
  );

  useEffect(() => {
    if (dates.length > 0 && !dates.includes(date)) {
      setDate(dates[0]);
    }
  }, [dates, date]);

  useEffect(() => {
    if (
      publicationDates.length > 0 &&
      !publicationDates.includes(publicationDate)
    ) {
      setPublicationDate(publicationDates[0]);
    }
  }, [publicationDates, publicationDate]);

  // Основная статистика.
  const {
    data: stats = null,
    isPending: statsLoading,
    isError: statsError,
    error: statsErrorData,
  } = useDashboardStatistics(
    date && msuId
      ? {
          date,
          msuId: Number(msuId),
          organizationId: orgId ? Number(orgId) : null,
        }
      : null,
  );

  // Статистика публикаций.
  const {
    data: publicationData,
    isPending: publicationsLoading,
    isError: publicationsError,
  } = usePublicationStatistics(
    tab === "publications" && publicationDate
      ? {
          date: publicationDate,
          msuId: publicationMsuId ? Number(publicationMsuId) : null,
        }
      : null,
  );

  const publicationRows: PublicationRow[] = publicationData?.metrics ?? [];

  const loading =
    datesLoading ||
    msuLoading ||
    (!!msuId && orgsLoading) ||
    (!!date && !!msuId && statsLoading);

  const error =
    datesError || msuError
      ? "Не удалось загрузить справочники. Проверьте, что backend запущен."
      : statsError
        ? statsErrorData instanceof Error
          ? statsErrorData.message
          : "Не удалось загрузить показатели."
        : "";

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; metrics: Metric[] }>();

    (stats?.metrics || []).forEach((m) => {
      if (!map.has(m.categoryKey)) {
        map.set(m.categoryKey, {
          label: m.categoryLabel,
          metrics: [],
        });
      }

      map.get(m.categoryKey)!.metrics.push(m);
    });

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [stats]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>Моя школа</strong>
            <span>Мониторинг показателей</span>
          </div>
        </div>
        <div className="nav-label">Дашборды</div>
        <button
          className={"nav-item " + (tab === "school" ? "active" : "")}
          onClick={() => setTab("school")}
        >
          <BarChart3 size={18} />
          <span>ТОР Моя школа</span>
        </button>
        <button
          className={"nav-item " + (tab === "publications" ? "active" : "")}
          style={{ marginTop: 8 }}
          onClick={() => setTab("publications")}
        >
          <Activity size={18} />
          <span>Публикации</span>
        </button>
        <div className="sidebar-note">
          <Activity size={17} />
          <div>
            <strong>Сводная статистика</strong>
            <p>Данные обновляются после загрузки очередного отчёта.</p>
          </div>
        </div>
        {authorized && (
          <a className="admin-link" href="/admin">
            <span>Панель администратора</span>
            <ChevronRight size={16} />
          </a>
        )}
      </aside>
      <main className="main">
        <header className="page-heading">
          <div>
            <p className="eyebrow">
              АНАЛИТИКА · ЦИФРОВАЯ ОБРАЗОВАТЕЛЬНАЯ СРЕДА
            </p>
            <h1>ТОР «Моя школа»</h1>
            <p className="subtitle">
              {tab === "school"
                ? "Показатели образовательных организаций в разрезе МСУ"
                : "Показатели публикационной активности образовательных организаций"}
            </p>
          </div>
          <div className="heading-actions">
            <div className="date-badge">
              <span className="live-dot" />
              <div>
                <small>Последняя загрузка</small>
                <strong>
                  {(tab === "school" ? date : publicationDate)
                    ? new Date(
                        (tab === "school" ? date : publicationDate) +
                          "T12:00:00",
                      ).toLocaleDateString("ru-RU")
                    : "Нет данных"}
                </strong>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </header>
        <section className="filters">
          <label>
            <span>Дата загрузки</span>
            <select
              value={tab === "school" ? date : publicationDate}
              onChange={(e) =>
                tab === "school"
                  ? setDate(e.target.value)
                  : setPublicationDate(e.target.value)
              }
            >
              <option value="">Нет доступных дат</option>
              {(tab === "school" ? dates : publicationDates).map((d) => (
                <option key={d} value={d}>
                  {new Date(d + "T12:00:00").toLocaleDateString("ru-RU")}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Муниципальное образование (МСУ)</span>
            <select
              value={tab === "school" ? msuId : publicationMsuId}
              onChange={(e) =>
                tab === "school"
                  ? (setMsuId(e.target.value), setOrgId(""))
                  : setPublicationMsuId(e.target.value)
              }
            >
              <option value="">Все МСУ</option>
              {msu.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          {tab === "school" && (
            <label>
              <span>Образовательная организация (ОО)</span>
              <select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                disabled={!msuId || orgsLoading}
              >
                <option value="">Общая статистика МСУ</option>
                {orgs.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>
        {tab === "school" && orgsError && (
          <div className="notice">
            Не удалось загрузить список образовательных организаций.
          </div>
        )}
        {tab === "publications" && (
          <>
            {publicationDatesLoading || publicationsLoading ? (
              <div className="empty-state">Загрузка статистики публикаций…</div>
            ) : publicationsError || publicationDatesError ? (
              <div className="notice">
                Не удалось загрузить статистику публикаций.
              </div>
            ) : publicationDates.length === 0 ? (
              <div className="empty-state">
                <BookOpenCheck size={34} />
                <h2>Нет загруженной статистики публикаций</h2>
                <p>
                  Администратор может загрузить отдельный Excel на странице
                  управления данными.
                </p>
              </div>
            ) : publicationRows.length === 0 ? (
              <div className="empty-state">
                <BookOpenCheck size={34} />
                <h2>Нет данных для выбранного фильтра</h2>
                <p>Выберите другую дату или МСУ.</p>
              </div>
            ) : (
              <>
                <section className="summary-row">
                  {(
                    [
                      {
                        label: "Публикации в соцсетях и каналах ОО",
                        key: "socialPublications",
                      },
                      {
                        label: "Публикации на сайтах ОО",
                        key: "websitePublications",
                      },
                      {
                        label: "Публикации в родительских чатах",
                        key: "parentChatPublications",
                      },
                      {
                        label: "Опубликованные тематические видео",
                        key: "thematicVideos",
                      },
                      { label: "Охват публикаций", key: "publicationReach" },
                      {
                        label: "ОО, разместившие информацию",
                        key: "organizationsPercent",
                        percent: true,
                      },
                    ] as { label: string; key: string; percent?: boolean }[]
                  ).map((k) => {
                    const values = publicationRows
                      .map((r) => r[k.key as keyof PublicationRow])
                      .filter((v): v is number => typeof v === "number");
                    const value = values.length
                      ? k.percent
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : values.reduce((a, b) => a + b, 0)
                      : null;
                    return (
                      <div className="summary-card" key={k.key}>
                        <div className="summary-icon blue">
                          <Activity size={19} />
                        </div>
                        <span>{k.label}</span>
                        <strong>
                          {value === null
                            ? "Нет данных"
                            : value.toLocaleString("ru-RU", {
                                maximumFractionDigits: 1,
                              }) + (k.percent ? "%" : "")}
                        </strong>
                        {k.percent && value !== null && (
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: Math.max(0, Math.min(100, value)) + "%",
                                backgroundColor: color(value),
                              }}
                            />
                          </div>
                        )}
                        <small>
                          {publicationMsuId
                            ? "Выбранное МСУ"
                            : "Сумма по выбранным МСУ"}
                        </small>
                      </div>
                    );
                  })}
                </section>
                <section className="metrics-section">
                  <div className="section-title">
                    <div>
                      <h2>Статистика по МСУ</h2>
                      <p>Показатели из загруженного файла</p>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>МСУ</th>
                          <th>Соцсети и каналы ОО</th>
                          <th>Сайты ОО</th>
                          <th>Родительские чаты</th>
                          <th>Видео</th>
                          <th>Охват</th>
                          <th>ОО, %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publicationRows.map((r) => (
                          <tr key={r.msuId}>
                            <td>{r.name}</td>
                            <td>
                              {r.socialPublications?.toLocaleString("ru-RU") ??
                                "Нет данных"}
                            </td>
                            <td>
                              {r.websitePublications?.toLocaleString("ru-RU") ??
                                "Нет данных"}
                            </td>
                            <td>
                              {r.parentChatPublications?.toLocaleString(
                                "ru-RU",
                              ) ?? "Нет данных"}
                            </td>
                            <td>
                              {r.thematicVideos?.toLocaleString("ru-RU") ??
                                "Нет данных"}
                            </td>
                            <td>
                              {r.publicationReach?.toLocaleString("ru-RU") ??
                                "Нет данных"}
                            </td>
                            <td>
                              {r.organizationsPercent === null
                                ? "Нет данных"
                                : r.organizationsPercent + "%"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
        {loading && <div className="empty-state">Загрузка данных…</div>}
        {tab === "school" && !loading && error && (
          <div className="notice">{error}</div>
        )}
        {tab === "school" && !loading && !msu.length && (
          <div className="empty-state">
            <School size={34} />
            <h2>Пока нет загруженных данных</h2>
            <p>
              После загрузки Excel в административной панели здесь появятся
              доступные даты и МСУ.
            </p>
          </div>
        )}
        {tab === "school" && !loading && msu.length > 0 && !msuId && (
          <div className="empty-state">
            <Building2 size={34} />
            <h2>Выберите МСУ</h2>
            <p>
              После выбора МСУ появится сводная статистика. Чтобы увидеть
              отдельную школу, выберите её в списке ОО.
            </p>
          </div>
        )}
        {tab === "school" && stats && stats.metrics.length > 0 && (
          <>
            <section className="summary-row">
              <div className="summary-card">
                <div className="summary-icon blue">
                  <Building2 size={19} />
                </div>
                <span>Выбранный уровень</span>
                <strong>
                  {stats.scope === "organization" ? "Организация" : "МСУ"}
                </strong>
                <small>{stats.title}</small>
              </div>
              <div className="summary-card">
                <div className="summary-icon violet">
                  <BookOpenCheck size={19} />
                </div>
                <span>Показателей в отчёте</span>
                <strong>{stats.metrics.length}</strong>
                <small>По данным Excel</small>
              </div>
              <div className="summary-card">
                <div className="summary-icon green">
                  <Users size={19} />
                </div>
                <span>Заполнено значений</span>
                <strong>{stats.metrics.filter((m) => m.hasData).length}</strong>
                <small>Из {stats.metrics.length} показателей</small>
              </div>
            </section>
            <section className="metrics-section">
              <div className="section-title">
                <div>
                  <h2>Показатели по направлениям</h2>
                  <p>Откройте направление, чтобы посмотреть подробности</p>
                </div>
              </div>
              {categories.map((c, i) => (
                <section className="category" key={c.key}>
                  <button
                    className="category-toggle"
                    onClick={() =>
                      setOpened((old) =>
                        old.includes(c.key)
                          ? old.filter((k) => k !== c.key)
                          : [...old, c.key],
                      )
                    }
                  >
                    <span className="category-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="category-name">
                      <strong>{c.label}</strong>
                      <small>{c.metrics.length} показателей</small>
                    </span>
                    <span className="category-count">
                      {c.metrics.filter((m) => m.hasData).length}/
                      {c.metrics.length}
                    </span>
                    {opened.includes(c.key) ? (
                      <ChevronDown size={19} />
                    ) : (
                      <ChevronRight size={19} />
                    )}
                  </button>
                  {opened.includes(c.key) && (
                    <div className="metric-grid">
                      {c.metrics.map((m) => {
                        const pct =
                          m.percentage && typeof m.value === "number"
                            ? Math.max(0, Math.min(100, m.value))
                            : null;
                        return (
                          <article className="metric-card" key={m.key}>
                            <div className="metric-top">
                              <span>{m.label}</span>
                              {m.percentage && (
                                <span className="metric-tag">%</span>
                              )}
                            </div>
                            <strong
                              className={
                                m.hasData
                                  ? "metric-value"
                                  : "metric-value no-data"
                              }
                            >
                              {showValue(m)}
                            </strong>
                            {m.percentage &&
                              typeof m.value === "number" &&
                              m.hasData && <PercentageRing value={m.value} />}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </section>
          </>
        )}
        {tab === "school" && stats?.message && (
          <div className="notice">{stats.message}</div>
        )}
        <footer>
          ТОР «Моя школа» · Данные соответствуют выбранной загрузке отчёта.
        </footer>
      </main>
    </div>
  );
}
