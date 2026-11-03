import { apiFetch } from "@/lib/api/client";

import type { DashboardStats } from "@/types/dashboard";

export type DashboardStatisticsParams = {
  date: string;
  msuId?: number | null;
  organizationId?: number | null;
};

/**
 * Получение основной статистики дашборда.
 *
 * Если organizationId не указан, получаем статистику
 * по всему МСУ (или по региону, если не указан msuId).
 */
export function getDashboardStatistics(
  params: DashboardStatisticsParams,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({
    date: params.date,
  });

  if (params.msuId != null) {
    searchParams.set("msuId", String(params.msuId));
  }

  if (params.organizationId != null) {
    searchParams.set("organizationId", String(params.organizationId));
  }

  return apiFetch<DashboardStats>(
    `/api/dashboard/statistics?${searchParams.toString()}`,
    { signal },
  );
}
